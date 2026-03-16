import { Plugin } from "obsidian";
import { Chart, registerables } from "chart.js";
import {
	VaultAnalyticsSettings,
	DEFAULT_SETTINGS,
} from "./types";

Chart.register(...registerables);
import { VaultAnalyticsSettingTab } from "./settings";
import { DataCollector } from "./data-collector";
import { AnalyticsView, VIEW_TYPE_ANALYTICS } from "./analytics-view";

export default class VaultAnalyticsPlugin extends Plugin {
	settings: VaultAnalyticsSettings = DEFAULT_SETTINGS;
	private collector!: DataCollector;

	async onload(): Promise<void> {
		await this.loadSettings();

		// Initialize data collector
		this.collector = new DataCollector(
			this.app.vault,
			this.app.metadataCache,
			this.settings,
		);

		// Register the analytics view
		this.registerView(VIEW_TYPE_ANALYTICS, (leaf) => {
			return new AnalyticsView(leaf, this.collector, this.settings.defaultPeriod);
		});

		// Ribbon icon to open dashboard
		this.addRibbonIcon("bar-chart-2", "Open Vault Analytics", () => {
			this.activateView();
		});

		// Command to open dashboard
		this.addCommand({
			id: "open-vault-analytics",
			name: "Open analytics dashboard",
			callback: () => {
				this.activateView();
			},
		});

		// Add settings tab
		this.addSettingTab(new VaultAnalyticsSettingTab(this.app, this));

		// Scan vault and start listening
		await this.collector.scanAll();
		this.collector.startListening();
	}

	async onunload(): Promise<void> {
		this.collector?.stopListening();
	}

	async loadSettings(): Promise<void> {
		const data = await this.loadData();
		this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	private async activateView(): Promise<void> {
		const { workspace } = this.app;

		let leaf = workspace.getLeavesOfType(VIEW_TYPE_ANALYTICS)[0];
		if (!leaf) {
			const newLeaf = workspace.getRightLeaf(false);
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
