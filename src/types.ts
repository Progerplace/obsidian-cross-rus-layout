export interface FileInfo {
	path: string,
	basename: string,
	onChangeOrd: number,
	onOpenOrd: number,
}

export interface CrlSettings {
	countDefault: number;
	sort: string;
	isShowCurrentFile: boolean;
	isShowOnlyBasename: boolean;
	isOpacityFilePath: boolean;
	recentFiles: string[];
}

export enum Sort {
	OpenAsc = 'open_asc',
	OpenDesc = 'open_desc',
	ChangeAsc = 'change_asc',
	ChangeDesc = 'change_desc',
	TitleAsc = 'title_asc',
	TitleDesc = 'title_desc',
}

export const SortDescriptions: Record<Sort, string> = {
	[Sort.OpenAsc]: 'По дате просмотра (первый - >последний)',
	[Sort.OpenDesc]: 'По дате просмотра (последний -> первый)',
	[Sort.ChangeAsc]: 'По дате изменения (первый -> последний)',
	[Sort.ChangeDesc]: 'По дате изменения (последний -> первый)',
	[Sort.TitleAsc]: 'По алфавиту (А -> Я)',
	[Sort.TitleDesc]: 'По алфавиту (Я -> А)',
};

