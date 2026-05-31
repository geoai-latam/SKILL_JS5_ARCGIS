// snippet-apikey.ts — the simplest auth: an API key for location services. Smoke-tested.
import esriConfig from "@arcgis/core/config.js";

// Never hardcode the key — read it from the environment.
esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY as string;

export {};
