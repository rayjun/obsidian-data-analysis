import { describe, it, expect } from "vitest";
import { countWords, formatDate, getWeekday, getDateRange } from "../src/utils";

describe("countWords", () => {
	it("counts English words by whitespace", () => {
		expect(countWords("hello world foo bar")).toBe(4);
	});

	it("counts Chinese characters individually", () => {
		expect(countWords("你好世界")).toBe(4);
	});

	it("handles mixed Chinese and English", () => {
		expect(countWords("hello 你好 world")).toBe(4);
	});

	it("returns 0 for empty string", () => {
		expect(countWords("")).toBe(0);
	});

	it("returns 0 for whitespace only", () => {
		expect(countWords("   \n\t  ")).toBe(0);
	});

	it("ignores markdown syntax", () => {
		expect(countWords("# Heading\n\nSome **bold** text")).toBe(4);
	});

	it("ignores frontmatter", () => {
		const content = "---\ntitle: Test\ntags: [a, b]\n---\nHello world";
		expect(countWords(content)).toBe(2);
	});
});

describe("formatDate", () => {
	it("formats a timestamp to YYYY-MM-DD", () => {
		const ts = new Date("2026-03-16T00:00:00").getTime();
		expect(formatDate(ts)).toBe("2026-03-16");
	});
});

describe("getWeekday", () => {
	it("returns 0 for Monday", () => {
		const ts = new Date("2026-03-16T12:00:00").getTime();
		expect(getWeekday(ts)).toBe(0);
	});

	it("returns 6 for Sunday", () => {
		const ts = new Date("2026-03-22T12:00:00").getTime();
		expect(getWeekday(ts)).toBe(6);
	});
});

describe("getDateRange", () => {
	const refDate = new Date("2026-03-16T12:00:00").getTime();

	it("returns 7-day range for week", () => {
		const { start, end } = getDateRange("week", refDate);
		expect(formatDate(start)).toBe("2026-03-10");
		expect(formatDate(end)).toBe("2026-03-16");
	});

	it("returns 30-day range for month", () => {
		const { start, end } = getDateRange("month", refDate);
		expect(formatDate(start)).toBe("2026-02-14");
		expect(formatDate(end)).toBe("2026-03-16");
	});

	it("returns 365-day range for year", () => {
		const { start, end } = getDateRange("year", refDate);
		expect(formatDate(start)).toBe("2025-03-17");
		expect(formatDate(end)).toBe("2026-03-16");
	});
});
