# Svelte Sprint Studio


## What the app shows

- Local reactive state with Svelte 5 runes.
- Derived values for filtering and dashboard metrics.
- Component composition with reusable cards.
- Two-way form bindings for building UI quickly.
- A clean Vite setup that can be extended into a larger project.

## Project concept

The sample is a mini "Sprint Studio" for project ideas. Users can:

- Filter project cards by track.
- Search by title, summary, or stack.
- Toggle a demo-ready filter.
- Advance a project's status through the workflow.
- Add a new project idea from a bound form and watch the UI update immediately.

## Run locally

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal, usually `http://localhost:5173`.

## Useful teaching talking points

1. `projects` is the source of truth for the board.
2. `filteredProjects`, `readyProjects`, and `completionRate` are derived from that source instead of being manually synchronized.
3. Form fields use `bind:value` and `bind:checked`, so the preview updates without DOM query code.
4. The UI is split into focused components instead of putting everything in one file.

