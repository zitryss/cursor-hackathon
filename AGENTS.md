# AGENTS.md

## Tech Stack

* [TypeScript](https://www.typescriptlang.org/docs/)
* [Node.js](https://nodejs.org/llms.txt)
* [pnpm](https://pnpm.io/)
* [Vite](https://vite.dev/llms.txt)
* [React](https://react.dev/llms.txt)
* [React Compiler](https://react.dev/llms.txt)
* [React Router](https://reactrouter.com/)
* [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss.com/blob/md-endpoints/llms.txt)
* [shadcn/ui](https://ui.shadcn.com/llms.txt)
* [Base UI](https://base-ui.com/llms.txt)
* [Biome](https://biomejs.dev/)
* [Vitest](https://vitest.dev/llms.txt)
* [Playwright](https://playwright.dev/)

## Rules

* Use `pnpm` as the package manager.
* Never use `any` unless it is necessary or specifically requested.
* Use `pnpm run <script>` for project workflows. Use `pnpm exec <binary>` only when no project script covers the required tool operation.
* Pass arguments directly after a `pnpm run` script name: `pnpm run <script> <args...>`; do not insert an npm-style `--`. pnpm forwards `--` to the target CLI, so use it only when that CLI explicitly requires an end-of-options marker; this project rule overrides generic examples.
* Run package-provided CLIs from the local dependency graph. Never use global executables, `npx`, or `pnpm dlx`.
* Do not run long-lived processes such as `pnpm run dev`, `pnpm run start`, or any watch mode. Assume the development server is already running.
* Never run Playwright unless explicitly requested or authorized by the user. This includes end-to-end tests, test discovery, browser diagnosis, browser installation, and scripts such as `verify:full` that invoke Playwright.

## Project Scripts

| Script | Intent |
| --- | --- |
| `dev` | Start the hot-reloading development server; agents must not start it. |
| `build` | Create the React Router production build. |
| `start` | Serve the compiled production bundle; agents must not start it. |
| `routes` | Print the resolved route tree as JSON. |
| `check` | Check the entire project with Biome without modifying files. |
| `check:write` | Apply project-wide Biome fixes; use only for intentional cleanup and review every change. |
| `typecheck` | Generate route types, then check the complete TypeScript project. |
| `deps:check` | Report dependency updates as JSON without changing files; exit code 1 means updates are available. |
| `deps:update:runtime` | Update production dependencies and their version-coupled development packages. |
| `deps:update:tooling` | Update development tools and their version-coupled runtime packages. |
| `test` | Run the unit test suite once with concise agent output. |
| `test:e2e` | Run the Playwright end-to-end suite once with line output; requires explicit user request or authorization. |
| `verify` | Run Biome, type checking, unit tests, and the production build. |
| `verify:full` | Run `verify`, then the complete end-to-end suite; requires explicit user request or authorization. |

## Workflows

### Dependencies

* Run `pnpm install` only when dependencies changed or `node_modules` is missing, then review any lockfile change.
* Use `pnpm install --frozen-lockfile` when the manifest and lockfile must remain unchanged.
* Use `pnpm ci` only for a clean CI-style install; it removes `node_modules` first.

### During Implementation

* Run `pnpm exec biome check --write <changed-files...>` after editing files Biome supports.
* Run `pnpm run test <test-file>` for focused unit coverage. Add `-t "<test-name>"` to select one test.
* End-to-end Playwright tests are outside the default implementation workflow. Run `pnpm run test:e2e <spec-file> --project=chromium` only when explicitly requested or authorized; add `:<line>` to select one test.
* Run `pnpm run typecheck` after TypeScript, route, configuration, or generated-type changes.

### Before Handoff

Run `pnpm run verify` as the default handoff gate for all implementation changes, including UI, routing, server behavior, and cross-layer integration. Do not run end-to-end tests or `pnpm run verify:full` unless explicitly requested or authorized. If `verify:full` is authorized, run it instead of `verify`; the full gate already includes it.

### Inspection and Diagnostics

Inspect project state with:

```bash
pnpm run routes
```

Only when Playwright is explicitly requested or authorized, list tests with `pnpm run test:e2e --list`.

For browser diagnosis, only when explicitly requested or authorized, use one named session and refs returned by snapshots:

```bash
pnpm exec playwright-cli -s=cursor-hackaton open http://127.0.0.1:5173
pnpm exec playwright-cli -s=cursor-hackaton snapshot --depth=4
pnpm exec playwright-cli -s=cursor-hackaton click <element-ref>
pnpm exec playwright-cli -s=cursor-hackaton console
pnpm exec playwright-cli -s=cursor-hackaton requests
pnpm exec playwright-cli -s=cursor-hackaton close
```

Prefer `snapshot`, `find`, `console`, and `requests` over screenshots. Always close the session.

### shadcn/ui Workflow

Specify the registry and use the exact-pinned local CLI:

```bash
pnpm exec shadcn info --json
pnpm exec shadcn search <registry> -q "<query>" --json
pnpm exec shadcn docs <component>
pnpm exec shadcn add <component> --dry-run
pnpm exec shadcn add <component> --diff
pnpm exec shadcn add <component>
```

Read the URLs returned by `docs` before implementation and review every generated file. Never use the deprecated `shadcn diff`, fetch registry files manually, or pass `--overwrite` without explicit user approval.

### Runtime Dependency Updates

Start with `pnpm run deps:check` and review release notes for the proposed versions.

1. Run `pnpm run deps:update:runtime`.
2. Keep `react` with `react-dom` and all four React Router packages on matching versions.
3. Review `package.json` and `pnpm-lock.yaml`, apply required migrations, then run `pnpm run verify`.

### Tooling and Exact-Pinned CLI Updates

Start with `pnpm run deps:check` and review release notes for the proposed versions.

1. Run `pnpm run deps:update:tooling`.
2. Run `corepack use pnpm@latest`, then `pnpm install` to validate the lockfile with the new pinned pnpm version.
3. If Playwright changed, run `pnpm exec playwright install chromium firefox webkit` only when explicitly requested or authorized.
4. Confirm the React Router and Tailwind package families remain synchronized; review the manifest and lockfile, then run `pnpm run verify`.

## Project Guidelines

* The pitch deck is 16:9 primary; the phone is a mock inside the slide.
* Use vertical slice architecture: organize code by feature or use case, keeping its UI, business logic, and data access together. Minimize coupling between slices.

## Git Guidelines

* Take responsibility and accountability for local Git as part of implementation. Handle routine Git work quietly and autonomously. Do not wait for the user to request commits or involve them in routine commit decisions.
* Choose commit boundaries by purpose and completeness, not by individual edits or messages. Proactively commit each completed atomic changeset—one coherent change with a single purpose—before moving on to unrelated work.
* Keep the working tree clean between completed tasks by committing your work. If unrelated changes are present or appear during the task, preserve them and ask how to proceed. Never discard work or use destructive cleanup to obtain a clean working tree.
* Never commit secrets. Exclude temporary artifacts from commits and add appropriate ignore rules for them.
* Use Conventional Commits.
* Work directly on `main` by default. Create, switch, or delete branches or worktrees only when requested or authorized.
* Begin each new task from updated local `main`: fetch from `origin` and fast-forward `main` when it is behind `origin/main`. Preserve unpushed local commits; if the histories have diverged, propose a reconciliation approach for the user's approval. Create authorized feature branches from the resulting `main`. Continue an existing task on its existing branch.
* Before local feature-branch integration or opening a pull request, fetch again and rebase the feature branch onto `origin/main`.
* For authorized local integration, fast-forward `main` to the feature branch. If this fails, resolve the divergence within the authorized scope or propose a solution for the user's approval; do not fall back to creating a merge commit.
* For the pull-request workflow, push the feature branch and open the PR only as authorized. Wait for review approval and satisfaction of applicable merge requirements. Use Squash and merge only when merging is also authorized; permission to publish or open a PR does not imply permission to merge it.
* When undoing committed changes, prefer a targeted revert commit that preserves subsequent work.
* Feature-branch integration, pushing, publishing, opening or merging pull requests, and creating releases require explicit user authorization. Routine fetching and fast-forward updates from upstream are permitted. Force-pushing, including with `--force-with-lease`, requires specific authorization for that operation, even after a rebase.
* Involve the user when authorization is required or a blocker cannot be resolved within the current task. Routine successful Git operations do not need a separate report.
