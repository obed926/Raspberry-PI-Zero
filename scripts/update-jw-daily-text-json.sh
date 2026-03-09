#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LANG_CODE="${1:-en}"
DATE_PATH="$(date +%Y/%-m/%-d)"

case "$LANG_CODE" in
  en)
    SOURCE_URL="https://r.jina.ai/http://wol.jw.org/en/wol/h/r1/lp-e/$DATE_PATH"
    OUT_PATH="${2:-$ROOT_DIR/deliverables/dashboard/data/jw-daily-text-en.json}"
    ;;
  es)
    SOURCE_URL="https://r.jina.ai/http://wol.jw.org/es/wol/h/r4/lp-s/$DATE_PATH"
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

node - <<'NODE' "$TMP_MD" "$TMP_JSON" "$SOURCE_URL" "$LANG_CODE"
const fs = require("fs");

const [markdownPath, outPath, sourcePageUrl, langCode] = process.argv.slice(2);
const markdown = fs.readFileSync(markdownPath, "utf8").replace(/\r\n/g, "\n");

function stripMarkdownToText(value) {
  return String(value || "")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, "$1")
    .replace(/[_*`>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeTextForMatch(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/,/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isDailyHeading(line, lang) {
  const text = String(line || "").trim();
  if (lang === "es") {
    return /^(Lunes|Martes|Miercoles|Miércoles|Jueves|Viernes|Sabado|Sábado|Domingo)\s+\d{1,2}\s+de\s+[A-Za-záéíóúñ]+$/i.test(
      text
    );
  }
  return /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+[A-Za-z]+\s+\d{1,2}$/i.test(text);
}

function parseEntries(text, lang) {
  const lines = text.split("\n");
  const rows = [];
  for (let i = 0; i < lines.length; i += 1) {
    const heading = lines[i].trim();
    if (!isDailyHeading(heading, lang)) continue;
    if (!/^[-=]{3,}$/.test((lines[i + 1] || "").trim())) continue;
    let j = i + 2;
    while (j < lines.length && !isDailyHeading(lines[j].trim(), lang)) j += 1;

    const block = lines.slice(i + 2, j).join("\n");
    const blockLines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const verseLine = blockLines.find((line) => /—/.test(line) || /_/.test(line)) || blockLines[0] || "";
    const cutoff = blockLines.findIndex(
      (line) =>
        line.startsWith("[Examining the Scriptures Daily") ||
        line.startsWith("[Examinemos las Escrituras todos los días") ||
        line === "Welcome." ||
        line === "Bienvenido."
    );
    const bodyLines = blockLines
      .slice(1, cutoff > 0 ? cutoff : blockLines.length)
      .filter((line) => !line.startsWith("*   "))
      .filter((line) => !line.startsWith("[Examining the Scriptures Daily"))
      .filter((line) => !line.startsWith("[Examinemos las Escrituras todos los días"))
      .filter((line) => !/^(Font Size|Share)$/.test(line))
      .filter((line) => !/^(A|A\+)$/.test(line));
    const sourceMatch = block.match(
      /\[(?:Examining the Scriptures Daily|Examinemos las Escrituras todos los días)[^\]]*\]\((https?:\/\/[^)]+)\)/
    );
    rows.push({
      date_label: heading || "Daily Text",
      verse: stripMarkdownToText(verseLine || "Daily scripture"),
      body: stripMarkdownToText(bodyLines.join(" ") || "Daily commentary unavailable."),
      source_url: sourceMatch ? sourceMatch[1] : sourcePageUrl
    });
    i = j - 1;
  }
  return rows;
}

const entries = parseEntries(markdown, langCode);
if (!entries.length) throw new Error("Could not locate daily text heading block");

const now = new Date();
const monthNorm = normalizeTextForMatch(
  now.toLocaleDateString(langCode === "es" ? "es-ES" : "en-US", { month: "long" })
);
const day = String(now.getDate());
const todayLabelNorm = normalizeTextForMatch(
  now.toLocaleDateString(langCode === "es" ? "es-ES" : "en-US", {
    weekday: "long",
    ...(langCode === "es" ? { day: "numeric", month: "long" } : { month: "long", day: "numeric" })
  })
);

const picked =
  entries.find((entry) => normalizeTextForMatch(entry.date_label) === todayLabelNorm) ||
  entries.find((entry) => {
    const norm = normalizeTextForMatch(entry.date_label);
    return langCode === "es" ? norm.includes(`${day} de ${monthNorm}`) : norm.includes(`${monthNorm} ${day}`);
  }) ||
  entries[0];

const entry = {
  date_label: picked.date_label || "Daily Text",
  verse: picked.verse || "Daily scripture",
  body: picked.body || "Daily commentary unavailable.",
  source_url: picked.source_url || sourcePageUrl,
  captured_at_utc: new Date().toISOString()
};

fs.writeFileSync(outPath, JSON.stringify(entry, null, 2));
NODE

mkdir -p "$(dirname "$OUT_PATH")"
cp "$TMP_JSON" "$OUT_PATH"
echo "Updated $OUT_PATH"
