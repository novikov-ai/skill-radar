# Skill Radar

An interactive radar chart for tracking skill progress over time.

**Live demo:** https://novikov-ai.github.io/skill-radar/

## Features

- Define your own skill categories
- 0–5 scoring scale (None → Aware → Basic → Competent → Advanced → Expert)
- Snapshot comparison — overlay multiple time periods on one chart
- Add, remove, edit, and reorder skills
- Add, remove, and rename snapshots
- JSON export / import for data persistence
- Dark theme

## Tech stack

- React 18 + Vite
- Recharts (RadarChart)
- Tailwind CSS

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deployment

Pushes to `main` automatically deploy to GitHub Pages via GitHub Actions.

## License

MIT © novikov-ai
