export type Language = "en" | "zh";

const en = {
	// Analytics View
	dashboardTitle: "Data Analytics",
	week: "Week",
	month: "Month",
	year: "Year",
	emptyVault: "No notes found. Start writing to see your analytics!",

	// Summary Cards
	totalNotes: "Total Notes",
	totalWords: "Total Words",
	currentStreak: "Current Streak",
	avgWordsPerDay: "Avg Words/Day",

	// Heatmap
	activityHeatmap: "Activity Heatmap",
	noDataForPeriod: "No data for this period",
	activities: "activities",
	dayMon: "Mon",
	dayWed: "Wed",
	dayFri: "Fri",

	// Trend Chart
	noteTrend: "Note Trend",
	notes: "Notes",
	words: "Words",
	failedToLoadChart: "Failed to load chart",

	// Tag Chart
	tagDistribution: "Tag Distribution",
	noTagsFound: "No tags found",

	// Activity Chart
	weeklyActivity: "Weekly Activity",
	dayLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as string[],

	// Settings
	settingsTitle: "Data Analytics Settings",
	settingLanguage: "Language",
	settingLanguageDesc: "Display language for the dashboard",
	settingDefaultPeriod: "Default time range",
	settingDefaultPeriodDesc: "The default period shown when opening the dashboard",
	settingExcludeFolders: "Excluded folders",
	settingExcludeFoldersDesc: "Folders to exclude from analysis (one per line)",

	// Main
	ribbonTooltip: "Open data analytics",
	commandName: "Open analytics dashboard",
};

const zh: typeof en = {
	// Analytics View
	dashboardTitle: "数据分析",
	week: "周",
	month: "月",
	year: "年",
	emptyVault: "未找到笔记，开始写作后即可查看分析！",

	// Summary Cards
	totalNotes: "笔记总数",
	totalWords: "总字数",
	currentStreak: "连续天数",
	avgWordsPerDay: "日均字数",

	// Heatmap
	activityHeatmap: "活动热力图",
	noDataForPeriod: "该时段暂无数据",
	activities: "次活动",
	dayMon: "一",
	dayWed: "三",
	dayFri: "五",

	// Trend Chart
	noteTrend: "笔记趋势",
	notes: "笔记",
	words: "字数",
	failedToLoadChart: "图表加载失败",

	// Tag Chart
	tagDistribution: "标签分布",
	noTagsFound: "暂无标签",

	// Activity Chart
	weeklyActivity: "每周活动",
	dayLabels: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],

	// Settings
	settingsTitle: "数据分析设置",
	settingLanguage: "语言",
	settingLanguageDesc: "仪表盘显示语言",
	settingDefaultPeriod: "默认时间范围",
	settingDefaultPeriodDesc: "打开仪表盘时默认显示的时间范围",
	settingExcludeFolders: "排除文件夹",
	settingExcludeFoldersDesc: "需要排除的文件夹（每行一个）",

	// Main
	ribbonTooltip: "打开数据分析",
	commandName: "打开数据分析面板",
};

export type I18n = typeof en;

const translations: Record<Language, I18n> = { en, zh };

export function t(lang: Language): I18n {
	return translations[lang] ?? translations.en;
}
