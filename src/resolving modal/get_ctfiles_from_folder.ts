import { TAbstractFile, TFile, Vault } from 'obsidian';

import { resolve_ctfolder } from './resolve_ctfolder';

export function get_ctfiles_from_folder(folder_str: string): Array<TFile> {
	const folder = resolve_ctfolder(folder_str);

	const files: Array<TFile> = [];
	Vault.recurseChildren(folder, (file: TAbstractFile) => {
		if (file instanceof TFile) {
			files.push(file);
		}
	});

	files.sort((a, b) => {
		return a.basename.localeCompare(b.basename);
	});

	return files;
}
