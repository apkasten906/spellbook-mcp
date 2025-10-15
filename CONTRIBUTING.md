# Contributing

We use **GitHub Flow** and **SemVer**.

## Branches

- `main`: latest stable
- `dev`: next release in progress
- `feat/*`, `fix/*`, `docs/*`: feature branches

## Branching policy

- Every new feature must have its own top-level feature branch named `feat/<short-description>`.
- If a feature is split into multiple stories or tasks, create topic branches for each story named `feat/<feature>/story-<short>` or `story/<feature>-<short>` and merge them into the feature branch (via PR) before the feature branch is merged into `dev`.
- Bugfixes should use `fix/<short-description>` and be targeted to `dev` (or the active feature branch, if the fix is feature-specific).
- Keep PRs small and focused: prefer multiple small PRs on story/topic branches that merge into the feature branch.
- Example flow:
	 1. Create `feat/notifications` for a new notifications feature.
	 2. Create `feat/notifications/story-email` and `feat/notifications/story-ui` for separate stories.
	 3. Open PRs from the story branches into `feat/notifications`.
	 4. Once feature is complete, open PR from `feat/notifications` into `dev`.

Enforcing this policy improves reviewability and keeps `dev` stable while features are in progress.

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
