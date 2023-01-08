	import { TAbstractFile, FuzzySuggestModal, App, TFolder, Editor, ItemView, MarkdownView, Modal, Notice, Plugin, TFile, Vault, PluginSettingTab, Setting } from 'obsidian';
	// Importing the canvas library
	import * as fs from 'fs';
import * as path from 'path';
import { join } from 'path';



	interface CanvasUtilitiesSettings {
		canvasTemplatesFolder: string,
		debug: boolean
	}

	const DEFAULT_SETTINGS: CanvasUtilitiesSettings = {
		canvasTemplatesFolder: 'default',
		debug: false
	}


	export default class CanvasUtilities extends Plugin {
		settings: CanvasUtilitiesSettings;
		async onload() {
			await this.loadSettings();

			// This adds a simple command that can be triggered anywhere
			this.addCommand({
				id: 'open-canvas-template-modal',
				name: 'Open Canvas Template Modal',
				callback: async () => {
					// get the active file
					const activeFile = this.app.workspace.getActiveFile();
					// generate an id for the new page similar to 'aba082f3296f476f'
					const newPageId = generateRandomId();

					// modal
					// new TemplateModal(this.settings.canvasTemplatesFolder, plugin: CanvasUtilities).open();
					
					if(activeFile) {
						// get the file path
						console.log("Active file path: " + activeFile);
						const content = await this.app.vault.read(activeFile);
						console.log(content);
						// parse the file contents with parseCanvasFile
						const canvasData: CanvasData = JSON.parse(content);
						// print the canvas data to the console
						CanvasToConsole(canvasData);
						const newPage: CanvasFileData = {
							id: newPageId,
							file: 'Untitled.md',
							height: 200,
							type: 'file',
							width: 200,
							x: 0,
							y: 0,
						}


					// Add a page to the Canvas Object
					canvasData.nodes.push(newPage);
					this.app.vault.modify(activeFile, JSON.stringify(canvasData));
					}else{ 
						// if there is no active file, print an error to the console
						console.log("No active file");
					}
				}
			});
			this.addSettingTab(new CanvasUtilitiesSettings(this.app, this));
			// Function to print a Canvas object to the console
			function CanvasToConsole(Canvas: CanvasData): void {
				console.log(Canvas);
			}
		}
		async onunload(): Promise<void> {
			console.log('unloading plugin');
		}
		async loadSettings() {
			this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		}
		async saveSettings() {
			await this.saveData(this.settings);
		}



	}

	// Function to insert a canvas file into the active file
	async function insertCanvasFile(mainCanvasFile: TFile,canvasFile: TFile): Promise<void> {
		if(this.app.settings.debug) {
			console.log("Inserting canvas file into active file");
		}
		if(this.app.settings.debug) {
			console.log("Active file: " + mainCanvasFile);
			console.log("Canvas file: " + canvasFile);
		}
		// Reading the contents of the files
		const mainContent = await this.app.vault.read(mainCanvasFile);
		const canvasContent = await this.app.vault.read(canvasFile);
		if(this.app.settings.debug) {
			console.log("Main file contents: " + mainContent);
			console.log("Canvas file contents: " + canvasContent);
		}
		// Parsing the contents of the files and creating a CanvasData object for each
		const mainCanvasData: CanvasData = JSON.parse(mainContent);
		const canvasData: CanvasData = JSON.parse(canvasContent);
		if(this.app.settings.debug) {
			console.log("Main canvas data: " + mainCanvasData);
			console.log("Canvas data: " + canvasData);
		}
		// Adding the nodes from the canvas file to the main canvas file
		for(let i = 0; i < canvasData.nodes.length; i++) {
			mainCanvasData.nodes.push(canvasData.nodes[i]);
			if(this.app.settings.debug) {
				console.log("Pushing node: " + canvasData.nodes[i]);
			}
		}
		// Adding the changes back to the main Canvas File
		this.app.vault.modify(mainCanvasFile, JSON.stringify(mainCanvasData));
	}

	class TemplateModal extends FuzzySuggestModal<TFile> {
		plugin: CanvasUtilities;
		selectedTemplate: string;
		private creation_folder: TFolder | undefined;

		constructor(app: App, plugin: CanvasUtilities) {
			super(app);
			this.plugin = plugin;
			this.setPlaceholder("Type name of a canvas template...")
		}

		getCItems(): TFile[] {
			if(!this.plugin.settings.canvasTemplatesFolder) {
				return app.vault.getMarkdownFiles();
			}
			const files = get_ctfiles_from_folder(this.plugin.settings.canvasTemplatesFolder);
				if(!files) {
					return [];
				}
				return files;
			}

			getItemText(item: TFile): string {
				return item.basename;
			}

			onChooseItem(item: TFile | KeyboardEvent): void {
				insertCanvasFile(this.app.workspace.getActiveFile(), item);
			}

				

		onOpen() {
			const {contentEl} = this;
			contentEl.setText("jdslafj")
		}
		onClose(): void {
			const {contentEl} = this;
			contentEl.empty();
		}
	}


	class CanvasUtilitiesSettings extends PluginSettingTab {
		plugin: CanvasUtilities;
		constructor(app: App, plugin: CanvasUtilities) {
			super(app, plugin);
			this.plugin = plugin;
		}
		display(): void {
			const {containerEl} = this;
			containerEl.empty();
			containerEl.createEl('h2', {text: 'Settings for Canvas Utilities.'});
			new Setting(containerEl)
				.setName('Canvas Templates Folder')
				.setDesc('The folder where your Canvas templates are stored.')
				.addText(text => text
					.setPlaceholder('default')
					.setValue(this.plugin.settings.canvasTemplatesFolder)
					.onChange(async (value) => {
						this.plugin.settings.canvasTemplatesFolder = value;
						await this.plugin.saveSettings();
					}));
		}
	}


