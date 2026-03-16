import { Chart, registerables } from "chart.js";
import type { AggregatedData, ChartComponent } from "../types";

Chart.register(...registerables);

const CHART_COLORS = ["#39d353", "#58a6ff", "#d2a8ff", "#f778ba", "#ff7b72", "#ffa657", "#d29922", "#3fb950", "#79c0ff", "#bc8cff"];

export class TagChart implements ChartComponent {
	private container: HTMLElement;
	private wrapper: HTMLElement | null = null;
	private chart: Chart | null = null;

	constructor(container: HTMLElement) { this.container = container; }

	render(data: AggregatedData): void {
		this.destroy();
		this.wrapper = this.container.createDiv({ cls: "va-tag-chart" });
		this.wrapper.createDiv({ cls: "va-section-title", text: "Tag Distribution" });

		if (data.tagDistribution.length === 0) {
			this.wrapper.createDiv({ cls: "va-empty", text: "No tags found" });
			return;
		}

		const canvas = this.wrapper.createEl("canvas");
		const top10 = data.tagDistribution.slice(0, 10);
		try {
			this.chart = new Chart(canvas, {
				type: "bar",
				data: {
					labels: top10.map((t) => t.tag),
					datasets: [{ label: "Notes", data: top10.map((t) => t.count), backgroundColor: top10.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]!), borderRadius: 4 }],
				},
				options: {
					responsive: true, maintainAspectRatio: false, indexAxis: "y",
					scales: { x: { ticks: { color: "#8b949e" }, grid: { color: "rgba(139, 148, 158, 0.1)" } }, y: { ticks: { color: "#8b949e" }, grid: { display: false } } },
					plugins: { legend: { display: false } },
				},
			});
		} catch (err) {
			console.error("[Vault Analytics] Failed to render tag chart:", err);
			this.wrapper.createDiv({ cls: "va-chart-error", text: "Failed to load chart" });
		}
	}

	destroy(): void { this.chart?.destroy(); this.chart = null; this.wrapper?.remove(); this.wrapper = null; }
}
