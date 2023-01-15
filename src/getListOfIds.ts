import { CanvasData } from './canvas/canvas';

export function getListOfIds(firstCanvasData: CanvasData, secondCanvasData: CanvasData) {
	const ids: string[] = [];
	// add all ids from the first canvas data object to the list
	for (let i = 0; i < firstCanvasData.nodes.length; i++) {
		ids.push(firstCanvasData.nodes[i].id);
	}
	// add all ids from the second canvas data object to the list
	for (let i = 0; i < secondCanvasData.nodes.length; i++) {
		ids.push(secondCanvasData.nodes[i].id);
	}
	// add all ids from the edges of the first canvas data object to the list
	for (let i = 0; i < firstCanvasData.edges.length; i++) {
		ids.push(firstCanvasData.edges[i].id);
	}
	// add all ids from the edges of the second canvas data object to the list
	for (let i = 0; i < secondCanvasData.edges.length; i++) {
		ids.push(secondCanvasData.edges[i].id);
	}
	return ids;
}
