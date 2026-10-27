// snippet-chart.ts — a bar chart from createModel(). Smoke-tested.
import "@arcgis/charts-components/components/arcgis-chart";
import { createModel } from "@arcgis/charts-components/model/shared/setup-utils";
import type FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";

export async function barChart(chart: HTMLArcgisChartElement, layer: FeatureLayer, field: string) {
  const model = await createModel({ layer, chartType: "barChart" });
  model.xAxisField = field;
  model.aggregationType = "count";
  chart.layer = layer;
  chart.model = model;
}
