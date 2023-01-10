---
created: 2022-12-31T14:29:38-06:00
updated: 2022-12-31T15:14:27-06:00
---

Obsidian recently released a new core plugin called "canvas" which allows for the user to place Notes, Headers, and Media anywhere in a basically infinite, easily  location. Though a great update and addition I am sure will reignite many plugin developers, I found that I wanted templates to stop repeative work or even create a canvas that houses all your daily notes/canvases.This plugin is aimed to be the ultimate solution to this and many other problems.  The plugin is designed to allow users to quickly and easily create usable templates with which they can quickly and easily populate their canvases with. Allowing for custom notes, headers, media, and more to be placed with one action. 

The plugin also allows for the user to customize their canvas in a variety of ways, allowing for the user to tailor their canvas to their specific needs. This includes the ability to add custom backgrounds and colors, as well as being able to adjust the size of each note or header within the template by accessing the canvas used as a template.



 
# Big Milestones
- [x] Inserting a canvas into an existing canvas
- [x] Templates Folder
- [x] Template Modal for Insertion
- [ ] Template Insertion Variables
	- [ ] Time Variables
	- [ ] Location Variables
	- [ ] Part of Group Variables


# Insertion Location 
The template is inserted at the location of the Template Header if using because of offering an alternative to the mouse cursor.


- [ ] Default Location Picked

## (Obsidian Canvas Constants Resource for Developers)[ https://github.com/obsidianmd/obsidian-api/blob/master/canvas.d.ts] 

```typescript
// A color used to encode color data for nodes and edges
// can be a number (like "1") representing one of the (currently 6) supported colors.
// or can be a custom color using the hex format "#FFFFFFF".
export type CanvasColor = string;

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
```
