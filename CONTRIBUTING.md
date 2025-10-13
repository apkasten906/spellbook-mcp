# Contributing

We use **GitHub Flow** and **SemVer**.

## Branches

- `main`: latest stable
- `dev`: next release in progress
- `feat/*`, `fix/*`, `docs/*`: feature branches

## Commits

- Use **Conventional Commits**: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `ci:`

## Releases

1. Update prompts / server code.
2. Update `CHANGELOG.md`.
3. Bump version in README.
4. Tag the release: `git tag vX.Y.Z && git push --tags`.
5. Action **Release** attaches a zip artifact.

## Code of Conduct

Be kind. PRs must include a short rationale in the description.
