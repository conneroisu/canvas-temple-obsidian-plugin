import CanvasTemple from '../main';

export async function CurrentCanvasLocationY(plugin: CanvasTemple): Promise<number> {
	this.plugin = plugin;
	// get the current file 
	const active = this.app.workspace.getActiveFile();
	// get the current file content
	const fileContent = await this.app.vault.read(active);
	// get the current file content as a canvasData
	const canvasData = JSON.parse(fileContent);
	// get nodes that are text nodes
	const textNodes = canvasData.nodes.filter(node => node.type == 'text');
	console.log("textNodes: " + textNodes);
	// for each text node get the x and y position if the text containes insert here
	for (let i = 0; i < textNodes.length; i++) {
		if (textNodes[i].text.startsWith(plugin.settings.insertCardContent)) {
			console.log("textNodes[i].y: " + textNodes[i].y);
			return textNodes[i].y;
		}
	}
	return 0;
}
