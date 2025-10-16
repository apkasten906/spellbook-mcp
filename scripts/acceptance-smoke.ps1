Param()

# Create logs directory
$logDir = Join-Path -Path $PSScriptRoot -ChildPath '..\mcp-starter\logs' | Resolve-Path -Relative
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}

Write-Host "Running acceptance smoke locally with LOG_MCP=1. Logs will be in: $logDir"

Set-Location -Path (Join-Path -Path $PSScriptRoot -ChildPath '..\mcp-starter')

$env:LOG_MCP = '1'
# Install at repo root so root devDependencies (e.g., Cucumber) are available
npm ci --prefix ..
try {
    # Run acceptance from repo root using --prefix so scripts in root package.json are used
    npm --prefix .. run acceptance
} catch {
    Write-Host "Acceptance run failed. See logs in $logDir"
    exit 1
}

Write-Host "Acceptance smoke completed. Logs: $logDir"
