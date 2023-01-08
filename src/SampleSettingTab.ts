import { App, PluginSettingTab, Setting } from 'obsidian';
import CanvasUtilities from 'main';

class CanvasUtilitiesTab extends PluginSettingTab {
	plugin: CanvasUtilities;
	constructor(app: App, plugin: CanvasUtilities) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Settings for my awesome plugin.' });

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.canvasTemplatesFolder)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.canvasTemplatesFolder = value;
					await this.plugin.saveSettings();
				}));
	}
}
