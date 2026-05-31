// snippet-render-node.ts — reference the RenderNode base for custom WebGL passes.
// RenderNode is abstract; you subclass it and attach to a SceneView. Smoke-tested.
import type RenderNode from "@arcgis/core/views/3d/webgl/RenderNode.js";

// A helper that wires an already-constructed custom render node into your app.
export function useRenderNode(node: RenderNode) {
  // node.produces / node.consumes declare the injection point in the render pipeline.
  return node;
}
