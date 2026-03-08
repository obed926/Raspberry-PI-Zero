#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LANG_CODE="${1:-en}"

case "$LANG_CODE" in
  en)
    SOURCE_URL="https://r.jina.ai/http://wol.jw.org/en/wol/h/r1/lp-e"
    OUT_PATH="${2:-$ROOT_DIR/deliverables/dashboard/data/jw-daily-text-en.json}"
    ;;
  es)
    SOURCE_URL="https://r.jina.ai/http://wol.jw.org/es/wol/h/r4/lp-s"
    OUT_PATH="${2:-$ROOT_DIR/deliverables/dashboard/data/jw-daily-text-es.json}"
    ;;
  *)
    echo "Unsupported language: $LANG_CODE (use en or es)" >&2
    exit 1
    ;;
esac
TMP_MD="$(mktemp)"
TMP_JSON="$(mktemp)"

cleanup() {
  rm -f "$TMP_MD" "$TMP_JSON"
}
trap cleanup EXIT

curl -sL "$SOURCE_URL" > "$TMP_MD"

node - <<'NODE' "$TMP_MD" "$TMP_JSON" "$SOURCE_URL"
const fs = require("fs");

const [markdownPath, outPath, sourcePageUrl] = process.argv.slice(2);
const markdown = fs.readFileSync(markdownPath, "utf8").replace(/\r\n/g, "\n");

function stripMarkdownToText(value) {
  return String(value || "")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, "$1")
    .replace(/[_*`>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const blockMatch = markdown.match(/^([^\n]+)\n-+\n([\s\S]+)/m);
if (!blockMatch) throw new Error("Could not locate daily text heading block");

const dateLabel = blockMatch[1].trim();
const block = blockMatch[2];
const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
const verseLine = lines.find((line) => /—/.test(line) || /_/.test(line)) || "";

const cutoff = lines.findIndex((line) => line.startsWith("[Examining the Scriptures Daily"));
const bodyLines = lines
  .slice(1, cutoff > 0 ? cutoff : lines.length)
  .filter((line) => !line.startsWith("*   "))
  .filter((line) => !line.startsWith("[Examining the Scriptures Daily"))
  .filter((line) => !line.startsWith("[Examinemos las Escrituras todos los días"))
  .filter((line) => !/^(Font Size|Share)$/.test(line));
const body = stripMarkdownToText(bodyLines.join(" "));

const sourceMatch = block.match(/\[(?:Examining the Scriptures Daily|Examinemos las Escrituras todos los días)[^\]]*\]\((https?:\/\/[^)]+)\)/);
const entry = {
  date_label: dateLabel || "Daily Text",
  verse: stripMarkdownToText(verseLine || "Daily scripture"),
  body: body || "Daily commentary unavailable.",
  source_url: sourceMatch ? sourceMatch[1] : sourcePageUrl,
  captured_at_utc: new Date().toISOString()
};

fs.writeFileSync(outPath, JSON.stringify(entry, null, 2));
NODE

mkdir -p "$(dirname "$OUT_PATH")"
cp "$TMP_JSON" "$OUT_PATH"
echo "Updated $OUT_PATH"
