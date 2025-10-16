# Build the Docker image
Write-Host "Building Docker image..."
docker build --file Dockerfile.mcp -t spellbook-mcp:ci .

# Create logs directory (absolute path)
$logDirRel = Join-Path -Path $PSScriptRoot -ChildPath '..\\mcp-starter\\logs'
try {
    $logDir = (Resolve-Path -Path $logDirRel -ErrorAction Stop).ProviderPath
} catch {
    # If Resolve-Path fails, create directory and then resolve
    New-Item -ItemType Directory -Path $logDirRel -Force | Out-Null
    $logDir = (Resolve-Path -Path $logDirRel).ProviderPath
}

Write-Host "Log directory (host): $logDir"

# Prepare container create command using /bin/sh as entrypoint so we can run a shell command
Write-Host "Creating container to run acceptance tests..."

# Use docker create with --entrypoint /bin/sh and pass -c "..." to run npm commands inside the container
$createOutput = docker create --entrypoint '/bin/sh' -e LOG_MCP=1 -e LOG_DIR=/app/mcp-starter/logs spellbook-mcp:ci -c "cd /app && npm --prefix /app/mcp-starter ci --omit=dev && cd /app && npm run acceptance" 2>&1
if ($LASTEXITCODE -ne 0 -or -not $createOutput) {
    Write-Host "docker create failed:";
    Write-Host $createOutput
    exit 1
}

$containerId = $createOutput.Trim()
Write-Host "Created container id: $containerId"

# Start the container and stream output
Write-Host "Starting container and streaming output (this may take a while)..."
docker start -a $containerId

# After run completes, attempt to copy logs from container to host
Write-Host "Copying logs from container to host: container:$($containerId):/app/mcp-starter/logs -> $logDir"
$src = "${containerId}:/app/mcp-starter/logs/."

try {
    docker cp $src $logDir 2>&1 | Write-Host
} catch {
    Write-Host "docker cp failed with: $_"
}

# Inspect container exit code
$inspect = docker inspect $containerId --format='{{.State.ExitCode}}' 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "docker inspect failed: $inspect"
} else {
    $exitCode = $inspect.Trim()
    Write-Host "Container exit code: $exitCode"
}

# Cleanup
docker rm $containerId | Out-Null

if ($exitCode -and $exitCode -ne '0') {
    Write-Host "Container exited with code $exitCode"
    exit [int]$exitCode
}

Write-Host "Acceptance smoke tests completed. Logs (if any) copied to: $logDir"
