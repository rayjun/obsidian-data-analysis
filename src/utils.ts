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
