// snippet-utility-network.ts — load a UtilityNetwork from a feature service. Smoke-tested.
import UtilityNetwork from "@arcgis/core/networks/UtilityNetwork.js";

export async function loadUtilityNetwork(layerUrl: string) {
  const utilityNetwork = new UtilityNetwork({ layerUrl });
  await utilityNetwork.load();
  return utilityNetwork;
}
