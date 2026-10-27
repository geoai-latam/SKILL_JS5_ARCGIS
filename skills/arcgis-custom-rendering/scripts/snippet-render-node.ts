// snippet-render-node.ts: a minimal RenderNode for SDK 5.1. Same shape as the measured runtime case.
// RenderNode is an Accessor: subclass with createSubclass, not `class extends`.
import RenderNode from "@arcgis/core/views/3d/webgl/RenderNode.js";
import type SceneView from "@arcgis/core/views/SceneView.js";

export function addOverlayNode(view: SceneView) {
  const OverlayNode = RenderNode.createSubclass({
    consumes: { required: ["composite-color"] }, // object with required/optional, not an array
    produces: "composite-color",
    render() {
      const output = this.bindRenderTarget();
      // draw with this.gl (WebGL2); read this.camera here, every frame
      return output;
    },
  });
  return new OverlayNode({ view }); // call .destroy() to remove it
}
