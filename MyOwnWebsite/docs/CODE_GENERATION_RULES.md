# Code Generation Rules

## Purpose

This file is a reusable instruction script for any AI coding tool, code generator, or teammate working in this repository.

Goal:

- Keep generated code consistent with the current project
- Avoid unsafe refactors and low-quality placeholder code
- Require verification before considering code complete

Use this file as a required prompt or pre-task rule set before generating or editing code.

---

## Required Stack Rules

1. Use Vue 3 with Composition API only.
2. In Vue files, use `<script setup lang="ts">` for new code unless the target file clearly requires another pattern.
3. Use TypeScript for all new logic.
4. Preserve the existing router, service, and composable structure.
5. Do not introduce a new state library, CSS framework, animation library, or UI library unless explicitly requested.

---

## Repository-Specific Rules

1. Prefer updating existing components and composables over adding duplicate logic.
2. If a page grows beyond one clear responsibility, extract reusable logic into `src/composables/...`.
3. If a visual effect is reused across pages, extract it into `src/components/...`.
4. For CSGO pages, shared motion logic must go through reusable helpers instead of copy-pasted animation code.
5. Do not hide page content by default with `opacity: 0` unless there is a guaranteed JS or Vue transition path that restores visibility.
6. For translucent UI, use `rgba(...)` or transparent gradients on backgrounds. Do not reduce whole-container `opacity` when text readability matters.
7. Background effects must use `pointer-events: none` unless the effect is intentionally interactive.
8. New visuals must not block clicks, scrolling, form input, or charts.

---

## Vue Component Rules

1. Keep data derivation in `computed`.
2. Use `watch` only for side effects, async reactions, or imperative animation triggers.
3. Type template refs explicitly with `useTemplateRef<HTMLElement>()` or the correct instance type.
4. Prefer props down and events up. Do not mutate parent state indirectly.
5. Avoid large inline template expressions. Move branching and formatting into script when it improves readability.
6. Keep templates declarative and readable.
7. Use stable keys in `v-for`.
8. Do not use `v-html` with untrusted content.

---

## Styling Rules

1. Prefer scoped styles for page-local styling.
2. Prefer class selectors over bare element selectors in scoped CSS.
3. Reuse the project's visual language:
   - dark layered backgrounds
   - glass or translucent panels
   - restrained but noticeable motion
   - strong contrast for text and actions
4. Do not add random colors that break the current palette.
5. For page backgrounds, keep effects atmospheric rather than noisy.
6. For hover states, use subtle transform, border, shadow, or background shifts.
7. Do not rely on giant inline `style=""` blocks unless the value is truly dynamic.

---

## Animation Rules

1. Prefer reusable animation helpers over page-local ad hoc animation blocks.
2. Animation must enhance the UI, not control whether the page can be seen.
3. Entry animations should be short, readable, and layered:
   - section reveal
   - staggered cards
   - lightweight feedback on tab/filter changes
4. Avoid long autoplay animations on core content that distract from reading.
5. Ensure motion does not break when data is empty, loading, or delayed.
6. When a page uses Anime.js, keep selectors scoped to the page container when possible.
7. Always clean up long-running animations on unmount.

---

## Type Safety Rules

1. Do not add `any` unless there is no reasonable alternative and the boundary is external data.
2. When external API data is uncertain, narrow or type the minimum required fields.
3. Prefer explicit return types for reusable functions and composables.
4. Keep nullable state explicit.

---

## Refactor Safety Rules

1. Do not change behavior that was not requested.
2. Do not rename public APIs, routes, or component contracts unless required.
3. Do not remove existing features, text, or interactions just to simplify the code.
4. Do not replace working project patterns with generic boilerplate.
5. Keep diffs focused and minimal.

---

## Code Quality Rules

1. New code must be readable without extra explanation.
2. Use descriptive names for components, composables, and handlers.
3. Add comments only when the intent is not obvious.
4. Avoid dead code, commented-out blocks, placeholder logs, and speculative abstractions.
5. Keep one source of truth for the same piece of state.

---

## Verification Rules

Before finishing any coding task, the generated code must satisfy all of the following:

1. `pnpm exec vue-tsc --noEmit` passes
2. `pnpm exec vite build` passes when the change affects app behavior or build output
3. No new console errors are introduced by obvious inspection
4. No container is left unintentionally invisible because of motion or opacity logic
5. No background effect blocks foreground interactions

If verification cannot be run, the response must explicitly say so.

---

## Forbidden Patterns

Do not generate code that:

- uses Options API in new Vue components without a project-specific reason
- adds full-container `opacity` to make cards translucent
- hides core content permanently behind animation states
- adds random utility classes or CSS systems not already used here
- mixes multiple animation paradigms for the same effect without reason
- introduces unrelated formatting churn
- leaves broken template nesting or mismatched tags

---

## Required Output Format For AI Tools

When using this repository with an AI coding tool, require the tool to follow this process:

1. Read the target file and nearby related files first.
2. Explain the intended change briefly before editing.
3. Reuse existing patterns from the repository.
4. Make the code change.
5. Run verification commands.
6. Report:
   - what changed
   - which files changed
   - what was verified
   - any remaining risk

---

## Ready-To-Use Prompt Script

Copy the block below into your coding assistant before asking it to generate code:

```text
You are editing a Vue 3 + TypeScript project.

Follow these rules exactly:

1. Use Composition API and <script setup lang="ts"> for new Vue logic.
2. Reuse existing project patterns before introducing new abstractions.
3. Keep route pages focused; extract reusable logic into composables and reusable visuals into components.
4. Use computed for derived state and watch only for side effects.
5. Do not hide content by default with opacity-based animation states unless visibility recovery is guaranteed.
6. For translucent UI, change background colors to rgba/transparent gradients instead of reducing whole-container opacity.
7. Background effects must never block interaction.
8. Do not introduce unrelated refactors or new libraries unless explicitly requested.
9. Keep code strongly typed and avoid any where possible.
10. Before finishing, run:
   - pnpm exec vue-tsc --noEmit
   - pnpm exec vite build

Your output must include:
- a short summary of the change
- files changed
- verification results
- any remaining risk
```

---

## Suggested Maintenance

Update this file whenever:

- the project adopts a new library or architecture rule
- common codegen mistakes appear repeatedly
- a new animation, styling, or routing pattern becomes standard
- verification commands change

