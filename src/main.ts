import { Platform, Plugin } from "obsidian";
import { Chart, registerables } from "chart.js";
import {
	DataAnalyticsSettings,
	DEFAULT_SETTINGS,
} from "./types";
import { t } from "./i18n";

Chart.register(...registerables);
import { DataAnalyticsSettingTab } from "./settings";
import { DataCollector } from "./data-collector";
import { AnalyticsView, VIEW_TYPE_ANALYTICS } from "./analytics-view";

export default class DataAnalyticsPlugin extends Plugin {
	settings: DataAnalyticsSettings = DEFAULT_SETTINGS;
	private collector!: DataCollector;

	async onload(): Promise<void> {
		await this.loadSettings();

		// Always exclude the config directory
		const configDir = this.app.vault.configDir;
		if (!this.settings.excludeFolders.includes(configDir)) {
			this.settings.excludeFolders.push(configDir);
		}

		const i18n = t(this.settings.language);

		// Initialize data collector
		this.collector = new DataCollector(
			this.app.vault,
			this.app.metadataCache,
			this.settings,
		);

		// Register the analytics view — pass settings reference so view always reads latest language
		this.registerView(VIEW_TYPE_ANALYTICS, (leaf) => {
			return new AnalyticsView(leaf, this.collector, this.settings);
		});

		// Ribbon icon to open dashboard
		this.addRibbonIcon("bar-chart-2", i18n.ribbonTooltip, () => {
			void this.activateView();
		});

		// Command to open dashboard
		this.addCommand({
			id: "open-dashboard",
			name: i18n.commandName,
			callback: () => {
				void this.activateView();
			},
		});

		// Add settings tab
		this.addSettingTab(new DataAnalyticsSettingTab(this.app, this));

		// Scan vault and start listening
		await this.collector.scanAll();
		this.collector.startListening();
	}

	onunload(): void {
		this.collector?.stopListening();
	}

	async loadSettings(): Promise<void> {
		const data = await this.loadData();
		this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
		// Refresh any open analytics views so language/settings changes take effect immediately
		this.app.workspace.getLeavesOfType(VIEW_TYPE_ANALYTICS).forEach((leaf) => {
			const view = leaf.view;
			if (view instanceof AnalyticsView) {
				view.rebuildUI();
			}
		});
	}

	private async activateView(): Promise<void> {
		const { workspace } = this.app;

		let leaf = workspace.getLeavesOfType(VIEW_TYPE_ANALYTICS)[0];
		if (!leaf) {
			// On mobile, open in main area; on desktop, open in right sidebar
			const newLeaf = Platform.isMobile
				? workspace.getLeaf(true)
				: workspace.getRightLeaf(false);
			if (newLeaf) {
				await newLeaf.setViewState({
					type: VIEW_TYPE_ANALYTICS,
					active: true,
				});
				leaf = newLeaf;
			}
		}

		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	}
}
