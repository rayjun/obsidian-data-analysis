import type { AggregatedData, ChartComponent } from "../types";

export class SummaryCards implements ChartComponent {
	private container: HTMLElement;
	private el: HTMLElement | null = null;

	constructor(container: HTMLElement) {
		this.container = container;
	}

	render(data: AggregatedData): void {
		this.destroy();
		this.el = this.container.createDiv({ cls: "va-summary-cards" });
		const cards = [
			{ label: "Total Notes", value: String(data.summary.totalNotes), icon: "📝" },
			{ label: "Total Words", value: this.formatNumber(data.summary.totalWords), icon: "📖" },
			{ label: "Current Streak", value: `${data.summary.currentStreak}d`, icon: "🔥" },
			{ label: "Avg Words/Day", value: String(data.summary.avgWordsPerDay), icon: "📊" },
		];
		for (const card of cards) {
			const cardEl = this.el.createDiv({ cls: "va-card" });
			cardEl.createDiv({ cls: "va-card-icon", text: card.icon });
			cardEl.createDiv({ cls: "va-card-value", text: card.value });
			cardEl.createDiv({ cls: "va-card-label", text: card.label });
		}
	}

	destroy(): void {
		this.el?.remove();
		this.el = null;
	}

	private formatNumber(n: number): string {
		if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
		if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
		return String(n);
	}
}
