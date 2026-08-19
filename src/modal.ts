import {App, FuzzyMatch, FuzzySuggestModal, SearchMatches, SearchMatchPart, TFile,} from 'obsidian';
import utils from "./utils";
import {CrlSettings, FileInfo, Sort} from "./types";

export class LayoutAwareSearchModal extends FuzzySuggestModal<FileInfo> {
	settings: CrlSettings;
	isSortByOpen: boolean;

	constructor(app: App, settings: CrlSettings) {
		super(app);
		this.settings = settings;

		this.isSortByOpen = [Sort.OpenAsc, Sort.OpenDesc].includes(this.settings.sort as Sort);
		if (this.settings.countDefault > 0) {
			this.limit = this.settings.countDefault;
		}
	}

	getItemText(item: FileInfo): string {
		throw new Error("Method not implemented.");
	}

	renderSuggestion(value: FuzzyMatch<FileInfo>, el: HTMLElement): void {
		el.empty();

		const container = el.createDiv({cls: 'crl-suggestion-item'});

		if (!value.item.path) {
			return;
		}

		const pathParts = value.item.path.split('/');
		const name = <string>pathParts.pop();
		const dir = pathParts.length
			? pathParts.join('/') + '/'
			: '';

		let index = 0;
		const matches = this.getSortedMatchRanges(value);
		const modClassOpacity = this.settings.isOpacityFilePath
			? '_opacity'
			: '';

		if (matches.length) {
			if (!this.settings.isShowOnlyBasename) {
				for (const match of matches) {
					this.addSuggestionPartEl(container, dir.slice(index, match[0]), modClassOpacity)
					this.addSuggestionPartEl(container, dir.slice(match[0], match[1]), `${modClassOpacity} _highlight`)
					index = match[1];
				}
				this.addSuggestionPartEl(container, dir.slice(index), modClassOpacity)
			}

			index = dir.length;
			const matchesOfName = this.buildFileNameMatchRanges(matches, dir)
			for (const match of matchesOfName) {
				this.addSuggestionPartEl(container, value.item.path.slice(index, match[0]), '')
				this.addSuggestionPartEl(container, value.item.path.slice(match[0], match[1]), '_highlight')
				index = match[1];
			}
			this.addSuggestionPartEl(container, value.item.path.slice(index), '')
		} else {
			this.addSuggestionPartEl(container, dir, modClassOpacity);
			this.addSuggestionPartEl(container, name, '');
		}
	}

	addSuggestionPartEl(container: HTMLDivElement, text: string, cls: string): void {
		if (!text) {
			return;
		}

		container.createSpan({
			cls: `crl-suggestion-part ${cls}`,
			text,
		});
	}

	buildFileNameMatchRanges(ranges: [number, number][], dir: string): SearchMatches {
		return ranges
			.map((range: SearchMatchPart): SearchMatchPart | null => {
				if (dir.length > range[0] && dir.length >= range[1]) {
					return null;
				} else if (dir.length > range[0] && dir.length < range[1]) {
					return [dir.length, range[1]]
				} else {
					return range;
				}
			})
			.filter((range: SearchMatchPart | null): range is SearchMatchPart => range !== null)
	}

	getSortedMatchRanges(value: FuzzyMatch<FileInfo>): SearchMatches {
		const ranges: SearchMatches = [];
		for (const part of value.match.matches) {
			if (Array.isArray(part)) {
				ranges.push(part);
			}
		}
		ranges.sort((a, b) => a[0] - b[0]);

		return ranges;
	}

	getItems(): FileInfo[] {
		let files = this.app.vault.getMarkdownFiles().map((file: TFile): FileInfo => utils.fileInfoFromTFile(file));

		const currentFile = this.app.workspace.getActiveFile()
		if (currentFile && !this.settings.isShowCurrentFile) {
			files = files.filter((file: FileInfo): boolean => currentFile.path !== file.path);
		}

		if (!this.isSortByOpen || !this.settings.recentFiles) {
			return files;
		}

		const recentFiles = this.settings.recentFiles;
		const mapFilesOpenOrd = recentFiles.reduce((res: Record<string, number>, item: string, number: number): Record<string, number> => {
			res[item] = number + 1;

			return res;
		}, {})

		return files.map((file: FileInfo): FileInfo => {
			file.onOpenOrd = mapFilesOpenOrd[file.path] || 0;

			return file;
		});
	}

	getSuggestions(query: string): FuzzyMatch<FileInfo>[] {
		const queryAlt = utils.toggleLayout(query);
		const files = this.getItems();

		let filesMatches = files.map(file => {
			return {
				item: file,
				match: {
					score: 1,
					matches: query
						? utils.findStrMatches(file.path, query, queryAlt)
						: []
				}
			}
		})

		if (query) {
			filesMatches = filesMatches.filter(item => item.match.matches.length)
		}

		filesMatches = utils.sortFiles(filesMatches, <Sort>this.settings.sort);

		return filesMatches;
	}

	onChooseItem(item: FileInfo): void {
		const file = this.app.vault.getFileByPath(item.path);

		if (file) {
			void this.app.workspace.getLeaf().openFile(file);
		}
	}
}
