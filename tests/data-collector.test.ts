import { describe, it, expect, vi, beforeEach } from "vitest";
import { DataCollector } from "../src/data-collector";
import type { VaultAnalyticsSettings } from "../src/types";

function createMockVault(files: any[] = []) {
	return {
		getFiles: () => files,
		cachedRead: vi.fn().mockResolvedValue("hello world"),
		on: vi.fn().mockReturnValue({ id: "fake-ref" }),
		offref: vi.fn(),
	};
}

function createMockMetadataCache() {
	return {
		getFileCache: vi.fn().mockReturnValue({
			frontmatter: { tags: ["tag1"] },
			tags: [{ tag: "#tag2" }],
		}),
	};
}

function createMockFile(path: string, ctime: number, mtime: number, ext = "md") {
	return {
		path,
		stat: { ctime, mtime, size: 100 },
		extension: ext,
		basename: path.split("/").pop()?.replace(`.${ext}`, "") ?? "",
		name: path.split("/").pop() ?? "",
		parent: { path: path.split("/").slice(0, -1).join("/") || "/" },
	};
}

const defaultSettings: VaultAnalyticsSettings = {
	excludeFolders: [".obsidian"],
	defaultPeriod: "month",
};

describe("DataCollector", () => {
	it("scans markdown files and produces FileRecords", async () => {
		const file = createMockFile("notes/test.md", 1000, 2000);
		const vault = createMockVault([file]);
		const cache = createMockMetadataCache();
		const collector = new DataCollector(vault as any, cache as any, defaultSettings);
		await collector.scanAll();
		const records = collector.getRecords();
		expect(records).toHaveLength(1);
		expect(records[0]?.path).toBe("notes/test.md");
		expect(records[0]?.createdAt).toBe(1000);
		expect(records[0]?.modifiedAt).toBe(2000);
		expect(records[0]?.tags).toContain("tag1");
		expect(records[0]?.tags).toContain("tag2");
	});

	it("excludes non-markdown files", async () => {
		const mdFile = createMockFile("notes/test.md", 1000, 2000);
		const pngFile = createMockFile("images/pic.png", 1000, 2000, "png");
		const vault = createMockVault([mdFile, pngFile]);
		const cache = createMockMetadataCache();
		const collector = new DataCollector(vault as any, cache as any, defaultSettings);
		await collector.scanAll();
		expect(collector.getRecords()).toHaveLength(1);
	});

	it("excludes files in excluded folders", async () => {
		const note = createMockFile("notes/test.md", 1000, 2000);
		const config = createMockFile(".obsidian/config.md", 1000, 2000);
		const vault = createMockVault([note, config]);
		const cache = createMockMetadataCache();
		const collector = new DataCollector(vault as any, cache as any, defaultSettings);
		await collector.scanAll();
		expect(collector.getRecords()).toHaveLength(1);
		expect(collector.getRecords()[0]?.path).toBe("notes/test.md");
	});

	it("extracts tags from frontmatter and inline tags", async () => {
		const file = createMockFile("notes/test.md", 1000, 2000);
		const vault = createMockVault([file]);
		const cache = createMockMetadataCache();
		const collector = new DataCollector(vault as any, cache as any, defaultSettings);
		await collector.scanAll();
		const tags = collector.getRecords()[0]?.tags ?? [];
		expect(tags).toContain("tag1");
		expect(tags).toContain("tag2");
	});

	it("notifies listener on data change callback", async () => {
		const file = createMockFile("notes/test.md", 1000, 2000);
		const vault = createMockVault([file]);
		const cache = createMockMetadataCache();
		const collector = new DataCollector(vault as any, cache as any, defaultSettings);
		const callback = vi.fn();
		collector.onDataChange(callback);
		await collector.scanAll();
		(collector as any).notifyChange();
		expect(callback).toHaveBeenCalledOnce();
	});

	it("registers vault event handlers on startListening", () => {
		const vault = createMockVault([]);
		const cache = createMockMetadataCache();
		const collector = new DataCollector(vault as any, cache as any, defaultSettings);
		collector.startListening();
		expect(vault.on).toHaveBeenCalledTimes(4);
	});

	it("unregisters event handlers on stopListening", () => {
		const vault = createMockVault([]);
		const cache = createMockMetadataCache();
		const collector = new DataCollector(vault as any, cache as any, defaultSettings);
		collector.startListening();
		collector.stopListening();
		expect(vault.offref).toHaveBeenCalledTimes(4);
	});
});
