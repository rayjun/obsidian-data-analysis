import { Chart } from "chart.js";
import type { AggregatedData, ChartComponent } from "../types";
import type { I18n } from "../i18n";

export class TrendChart implements ChartComponent {
	private container: HTMLElement;
	private wrapper: HTMLElement | null = null;
	private chart: Chart | null = null;
	private i18n: I18n;

	constructor(container: HTMLElement, i18n: I18n) { this.container = container; this.i18n = i18n; }

	render(data: AggregatedData): void {
		this.destroy();
		this.wrapper = this.container.createDiv({ cls: "va-trend-chart" });
		this.wrapper.createDiv({ cls: "va-section-title", text: this.i18n.noteTrend });

		if (data.trendData.every((d) => d.noteCount === 0 && d.wordCount === 0)) {
			this.wrapper.createDiv({ cls: "va-empty", text: this.i18n.noDataForPeriod });
			return;
		}

		const canvas = this.wrapper.createEl("canvas");
		try {
			this.chart = new Chart(canvas, {
				type: "line",
				data: {
					labels: data.trendData.map((d) => d.date),
					datasets: [
						{ label: this.i18n.notes, data: data.trendData.map((d) => d.noteCount), borderColor: "#39d353", backgroundColor: "rgba(57, 211, 83, 0.1)", fill: true, tension: 0.3, pointRadius: data.trendData.length > 60 ? 0 : 3 },
						{ label: this.i18n.words, data: data.trendData.map((d) => d.wordCount), borderColor: "#58a6ff", backgroundColor: "rgba(88, 166, 255, 0.1)", fill: true, tension: 0.3, yAxisID: "y1", pointRadius: data.trendData.length > 60 ? 0 : 3 },
					],
				},
				options: {
					responsive: true, maintainAspectRatio: false,
					interaction: { mode: "index", intersect: false },
					scales: {
						x: { ticks: { maxTicksLimit: 10, color: "#8b949e" }, grid: { color: "rgba(139, 148, 158, 0.1)" } },
						y: { position: "left", title: { display: true, text: this.i18n.notes, color: "#8b949e" }, ticks: { color: "#8b949e" }, grid: { color: "rgba(139, 148, 158, 0.1)" } },
						y1: { position: "right", title: { display: true, text: this.i18n.words, color: "#8b949e" }, ticks: { color: "#8b949e" }, grid: { drawOnChartArea: false } },
					},
					plugins: { legend: { labels: { color: "#c9d1d9" } } },
				},
			});
		} catch (err) {
			console.error("[Data Analytics] Failed to render trend chart:", err);
			this.wrapper.createDiv({ cls: "va-chart-error", text: this.i18n.failedToLoadChart });
		}
	}

	destroy(): void { this.chart?.destroy(); this.chart = null; this.wrapper?.remove(); this.wrapper = null; }
}
