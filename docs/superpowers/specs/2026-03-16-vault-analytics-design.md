# Obsidian Vault Analytics Plugin — Design Spec

## Overview

An Obsidian plugin that provides a dedicated Dashboard view for analyzing personal knowledge management habits. It visualizes note creation/modification frequency, tag distribution, and word count trends through a GitHub-style contribution heatmap and various statistical charts, with week/month/year time range switching.

## Core Requirements

- **Target user**: Individual knowledge workers tracking their own note-taking habits
- **Data dimensions**: Note creation/modification frequency, tag/folder distribution, word count statistics
- **Heatmap**: Daily note activity count (created + modified), GitHub contribution graph style
- **Charts**: Trend line chart, tag distribution pie/bar chart, summary cards, weekday activity distribution
- **Time switching**: Week, month, year
- **Chart library**: Chart.js (heatmap uses custom Canvas rendering)
- **Presentation**: Dedicated ItemView panel (Dashboard)
- **Reference**: Follows obsidian-google-drive-sync plugin structure and patterns

## Architecture

### Approach: Unified Dashboard View + In-Memory Data Cache

A single `ItemView` serves as the Dashboard. A data collection layer scans vault file metadata on plugin load using Obsidian's `vault.getFiles()` and `metadataCache`, caching results in memory. Incremental updates are handled via vault event listeners.

This approach was chosen over Web Worker (unnecessary complexity for typical vault sizes) and local database persistence (exceeds current requirements).

## Dashboard Layout

Vertical waterfall layout, scrollable:

1. **Time range switcher** — Week / Month / Year toggle at top
2. **Summary cards row** — 4 cards: Total notes, Total words, Current streak, Avg words/day
3. **Heatmap** — Full-width GitHub-style contribution grid
4. **Trend + Tags row** — Line chart (2/3 width) alongside pie/bar chart (1/3 width)
5. **Activity distribution** — Weekday bar chart showing which days are most active

## Project Structure

```
obsidian-vault-analytics/
├── .github/workflows/release.yml
├── src/
│   ├── main.ts                  # Plugin entry: registers view, commands, ribbon icon
│   ├── settings.ts              # Settings tab (excluded folders, default period)
│   ├── analytics-view.ts        # Dashboard view (extends ItemView)
│   ├── data-collector.ts        # Scans vault files, extracts metadata
│   ├── data-aggregator.ts       # Aggregates raw data by time period (pure functions)
│   ├── charts/
│   │   ├── heatmap.ts           # Heatmap component (custom Canvas, no Chart.js)
│   │   ├── trend-chart.ts       # Trend line chart (Chart.js)
│   │   ├── tag-chart.ts         # Tag distribution pie/bar chart (Chart.js)
│   │   ├── activity-chart.ts    # Weekday activity bar chart (Chart.js)
│   │   └── summary-cards.ts     # Summary number cards (pure DOM)
│   └── utils.ts                 # Date helpers, word count
├── tests/
│   ├── __mocks__/obsidian.ts
│   ├── data-collector.test.ts
│   ├── data-aggregator.test.ts
│   └── utils.test.ts
├── esbuild.config.mjs
├── manifest.json
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── styles.css
└── versions.json
```

## Data Flow

```
vault files → data-collector (scan + listen) → FileRecord[]
    → data-aggregator (aggregate by period) → AggregatedData
    → charts/* (render) → analytics-view (assemble into Dashboard)
```

## Data Models

### FileRecord (raw data from data-collector)

```typescript
interface FileRecord {
  path: string;           // File path
  createdAt: number;      // Creation timestamp (ms)
  modifiedAt: number;     // Last modified timestamp (ms)
  wordCount: number;      // Word count
  tags: string[];         // Tags from frontmatter + inline tags
  folder: string;         // Parent folder
}
```

### AggregatedData (output from data-aggregator)

