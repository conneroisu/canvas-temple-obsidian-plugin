import CanvasTemple from '../main';

export async function CurrentCanvasLocationX(plugin: CanvasTemple): Promise<number> {
	this.plugin = plugin;
	// get the current file 
	const active = this.app.workspace.getActiveFile();
	// get the current file content
	const fileContent = await this.app.vault.read(active);
	// get the current file content as a canvasData
	const canvasData = JSON.parse(fileContent);
	// get nodes that are text nodes
	const textNodes = canvasData.nodes.filter(node => node.type == 'text');
	if (plugin.settings.debug) { console.log("textNodes: " + textNodes); }
	// for each text node get the x and y position if the text containes insert here
	for (let i = 0; i < textNodes.length; i++) {
		if (textNodes[i].text.includes('insert here')) {
			// remove the text node 
			if (plugin.settings.debug) { console.log("textNodes[i].x: " + textNodes[i].x); }
			return textNodes[i].x;
		}
	}
	return 0;
}
