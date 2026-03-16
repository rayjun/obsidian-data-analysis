import { describe, it, expect } from "vitest";
import { aggregate, calculateStreak } from "../src/data-aggregator";
import type { FileRecord } from "../src/types";

function makeRecord(
	path: string,
	createdAt: string,
	modifiedAt: string,
	wordCount = 100,
	tags: string[] = [],
): FileRecord {
	return {
		path,
		createdAt: new Date(createdAt).getTime(),
		modifiedAt: new Date(modifiedAt).getTime(),
		wordCount,
		tags,
		folder: path.split("/").slice(0, -1).join("/") || "/",
	};
}

describe("aggregate", () => {
	const records: FileRecord[] = [
		makeRecord("a.md", "2026-03-15", "2026-03-15", 200, ["tech"]),
		makeRecord("b.md", "2026-03-16", "2026-03-16", 300, ["tech", "reading"]),
		makeRecord("c.md", "2026-03-14", "2026-03-16", 150, ["reading"]),
	];

	it("computes correct summary for week period", () => {
		const now = new Date("2026-03-16T12:00:00").getTime();
		const result = aggregate(records, "week", now);
		expect(result.period).toBe("week");
		expect(result.summary.totalNotes).toBe(3);
		expect(result.summary.totalWords).toBe(650);
	});

	it("builds heatmap data with correct date keys", () => {
		const now = new Date("2026-03-16T12:00:00").getTime();
		const result = aggregate(records, "week", now);
		expect(result.heatmapData.get("2026-03-15")).toBe(1);
		expect(result.heatmapData.get("2026-03-16")).toBe(2);
		expect(result.heatmapData.get("2026-03-14")).toBe(1);
	});

	it("computes tag distribution sorted by count descending", () => {
		const now = new Date("2026-03-16T12:00:00").getTime();
		const result = aggregate(records, "week", now);
		expect(result.tagDistribution[0]?.tag).toBe("tech");
		expect(result.tagDistribution[0]?.count).toBe(2);
		expect(result.tagDistribution[1]?.tag).toBe("reading");
		expect(result.tagDistribution[1]?.count).toBe(2);
	});

	it("computes activity by weekday", () => {
		const now = new Date("2026-03-16T12:00:00").getTime();
		const result = aggregate(records, "week", now);
		const monday = result.activityByDay.find((d) => d.day === 0);
		expect(monday).toBeDefined();
		expect(monday!.count).toBeGreaterThan(0);
	});

	it("returns empty data when no records match period", () => {
		const farFuture = new Date("2030-01-01T12:00:00").getTime();
		const result = aggregate(records, "week", farFuture);
		expect(result.summary.totalNotes).toBe(0);
		expect(result.summary.totalWords).toBe(0);
		expect(result.trendData.every((d) => d.noteCount === 0)).toBe(true);
	});

	it("handles empty records array", () => {
		const now = new Date("2026-03-16T12:00:00").getTime();
		const result = aggregate([], "month", now);
		expect(result.summary.totalNotes).toBe(0);
		expect(result.summary.totalWords).toBe(0);
		expect(result.summary.currentStreak).toBe(0);
	});
});

describe("calculateStreak", () => {
	it("counts consecutive days with activity ending today", () => {
		const records = [
			makeRecord("a.md", "2026-03-16", "2026-03-16"),
			makeRecord("b.md", "2026-03-15", "2026-03-15"),
			makeRecord("c.md", "2026-03-14", "2026-03-14"),
			makeRecord("d.md", "2026-03-12", "2026-03-12"),
		];
		const now = new Date("2026-03-16T12:00:00").getTime();
		expect(calculateStreak(records, now)).toBe(3);
	});

	it("returns 0 when no activity today", () => {
		const records = [makeRecord("a.md", "2026-03-14", "2026-03-14")];
		const now = new Date("2026-03-16T12:00:00").getTime();
		expect(calculateStreak(records, now)).toBe(0);
	});

	it("returns 0 for empty records", () => {
		const now = new Date("2026-03-16T12:00:00").getTime();
		expect(calculateStreak([], now)).toBe(0);
	});
});
