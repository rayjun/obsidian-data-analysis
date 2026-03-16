import { Chart, registerables } from "chart.js";
import type { AggregatedData, ChartComponent } from "../types";

Chart.register(...registerables);

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export class ActivityChart implements ChartComponent {
	private container: HTMLElement;
	private wrapper: HTMLElement | null = null;
	private chart: Chart | null = null;

	constructor(container: HTMLElement) { this.container = container; }

	render(data: AggregatedData): void {
		this.destroy();
		this.wrapper = this.container.createDiv({ cls: "va-activity-chart" });
		this.wrapper.createDiv({ cls: "va-section-title", text: "Weekly Activity" });

		if (data.activityByDay.every((d) => d.count === 0)) {
			this.wrapper.createDiv({ cls: "va-empty", text: "No data for this period" });
			return;
		}

		const canvas = this.wrapper.createEl("canvas");
		try {
			this.chart = new Chart(canvas, {
				type: "bar",
				data: {
					labels: DAY_LABELS,
					datasets: [{ label: "Activities", data: data.activityByDay.map((d) => d.count), backgroundColor: data.activityByDay.map((d) => d.count > 0 ? "#39d353" : "#161b22"), borderRadius: 4 }],
				},
				options: {
					responsive: true, maintainAspectRatio: false,
					scales: { x: { ticks: { color: "#8b949e" }, grid: { display: false } }, y: { ticks: { color: "#8b949e" }, grid: { color: "rgba(139, 148, 158, 0.1)" }, beginAtZero: true } },
					plugins: { legend: { display: false } },
				},
			});
		} catch (err) {
			console.error("[Vault Analytics] Failed to render activity chart:", err);
			this.wrapper.createDiv({ cls: "va-chart-error", text: "Failed to load chart" });
		}
	}

	destroy(): void { this.chart?.destroy(); this.chart = null; this.wrapper?.remove(); this.wrapper = null; }
}
