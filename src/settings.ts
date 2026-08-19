import {App, PluginSettingTab} from 'obsidian';
import CrlPlugin from './main';
import {CrlSettings, Sort, SortDescriptions} from "./types";


export const DEFAULT_SETTINGS: CrlSettings = {
	countDefault: 10,
	sort: Sort.OpenDesc,
	isShowCurrentFile: false,
	isShowOnlyBasename: false,
	isOpacityFilePath: true,
	recentFiles: []
};

export class CrlSettingTab extends PluginSettingTab {
	display(): void {
		throw new Error("Method not implemented.");
	}

	plugin: CrlPlugin;

	constructor(app: App, plugin: CrlPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getSettingDefinitions() {
		return [
			{
				name: 'Максимальное количество элементов в списке',
				desc: 'Если 0 - выводятся без ограничений.',
				control: {
					type: 'number',
					key: 'countDefault',
					min: '0',
					placeholder: '10',
				},
			},
			{
				name: 'Сортировка списка файлов',
				control: {
					type: 'dropdown',
					key: 'sort',
					defaultValue: 'mtime_desc',
					options: Object.values(Sort).reduce((res: Record<string, string>, item: string): Record<string, string> => {
						res[item] = SortDescriptions[item as Sort];

						return res;
					}, {}),
				},
			},
			{
				name: 'Показывать текущий файл в списке',
				control: {
					type: 'toggle',
					key: 'isShowCurrentFile'
				}
			},
			{
				name: 'Показывать только название, а не путь к файлу',
				desc: 'Отображаться будет только название, но поиск будет по прежнему будет производиться по пути к файлу.',
				control: {
					type: 'toggle',
					key: 'isShowOnlyBasename'
				}
			},
			{
				name: 'Затенять путь к файлу',
				desc: 'Затеняет только путь, цвет названия файла всегда остаётся обычного цвета.',
				control: {
					type: 'toggle',
					key: 'isOpacityFilePath'
				}
			}
		]
	}

}
