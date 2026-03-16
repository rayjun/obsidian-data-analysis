import type { TFile, Vault, MetadataCache } from "obsidian";
import type { FileRecord, VaultAnalyticsSettings } from "./types";
import { countWords } from "./utils";

export class DataCollector {
	private records: FileRecord[] = [];
	private changeCallbacks: Array<() => void> = [];
	private eventRefs: Array<{ event: string; ref: any }> = [];

	constructor(
		private vault: Vault,
		private metadataCache: MetadataCache,
		private settings: VaultAnalyticsSettings,
	) {}

	async scanAll(): Promise<FileRecord[]> {
		const files = this.vault.getFiles().filter(
			(f: TFile) => f.extension === "md" && !this.isExcluded(f.path),
		);
		this.records = [];
		for (const file of files) {
			const record = await this.buildRecord(file);
			if (record) this.records.push(record);
		}
		return this.records;
	}

	getRecords(): FileRecord[] { return this.records; }

	startListening(): void {
		const events = ["create", "modify", "delete", "rename"] as const;
		for (const event of events) {
			const ref = this.vault.on(event as any, () => {
				this.scanAll().then(() => this.notifyChange());
			});
			this.eventRefs.push({ event, ref });
		}
	}

	stopListening(): void {
		for (const { ref } of this.eventRefs) {
			this.vault.offref(ref);
		}
		this.eventRefs = [];
	}

	onDataChange(callback: () => void): void { this.changeCallbacks.push(callback); }

	notifyChange(): void {
		for (const cb of this.changeCallbacks) { cb(); }
	}

	private isExcluded(path: string): boolean {
		return this.settings.excludeFolders.some(
			(folder) => path === folder || path.startsWith(folder + "/"),
		);
	}

	private async buildRecord(file: TFile): Promise<FileRecord | null> {
		try {
			const content = await this.vault.cachedRead(file);
			const cache = this.metadataCache.getFileCache(file);
			const tags: string[] = [];
			const fmTags = cache?.frontmatter?.tags;
			if (Array.isArray(fmTags)) {
				for (const t of fmTags) {
					if (typeof t === "string") tags.push(t.replace(/^#/, ""));
				}
			} else if (typeof fmTags === "string") {
				tags.push(fmTags.replace(/^#/, ""));
			}
			if (cache?.tags) {
				for (const t of cache.tags) { tags.push(t.tag.replace(/^#/, "")); }
			}
			return {
				path: file.path,
				createdAt: file.stat.ctime,
				modifiedAt: file.stat.mtime,
				wordCount: countWords(content),
				tags: [...new Set(tags)],
				folder: file.parent?.path ?? "/",
			};
		} catch (err) {
			console.warn(`[Vault Analytics] Failed to read ${file.path}:`, err);
			return null;
		}
	}
}
