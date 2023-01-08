	import { TAbstractFile, FuzzySuggestModal, App, TFolder, Editor, ItemView, MarkdownView, Modal, Notice, Plugin, TFile, Vault, PluginSettingTab, Setting, FuzzyMatch } from 'obsidian';
	// Importing the canvas library
	import * as fs from 'fs';
import * as path from 'path';
import { join } from 'path';
import { CanvasEdgeData } from 'src/canvas';



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
			this.addCommand({
				id: 'open-canvas-template-modal',
				name: 'Open Canvas Template Modal',
				checkCallback: (checking: boolean) => {
					const active = this.app.workspace.getActiveFile();
					if(active && active.extension == 'canvas') {
						if(!checking) {
						
							new TemplateModal(this).open();
						}
						return true;
					}
				}
			});
			this.addSettingTab(new CanvasTempleSettings(this.app, this));
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
	function isToNodeIdMatching(edges: CanvasEdgeData[], nodeId: string): number {
		for(let i = 0; i < edges.length; i++) {
			if(edges[i].toNode == nodeId) {
				return i;
			}
		}
		return -1;
	}
	function isFromNodeIdMatching(edges: CanvasEdgeData[], nodeId: string): number {
		for(let i = 0; i < edges.length; i++) {
			if(edges[i].fromNode == nodeId) {
				return i;
			}
		}
		return -1;
	}

	//function to udate the canvasData nodes and edges with the new ids of the nodes and edges using generateRandomId()
	function updateCanvasData(canvasData: CanvasData, ): CanvasData {
		// Randomizing the node ids and edge ids
		// using matching methods to check if the node id is also in the edges
		for(let i = 0; i < canvasData.nodes.length; i++) {
			if(canvasData.nodes[i]){
				const newId = generateRandomId();
				const oldId = canvasData.nodes[i].id;
				canvasData.nodes[i].id = newId;
				const toNodeIndex = isToNodeIdMatching(canvasData.edges, oldId);
				const fromNodeIndex = isFromNodeIdMatching(canvasData.edges, oldId);
				if(toNodeIndex != -1) {
					canvasData.edges[toNodeIndex].toNode = newId;
				}else if(fromNodeIndex != -1) {
					canvasData.edges[fromNodeIndex].fromNode = newId;
				}else{
					canvasData.nodes[i].id = oldId;
				}
			}
		}
		for(let i = 0; i < canvasData.edges.length; i++) {
			if(canvasData.edges[i]){
				canvasData.edges[i].id = generateRandomId();
			}
		}
		return canvasData;
	}


		


	// Function to insert a canvas file into the active file
	async function insertCanvasFile(mainCanvasFile: TFile,canvasFile: TFile): Promise<void> {
		// Reading the contents of the files
		const mainContent = await this.app.vault.read(mainCanvasFile);
		const canvasContent = await this.app.vault.read(canvasFile);
		// Parsing the contents of the files and creating a CanvasData object for each
		const mainCanvasData: CanvasData = JSON.parse(mainContent);
		let canvasData: CanvasData = JSON.parse(canvasContent);
		console.log("Number of edges in canvas file: " + canvasData.edges.length);

		canvasData = updateCanvasData(canvasData);


		for(let i = 0; i < canvasData.edges.length; i++) {
			if(canvasData.edges[i]){
				
				console.log("Number of edges in main canvas file now: " + mainCanvasData.edges.length);
				console.log("Pushing edge: " + canvasData.edges[i].toString());
				const num = mainCanvasData.edges.push(canvasData.edges[i]);
				console.log("Number of edges in main canvas file now: " + num);
			}
		}
		for(let i = 0; i < canvasData.nodes.length; i++) {
			if(canvasData.nodes[i]){
				mainCanvasData.nodes.push(canvasData.nodes[i]);
				console.log("Pushing node: " + canvasData.nodes[i]);
			}
		}
		// Adding the changes back to the main Canvas File
		console.log(getCanvasFileJsonString(mainCanvasData));
		this.app.vault.modify(mainCanvasFile, getCanvasFileJsonString(mainCanvasData));
	}
	// function to check if the given node id is already in the main canvas file
	function checkNodeIdNotMain(mainCanvasData: CanvasData, nodeId: string) {
		for(let i = 0; i < mainCanvasData.nodes.length; i++) {
			if(mainCanvasData.nodes[i].id == nodeId) {
				return true;
			}
		}
		return false;
	}
	// function to return a properly formatted json string for the canvas file example seen below from a json
	// 	{
	// 	"nodes":[
	// 		{"id":"e7a47ad7bd0b34c4","x":-368,"y":-316,"width":399,"height":265,"type":"file","file":"Rainbow Ames Camponile.jpg"},
	// 		{"id":"562fbaa5d17165e4","x":65,"y":-316,"width":409,"height":60,"type":"text","text":"# Main Ideas"},
	// 	],
	// 	"edges":[
	// 		{"id":"Vqng34oEJUNaTyyQ","fromNode":"SWbCGAfhwICSTeLc","fromSide":"right","toNode":"Txmd3sxPcQs1qWqS","toSide":"left"},
	// 		{"id":"TJWhbRHUDBzAKJgR","fromNode":"OoSnxYlnLaTomYTc","fromSide":"right","toNode":"kSfOmEVsE8p6cY0P","toSide":"left"}
	// 	]
	// }
		function getCanvasFileJsonString(canvasData: CanvasData): string {
			const jsonString = JSON.stringify(canvasData);
			// new lines after each opening bracket "["
			const newJsonString = jsonString.replace(/\[/g, "[\n");
			// new lines after each closing bracket "]" 
			const newJsonString2 = newJsonString.replace(/\]/g, "\n]");
			// new lines before "],"
			const newJsonString3 = newJsonString2.replace(/\],/g, "\n],");
			// new lines after a bracket + comma "},"
			const newJsonString4 = newJsonString3.replace(/\},/g, "},\n");
			
		
			return newJsonString4;
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
				const activestate = this.app.workspace.getActiveFile();
				if(activestate){
					insertCanvasFile(activestate, item);
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

