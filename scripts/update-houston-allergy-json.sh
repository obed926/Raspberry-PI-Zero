#!/usr/bin/env bash
set -euo pipefail

SOURCE_URL="https://www.accuweather.com/en/us/houston/77002/health-activities/351197"
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT_PATH="${1:-$ROOT_DIR/deliverables/dashboard/data/houston-allergy.json}"
TMP_HTML="$(mktemp)"
TMP_JSON="$(mktemp)"

cleanup() {
  rm -f "$TMP_HTML" "$TMP_JSON"
}
trap cleanup EXIT

curl -L -s -A "$UA" "$SOURCE_URL" > "$TMP_HTML"

node - <<'NODE' "$TMP_HTML" "$TMP_JSON" "$SOURCE_URL"
const fs = require("fs");

const [htmlPath, outPath, sourceUrl] = process.argv.slice(2);
const html = fs.readFileSync(htmlPath, "utf8");
const match = html.match(/var indexListData = (\[.*?\]);/s);
if (!match) {
  throw new Error("Could not find indexListData in AccuWeather page source");
}

const list = JSON.parse(match[1]);
if (!Array.isArray(list) || list.length === 0) {
  throw new Error("indexListData was empty");
}

const sorted = list
  .map((item) => ({
    name: item.localizedName || item.name || "Unknown",
    slug: item.slug || "",
    value: Number(item.value || 0),
    category: item.localizedCategory || item.category || "Unknown",
    advisory: item.categoryPhrase || "",
    index_date_local: item.indexDate || ""
  }))
  .sort((a, b) => b.value - a.value);

const dominant = sorted[0];
const payload = {
  captured_at_utc: new Date().toISOString(),
  source_url: sourceUrl,
  location: "Houston, TX",
  summary: {
    overall_category: dominant.category,
    overall_value: dominant.value,
    dominant_trigger: {
      name: dominant.name,
      value: dominant.value,
      category: dominant.category
    },
    source_index_date_local: dominant.index_date_local
  },
  items: sorted
};

fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
NODE

mkdir -p "$(dirname "$OUT_PATH")"
cp "$TMP_JSON" "$OUT_PATH"
echo "Updated $OUT_PATH"
