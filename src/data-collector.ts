import type { TFile, Vault, MetadataCache, EventRef } from "obsidian";
import type { FileRecord, DataAnalyticsSettings } from "./types";
import { countWords } from "./utils";

type VaultEvent = "create" | "modify" | "delete" | "rename";

export class DataCollector {
	private records: FileRecord[] = [];
	private changeCallbacks: Array<() => void> = [];
	private eventRefs: Array<{ event: VaultEvent; ref: EventRef }> = [];
	private debounceTimer: ReturnType<typeof setTimeout> | null = null;

	constructor(
		private vault: Vault,
		private metadataCache: MetadataCache,
		private settings: DataAnalyticsSettings,
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
		const handler = () => {
			if (this.debounceTimer) clearTimeout(this.debounceTimer);
			this.debounceTimer = setTimeout(() => {
				void this.scanAll().then(() => this.notifyChange()).catch(() => { /* scan failed silently */ });
			}, 500);
		};
		const createRef = this.vault.on("create", handler);
		const modifyRef = this.vault.on("modify", handler);
		const deleteRef = this.vault.on("delete", handler);
		const renameRef = this.vault.on("rename", handler);
		this.eventRefs.push(
			{ event: "create", ref: createRef },
			{ event: "modify", ref: modifyRef },
			{ event: "delete", ref: deleteRef },
			{ event: "rename", ref: renameRef },
		);
	}

	stopListening(): void {
		for (const { ref } of this.eventRefs) {
			this.vault.offref(ref);
		}
		this.eventRefs = [];
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer);
			this.debounceTimer = null;
		}
	}

	onDataChange(callback: () => void): () => void {
		this.changeCallbacks.push(callback);
		return () => {
			const idx = this.changeCallbacks.indexOf(callback);
			if (idx !== -1) this.changeCallbacks.splice(idx, 1);
		};
	}

	private notifyChange(): void {
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
			console.warn(`[Data Analytics] Failed to read ${file.path}:`, err);
			return null;
		}
	}
}
