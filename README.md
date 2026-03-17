# Obsidian Vault Analytics

A data analytics dashboard plugin for [Obsidian](https://obsidian.md). Visualize your note-taking habits with a GitHub-style contribution heatmap, trend charts, tag distribution, and activity statistics.

![Obsidian](https://img.shields.io/badge/Obsidian-%23483699.svg?logo=obsidian&logoColor=white)
![License](https://img.shields.io/github/license/rayjun/obsidian-vault-analytics)

## Features

- **GitHub-style Heatmap** — Daily note activity (created + modified) displayed as a contribution grid
- **Summary Cards** — Total notes, total words, current writing streak, average words per day
- **Trend Chart** — Line chart showing note count and word count trends over time
- **Tag Distribution** — Horizontal bar chart of your most-used tags
- **Weekday Activity** — Bar chart showing which days of the week you're most active
- **Time Range Switching** — Toggle between Week / Month / Year views
- **Mixed Language Support** — Word count handles both Chinese characters and English words
- **Responsive Layout** — Adapts to narrow panes and mobile devices

## Installation

### From Obsidian Community Plugins (Recommended)

1. Open Obsidian Settings → Community plugins
2. Click "Browse" and search for **Vault Analytics**
3. Click Install, then Enable

### Install Script

```bash
git clone https://github.com/rayjun/obsidian-vault-analytics.git
cd obsidian-vault-analytics
./install.sh                    # Build only
./install.sh /path/to/vault     # Build and install to vault
```

### Manual Install

1. Download `main.js`, `manifest.json`, `styles.css` from the [latest release](https://github.com/rayjun/obsidian-vault-analytics/releases/latest)
2. Create folder `<vault>/.obsidian/plugins/vault-analytics/`
3. Copy the 3 files into that folder
4. Restart Obsidian → Settings → Community plugins → Enable **Vault Analytics**

## Usage

- Click the **bar chart icon** in the left ribbon to open the dashboard
- Or use the command palette: `Vault Analytics: Open analytics dashboard`

### Settings

- **Default time range** — Choose whether the dashboard opens in Week, Month, or Year view
- **Excluded folders** — Folders to ignore during analysis (`.obsidian` excluded by default)

## Development

```bash
# Install dependencies
npm install

# Development build (watch mode)
npm run dev

# Production build
npm run build

# Run tests
npm test
```

### Tech Stack

- TypeScript (strict mode)
- Chart.js for line/bar charts
- Custom Canvas rendering for heatmap
- esbuild for bundling
- Vitest for testing

## License

MIT
