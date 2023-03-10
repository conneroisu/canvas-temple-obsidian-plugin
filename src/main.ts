import { ItemView, MarkdownView, Plugin, TFile } from 'obsidian';

import { CanvasData } from './canvas/canvas';
import { CanvasTempleSettings, DEFAULT_SETTINGS } from './CanvasTempleSettings';
import { getListOfIds } from './getListOfIds';
import { CurrentCanvasLocationX } from './insert location/CurrentCanvasLocationX';
import { CurrentCanvasLocationY } from './insert location/CurrentCanvasLocationY';
import { TemplateModal } from './TemplateModal';
import { generateRandomIdAvoidingCollisions } from './utils/generateRandomIdAvoidingCollisions';

	export default class CanvasTemple extends Plugin {
		settings: CanvasTempleSettings;
		insertx: number = 0; 
		inserty: number = 0;
		async onload() {
			await this.loadSettings();
			this.addCommand({
				id: 'move-files-to-canvas-templates-folder',
				name: 'Move Files to Canvas Templates Folder',
				checkCallback: (checking: boolean) => {
					const active = this.app.workspace.getActiveFile();
					if(active && active.extension == 'canvas') {
						if(!checking) {
							moveFiletoTemplatesFolder(this,active);
						}
					}
					return true;
				}
			});
			this.addCommand({
				id: 'insert-to-placeholder-with-canvas-template-modal',
				name: 'Insert Canvas to Placeholder Canvas Template Modal',
				checkCallback: async (checking: boolean) => {
					const canvasView = this.app.workspace.getActiveViewOfType(ItemView);
					if(canvasView){
						const canvas = canvasView.canvas;
						console.log("canvas: " + canvas)
					}
					const active = this.app.workspace.getActiveFile();
					let view = this.app.workspace.getActiveViewOfType(MarkdownView);
					// get mouse x and y 
					if(active && active.extension == 'canvas') {
						// get canvas position
						if(!checking) {
							this.insertx = await CurrentCanvasLocationX(this);
							this.inserty = await CurrentCanvasLocationY(this);
							// insertx is 0 if CurrentCanvasLocation returns undefined 
							new TemplateModal(this, this.insertx, this.inserty).open();
						}
						return true;
					}
				}
			});
			this.addCommand({
				id: 'insert-to-origin-with-canvas-template-modal',
				name: 'Insert Canvas to Origin Canvas Template Modal',
				checkCallback: (checking: boolean) => {
					const active = this.app.workspace.getActiveFile();
					const view = this.app.workspace.getActiveViewOfType(MarkdownView);
					if(active && active.extension == 'canvas') {
						if(!checking) {
							new TemplateModal(this,0,0).open();
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
	export async function insertCanvasFile(plugin: CanvasTemple, firstCanvasFile: TFile,secondCanvasFile: TFile, location_x: number, location_y:number): Promise<void> {
		// Reading the contents of the files
		const firstContent = await this.app.vault.read(firstCanvasFile);
		const secondContent = await this.app.vault.read(secondCanvasFile);
		// Parsing the contents of the files and creating a CanvasData object for each
		const firstCanvasData: CanvasData = JSON.parse(firstContent);
		const secondCanvasData: CanvasData = JSON.parse(secondContent);
		plugin.insertx = await CurrentCanvasLocationX(plugin);
		plugin.inserty = await CurrentCanvasLocationY(plugin);
		
		// Add location to the nodes x and y
		for(let i = 0; i < secondCanvasData.nodes.length; i++) {
			secondCanvasData.nodes[i].x += plugin.insertx;
			secondCanvasData.nodes[i].y += plugin.inserty;
			console.log("location: " +location_x + ", " + location_y);
		}
		// Adjust the first CanvasData object and second CanvasData object to avoid duplicate ids
		adjustForIds(plugin ,firstCanvasData, secondCanvasData);
		// Combine the two CanvasData objects
		const combinedCanvasData: CanvasData = combineCanvasData(firstCanvasData, secondCanvasData);
		this.app.vault.modify(firstCanvasFile, JSON.stringify(combinedCanvasData));
	}
	
	export function combineCanvasData(firstCanvasData: CanvasData, secondCanvasData: CanvasData): CanvasData {
		// Combine the two CanvasData objects
		// for each node in the second canvas data object, add it to the first canvas data object
		for(let i = 0; i < secondCanvasData.nodes.length; i++) {
			firstCanvasData.nodes.push(secondCanvasData.nodes[i]);
		}
		// for each edge in the second canvas data object, add it to the first canvas data object
		for(let i = 0; i < secondCanvasData.edges.length; i++) {
			firstCanvasData.edges.push(secondCanvasData.edges[i]);
		}
		return firstCanvasData;
	}

	// Function to adjust the ids of the nodes and edges of the second canvas data object to avoid duplicates
	export function adjustForIds(plugin: Plugin, firstCanvasData: CanvasData, secondCanvasData: CanvasData): CanvasData {
		// all ids in a list 
		const ids: string[] = getListOfIds(firstCanvasData, secondCanvasData);

		firstCanvasData.nodes.forEach(node => {
			secondCanvasData.nodes.forEach(de => {
				// if the node contains the same id in fromNode or toNode as the node in the second canvas data object
				firstCanvasData.edges.forEach(edge => {
					secondCanvasData.edges.forEach(ede => {
						if(node.id == edge.fromNode && node.id == edge.fromNode) {
							const newId = generateRandomIdAvoidingCollisions(ids);
							ede.fromNode = newId;
							de.id = newId;
						}
						if(node.id == edge.toNode && node.id == edge.toNode) {
							const newId = generateRandomIdAvoidingCollisions(ids);
							ede.toNode = newId;
							de.id = newId;
						}
					})})
				// if the node contains the same id as the node in the second canvas data object
				if(node.id == de.id) {
					node.id = generateRandomIdAvoidingCollisions(ids);
				}else{
				}
			});
		});
		firstCanvasData.edges.forEach(edge => {
			secondCanvasData.edges.forEach(de => {
				if(edge.id == de.id) {
					de.id = generateRandomIdAvoidingCollisions(ids);
				}else{
				}
			});
		});
	}
	// function to return true of two nodes have the same type and 
	function getCanvasFileJsonString(canvasData: CanvasData): string {
		const jsonString = JSON.stringify(canvasData);
		// Formatting the string into canvas formatted string 
		// Essentially formatting lists of node and edge data 
		const newJsonString = formatString(jsonString);
		return newJsonString;
	}
function formatString(input: string): string {
	return input; 
}


function moveFiletoTemplatesFolder(plugin: CanvasTemple, file: TFile): void {
	// move file to templates folder defined in settings
	this.app.vault.rename(file, plugin.settings.canvasTemplatesFolder + "/" + file.name + ".canvas");
}





