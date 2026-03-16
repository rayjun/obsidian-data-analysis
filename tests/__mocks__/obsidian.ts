// Minimal Obsidian mock for unit tests
export class Plugin {
	app: any = {};
	loadData(): Promise<any> { return Promise.resolve(null); }
	saveData(_data: any): Promise<void> { return Promise.resolve(); }
	addRibbonIcon(_icon: string, _title: string, _callback: () => void): HTMLElement {
		return document.createElement("div");
	}
	addCommand(_command: any): void {}
	addSettingTab(_tab: any): void {}
	registerView(_type: string, _creator: any): void {}
}
export class PluginSettingTab {
	app: any;
	plugin: any;
	containerEl: any = {
		empty: () => {},
		createEl: () => document.createElement("div"),
	};
	constructor(app: any, plugin: any) {
		this.app = app;
		this.plugin = plugin;
	}
}
export class ItemView {
	containerEl: HTMLElement = document.createElement("div");
	contentEl: HTMLElement = document.createElement("div");
	app: any = {};
	getViewType(): string { return ""; }
	getDisplayText(): string { return ""; }
	getIcon(): string { return "bar-chart-2"; }
	async onOpen(): Promise<void> {}
	async onClose(): Promise<void> {}
}
export class Setting {
	constructor(_el: any) {}
	setName(_name: string): this { return this; }
	setDesc(_desc: string): this { return this; }
	addText(_cb: any): this { return this; }
	addDropdown(_cb: any): this { return this; }
	addTextArea(_cb: any): this { return this; }
}
export class Notice {
	constructor(_message: string) {}
}
export function setIcon(_el: HTMLElement, _iconId: string): void {}
export class TFile {
	path: string = "";
	stat: { ctime: number; mtime: number; size: number } = { ctime: 0, mtime: 0, size: 0 };
	extension: string = "md";
	basename: string = "";
	name: string = "";
	parent: { path: string } | null = null;
}
export class Vault {
	getFiles(): any[] { return []; }
	cachedRead(_file: any): Promise<string> { return Promise.resolve(""); }
	on(_event: string, _callback: Function): any { return {}; }
	offref(_ref: any): void {}
}
export class MetadataCache {
	getFileCache(_file: any): any { return null; }
}
export class WorkspaceLeaf {}
export class App {}
export type EventRef = any;
