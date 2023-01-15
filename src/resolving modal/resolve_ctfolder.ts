import { TFolder } from 'obsidian';
import { normalizePath } from 'src/resolving modal/normalizePath';

export function resolve_ctfolder(folder_str: string): TFolder {
	folder_str = normalizePath(folder_str);
	const folder = app.vault.getAbstractFileByPath(folder_str);
	if (!folder) {
		console.log("folder not found");
	}

	if (!(folder instanceof TFolder)) {
		if (this.settings.debug) {
			console.log("folder resolved to is not a folder");
		}
	}
	if (folder) {
		return folder;
	}
}
