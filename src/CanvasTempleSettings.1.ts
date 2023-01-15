import { App, PluginSettingTab, Setting } from 'obsidian';

import CanvasTemple from './main';

export class CanvasTempleSettings extends PluginSettingTab {
	plugin: CanvasTemple;
	constructor(app: App, plugin: CanvasTemple) {
		super(app, plugin);
		this.plugin = plugin;
	}
	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl('h2', { text: 'Settings for Canvas Utilities.' });
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
		new Setting(containerEl)
			.setName('Canvas Insertion Text')
			.setDesc('The text that will be replaced with the template.')
			.addText(text => text
				.setPlaceholder('insert here')
				.setValue(this.plugin.settings.insertCardContent)
				.onChange(async (value) => {
					this.plugin.settings.insertCardContent = value;
					await this.plugin.saveSettings();
				}
				));


	}
}
