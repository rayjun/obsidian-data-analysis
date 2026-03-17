export type Period = "week" | "month" | "year";

export interface FileRecord {
	path: string;
	createdAt: number;
	modifiedAt: number;
	wordCount: number;
	tags: string[];
	folder: string;
}

export interface SummaryData {
	totalNotes: number;
	totalWords: number;
	currentStreak: number;
	avgWordsPerDay: number;
}

export interface AggregatedData {
	period: Period;
	summary: SummaryData;
	heatmapData: Map<string, number>;
	trendData: { date: string; noteCount: number; wordCount: number }[];
	tagDistribution: { tag: string; count: number }[];
	activityByDay: { day: number; count: number }[];
}

export interface DataAnalyticsSettings {
	excludeFolders: string[];
	defaultPeriod: Period;
}

export const DEFAULT_SETTINGS: DataAnalyticsSettings = {
	excludeFolders: [".obsidian"],
	defaultPeriod: "month",
};

export interface ChartComponent {
	render(data: AggregatedData): void;
	destroy(): void;
}
