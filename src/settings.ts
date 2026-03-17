import { App, PluginSettingTab, Setting } from "obsidian";
import type DataAnalyticsPlugin from "./main";
import type { Period } from "./types";

export class DataAnalyticsSettingTab extends PluginSettingTab {
	plugin: DataAnalyticsPlugin;

	constructor(app: App, plugin: DataAnalyticsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl("h2", { text: "Data Analytics Settings" });

		new Setting(containerEl)
			.setName("Default time range")
			.setDesc("The default period shown when opening the dashboard")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("week", "Week")
					.addOption("month", "Month")
					.addOption("year", "Year")
					.setValue(this.plugin.settings.defaultPeriod)
					.onChange(async (value: string) => {
						this.plugin.settings.defaultPeriod = value as Period;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Excluded folders")
			.setDesc("Folders to exclude from analysis (one per line)")
			.addTextArea((text) =>
				text
					.setPlaceholder(".obsidian\ntemplates")
					.setValue(this.plugin.settings.excludeFolders.join("\n"))
					.onChange(async (value: string) => {
						this.plugin.settings.excludeFolders = value
							.split("\n")
							.map((s) => s.trim())
							.filter((s) => s.length > 0);
						await this.plugin.saveSettings();
					}),
			);
	}
}
