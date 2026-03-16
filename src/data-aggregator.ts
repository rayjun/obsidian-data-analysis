import type { FileRecord, AggregatedData, Period } from "./types";
import { formatDate, getWeekday, getDateRange } from "./utils";

export function aggregate(
	records: FileRecord[],
	period: Period,
	refDate: number = Date.now(),
): AggregatedData {
	const { start, end } = getDateRange(period, refDate);

	const activeRecords = records.filter(
		(r) =>
			(r.createdAt >= start && r.createdAt <= end) ||
			(r.modifiedAt >= start && r.modifiedAt <= end),
	);

	const totalNotes = activeRecords.length;
	const totalWords = activeRecords.reduce((sum, r) => sum + r.wordCount, 0);
	const periodDays = period === "week" ? 7 : period === "month" ? 31 : 365;
	const avgWordsPerDay = periodDays > 0 ? Math.round(totalWords / periodDays) : 0;

	const heatmapData = new Map<string, number>();
	for (const r of activeRecords) {
		const createdDate = formatDate(r.createdAt);
		if (r.createdAt >= start && r.createdAt <= end) {
			heatmapData.set(createdDate, (heatmapData.get(createdDate) ?? 0) + 1);
		}
		const modifiedDate = formatDate(r.modifiedAt);
		if (r.modifiedAt >= start && r.modifiedAt <= end && modifiedDate !== createdDate) {
			heatmapData.set(modifiedDate, (heatmapData.get(modifiedDate) ?? 0) + 1);
		}
	}

	const trendData: AggregatedData["trendData"] = [];
	const cursor = new Date(start);
	cursor.setHours(0, 0, 0, 0);
	const endDate = new Date(end);
	endDate.setHours(0, 0, 0, 0);
	while (cursor <= endDate) {
		const dateStr = formatDate(cursor.getTime());
		const dayStart = new Date(cursor);
		dayStart.setHours(0, 0, 0, 0);
		const dayEnd = new Date(cursor);
		dayEnd.setHours(23, 59, 59, 999);
		const dayRecords = activeRecords.filter(
			(r) =>
				(r.createdAt >= dayStart.getTime() && r.createdAt <= dayEnd.getTime()) ||
				(r.modifiedAt >= dayStart.getTime() && r.modifiedAt <= dayEnd.getTime()),
		);
		trendData.push({
			date: dateStr,
			noteCount: dayRecords.length,
			wordCount: dayRecords.reduce((s, r) => s + r.wordCount, 0),
		});
		cursor.setDate(cursor.getDate() + 1);
	}

	const tagCounts = new Map<string, number>();
	for (const r of activeRecords) {
		for (const tag of r.tags) {
			tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
		}
	}
	const tagDistribution = Array.from(tagCounts.entries())
		.map(([tag, count]) => ({ tag, count }))
		.sort((a, b) => b.count - a.count);

	const weekdayCounts = new Array(7).fill(0) as number[];
	for (const r of activeRecords) {
		const ts = r.modifiedAt >= start && r.modifiedAt <= end ? r.modifiedAt : r.createdAt;
		const day = getWeekday(ts);
		if (weekdayCounts[day] !== undefined) weekdayCounts[day]++;
	}
	const activityByDay = weekdayCounts.map((count, day) => ({ day, count }));

	return {
		period,
		summary: {
			totalNotes,
			totalWords,
			currentStreak: calculateStreak(records, refDate),
			avgWordsPerDay,
		},
		heatmapData,
		trendData,
		tagDistribution,
		activityByDay,
	};
}

export function calculateStreak(
	records: FileRecord[],
	refDate: number = Date.now(),
): number {
	if (records.length === 0) return 0;

	const activeDates = new Set<string>();
	for (const r of records) {
		activeDates.add(formatDate(r.createdAt));
		activeDates.add(formatDate(r.modifiedAt));
	}

	let streak = 0;
	const cursor = new Date(refDate);
	cursor.setHours(0, 0, 0, 0);

	while (activeDates.has(formatDate(cursor.getTime()))) {
		streak++;
		cursor.setDate(cursor.getDate() - 1);
	}

	return streak;
}
