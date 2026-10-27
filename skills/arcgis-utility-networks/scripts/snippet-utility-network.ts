// snippet-utility-network.ts — load a utility network from a web map and trace with a named configuration.
// The classes are runtime-checked on SDK 5.1 (tests/runtime/casos/arcgis-utility-networks.ts); a full trace needs a
// signed-in session against a utility network service.
import WebMap from "@arcgis/core/WebMap.js";

export async function traceFrom(webMapId: string, globalId: string, terminalId: number | null = null) {
  const webMap = new WebMap({ portalItem: { id: webMapId } });
  await webMap.load();
  const un = webMap.utilityNetworks?.at(0);
  if (!un) throw new Error("This web map does not store a utility network");
  await un.load(); // pending behind a sign-in dialog on a secured service without a session
  const config = un.sharedNamedTraceConfigurations[0];
  if (!config) throw new Error("No trace configuration is shared with this web map");
  const result = await un.trace({
    namedTraceConfigurationGlobalId: config.globalId, // the JS name, not traceConfigurationGlobalId
    traceLocations: [{ type: "starting-point", globalId, terminalId }],
  });
  return { elements: result.elements, ignored: result.startingPointsIgnored, warnings: result.warnings };
}
