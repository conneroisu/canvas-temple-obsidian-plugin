import { FuzzySuggestModal, Notice, TFile, TFolder } from 'obsidian';

import CanvasTemple, { insertCanvasFile } from './main';
import { get_ctfiles_from_folder } from './resolving modal/get_ctfiles_from_folder';

export class TemplateModal extends FuzzySuggestModal<TFile> {
	plugin: CanvasTemple;
	location: { x: number; y: number; };
	selectedTemplate: string;
	private creation_folder: TFolder | undefined;

	constructor(plugin: CanvasTemple, locx: number, locy: number) {
		super(app);
		this.location = { x: locx, y: locy };
		this.plugin = plugin;
		this.setPlaceholder("Type name of a canvas template...");
	}

	getItems(): TFile[] {
		if (!this.plugin.settings.canvasTemplatesFolder) {
			return app.vault.getMarkdownFiles();
		}
		console.log("Getting items from folder: " + this.plugin.settings.canvasTemplatesFolder);
		const files = get_ctfiles_from_folder(this.plugin.settings.canvasTemplatesFolder);
		if (!files) {
			console.log("files returned null");
			return [];
		}
		return files;
	}
	getItemText(item: TFile): string {
		return item.basename;
	}

	onChooseItem(item: TFile): void {
		const activestate = this.app.workspace.getActiveFile();
		if (activestate) {
			insertCanvasFile(this.plugin, activestate, item, this.location.x, this.location.y);
		} else {
			new Notice("No active file or improper view mode.");
		}
	}

	start(): void {
		try {
			this.open();
		} catch (error) {
			new Notice("No active file or improper view mode.");
		}
	}
}
