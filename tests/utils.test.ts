import { describe, it, expect } from "vitest";
import { countWords } from "../src/utils";

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
