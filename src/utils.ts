import {FuzzyMatch, SearchMatches, TFile} from "obsidian";
import {FileInfo, Sort} from "./types";

function toggleLayout(text: string): string {
	const layoutMap: { [key: string]: string } = {
		'q': 'й', 'w': 'ц', 'e': 'у', 'r': 'к', 't': 'е', 'y': 'н', 'u': 'г', 'i': 'ш', 'o': 'щ', 'p': 'з',
		'a': 'ф', 's': 'ы', 'd': 'в', 'f': 'а', 'g': 'п', 'h': 'р', 'j': 'о', 'k': 'л', 'l': 'д',
		'z': 'я', 'x': 'ч', 'c': 'с', 'v': 'м', 'b': 'и', 'n': 'т', 'm': 'ь',
		',': 'б', '.': 'ю', "'": 'э', '`': 'ё', '[': 'х', ']': 'ъ',';': 'ж',
		//
		'й': 'q', 'ц': 'w', 'у': 'e', 'к': 'r', 'е': 't', 'н': 'y', 'г': 'u', 'ш': 'i', 'щ': 'o', 'з': 'p',
		'ф': 'a', 'ы': 's', 'в': 'd', 'а': 'f', 'п': 'g', 'р': 'h', 'о': 'j', 'л': 'k', 'д': 'l',
		'я': 'z', 'ч': 'x', 'с': 'c', 'м': 'v', 'и': 'b', 'т': 'n', 'ь': 'm',
	};

	let res = '';
	for (let char of text) {
		res += layoutMap[char] || char;
	}

	return res;
}

function findStrMatches(str: string, query: string, queryAlt: string): SearchMatches {
	return findMatchesSubstring(str, query) || findMatchesSubstring(str, queryAlt) || [];
}

function findMatchesSubstring(str: string, substr: string): SearchMatches | null {
	if (substr.length === 0) {
		return [];
	}

	str = str.toLowerCase();
	substr = substr.toLowerCase();
	const result: SearchMatches = [];
	let fromIndex = 0;
	let index: number;

	while ((index = str.indexOf(substr, fromIndex)) !== -1) {
		result.push([index, index + substr.length]);
		fromIndex = index + substr.length + 1;
	}

	return result.length
		? result
		: null;
}

function strCmpAsc(a: string, b: string): number {
	if (a < b) {
		return 1;
	} else if (a > b) {
		return -1;
	}

	return 0;
}

function strCmpDesc(a: string, b: string): number {
	if (a > b) {
		return 1;
	} else if (a < b) {
		return -1;
	}

	return 0;
}

function fileInfoFromTFile(file: TFile): FileInfo {
	return {
		basename: file.basename,
		path: file.path,
		onChangeOrd: file.stat.mtime,
		onOpenOrd: 0,
	}
}

function sortFiles(files: FuzzyMatch<FileInfo>[], sort: Sort): FuzzyMatch<FileInfo>[] {
	if (sort === Sort.OpenAsc) {
		const filesRecent = files
			.filter((file: FuzzyMatch<FileInfo>): boolean => file.item.onOpenOrd > 0)
			.sort((a: FuzzyMatch<FileInfo>, b: FuzzyMatch<FileInfo>): number => (b.item.onOpenOrd - a.item.onOpenOrd));

		const filesAdditional = files
			.filter((file: FuzzyMatch<FileInfo>): boolean => file.item.onOpenOrd <= 0)
			.sort((a: FuzzyMatch<FileInfo>, b: FuzzyMatch<FileInfo>): number => a.item.onChangeOrd - b.item.onChangeOrd);

		return [
			...filesRecent,
			...filesAdditional
		]
	} else if (sort === Sort.OpenDesc) {
		const filesRecent = files
			.filter((file: FuzzyMatch<FileInfo>): boolean => file.item.onOpenOrd > 0)
			.sort((a: FuzzyMatch<FileInfo>, b: FuzzyMatch<FileInfo>): number => (a.item.onOpenOrd - b.item.onOpenOrd));

		const filesAdditional = files
			.filter((file: FuzzyMatch<FileInfo>): boolean => file.item.onOpenOrd <= 0)
			.sort((a: FuzzyMatch<FileInfo>, b: FuzzyMatch<FileInfo>): number => b.item.onChangeOrd - a.item.onChangeOrd);

		return [
			...filesRecent,
			...filesAdditional
		]
	} else if (sort === Sort.ChangeAsc) {
		return files.sort((a: FuzzyMatch<FileInfo>, b: FuzzyMatch<FileInfo>): number => a.item.onChangeOrd - b.item.onChangeOrd);
	} else if (sort === Sort.ChangeDesc) {
		return files.sort((a: FuzzyMatch<FileInfo>, b: FuzzyMatch<FileInfo>): number => b.item.onChangeOrd - a.item.onChangeOrd);
	} else if (sort === Sort.TitleAsc) {
		return files.sort((a: FuzzyMatch<FileInfo>, b: FuzzyMatch<FileInfo>): number => strCmpAsc(b.item.basename, a.item.basename));
	} else if (sort === Sort.TitleDesc) {
		return files.sort((a: FuzzyMatch<FileInfo>, b: FuzzyMatch<FileInfo>): number => strCmpAsc(a.item.basename, b.item.basename));
	}

	throw new Error('Unhandled sort variant');
}

export default {
	toggleLayout,
	findStrMatches,
	strCmpAsc,
	strCmpDesc,
	fileInfoFromTFile,
	sortFiles,
}
