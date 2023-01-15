import { CanvasData } from './canvas/CanvasData';
import CanvasTemple from './main';
import { generateRandomIdAvoidingCollisions } from './utils/generateRandomIdAvoidingCollisions';

//function to udate the canvasData nodes and edges with the new ids of the nodes and edges using generateRandomId()
export function updateCanvasData(plugin: CanvasTemple, canvasData: CanvasData, mainCanvasData: CanvasData): CanvasData {
	// combine the two canvas datas 
	const combinedCanvasData: CanvasData = {
		nodes: [...canvasData.nodes, ...mainCanvasData.nodes],
		edges: [...canvasData.edges, ...mainCanvasData.edges],
	};
	// update the canvas data nodes and edges with the new ids of the nodes and edges using generateRandomId()
	const updatedCanvasData: CanvasData = {
		nodes: combinedCanvasData.nodes.map((node: { id: any; }) => {
			const newId = generateRandomIdAvoidingCollisions(combinedCanvasData.nodes.map((node) => node.id));
			if (combinedCanvasData.nodes.includes(node.id)) {
				return {
					...node,
					id: newId,
				};
			}
			for(let edge of combinedCanvasData.edges){
				if(edge.fromNode === node.id){
					edge.fromNode = newId;
				}
			}
			for(let edge of combinedCanvasData.edges){
				if(edge.toNode === node.id){
					edge.toNode = newId; 				}
			}
			return node;	
		}),
		edges: combinedCanvasData.edges.map((edge: { id: any; }) => {
			const newId = generateRandomIdAvoidingCollisions(combinedCanvasData.edges.map((edge) => edge.id));
			if (combinedCanvasData.nodes.includes(edge.id)) {
				return {
					...edge,
					id: newId,
								};
			}
			for(let edge of combinedCanvasData.edges){
				if(edge.fromNode === edge.id){
					edge.fromNode = newId;
				}
			}
			for(let edge of combinedCanvasData.edges){
				if(edge.toNode === edge.id){
					edge.toNode = newId; 				}
			}
			
			return edge;
		}),
	};
	console.log('updatedCanvasData', updatedCanvasData.edges);
	return updatedCanvasData;

}
