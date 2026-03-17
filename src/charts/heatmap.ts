import type { AggregatedData, ChartComponent } from "../types";
import type { I18n } from "../i18n";
import { formatDate } from "../utils";

const CELL_SIZE = 12;
const CELL_GAP = 3;
const COLORS = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];

export class HeatmapChart implements ChartComponent {
	private container: HTMLElement;
	private wrapper: HTMLElement | null = null;
	private canvas: HTMLCanvasElement | null = null;
	private tooltip: HTMLElement | null = null;
	private cells: { x: number; y: number; date: string; count: number }[] = [];
	private labelWidth = 30;
	private i18n: I18n;

	constructor(container: HTMLElement, i18n: I18n) {
		this.container = container;
		this.i18n = i18n;
	}

	render(data: AggregatedData): void {
		this.destroy();
		this.wrapper = this.container.createDiv({ cls: "va-heatmap" });
		this.wrapper.createDiv({ cls: "va-section-title", text: this.i18n.activityHeatmap });

		if (data.heatmapData.size === 0) {
			this.wrapper.createDiv({ cls: "va-empty", text: this.i18n.noDataForPeriod });
			return;
		}

		const canvasWrapper = this.wrapper.createDiv({ cls: "va-heatmap-canvas-wrapper" });
		this.canvas = canvasWrapper.createEl("canvas");
		this.tooltip = this.wrapper.createDiv({ cls: "va-heatmap-tooltip va-hidden" });
		this.drawHeatmap(data);
		this.setupTooltip();
	}

	destroy(): void {
		this.wrapper?.remove();
		this.wrapper = null;
		this.canvas = null;
		this.tooltip = null;
	}

	private drawHeatmap(data: AggregatedData): void {
		const canvas = this.canvas;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const dates = Array.from(data.heatmapData.keys()).sort();
		const endDate = dates.length > 0 ? new Date(dates[dates.length - 1]!) : new Date();
		const totalDays = data.period === "week" ? 7 : data.period === "month" ? 31 : 365;
		const startDate = new Date(endDate);
		startDate.setDate(startDate.getDate() - totalDays + 1);
		const startDay = startDate.getDay();
		const offset = startDay === 0 ? 6 : startDay - 1;
		startDate.setDate(startDate.getDate() - offset);

		const cursor = new Date(startDate);
		const cells: { x: number; y: number; date: string; count: number }[] = [];
		let col = 0;

		while (cursor <= endDate) {
			const jsDay = cursor.getDay();
			const row = jsDay === 0 ? 6 : jsDay - 1;
			const dateStr = formatDate(cursor.getTime());
			const count = data.heatmapData.get(dateStr) ?? 0;
			cells.push({ x: col, y: row, date: dateStr, count });
			cursor.setDate(cursor.getDate() + 1);
			if (cursor.getDay() === 1 && cursor <= endDate) col++;
		}

		const numCols = col + 1;
		const labelWidth = 30;
		const width = labelWidth + numCols * (CELL_SIZE + CELL_GAP);
		const height = 7 * (CELL_SIZE + CELL_GAP);
		const dpr = window.devicePixelRatio || 1;
		canvas.width = width * dpr;
		canvas.height = height * dpr;
		canvas.setCssProps({ "width": `${width}px`, "height": `${height}px` });
		ctx.scale(dpr, dpr);

		ctx.fillStyle = "#8b949e";
		ctx.font = "10px sans-serif";
		const dayLabels = [this.i18n.dayMon, "", this.i18n.dayWed, "", this.i18n.dayFri, "", ""];
		for (let r = 0; r < 7; r++) {
			if (dayLabels[r]) {
				ctx.fillText(dayLabels[r]!, 0, r * (CELL_SIZE + CELL_GAP) + CELL_SIZE - 1);
			}
		}

		const maxCount = Math.max(1, ...cells.map((c) => c.count));
		for (const cell of cells) {
			const colorIdx = cell.count === 0 ? 0 : Math.min(Math.ceil((cell.count / maxCount) * (COLORS.length - 1)), COLORS.length - 1);
			ctx.fillStyle = COLORS[colorIdx]!;
			ctx.beginPath();
			ctx.roundRect(labelWidth + cell.x * (CELL_SIZE + CELL_GAP), cell.y * (CELL_SIZE + CELL_GAP), CELL_SIZE, CELL_SIZE, 2);
			ctx.fill();
		}

		this.cells = cells;
		this.labelWidth = labelWidth;
	}

	private setupTooltip(): void {
		const canvas = this.canvas;
		const tooltip = this.tooltip;
		if (!canvas || !tooltip) return;

		canvas.addEventListener("mousemove", (e: MouseEvent) => {
			const rect = canvas.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			const cells = this.cells;
			const labelWidth = this.labelWidth;
			if (cells.length === 0) return;
			const col = Math.floor((x - labelWidth) / (CELL_SIZE + CELL_GAP));
			const row = Math.floor(y / (CELL_SIZE + CELL_GAP));
			const cell = cells.find((c) => c.x === col && c.y === row);
			if (cell) {
				tooltip.textContent = `${cell.date}: ${cell.count} ${this.i18n.activities}`;
				tooltip.removeClass("va-hidden");
				tooltip.setCssProps({
					"left": `${e.clientX - rect.left + 10}px`,
					"top": `${e.clientY - rect.top - 25}px`,
				});
			} else {
				tooltip.addClass("va-hidden");
			}
		});
		canvas.addEventListener("mouseleave", () => { tooltip.addClass("va-hidden"); });
	}
}
