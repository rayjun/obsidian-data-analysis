import type { Period } from "./types";

export function countWords(text: string): number {
	if (!text || !text.trim()) return 0;

	let content = text.replace(/^---[\s\S]*?---\n?/, "");

	content = content.replace(/#{1,6}\s/g, "");
	content = content.replace(/\*{1,3}(.*?)\*{1,3}/g, "$1");
	content = content.replace(/_{1,3}(.*?)_{1,3}/g, "$1");
	content = content.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
	content = content.replace(/!\[[^\]]*\]\([^)]*\)/g, "");
	content = content.replace(/`[^`]*`/g, "");

	const chineseChars = content.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g);
	const chineseCount = chineseChars ? chineseChars.length : 0;

	const withoutChinese = content.replace(/[\u4e00-\u9fff\u3400-\u4dbf]/g, " ");
	const englishWords = withoutChinese.split(/\s+/).filter((w) => w.length > 0);
	const englishCount = englishWords.length;

	return chineseCount + englishCount;
}

/** Format timestamp to "YYYY-MM-DD" in local time */
export function formatDate(ts: number): string {
	const d = new Date(ts);
	const year = d.getFullYear();
	const month = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

/** Get weekday: 0=Monday, 6=Sunday (differs from JS Date.getDay()) */
export function getWeekday(ts: number): number {
	const jsDay = new Date(ts).getDay();
	return jsDay === 0 ? 6 : jsDay - 1;
}

/** Get date range for a period, ending at refDate */
export function getDateRange(
	period: Period,
	refDate: number,
): { start: number; end: number } {
	const end = new Date(refDate);
	end.setHours(23, 59, 59, 999);

	const start = new Date(refDate);
	start.setHours(0, 0, 0, 0);

	switch (period) {
		case "week":
			start.setDate(start.getDate() - 6);
			break;
		case "month":
			start.setDate(start.getDate() - 30);
			break;
		case "year":
			start.setDate(start.getDate() - 364);
			break;
	}

	return { start: start.getTime(), end: end.getTime() };
}
