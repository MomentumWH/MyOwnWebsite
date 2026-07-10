---
name: my-daily-habit
description: Apply this repository's daily development conventions when implementing, refactoring, debugging, or reviewing MyOwnWebsite. Use for Vue 3 SFCs, TypeScript logic, Vue Router, Pinia stores, Axios services, Naive UI interfaces, ECharts or Anime.js interactions, and the CS item pages. Preserve the existing architecture, visual language, type safety, motion behavior, and verification workflow.
---

# MyOwnWebsite Daily Development

Keep changes consistent with the existing Vue 3 application. Prefer focused improvements over generic rewrites.

## Inspect Before Editing

1. Read the target file and its direct imports.
2. Read nearby components, composables, stores, services, and route definitions that own the same behavior.
3. Check `docs/CODE_GENERATION_RULES.md` and `package.json` when the task affects architecture, tooling, or verification.
4. Check `git status` and preserve unrelated user changes.
5. State the intended edit briefly before modifying files.

## Preserve Project Boundaries

- Keep route-level pages in `src/views` as composition surfaces when practical.
- Put reusable presentation in `src/components`.
- Put reusable stateful behavior and side effects in `src/composables`.
- Put cross-page state in Pinia stores under `src/stores`; keep page-only state local.
- Keep HTTP clients and endpoint wrappers in `src/services`.
- Keep authentication and route-access decisions in `src/permissions` and the global router guard.
- Reuse an existing component or composable before creating a parallel implementation.
- Do not rename routes, public component contracts, storage keys, or service functions unless the task requires it.

## Write Vue and TypeScript Consistently

- Use Vue 3 Composition API with `<script setup lang="ts">`.
- Keep SFC sections ordered as `<script>`, `<template>`, then `<style>`.
- Use `computed` for derived state and `watch` only for side effects or imperative synchronization.
- Use `shallowRef` for primitive state and opaque third-party instances when deep reactivity is unnecessary.
- Use `useTemplateRef<T>()` for DOM and component template refs.
- Type props and events with `defineProps` and `defineEmits`; follow props down and events up.
- Keep templates declarative. Move complex conditions, formatting, filtering, and sorting into script.
- Use stable primitive keys in `v-for` and never render untrusted content with `v-html`.
- Avoid `any`. At uncertain API boundaries, define the minimum response shape and narrow unknown values.
- Add comments only when they explain intent, cleanup requirements, or a non-obvious constraint.

## Follow Existing UI Conventions

- Reuse Naive UI and `@vicons/ionicons5` before adding custom controls or icon libraries.
- Use icons for familiar tool actions and text or icon-plus-text for explicit commands.
- Prefer scoped CSS or SCSS with class selectors for page-local styles.
- Preserve the project's dark layered backgrounds, translucent surfaces, high-contrast text, and restrained accent colors.
- Make translucent surfaces with `rgba(...)` or transparent gradients; do not lower container opacity when it contains text.
- Keep background decoration atmospheric and set `pointer-events: none` on non-interactive effects.
- Avoid nested decorative cards, excessive large radii, and effects that obscure content or charts.
- Define responsive dimensions for boards, charts, grids, toolbars, and other fixed-format UI.
- Check long Chinese and English text at desktop and mobile widths. Prevent overlap and horizontal overflow.

## Build Motion Safely

- Use the global route transition in `src/App.vue` for page changes instead of adding competing route animations.
- Reuse `src/composables/csgo/useCsgoPageMotion.ts` for motion shared by CS item pages.
- Scope Anime.js selectors to the current page container.
- Prefer `transform` and `opacity` for animation performance; avoid animating layout properties when possible.
- Keep entry and exit motion short. Do not delay access to core content for decorative animation.
- Never leave important content hidden at `opacity: 0` without a guaranteed visible fallback.
- Clean up timelines, listeners, timers, chart instances, and long-running animations on unmount.
- Respect `prefers-reduced-motion` for non-essential motion.

## Handle Data and APIs Deliberately

- Reuse the existing Axios clients instead of creating page-local clients.
- Keep environment-specific base URLs in Vite environment variables.
- Do not add API tokens, credentials, or private identifiers to client code.
- Represent loading, empty, success, and error states for user-facing requests.
- Keep ECharts instances outside deep Vue reactivity, resize them with their containers, and dispose them on unmount.
- Use `computed` for filtered and paginated views; do not repeatedly transform large collections in templates.

## Keep Changes Focused

- Do not introduce a new framework, state library, CSS system, UI kit, chart library, or animation library unless requested.
- Do not replace working project patterns with generic boilerplate.
- Do not remove existing text, features, or interactions merely to simplify implementation.
- Extract an abstraction only when it removes meaningful duplication or matches an established project boundary.
- Avoid unrelated formatting churn, dead code, placeholder logs, and speculative refactors.

## Verify Before Finishing

Run checks in proportion to the change:

```bash
pnpm run typecheck
pnpm run test
pnpm run build
git diff --check
```

- Always run `pnpm run typecheck` after TypeScript or Vue changes.
- Run `pnpm run test` after logic, permissions, stores, services, or composables change.
- Run `pnpm run build` after application, routing, styling, dependency, or build changes.
- Run focused browser checks for user-facing layout and interaction changes when browser access is available.
- Run lint only when the repository contains a working `eslint.config.*`; do not claim lint passed when ESLint cannot load a configuration.
- Report checks that were not run, existing warnings, and remaining visual or integration risks.

## Handoff Clearly

Report:

1. The behavior or structure changed.
2. The files changed.
3. The verification completed.
4. Any remaining risk or blocked check.