```typescript
interface AggregatedData {
  period: 'week' | 'month' | 'year';

  summary: {
    totalNotes: number;
    totalWords: number;
    currentStreak: number;    // Consecutive writing days
    avgWordsPerDay: number;
  };

  // Heatmap: date string → activity count
  heatmapData: Map<string, number>;  // "2026-03-16" → 5

  // Trend: daily note count and word count
  trendData: { date: string; noteCount: number; wordCount: number }[];

  // Tag distribution: tag → note count
  tagDistribution: { tag: string; count: number }[];

  // Weekday activity: day number → activity count
  // Note: 0=Monday, 6=Sunday (differs from JS Date.getDay() where 0=Sunday)
  activityByDay: { day: number; count: number }[];
}
```

### Settings

```typescript
interface VaultAnalyticsSettings {
  excludeFolders: string[];     // Excluded folders, default [".obsidian"]
  defaultPeriod: 'week' | 'month' | 'year';  // Default time range
}
```

## Key Design Decisions

1. **Heatmap uses custom Canvas** — GitHub-style grid heatmap is more precisely controlled with direct Canvas drawing than through Chart.js, which lacks a native heatmap type.

2. **data-collector: full scan on load + incremental event updates** — Listens to `vault.on('create')`, `vault.on('modify')`, `vault.on('delete')`, `vault.on('rename')` for real-time updates after initial scan.

3. **data-aggregator is pure functions** — Takes raw data + time range, returns aggregated result. No side effects, easy to test.

4. **Each chart component is independent** — Receives aggregated data, manages its own DOM element and Chart.js instance, responsible for cleanup/destroy.

5. **Word count: Chinese by character, English by whitespace** — `utils.ts` handles mixed-language word counting.

6. **Settings kept minimal** — Only exclude folders and default period. YAGNI for anything else.

## Component Interfaces

### data-collector

```typescript
class DataCollector {
  constructor(vault: Vault, metadataCache: MetadataCache, settings: VaultAnalyticsSettings);
  async scanAll(): Promise<FileRecord[]>;
  getRecords(): FileRecord[];
  startListening(): void;   // Register vault event handlers
  stopListening(): void;    // Unregister handlers
  onDataChange(callback: () => void): void;  // Notify view to re-render
}
```

### data-aggregator

```typescript
function aggregate(records: FileRecord[], period: 'week' | 'month' | 'year'): AggregatedData;
function calculateStreak(records: FileRecord[]): number;
```

### Chart components

All chart components implement the same interface pattern:

```typescript
interface ChartComponent {
  render(data: AggregatedData): void;
  destroy(): void;
}
```

Concrete implementations: `HeatmapChart`, `TrendChart`, `TagChart`, `ActivityChart`, `SummaryCards`. Each takes a container `HTMLElement` in its constructor.

### analytics-view

```typescript
class AnalyticsView extends ItemView {
  // Manages time range state, orchestrates chart components
  // Re-renders all charts when period changes or data updates
}
```

## Error Handling

- **File read failure** — Skip the file, `console.warn`, continue processing others
- **Empty vault / no markdown files** — Show empty state message in Dashboard
- **Chart.js render failure** — Show fallback text in chart area
- **No data for selected period** — Show "No data for this period" in each chart area

## Testing Strategy

Using Vitest with `tests/__mocks__/obsidian.ts` for Obsidian API mocking (same pattern as reference project).

- **data-collector.test.ts** — File scanning, incremental updates, tag extraction, folder exclusion filtering
- **data-aggregator.test.ts** — Pure function tests: aggregation across time ranges, streak calculation, empty data handling, boundary dates
- **utils.test.ts** — Word count (Chinese characters, English words, mixed), date formatting

## Build & CI

- **Build**: esbuild (same config as reference project), output `main.js`
- **TypeScript**: Strict mode, all strict flags enabled
- **CI/CD**: GitHub Actions release workflow triggered by tag push, publishes `main.js`, `manifest.json`, `styles.css`
- **Dev dependencies**: esbuild, obsidian types, typescript, vitest, chart.js
