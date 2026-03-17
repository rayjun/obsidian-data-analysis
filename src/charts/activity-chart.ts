import { Chart } from "chart.js";
import type { AggregatedData, ChartComponent } from "../types";
import type { I18n } from "../i18n";

export class ActivityChart implements ChartComponent {
	private container: HTMLElement;
	private wrapper: HTMLElement | null = null;
	private chart: Chart | null = null;
	private i18n: I18n;

	constructor(container: HTMLElement, i18n: I18n) { this.container = container; this.i18n = i18n; }

	render(data: AggregatedData): void {
		this.destroy();
		this.wrapper = this.container.createDiv({ cls: "va-activity-chart" });
		this.wrapper.createDiv({ cls: "va-section-title", text: this.i18n.weeklyActivity });

		if (data.activityByDay.every((d) => d.count === 0)) {
			this.wrapper.createDiv({ cls: "va-empty", text: this.i18n.noDataForPeriod });
			return;
		}

		const canvas = this.wrapper.createEl("canvas");
		try {
			this.chart = new Chart(canvas, {
				type: "bar",
				data: {
					labels: this.i18n.dayLabels,
					datasets: [{ label: this.i18n.activities, data: data.activityByDay.map((d) => d.count), backgroundColor: data.activityByDay.map((d) => d.count > 0 ? "#39d353" : "#ebedf0"), borderRadius: 4 }],
				},
				options: {
					responsive: true, maintainAspectRatio: false,
					scales: { x: { ticks: { color: "#8b949e" }, grid: { display: false } }, y: { ticks: { color: "#8b949e" }, grid: { color: "rgba(139, 148, 158, 0.1)" }, beginAtZero: true } },
					plugins: { legend: { display: false } },
				},
			});
		} catch (err) {
			console.error("[Data Analytics] Failed to render activity chart:", err);
			this.wrapper.createDiv({ cls: "va-chart-error", text: this.i18n.failedToLoadChart });
		}
	}

	destroy(): void { this.chart?.destroy(); this.chart = null; this.wrapper?.remove(); this.wrapper = null; }
}
