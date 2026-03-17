import type { AggregatedData, ChartComponent } from "../types";
import type { I18n } from "../i18n";

export class SummaryCards implements ChartComponent {
	private container: HTMLElement;
	private el: HTMLElement | null = null;
	private i18n: I18n;

	constructor(container: HTMLElement, i18n: I18n) {
		this.container = container;
		this.i18n = i18n;
	}

	render(data: AggregatedData): void {
		this.destroy();
		this.el = this.container.createDiv({ cls: "va-summary-cards" });
		const cards = [
			{ label: this.i18n.totalNotes, value: String(data.summary.totalNotes), icon: "📝" },
			{ label: this.i18n.totalWords, value: this.formatNumber(data.summary.totalWords), icon: "📖" },
			{ label: this.i18n.currentStreak, value: `${data.summary.currentStreak}d`, icon: "🔥" },
			{ label: this.i18n.avgWordsPerDay, value: String(data.summary.avgWordsPerDay), icon: "📊" },
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
