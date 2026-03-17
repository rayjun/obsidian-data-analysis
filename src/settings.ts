import { App, PluginSettingTab, Setting } from "obsidian";
import type DataAnalyticsPlugin from "./main";
import type { Period } from "./types";
import type { Language } from "./i18n";
import { t } from "./i18n";

export class DataAnalyticsSettingTab extends PluginSettingTab {
	plugin: DataAnalyticsPlugin;

	constructor(app: App, plugin: DataAnalyticsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		const i18n = t(this.plugin.settings.language);
		containerEl.createEl("h2", { text: i18n.settingsTitle });

		new Setting(containerEl)
			.setName(i18n.settingLanguage)
			.setDesc(i18n.settingLanguageDesc)
			.addDropdown((dropdown) =>
				dropdown
					.addOption("en", "English")
					.addOption("zh", "中文")
					.setValue(this.plugin.settings.language)
					.onChange(async (value: string) => {
						this.plugin.settings.language = value as Language;
						await this.plugin.saveSettings();
						this.display();
					}),
			);

		new Setting(containerEl)
			.setName(i18n.settingDefaultPeriod)
			.setDesc(i18n.settingDefaultPeriodDesc)
			.addDropdown((dropdown) =>
				dropdown
					.addOption("week", i18n.week)
					.addOption("month", i18n.month)
					.addOption("year", i18n.year)
					.setValue(this.plugin.settings.defaultPeriod)
					.onChange(async (value: string) => {
						this.plugin.settings.defaultPeriod = value as Period;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName(i18n.settingExcludeFolders)
			.setDesc(i18n.settingExcludeFoldersDesc)
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