function generateRandomId(): string {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 16; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return result;

}
export function normalizePath(path: string): string {
	return path.replace(/\\/g, '/');
}
export function resolve_ctfolder(folder_str: string): TFolder {
    folder_str = normalizePath(folder_str);
    const folder = app.vault.getAbstractFileByPath(folder_str);
    if (!folder) {
		console.log("folder not found");
    }
    if (!(folder instanceof TFolder)) {
		console.log("folder is a file, not a folder");
    }
    return folder;
}
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

// The overall canvas file's JSON
export interface CanvasData {
    nodes: AllCanvasNodeData[];
    edges: CanvasEdgeData[];
}

// A node
export interface CanvasNodeData {
    // The unique ID for this node
    id: string;
    // The positional data
    x: number;
    y: number;
    width: number;
    height: number;
    // The color of this node
    color?: CanvasColor;
}

export type AllCanvasNodeData = CanvasFileData | CanvasTextData | CanvasLinkData | CanvasGroupData;

// A node that is a file, where the file is located somewhere in the vault.
export interface CanvasFileData extends CanvasNodeData {
    type: 'file';
    file: string;
    // An optional subpath which links to a heading or a block. Always starts with a `#`.
    subpath?: string;
}

// A node that is plaintext.
export interface CanvasTextData extends CanvasNodeData {
    type: 'text';
    text: string;
}

// A node that is an external resource.
export interface CanvasLinkData extends CanvasNodeData {
    type: 'link';
    url: string;
}

// A node that represents a group.
export interface CanvasGroupData extends CanvasNodeData {
    type: 'group';
    label?: string;
}

// The side of the node that a connection is connected to
export type NodeSide = 'top' | 'right' | 'bottom' | 'left';

// An edge
export interface CanvasEdgeData {
    // The unique ID for this edge
    id: string;
    // The node ID and side where this edge starts
    fromNode: string;
    fromSide: NodeSide;
    // The node ID and side where this edge ends
    toNode: string;
    toSide: NodeSide;
    // The color of this edge
    color?: CanvasColor;
    // The text label of this edge, if available
    label?: string;
}

