import { ItemView, WorkspaceLeaf } from "obsidian";
import type { Period, AggregatedData, ChartComponent, DataAnalyticsSettings } from "./types";
import { t } from "./i18n";
import { DataCollector } from "./data-collector";
import { aggregate } from "./data-aggregator";
import { SummaryCards } from "./charts/summary-cards";
import { HeatmapChart } from "./charts/heatmap";
import { TrendChart } from "./charts/trend-chart";
import { TagChart } from "./charts/tag-chart";
import { ActivityChart } from "./charts/activity-chart";

export const VIEW_TYPE_ANALYTICS = "data-analytics-view";

export class AnalyticsView extends ItemView {
	private collector: DataCollector;
	private settings: DataAnalyticsSettings;
	private currentPeriod: Period;
	private charts: ChartComponent[] = [];
	private unsubscribe: (() => void) | null = null;

	constructor(leaf: WorkspaceLeaf, collector: DataCollector, settings: DataAnalyticsSettings) {
		super(leaf);
		this.collector = collector;
		this.settings = settings;
		this.currentPeriod = settings.defaultPeriod;
	}

	getViewType(): string { return VIEW_TYPE_ANALYTICS; }
	getDisplayText(): string { return t(this.settings.language).dashboardTitle; }
	getIcon(): string { return "bar-chart-2"; }

	async onOpen(): Promise<void> {
		this.unsubscribe = this.collector.onDataChange(() => this.rebuildUI());
		this.rebuildUI();
	}

	async onClose(): Promise<void> {
		this.unsubscribe?.();
		this.unsubscribe = null;
		this.destroyCharts();
	}

	/** Rebuild entire UI including header — called on language change and data change */
	rebuildUI(): void {
		this.destroyCharts();
		const container = this.contentEl;
		container.empty();
		container.addClass("va-dashboard");

		const i18n = t(this.settings.language);

		const header = container.createDiv({ cls: "va-header" });
		header.createEl("h2", { text: i18n.dashboardTitle });

		const switcher = header.createDiv({ cls: "va-period-switcher" });
		const periods: Period[] = ["week", "month", "year"];
		const labels: Record<Period, string> = { week: i18n.week, month: i18n.month, year: i18n.year };

		for (const p of periods) {
			const btn = switcher.createEl("button", {
				text: labels[p],
				cls: `va-period-btn ${p === this.currentPeriod ? "va-period-active" : ""}`,
			});
			btn.addEventListener("click", () => {
				this.currentPeriod = p;
				this.rebuildUI();
			});
		}

		const contentArea = container.createDiv({ cls: "va-content" });
		const records = this.collector.getRecords();

		if (records.length === 0) {
			contentArea.createDiv({ cls: "va-empty-state", text: i18n.emptyVault });
			return;
		}

		const data = aggregate(records, this.currentPeriod);

		const summarySection = contentArea.createDiv({ cls: "va-section" });
		const summaryCards = new SummaryCards(summarySection, i18n);
		summaryCards.render(data);
		this.charts.push(summaryCards);

		const heatmapSection = contentArea.createDiv({ cls: "va-section" });
		const heatmap = new HeatmapChart(heatmapSection, i18n);
		heatmap.render(data);
		this.charts.push(heatmap);

		const chartRow = contentArea.createDiv({ cls: "va-chart-row" });
		const trendSection = chartRow.createDiv({ cls: "va-chart-main" });
		const trendChart = new TrendChart(trendSection, i18n);
		trendChart.render(data);
		this.charts.push(trendChart);

		const tagSection = chartRow.createDiv({ cls: "va-chart-side" });
		const tagChart = new TagChart(tagSection, i18n);
		tagChart.render(data);
		this.charts.push(tagChart);

		const activitySection = contentArea.createDiv({ cls: "va-section" });
		const activityChart = new ActivityChart(activitySection, i18n);
		activityChart.render(data);
		this.charts.push(activityChart);
	}

	private destroyCharts(): void {
		for (const chart of this.charts) { chart.destroy(); }
		this.charts = [];
	}
}
