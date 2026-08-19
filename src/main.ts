import {Plugin, TAbstractFile, TFile,} from 'obsidian';
import {LayoutAwareSearchModal} from "./modal";
import {CrlSettingTab, DEFAULT_SETTINGS} from "./settings";
import {CrlSettings} from "./types";


export default class CrlPlugin extends Plugin {
	settings!: CrlSettings;
	lastFilePath!: string;

	async onload() {
		await this.loadSettings();
		this.lastFilePath = this.app.workspace.getActiveFile()?.path || '';

		this.addCommand({
			id: 'open-layout-aware-search',
			name: 'Открыть модальный поиск файлов',
			callback: () => {
				new LayoutAwareSearchModal(this.app, this.settings).open();
			},
		});

		this.addSettingTab(new CrlSettingTab(this.app, this));

		this.registerEvent(this.app.vault.on('rename', (fileAbstract: TAbstractFile): void => {
			const file = this.app.vault.getFileByPath(fileAbstract.path);
			this.addFileToHistory(file);
		}));

		this.registerEvent(this.app.workspace.on('active-leaf-change', () => {
			const file = this.app.workspace.getActiveFile();
			if (!file || file.path === this.lastFilePath) {
				return;
			}
			
			this.lastFilePath = file.path;
			this.addFileToHistory(file);
		}));
	}

	async loadSettings() {
		this.settings = {
			...DEFAULT_SETTINGS,
			...(await this.loadData()) as Partial<CrlSettings>,
		}
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private readonly addFileToHistory = (file: TFile | null): void => {
		if (!file) {
			return;
		}

		let recent = this.settings.recentFiles || [];
		recent = recent.filter((item: string): boolean => file.path !== item)
		const length = recent.unshift(file.path);
		const maxLength = this.settings.countDefault + 1;
		if (this.settings.countDefault && length > maxLength) {
			recent = recent.slice(0, maxLength);
		}

		this.settings.recentFiles = recent;
		void this.saveSettings();
	}
}


