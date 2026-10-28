# Genera los .parquet que lee tests/runtime/casos/arcgis-parquet.ts (salen versionados en
# tests/runtime/public/parquet/, ~310 KB en total). Requiere pyarrow, geopandas y shapely.
# Uso: python tests/runtime/generar-parquet.py
import datetime, os, random
import pyarrow as pa, pyarrow.parquet as pq
import geopandas as gpd
from shapely.geometry import Point, Polygon

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public", "parquet")
os.makedirs(out, exist_ok=True)
C = [("Bogotá", -74.08, 4.61, 7900000), ("Medellín", -75.57, 6.25, 2600000), ("Cali", -76.53, 3.45, 2200000),
     ("Barranquilla", -74.80, 10.96, 1300000), ("Cartagena", -75.51, 10.39, 1000000)]
nombres = [c[0] for c in C]; lon = [c[1] for c in C]; lat = [c[2] for c in C]; pob = [c[3] for c in C]
fechas = [datetime.datetime(2020, 1, i + 1, tzinfo=datetime.timezone.utc) for i in range(5)]
cuadro = lambda x, y, d=0.1: Polygon([(x - d, y - d), (x + d, y - d), (x + d, y + d), (x - d, y + d), (x - d, y - d)])
puntos = gpd.GeoDataFrame({"nombre": nombres, "poblacion": pob}, geometry=[Point(x, y) for x, y in zip(lon, lat)], crs="EPSG:4326")

# GeoParquet (metadato "geo"): se detecta solo.
puntos.to_parquet(f"{out}/geoparquet-puntos.parquet", compression="snappy")
gpd.GeoDataFrame({"nombre": ["Bucaramanga", "Pereira", "Santa Marta"], "poblacion": [600000, 480000, 540000]},
  geometry=[Point(-73.12, 7.12), Point(-75.69, 4.81), Point(-74.20, 11.24)], crs="EPSG:4326").to_parquet(f"{out}/geoparquet-puntos-2.parquet", compression="snappy")
gpd.GeoDataFrame({"ciudad": ["Ibagué"], "habitantes": [540000]}, geometry=[Point(-75.23, 4.44)], crs="EPSG:4326").to_parquet(f"{out}/geoparquet-otro-esquema.parquet", compression="snappy")
gpd.GeoDataFrame({"nombre": nombres}, geometry=[cuadro(x, y) for x, y in zip(lon, lat)], crs="EPSG:4326").to_parquet(f"{out}/geoparquet-poligonos.parquet", compression="snappy")
puntos.to_crs("EPSG:3857").to_parquet(f"{out}/geoparquet-3857.parquet", compression="snappy")
puntos.to_crs("EPSG:9377").to_parquet(f"{out}/geoparquet-9377.parquet", compression="snappy")
# WKB sin metadato "geo": hay que declarar la codificación.
pq.write_table(pa.table({"nombre": nombres, "geom": [Point(x, y).wkb for x, y in zip(lon, lat)]}), f"{out}/wkb-puntos.parquet", compression="snappy")
pq.write_table(pa.table({"nombre": nombres, "geom": [cuadro(x, y).wkb for x, y in zip(lon, lat)]}), f"{out}/wkb-poligonos.parquet", compression="snappy")
# Columnas de coordenadas: con nombre detectable (lon/lat) y con nombre propio (coord_x/coord_y).
pq.write_table(pa.table({"nombre": nombres, "lon": lon, "lat": lat}), f"{out}/lonlat.parquet", compression="gzip")
pq.write_table(pa.table({"nombre": nombres, "lon": lon, "lat": lat}), f"{out}/lonlat-zstd.parquet", compression="zstd")
pq.write_table(pa.table({"nombre": nombres, "coord_x": lon, "coord_y": lat}), f"{out}/coord-xy.parquet", compression="snappy")
# Fechas en tres unidades.
pq.write_table(pa.table({"nombre": nombres, "lon": lon, "lat": lat,
  "fecha_ms": pa.array(fechas, type=pa.timestamp("ms", tz="UTC")), "fecha_us": pa.array(fechas, type=pa.timestamp("us", tz="UTC")),
  "dia": pa.array([d.date() for d in fechas], type=pa.date32())}), f"{out}/fechas.parquet", compression="snappy")
# 10 000 puntos en 4 grupos de filas: más grande que un bloque de lectura (64 KB), para el caso del servidor sin Range.
random.seed(1); n = 10000
pq.write_table(pa.table({"id": list(range(n)), "lon": [random.uniform(-79, -67) for _ in range(n)], "lat": [random.uniform(-4, 12) for _ in range(n)]}),
  f"{out}/puntos-10k.parquet", compression="snappy", row_group_size=2500)

for f in sorted(os.listdir(out)):
    print(f, os.path.getsize(os.path.join(out, f)))
