	import { TAbstractFile, FuzzySuggestModal, App, TFolder, Editor, ItemView, MarkdownView, Modal, Notice, Plugin, TFile, Vault, PluginSettingTab, Setting, FuzzyMatch } from 'obsidian';
	// Importing the canvas library
	import * as fs from 'fs';
import * as path from 'path';
import { join } from 'path';



	interface CanvasTempleSettings {
		canvasTemplatesFolder: string,
		debug: boolean
	}

	const DEFAULT_SETTINGS: CanvasTempleSettings = {
		canvasTemplatesFolder: 'default',
		debug: false
	}


	export default class CanvasTemple extends Plugin {
		settings: CanvasTempleSettings;
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
					new TemplateModal(this).open();

			}});
			this.addSettingTab(new CanvasTempleSettings(this.app, this));
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
			console.log("Inserting canvas file into active file");
			console.log("Active file: " + mainCanvasFile);
			console.log("Canvas file: " + canvasFile);
		// Reading the contents of the files
		const mainContent = await this.app.vault.read(mainCanvasFile);
		const canvasContent = await this.app.vault.read(canvasFile);
			console.log("Main file contents: " + mainContent);
			console.log("Canvas file contents: " + canvasContent);
		// Parsing the contents of the files and creating a CanvasData object for each
		const mainCanvasData: CanvasData = JSON.parse(mainContent);
		const canvasData: CanvasData = JSON.parse(canvasContent);
			console.log("Main canvas data: " + mainCanvasData);
			console.log("Canvas data: " + canvasData);

		let fromNodeid: string[] = [];
		let toNodeid: string[] = [];
		let fomSideDirection: string[] = [];
		let toSideDirection: string[] = [];
		// For each edge in the canvas file add the fromNodeid and toNodeid and the fromSideDirection and toSideDirection to the arrays
		for(let i = 0; i < canvasData.edges.length; i++) {
			fromNodeid.push(canvasData.edges[i].fromNode);
			toNodeid.push(canvasData.edges[i].toNode);
			fomSideDirection.push(canvasData.edges[i].fromSide);
			toSideDirection.push(canvasData.edges[i].toSide);
		}

		// Adding the nodes from the canvas file to the main canvas file
		// Checking if the node already exists in the main canvas file using the id
		for(let i = 0; i < canvasData.nodes.length; i++) {
			for(let j = 0; j < mainCanvasData.nodes.length; j++) {
				while(canvasData.nodes[i].id == mainCanvasData.nodes[j].id) {
					// for each egde in the canvas file check if the fromNodeid or toNodeid is the same as the id of the node
					for(let k = 0; k < canvasData.edges.length; k++) {
						if(canvasData.edges[k].fromNode == canvasData.nodes[i].id) {
							// if the fromNodeid is the same as the id of the node then change the fromNodeid to the id of the node newly created randomly
							console.log("Changing id of node: " + canvasData.nodes[i].id)
							canvasData.nodes[i].id = generateRandomId();
							console.log("New id: " + canvasData.nodes[i].id);
							canvasData.edges[k].fromNode = canvasData.nodes[i].id;
						}else if(canvasData.edges[k].toNode == canvasData.nodes[i].id) {
							// if the toNodeid is the same as the id of the node then change the toNodeid to the id of the node newly created randomly
							console.log("Changing id of node: " + canvasData.nodes[i].id)
							canvasData.nodes[i].id = generateRandomId();
							console.log("New id: " + canvasData.nodes[i].id);
							canvasData.edges[k].toNode = canvasData.nodes[i].id;
						}else{
							console.log("Changing id of node: " + canvasData.nodes[i].id)
							canvasData.nodes[i].id = generateRandomId();
							console.log("New id: " + canvasData.nodes[i].id);
						}
					}
				}

			}
		}
		// Checking if the edge already exists in the main canvas file using the id
		for(let i = 0; i < canvasData.edges.length; i++) {
			for(let j = 0; j < mainCanvasData.edges.length; j++) {
				while(canvasData.edges[i].id == mainCanvasData.edges[j].id) {
					console.log("Changing id of edge: " + canvasData.edges[i].id)
					canvasData.edges[i].id = generateRandomId();
					console.log("New id: " + canvasData.edges[i].id);
				}
			}
		}
		for(let i = 0; i < canvasData.edges.length; i++) {
			if(canvasData.edges[i]){

				mainCanvasData.edges.push(canvasData.edges[i]);
				console.log("Pushing edge: " + canvasData.edges[i]);
			}
		}
		for(let i = 0; i < canvasData.nodes.length; i++) {
			if(canvasData.nodes[i]){
				mainCanvasData.nodes.push(canvasData.nodes[i]);
			console.log("Pushing node: " + canvasData.nodes[i]);
			}
		}
		// Adding the changes back to the main Canvas File
		console.log("Writing to file: " + mainCanvasFile.toString());
		this.app.vault.modify(mainCanvasFile, JSON.stringify(mainCanvasData));
	}

	class TemplateModal extends FuzzySuggestModal<TFile> {
		plugin: CanvasTemple;
		selectedTemplate: string;
		private creation_folder: TFolder | undefined;

		constructor(plugin: CanvasTemple) {
			super(app);
			this.plugin = plugin;
			this.setPlaceholder("Type name of a canvas template...")
		}

		getItems(): TFile[] {
			if(!this.plugin.settings.canvasTemplatesFolder) {
				return app.vault.getMarkdownFiles();
			}
			console.log("Getting items from folder: " + this.plugin.settings.canvasTemplatesFolder);
			const files = get_ctfiles_from_folder(this.plugin.settings.canvasTemplatesFolder);
				if(!files) {
					console.log("files returned null")
					return [];
				}
				return files;
		}
		getItemText(item: TFile): string {
			return item.basename;
		}

			onChooseItem(item: TFile | KeyboardEvent): void {
				if(this.app.workspace.getActiveFile()){
					insertCanvasFile(this.plugin.app.workspace.getActiveFile(), item);
				}else{ 
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


	class CanvasTempleSettings extends PluginSettingTab {
		plugin: CanvasTemple;
		constructor(app: App, plugin: CanvasTemple) {
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
			new Setting(containerEl)
				.setName('Debug')
				.setDesc('Enable debug mode.')
				.addToggle(toggle => toggle
					.setValue(this.plugin.settings.debug)
					.onChange(async (value) => {
						this.plugin.settings.debug = value;
						await this.plugin.saveSettings();
					}
				));

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

    // if (!(folder instanceof TFolder)) {
	// 	console.log("folder is a file, not a folder");
    // }
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

