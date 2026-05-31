// snippet-arcade.ts — compile and run an Arcade expression. Smoke-tested.
import { createArcadeExecutor } from "@arcgis/core/arcade.js";

const SCRIPT = "Round($feature.POP / 1000) + ' k'";

export async function makeLabelExecutor() {
  const executor = await createArcadeExecutor(SCRIPT, {
    variables: [{ name: "$feature", type: "feature" }],
  });
  return executor;
}
