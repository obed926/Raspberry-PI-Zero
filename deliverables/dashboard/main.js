const MAP_PATHS = ["../../registry/command-center-map.yaml", "./data/command-center-map.yaml"];
const LOG_PATHS = ["../../knowledge/agent-logs/agent-runs.csv", "./data/agent-runs.csv"];
const RTAH_DATA_PATHS = ["./data/rtah-op-app.json"];
const TUNNEL_STATUS_PATHS = ["/rtah-op-live/data/tunnel-status.json", "./data/tunnel-status.json"];
const COMMAND_CENTER_ACCESS_PATHS = ["./data/command-center-access.json"];
const QUICK_ACCESS_PATHS = ["./data/quick-access.json"];
const WEATHER_FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";
const ACCUWEATHER_ALLERGY_MD_URL = "https://r.jina.ai/http://www.accuweather.com/en/us/houston/77002/weather-forecast/351197";
const ALLERGY_DATA_PATHS = ["./data/houston-allergy.json"];
const WBC_SCOREBOARD_URL = "https://site.api.espn.com/apis/site/v2/sports/baseball/world-baseball-classic/scoreboard";
const WBC_STANDINGS_URL =
  "https://site.api.espn.com/apis/v2/sports/baseball/world-baseball-classic/standings?region=us&lang=en&contentorigin=espn";
const ASTROS_TEAM_ID = "18";
const ASTROS_SCHEDULE_URL = `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams/${ASTROS_TEAM_ID}/schedule`;
const JINA_HTTP_PREFIX = "https://r.jina.ai/http://";
const WBC_VISIBLE_THROUGH_CT = "2026-03-18";
const DAILY_TEXT_SOURCES = {
  en: {
    label: "English",
    liveBaseUrl: "https://r.jina.ai/http://wol.jw.org/en/wol/h/r1/lp-e",
    fallbackPaths: ["./data/jw-daily-text-en.json", "./data/jw-daily-text.json"],
    sourceUrl: "https://wol.jw.org/en/wol/h/r1/lp-e"
  },
  es: {
    label: "Spanish",
    liveBaseUrl: "https://r.jina.ai/http://wol.jw.org/es/wol/h/r4/lp-s",
    fallbackPaths: ["./data/jw-daily-text-es.json"],
    sourceUrl: "https://wol.jw.org/es/wol/h/r4/lp-s"
  }
};
const WEATHER_REFRESH_WINDOW_MS = 10 * 60 * 1000;
const DAILY_TEXT_REFRESH_WINDOW_MS = 6 * 60 * 60 * 1000;
const DAILY_TEXT_LIVE_TIMEOUT_MS = 8000;
const DAILY_TEXT_CACHE_KEY = "jwDailyTextCacheV1";
const DAILY_TEXT_LANG_KEY = "dailyTextLang";
const DAILY_TEXT_EXPANDED_KEY = "dailyTextExpanded";
const WEATHER_EXPANDED_KEY = "weatherExpanded";
const ALLERGY_EXPANDED_KEY = "allergyExpanded";
const PULL_REFRESH_TRIGGER_PX = 92;
const HOUSTON_WEATHER = {
  place: "Houston, TX",
  latitude: 29.7604,
  longitude: -95.3698
};
let dailyTextPrefetchLang = "";
let dailyTextRequestSeq = 0;

const state = {
  rawMap: null,
  logs: [],
  rtahData: null,
  tunnelStatus: null,
  commandCenterAccess: null,
  quickAccess: null,
  filters: {
    lane: "all",
    nodeType: "all",
    search: ""
  },
  autoRefreshEnabled: false,
  autoRefreshMs: 30000,
  autoRefreshTimer: null,
  controlsBound: false,
  pullRefreshBound: false,
  weather: {
    place: HOUSTON_WEATHER.place,
    currentTempF: null,
    feelsLikeF: null,
    humidity: null,
    windMph: null,
    highF: null,
    lowF: null,
    icon: "○",
    summary: "Loading weather...",
    hourly24: [],
    daily5: [],
    updatedAt: "",
    status: "loading"
  },
  weatherFetchedAt: 0,
  weatherExpanded: false,
  wbc: {
    visible: false,
    expanded: false,
    todayGames: [],
    allGames: [],
    standings: [],
    updatedAt: "",
    status: "loading"
  },
  astros: {
    previousGame: null,
    nextGame: null,
    updatedAt: "",
    status: "loading"
  },
  allergy: {
    location: "Houston, TX",
    overallCategory: "Loading...",
    overallValue: null,
    dominantLabel: "",
    dominantValue: null,
    updatedAt: "",
    sourceDate: "",
    items: [],
    sourceUrl: "",
    status: "loading"
  },
  allergyFetchedAt: 0,
  allergyExpanded: false,
  dailyTextLang: "en",
  dailyTextExpanded: false,
  dailyText: {
    dateLabel: "Loading...",
    verse: "Fetching today's scripture...",
    body: "",
    sourceUrl: "https://wol.jw.org/en/wol/h/r1/lp-e",
    updatedAt: "",
    status: "loading"
  },
  dailyTextFetchedAtByLang: {
    en: 0,
    es: 0
  }
};

const RTAH_APP_FALLBACK = {
  appName: "RTAH Department Hub",
  deploymentHost: "pi-zero.local",
  dashboardPath: "/deliverables/dashboard/",
  primaryUser: "obed",
  deviceClass: "Raspberry Pi Zero",
  capturedAt: "n/a"
};

const COMMAND_CENTER_ACCESS_FALLBACK = {
  local_url: "http://10.0.0.115/deliverables/dashboard/",
  public_url: "",
  testing_url: "",
  notes: "Set public_url after Vercel publish."
};

const QUICK_ACCESS_FALLBACK = {
  links: [
    {
      label: "Command Center (Local)",
      url: "http://10.0.0.115/deliverables/dashboard/",
      group: "Dashboard",
      note: "Best on home Wi-Fi."
    },
    {
      label: "Command Center (Public)",
      url: "https://dashboard-five-theta-88.vercel.app",
      group: "Dashboard",
      note: "Use outside your home network."
    },
    {
      label: "RTAH Hub (Live Test)",
      url: "http://10.0.0.115/rtah-op-live/public/index.html",
      group: "RTAH",
      note: "Local live test path on Pi."
    },
    {
      label: "RTAH Hub (Public)",
      url: "https://rtah-op-app.vercel.app",
      group: "RTAH",
      note: "Stable public URL."
    }
  ]
};

const JW_CONVENTION = {
  driveUrl: "https://drive.google.com/drive/folders/1TEUotljT356g8qu0kvkPijApT6HI_1gv?usp=sharing",
  driveAppUrl: "googledrive://drive/folders/1TEUotljT356g8qu0kvkPijApT6HI_1gv",
  macPath: "/Users/obed/My Drive/JW/Convention Assembly Documents/2026 - Regional",
  macShortcutName: "Open 2026 Convention Folder"
};
const CONTRACTS_NOTEBOOKLM_URL =
  "https://notebooklm.google.com/notebook/eb554713-8f73-4c2b-a27b-f973c753af51";
const CONTRACTS_SUPPORT = {
  driveUrl: "https://1drv.ms/f/c/84dc8027d1a25edb/IgAamtFayWE9Tp4uOteS3fSpAWkjImaUSF6fRe-qwb7gtMc",
  macPath: "/Users/obed/Library/CloudStorage/OneDrive-Personal/Contracts Support Team",
  macShortcutName: "Open Contracts Support Team Folder"
};
const CONTRACTS_SE_TEXAS = {
  driveUrl: "https://1drv.ms/f/c/84dc8027d1a25edb/IgA0RSpnMOuPTYBPWFijKB3-AX0gF7yv7GS5-NL9GcRJcFI",
  macPath: "/Users/obed/Library/CloudStorage/OneDrive-Personal/Contract Team – SE Texas",
  macShortcutName: "Open Contracts Team Folder"
};
const CONTRACTS_CHAT_STORAGE_KEY = "contractsTeamChatV1";
const CONTRACTS_CHAT_MAX_MESSAGES = 120;

async function loadText(paths) {
  let lastError = "";
  for (const path of paths) {
    try {
      const res = await fetch(path, { cache: "no-store" });
      if (res.ok) {
        return await res.text();
      }
      lastError = `${path} returned ${res.status}`;
    } catch (err) {
      lastError = `${path} failed (${err.message})`;
    }
  }
  throw new Error(lastError || "all paths failed");
}

async function loadJson(paths) {
  const text = await loadText(paths);
  return JSON.parse(text);
}

async function loadJsonFresh(paths) {
  let lastError = "";
  const ts = Date.now();
  for (const path of paths) {
    const separator = path.includes("?") ? "&" : "?";
    const freshPath = `${path}${separator}v=${ts}`;
    try {
      const res = await fetch(freshPath, { cache: "no-store" });
      if (res.ok) {
        return await res.json();
      }
      lastError = `${freshPath} returned ${res.status}`;
    } catch (err) {
      lastError = `${freshPath} failed (${err.message})`;
    }
  }
  throw new Error(lastError || "all paths failed");
}

function cleanValue(raw) {
  const v = raw.trim();
  if (v === "null") return null;
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  return v;
}

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

function buildTodayDailyTextLabel(lang) {
  if (lang === "es") {
    return new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
  }
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function buildDailyTextLiveUrl(source) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  return `${source.liveBaseUrl}/${year}/${month}/${day}`;
}

function isDailyTextHeading(line, lang) {
  if (lang === "es") {
    return /^(Lunes|Martes|Miercoles|Miércoles|Jueves|Viernes|Sabado|Sábado|Domingo)\s+\d{1,2}\s+de\s+[A-Za-záéíóúñ]+$/i.test(
      String(line || "").trim()
    );
  }
  return /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+[A-Za-z]+\s+\d{1,2}$/i.test(
    String(line || "").trim()
  );
}

function parseDailyTextEntries(markdown, lang, fallbackSourceUrl) {
  const normalized = String(markdown || "").replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const entries = [];

  for (let i = 0; i < lines.length; i += 1) {
    const heading = lines[i].trim();
    if (!isDailyTextHeading(heading, lang)) continue;
    if (!/^[-=]{3,}$/.test((lines[i + 1] || "").trim())) continue;

    let j = i + 2;
    while (j < lines.length && !isDailyTextHeading(lines[j].trim(), lang)) {
      j += 1;
    }
    const block = lines.slice(i + 2, j).join("\n").trim();
    const blockLines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
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
      .filter((line) => !/^(Font Size|Share)$/.test(line))
      .filter((line) => !/^(A|A\+)$/.test(line));
    const sourceMatch = block.match(
      /\[(?:Examining the Scriptures Daily|Examinemos las Escrituras todos los días)[^\]]*\]\((https?:\/\/[^)]+)\)/
    );
    entries.push({
      dateLabel: heading || "Daily Text",
      verse: stripMarkdownToText(verseLine || "Daily scripture unavailable."),
      body: stripMarkdownToText(bodyLines.join(" ") || "Daily commentary unavailable."),
      sourceUrl: sourceMatch ? sourceMatch[1] : fallbackSourceUrl
    });
    i = j - 1;
  }

  return entries;
}

function parseDailyTextMarkdown(markdown, fallbackSourceUrl, lang) {
  const entries = parseDailyTextEntries(markdown, lang, fallbackSourceUrl);
  if (!entries.length) throw new Error("Could not parse live Daily Text feed");

  const today = new Date();
  const monthNorm = normalizeTextForMatch(
    today.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", { month: "long" })
  );
  const day = String(today.getDate());
  const todayLabelNorm = normalizeTextForMatch(buildTodayDailyTextLabel(lang));

  const todayEntry =
    entries.find((entry) => normalizeTextForMatch(entry.dateLabel) === todayLabelNorm) ||
    entries.find((entry) => {
      const norm = normalizeTextForMatch(entry.dateLabel);
      return lang === "es" ? norm.includes(`${day} de ${monthNorm}`) : norm.includes(`${monthNorm} ${day}`);
    }) ||
    entries[0];

  return {
    dateLabel: todayEntry.dateLabel || "Daily Text",
    verse: todayEntry.verse || "Daily scripture unavailable.",
    body: todayEntry.body || "Daily commentary unavailable.",
    sourceUrl: todayEntry.sourceUrl || fallbackSourceUrl,
    updatedAt: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    status: "ready"
  };
}

async function fetchTextWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { cache: "no-store", signal: controller.signal });
    if (!res.ok) throw new Error(`live source returned ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchDailyTextForLang(lang) {
  const source = DAILY_TEXT_SOURCES[lang] || DAILY_TEXT_SOURCES.en;
  try {
    const liveMarkdown = await fetchTextWithTimeout(
      `${buildDailyTextLiveUrl(source)}?v=${Date.now()}`,
      DAILY_TEXT_LIVE_TIMEOUT_MS
    );
    return parseDailyTextMarkdown(liveMarkdown, source.sourceUrl, lang);
  } catch (liveErr) {
    const fallback = await loadJsonFresh(source.fallbackPaths);
    return {
      dateLabel: fallback.date_label || "Daily Text",
      verse: fallback.verse || "Daily scripture unavailable.",
      body: fallback.body || "Daily commentary unavailable.",
      sourceUrl: fallback.source_url || source.sourceUrl,
      updatedAt: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      status: "ready"
    };
  }
}

async function prefetchOtherDailyTextLang() {
  const otherLang = state.dailyTextLang === "es" ? "en" : "es";
  if (loadDailyTextCacheForLang(otherLang)) return;
  if (dailyTextPrefetchLang === otherLang) return;
  dailyTextPrefetchLang = otherLang;
  try {
    const entry = await fetchDailyTextForLang(otherLang);
    saveDailyTextCache(entry, otherLang);
  } catch (err) {
    // best-effort prefetch only
  } finally {
    if (dailyTextPrefetchLang === otherLang) dailyTextPrefetchLang = "";
  }
}

function loadDailyTextCacheForLang(lang) {
  try {
    const raw = localStorage.getItem(`${DAILY_TEXT_CACHE_KEY}_${lang}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.dateLabel || !parsed.verse) return null;
    return parsed;
  } catch (err) {
    return null;
  }
}

function loadDailyTextCache() {
  return loadDailyTextCacheForLang(state.dailyTextLang);
}

function saveDailyTextCache(entry, lang = state.dailyTextLang) {
  try {
    localStorage.setItem(`${DAILY_TEXT_CACHE_KEY}_${lang}`, JSON.stringify(entry));
  } catch (err) {
    // best-effort cache only
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function pickTeamLogo(teamObj) {
  const logos = Array.isArray(teamObj?.logos) ? teamObj.logos : [];
  return String(logos[0]?.href || "");
}

function renderTeamChip(name, logoUrl) {
  const safeName = escapeHtml(name || "TBD");
  const safeLogo = escapeHtml(logoUrl || "");
  return safeLogo
    ? `<span class="team-chip"><img class="team-logo" src="${safeLogo}" alt="" loading="lazy" />${safeName}</span>`
    : `<span class="team-chip">${safeName}</span>`;
}

function toNumericScore(value) {
  if (value && typeof value === "object") {
    const fromValue = Number(value.value);
    if (Number.isFinite(fromValue)) return fromValue;
    const fromDisplay = Number(value.displayValue);
    if (Number.isFinite(fromDisplay)) return fromDisplay;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function sumLineScores(linescores) {
  if (!Array.isArray(linescores) || !linescores.length) return null;
  const vals = linescores
    .map((row) => Number(row?.value))
    .filter((n) => Number.isFinite(n));
  if (!vals.length) return null;
  return vals.reduce((acc, n) => acc + n, 0);
}

function pickRunsForCompetitor(competitor) {
  const direct = toNumericScore(competitor?.score);
  if (direct !== null) return direct;
  const fromLines = sumLineScores(competitor?.linescores);
  if (fromLines !== null) return fromLines;
  return null;
}

function loadContractsChatMessages() {
  try {
    const raw = localStorage.getItem(CONTRACTS_CHAT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((row) => ({
        text: String(row && row.text ? row.text : ""),
        timestamp: String(row && row.timestamp ? row.timestamp : "")
      }))
      .filter((row) => row.text);
  } catch (err) {
    return [];
  }
}

function saveContractsChatMessages(messages) {
  const normalized = Array.isArray(messages) ? messages.slice(-CONTRACTS_CHAT_MAX_MESSAGES) : [];
  localStorage.setItem(CONTRACTS_CHAT_STORAGE_KEY, JSON.stringify(normalized));
}

function formatChatTime(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function renderContractsChat() {
  const root = document.getElementById("contractsChat");
  if (!root) return;

  const messages = loadContractsChatMessages();
  root.innerHTML = `
    <div class="contracts-chat-shell">
      <div class="contracts-chat-head">Team Chat</div>
      <div class="contracts-chat-log">
        ${
          messages.length
            ? messages
                .map(
                  (msg) => `
                    <div class="contracts-chat-row">
                      <div class="contracts-chat-msg">${escapeHtml(msg.text)}</div>
                      <div class="contracts-chat-time">${escapeHtml(formatChatTime(msg.timestamp))}</div>
                    </div>
                  `
                )
                .join("")
            : `<div class="contracts-chat-empty">No messages yet. Add quick notes for contracts.</div>`
        }
      </div>
      <textarea id="contractsChatInput" class="contracts-chat-input" rows="2" placeholder="Type a message for Contracts Team..."></textarea>
      <div class="contracts-chat-actions">
        <button id="contractsChatSendBtn" class="action-btn" type="button">Send</button>
        <button id="contractsChatClearBtn" class="action-btn secondary-btn" type="button">Clear Chat</button>
      </div>
    </div>
  `;
}

function renderDailyTextHero() {
  const heroEl = document.getElementById("dailyTextHero");
  const dateEl = document.getElementById("dailyTextDate");
  const verseEl = document.getElementById("dailyTextVerse");
  const bodyEl = document.getElementById("dailyTextBody");
  if (!heroEl || !dateEl || !verseEl || !bodyEl) return;

  const daily = state.dailyText;
  dateEl.textContent = daily.dateLabel || "Daily Text";
  verseEl.textContent = daily.verse || "Daily scripture unavailable.";
  bodyEl.textContent = daily.body || "Commentary unavailable.";
  bodyEl.hidden = !state.dailyTextExpanded;
  heroEl.classList.toggle("daily-text-collapsed", !state.dailyTextExpanded);
  heroEl.setAttribute("aria-expanded", state.dailyTextExpanded ? "true" : "false");

  const langToggle = document.getElementById("dailyTextLangToggle");
  if (langToggle instanceof HTMLInputElement) {
    langToggle.checked = state.dailyTextLang === "es";
  }
}

async function refreshDailyText(force = false, requestedLang = state.dailyTextLang) {
  const lang = requestedLang === "es" ? "es" : "en";
  const now = Date.now();
  const lastFetchedAt = Number(state.dailyTextFetchedAtByLang[lang] || 0);
  if (!force && lastFetchedAt && now - lastFetchedAt < DAILY_TEXT_REFRESH_WINDOW_MS) {
    return;
  }
  const requestSeq = ++dailyTextRequestSeq;

  const cached = loadDailyTextCacheForLang(lang);
  if (cached && state.dailyTextLang === lang) {
    state.dailyText = {
      ...state.dailyText,
      ...cached,
      status: "ready"
    };
    renderDailyTextHero();
  } else if (state.dailyTextLang === lang) {
    state.dailyText.status = "loading";
    renderDailyTextHero();
  }

  try {
    const entry = await fetchDailyTextForLang(lang);
    saveDailyTextCache(entry, lang);
    state.dailyTextFetchedAtByLang[lang] = Date.now();
    if (requestSeq !== dailyTextRequestSeq || state.dailyTextLang !== lang) return;
    state.dailyText = entry;
  } catch (fallbackErr) {
    if (cached) {
      if (requestSeq !== dailyTextRequestSeq || state.dailyTextLang !== lang) return;
      state.dailyText = {
        ...state.dailyText,
        ...cached,
        status: "ready"
      };
      renderDailyTextHero();
      return;
    }
    state.dailyText = {
      dateLabel: "Daily Text Unavailable",
      verse: "Could not load today's text.",
      body: `Reason: ${fallbackErr.message}`,
      sourceUrl: (DAILY_TEXT_SOURCES[lang] || DAILY_TEXT_SOURCES.en).sourceUrl,
      updatedAt: "",
      status: "error"
    };
  }

  renderDailyTextHero();
  prefetchOtherDailyTextLang().catch(() => {});
}

function sendContractsChatMessage() {
  const input = document.getElementById("contractsChatInput");
  if (!(input instanceof HTMLTextAreaElement)) return;

  const text = input.value.trim();
  if (!text) return;

  const messages = loadContractsChatMessages();
  messages.push({
    text,
    timestamp: new Date().toISOString()
  });
  saveContractsChatMessages(messages);
  renderContractsChat();
}

function clearContractsChatMessages() {
  saveContractsChatMessages([]);
  renderContractsChat();
}

function openNotebookLmPopup() {
  const popupFeatures = "popup=yes,width=1100,height=820,noopener,noreferrer";
  const win = window.open(CONTRACTS_NOTEBOOKLM_URL, "contractsNotebookLm", popupFeatures);
  if (!win) {
    window.open(CONTRACTS_NOTEBOOKLM_URL, "_blank", "noopener,noreferrer");
  }
}

function parseMapYaml(text) {
  const map = {
    updated_on: "",
    layout: { lanes: [] },
    nodes: [],
    edges: [],
    validation: {}
  };

  const lines = text.split("\n");
  let section = "";
  let inLanes = false;
  let inPromptSources = false;
  let currentLane = null;
  let currentNode = null;
  let currentEdge = null;

  for (const line of lines) {
    if (!line.trim()) continue;

    if (/^updated_on:/.test(line)) {
      map.updated_on = cleanValue(line.split(":").slice(1).join(":"));
      continue;
    }
    if (/^layout:/.test(line)) {
      section = "layout";
      inLanes = false;
      continue;
    }
    if (/^nodes:/.test(line)) {
      section = "nodes";
      inPromptSources = false;
      continue;
    }
    if (/^edges:/.test(line)) {
      section = "edges";
      continue;
    }
    if (/^validation:/.test(line)) {
      section = "validation";
      continue;
    }

    if (section === "layout") {
      if (/^  lanes:/.test(line)) {
        inLanes = true;
        continue;
      }
      if (inLanes && /^    - lane_id:/.test(line)) {
        currentLane = { lane_id: cleanValue(line.replace(/^    - lane_id:\s*/, "")), label: "" };
        map.layout.lanes.push(currentLane);
        continue;
      }
      if (inLanes && /^      label:/.test(line) && currentLane) {
        currentLane.label = cleanValue(line.replace(/^      label:\s*/, ""));
        continue;
      }
    }

    if (section === "nodes") {
      if (/^  - node_id:/.test(line)) {
        inPromptSources = false;
        currentNode = {
          node_id: cleanValue(line.replace(/^  - node_id:\s*/, "")),
          label: "",
          lane_id: "",
          node_type: "",
          permissions: "",
          model: "",
          max_turns: "",
          skill_path: "",
          prompt_sources: []
        };
        map.nodes.push(currentNode);
        continue;
      }
      if (!currentNode) continue;
      if (/^    prompt_sources:/.test(line)) {
        inPromptSources = true;
        continue;
      }
      if (inPromptSources && /^      - /.test(line)) {
        currentNode.prompt_sources.push(cleanValue(line.replace(/^      - /, "")));
        continue;
      }
      if (/^    [a-z_]+:/.test(line)) {
        inPromptSources = false;
        const idx = line.indexOf(":");
        const key = line.slice(4, idx).trim();
        const val = cleanValue(line.slice(idx + 1));
        currentNode[key] = val;
      }
      continue;
    }

    if (section === "edges") {
      if (/^  - from:/.test(line)) {
        currentEdge = { from: cleanValue(line.replace(/^  - from:\s*/, "")), to: "", relation: "" };
        map.edges.push(currentEdge);
        continue;
      }
      if (!currentEdge) continue;
      if (/^    to:/.test(line)) {
        currentEdge.to = cleanValue(line.replace(/^    to:\s*/, ""));
        continue;
      }
      if (/^    relation:/.test(line)) {
        currentEdge.relation = cleanValue(line.replace(/^    relation:\s*/, ""));
        continue;
      }
      continue;
    }

    if (section === "validation" && /^  [a-z_]+:/.test(line)) {
      const idx = line.indexOf(":");
      const key = line.slice(2, idx).trim();
      map.validation[key] = cleanValue(line.slice(idx + 1));
    }
  }

  return map;
}

function parseCsv(text) {
  const lines = text.split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const cols = line.split(",");
    const row = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] || "";
    });
    return row;
  });
}

function toFahrenheit(celsius) {
  return celsius == null ? null : Math.round((celsius * 9) / 5 + 32);
}

function weatherSymbol(code, isDay) {
  if (code === 0) return isDay ? "☀" : "☾";
  if ([1, 2, 3].includes(code)) return isDay ? "⛅" : "☁";
  if ([45, 48].includes(code)) return "〰";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "☂";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄";
  if ([95, 96, 99].includes(code)) return "⚡";
  return "○";
}

function weatherSummary(code) {
  if (code === 0) return "Clear";
  if ([1, 2].includes(code)) return "Partly Cloudy";
  if (code === 3) return "Cloudy";
  if ([45, 48].includes(code)) return "Foggy";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Conditions";
}

function formatHourLabel(timeText, index) {
  if (index === 0) return "Now";
  const date = new Date(timeText);
  return date.toLocaleTimeString([], { hour: "numeric" });
}

function formatDayLabel(timeText, index) {
  if (index === 0) return "Today";
  const date = new Date(timeText);
  return date.toLocaleDateString([], { weekday: "short" });
}

function buildHourlyForecast(payload) {
  const hourly = payload.hourly || {};
  const times = hourly.time || [];
  const temps = hourly.temperature_2m || [];
  const codes = hourly.weather_code || [];
  const probs = hourly.precipitation_probability || [];
  const days = hourly.is_day || [];
  const currentTime = (payload.current && payload.current.time) || "";

  let startIndex = times.indexOf(currentTime);
  if (startIndex < 0) {
    startIndex = times.findIndex((timeText) => timeText >= currentTime);
  }
  if (startIndex < 0) startIndex = 0;

  const endIndex = Math.min(startIndex + 24, times.length);
  const rows = [];
  for (let i = startIndex; i < endIndex; i += 1) {
    rows.push({
      label: formatHourLabel(times[i], i - startIndex),
      icon: weatherSymbol(Number(codes[i] ?? 0), Number(days[i] ?? 1) === 1),
      tempF: toFahrenheit(Number(temps[i])),
      precip: Math.round(Number(probs[i] ?? 0))
    });
  }
  return rows;
}

function buildDailyForecast(payload) {
  const daily = payload.daily || {};
  const times = daily.time || [];
  const highs = daily.temperature_2m_max || [];
  const lows = daily.temperature_2m_min || [];
  const codes = daily.weather_code || [];
  const probs = daily.precipitation_probability_max || [];

  const rows = [];
  const count = Math.min(5, times.length);
  for (let i = 0; i < count; i += 1) {
    rows.push({
      label: formatDayLabel(times[i], i),
      icon: weatherSymbol(Number(codes[i] ?? 0), true),
      highF: toFahrenheit(Number(highs[i])),
      lowF: toFahrenheit(Number(lows[i])),
      precip: Math.round(Number(probs[i] ?? 0))
    });
  }
  return rows;
}

function renderWeatherWidget() {
  const root = document.getElementById("weatherWidget");
  if (!root) return;

  const weather = state.weather;
  if (weather.status !== "ready") {
    root.innerHTML = `<div class="weather-loading">${weather.summary || "Loading weather..."}</div>`;
    return;
  }

  const lowRange = weather.daily5.map((day) => day.lowF).filter((n) => Number.isFinite(n));
  const highRange = weather.daily5.map((day) => day.highF).filter((n) => Number.isFinite(n));
  const minTemp = lowRange.length ? Math.min(...lowRange) : 0;
  const maxTemp = highRange.length ? Math.max(...highRange) : 1;
  const span = Math.max(1, maxTemp - minTemp);

  root.innerHTML = `
    <div class="weather-shell collapsible ${state.weatherExpanded ? "is-expanded" : "is-collapsed"}">
      <div class="weather-top">
        <div class="weather-place">${weather.place}</div>
        <div class="weather-updated">${weather.updatedAt || "Updated now"}</div>
      </div>
      <div class="weather-main">
        <div class="weather-icon" aria-hidden="true">${weather.icon}</div>
        <div class="weather-temp">${weather.currentTempF}&deg;</div>
      </div>
      <div class="weather-summary">${weather.summary}</div>
      <div class="weather-meta">
        <span>H:${weather.highF}&deg; L:${weather.lowF}&deg;</span>
        <span>Feels ${weather.feelsLikeF}&deg;</span>
        <span>Humidity ${weather.humidity}%</span>
        <span>Wind ${weather.windMph} mph</span>
      </div>
      <div class="weather-extended">
        <div class="weather-section-title">24-Hour Forecast</div>
        <div class="weather-hourly-strip">
          ${weather.hourly24
            .map(
              (row) => `
                <div class="weather-hour-card">
                  <div class="weather-hour-label">${row.label}</div>
                  <div class="weather-hour-icon">${row.icon}</div>
                  <div class="weather-hour-temp">${row.tempF}&deg;</div>
                  <div class="weather-hour-precip">${row.precip}%</div>
                </div>
              `
            )
            .join("")}
        </div>
        <div class="weather-section-title">5-Day Forecast</div>
        <div class="weather-daily-list">
          ${weather.daily5
            .map((day) => {
              const leftPct = Math.max(0, Math.min(100, ((day.lowF - minTemp) / span) * 100));
              const widthPct = Math.max(10, Math.min(100 - leftPct, ((day.highF - day.lowF) / span) * 100));
              return `
                <div class="weather-day-row">
                  <div class="weather-day-name">${day.label}</div>
                  <div class="weather-day-icon">${day.icon}</div>
                  <div class="weather-day-low">${day.lowF}&deg;</div>
                  <div class="weather-day-range">
                    <span class="weather-day-range-fill" style="left:${leftPct}%;width:${widthPct}%"></span>
                  </div>
                  <div class="weather-day-high">${day.highF}&deg;</div>
                  <div class="weather-day-precip">${day.precip}%</div>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    </div>
  `;
}

async function refreshWeatherData(force = false) {
  const now = Date.now();
  if (!force && state.weatherFetchedAt && now - state.weatherFetchedAt < WEATHER_REFRESH_WINDOW_MS) {
    return;
  }

  state.weather.status = "loading";
  state.weather.summary = "Loading weather...";
  renderWeatherWidget();

  try {
    const weatherUrl =
      `${WEATHER_FORECAST_URL}?latitude=${HOUSTON_WEATHER.latitude}&longitude=${HOUSTON_WEATHER.longitude}` +
      `&current=temperature_2m,apparent_temperature,weather_code,is_day,wind_speed_10m,relative_humidity_2m` +
      `&hourly=temperature_2m,weather_code,precipitation_probability,is_day` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
      `&forecast_days=6&timezone=auto`;
    const weatherRes = await fetch(weatherUrl, { cache: "no-store" });
    if (!weatherRes.ok) throw new Error("Could not load weather");
    const payload = await weatherRes.json();

    const current = payload.current || {};
    const daily = payload.daily || {};
    const hourly24 = buildHourlyForecast(payload);
    const daily5 = buildDailyForecast(payload);
    const code = Number(current.weather_code ?? 0);
    const isDay = Number(current.is_day ?? 1) === 1;

    state.weather = {
      ...state.weather,
      place: HOUSTON_WEATHER.place,
      currentTempF: toFahrenheit(Number(current.temperature_2m)),
      feelsLikeF: toFahrenheit(Number(current.apparent_temperature)),
      humidity: Math.round(Number(current.relative_humidity_2m ?? 0)),
      windMph: Math.round(Number(current.wind_speed_10m ?? 0) * 0.621371),
      highF: toFahrenheit(Number((daily.temperature_2m_max || [null])[0])),
      lowF: toFahrenheit(Number((daily.temperature_2m_min || [null])[0])),
      icon: weatherSymbol(code, isDay),
      summary: weatherSummary(code),
      hourly24,
      daily5,
      updatedAt: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      status: "ready"
    };
    state.weatherFetchedAt = now;
  } catch (err) {
    state.weather = {
      ...state.weather,
      summary: `Weather unavailable: ${err.message}`,
      status: "error"
    };
  }

  renderWeatherWidget();
}

function allergyClass(category) {
  const norm = String(category || "").toLowerCase();
  if (norm === "high" || norm === "very high") return "risk-high";
  if (norm === "moderate") return "risk-moderate";
  return "risk-low";
}

function pollenScore(value) {
  const v = Number(value || 0);
  if (v <= 0) return 1;
  if (v <= 10) return 2;
  if (v <= 30) return 3;
  if (v <= 60) return 4;
  return 5;
}

function scoreCategory(score) {
  if (score >= 5) return "Very High";
  if (score >= 4) return "High";
  if (score >= 3) return "Moderate";
  return "Low";
}

function allergyValueFromCategory(category) {
  const norm = String(category || "").toLowerCase();
  if (norm === "very high") return 5;
  if (norm === "high") return 4;
  if (norm === "moderate") return 3;
  return 2;
}

function buildAllergyFromAccuWeatherMarkdown(markdown) {
  const text = String(markdown || "");
  const wanted = ["Tree Pollen", "Ragweed Pollen", "Mold", "Grass Pollen", "Dust & Dander"];
  const levels = new Map();
  const rx = /(Tree Pollen|Ragweed Pollen|Mold|Grass Pollen|Dust & Dander)\s+(Low|Moderate|High|Very High)/gi;
  let match = rx.exec(text);
  while (match) {
    levels.set(match[1], match[2]);
    match = rx.exec(text);
  }
  if (!levels.size) throw new Error("AccuWeather allergy levels not found");

  const items = wanted.map((name) => {
    const category = levels.get(name) || "Low";
    return { name, value: allergyValueFromCategory(category), category };
  });
  const dominant = [...items].sort((a, b) => Number(b.value || 0) - Number(a.value || 0))[0] || items[0];
  return {
    location: "Houston, TX",
    overallCategory: dominant?.category || "Unknown",
    overallValue: dominant?.value ?? null,
    dominantLabel: dominant?.name || "n/a",
    dominantValue: dominant?.value ?? null,
    sourceDate: new Date().toLocaleDateString(),
    items,
    sourceUrl: "https://www.accuweather.com/en/us/houston/77002/weather-forecast/351197",
    updatedAt: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    status: "ready"
  };
}

function renderAllergyWidget() {
  const root = document.getElementById("allergyWidget");
  if (!root) return;

  const allergy = state.allergy;
  if (allergy.status !== "ready") {
    root.innerHTML = `<div class="weather-loading">${allergy.overallCategory || "Loading allergy forecast..."}</div>`;
    return;
  }

  const displayOrder = ["Tree Pollen", "Ragweed Pollen", "Mold", "Grass Pollen", "Dust & Dander"];
  const norm = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9& ]/g, "").trim();
  const lookup = new Map((allergy.items || []).map((item) => [norm(item.name), item]));
  const displayItems = displayOrder.map((name) => {
    const key = norm(name);
    let item = lookup.get(key) || null;
    if (!item && name === "Mold") item = lookup.get("mugwort pollen") || lookup.get("mugwort") || null;
    if (!item && name === "Dust & Dander") item = lookup.get("dander") || lookup.get("dust") || null;
    return {
      name,
      value: item ? Number(item.value || 0) : null,
      category: item ? item.category : "n/a"
    };
  });
  const dustItem = displayItems.find((item) => item.name === "Dust & Dander") || {
    name: "Dust & Dander",
    value: null,
    category: "n/a"
  };

  root.innerHTML = `
    <div class="weather-shell allergy-shell collapsible ${state.allergyExpanded ? "is-expanded" : "is-collapsed"}">
      <div class="weather-top">
        <div class="weather-place">${allergy.location}</div>
        <div class="weather-updated">${allergy.updatedAt || "Updated now"}</div>
      </div>
      <div class="allergy-main">
        <div class="allergy-score-wrap">
          <div class="allergy-score">${allergy.overallValue ?? "n/a"}</div>
          <div class="allergy-score-max">/ 5</div>
        </div>
        <div class="allergy-status">
          <span class="status-pill ${allergyClass(allergy.overallCategory)}">${allergy.overallCategory}</span>
          <span class="allergy-driver">Top trigger: ${allergy.dominantLabel || "n/a"}</span>
        </div>
      </div>
      <div class="allergy-collapsed">
        <div class="allergy-row">
          <div class="allergy-name">${dustItem.name}</div>
          <div class="allergy-value">${Number.isFinite(dustItem.value) ? `${dustItem.value}/5` : "n/a"}</div>
          <div class="allergy-cat ${allergyClass(dustItem.category)}">${dustItem.category || "n/a"}</div>
        </div>
      </div>
      <div class="allergy-detail">
        <div class="weather-section-title">Houston Allergy Breakdown</div>
        <div class="allergy-list">
          ${displayItems
            .map(
              (item) => `
                <div class="allergy-row">
                  <div class="allergy-name">${item.name}</div>
                  <div class="allergy-bar-track">
                    <span class="allergy-bar-fill" style="width:${Math.max(0, Math.min(100, ((Number(item.value || 0) || 0) / 5) * 100))}%"></span>
                  </div>
                  <div class="allergy-value">${Number.isFinite(item.value) ? `${item.value}/5` : "n/a"}</div>
                  <div class="allergy-cat ${allergyClass(item.category)}">${item.category || "n/a"}</div>
                </div>
              `
            )
            .join("")}
        </div>
        <div class="allergy-footnote">
          Source date: ${allergy.sourceDate || "n/a"} |
          <a href="${allergy.sourceUrl}" target="_blank" rel="noopener noreferrer">AccuWeather Houston Allergy Outlook</a>
        </div>
      </div>
    </div>
  `;
}

async function refreshAllergyData(force = false) {
  state.allergy.status = "loading";
  state.allergy.overallCategory = "Loading allergy forecast...";
  renderAllergyWidget();

  try {
    const res = await fetch(ACCUWEATHER_ALLERGY_MD_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("AccuWeather allergy source unavailable");
    const markdown = await res.text();
    state.allergy = {
      ...state.allergy,
      ...buildAllergyFromAccuWeatherMarkdown(markdown)
    };
    state.allergyFetchedAt = Date.now();
  } catch (liveErr) {
    try {
      const payload = await loadJsonFresh(ALLERGY_DATA_PATHS);
      const items = Array.isArray(payload.items) ? payload.items : [];
      const dominant = items.reduce(
        (acc, item) => {
          const value = Number(item.value || 0);
          return value > acc.value ? { label: item.name || "n/a", value } : acc;
        },
        { label: "", value: -1 }
      );

      state.allergy = {
        ...state.allergy,
        location: payload.location || "Houston, TX",
        overallCategory: (payload.summary && payload.summary.overall_category) || "Unknown",
        overallValue: (payload.summary && payload.summary.overall_value) ?? null,
        dominantLabel:
          (payload.summary && payload.summary.dominant_trigger && payload.summary.dominant_trigger.name) ||
          dominant.label ||
          "n/a",
        dominantValue:
          (payload.summary && payload.summary.dominant_trigger && payload.summary.dominant_trigger.value) ??
          dominant.value,
        sourceDate:
          (payload.summary && payload.summary.source_index_date_local) ||
          (items[0] && items[0].index_date_local) ||
          "",
        items: items.slice(0, 5),
        sourceUrl: payload.source_url || "https://www.accuweather.com/en/us/houston/77002/health-activities/351197",
        updatedAt: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        status: "ready"
      };
      state.allergyFetchedAt = Date.now();
    } catch (snapshotErr) {
      state.allergy = {
        ...state.allergy,
        overallCategory: `Allergy unavailable: ${snapshotErr.message || liveErr.message}`,
        status: "error"
      };
    }
  }

  renderAllergyWidget();
}

function ctDateYmd(dateValue = new Date()) {
  const dt = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (Number.isNaN(dt.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(dt);
  const year = parts.find((p) => p.type === "year")?.value || "0000";
  const month = parts.find((p) => p.type === "month")?.value || "01";
  const day = parts.find((p) => p.type === "day")?.value || "01";
  return `${year}-${month}-${day}`;
}

function wbcIsVisibleNow() {
  return ctDateYmd() <= WBC_VISIBLE_THROUGH_CT;
}

function formatCtTime(isoDate) {
  const dt = new Date(isoDate);
  if (Number.isNaN(dt.getTime())) return "TBD";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).format(dt);
}

function formatCtDayLabel(isoDate) {
  const dt = new Date(isoDate);
  if (Number.isNaN(dt.getTime())) return "TBD";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    month: "short",
    day: "numeric"
  }).format(dt);
}

function toYmdCompact(dateStr) {
  return String(dateStr || "").slice(0, 10).replace(/-/g, "");
}

function mapWbcEvent(event) {
  const comp = (event && event.competitions && event.competitions[0]) || {};
  const teams = Array.isArray(comp.competitors) ? comp.competitors : [];
  const home = teams.find((t) => t.homeAway === "home") || teams[0] || {};
  const away = teams.find((t) => t.homeAway === "away") || teams[1] || {};
  const statusType = (comp.status && comp.status.type) || {};
  const tvName =
    (comp.geoBroadcasts || []).find((b) => b?.media?.shortName)?.media?.shortName ||
    (comp.broadcasts || []).flatMap((b) => b?.names || [])[0] ||
    comp.broadcast ||
    "TBD";
  const venue = comp.venue || {};
  const city = venue.address && venue.address.city ? venue.address.city : "";
  return {
    id: String(event?.id || comp?.id || `${event?.name || "game"}-${event?.date || ""}`),
    date: event?.date || comp?.date || null,
    awayTeamName: away?.team?.shortDisplayName || away?.team?.displayName || "TBD",
    awayTeamLogo: pickTeamLogo(away?.team),
    homeTeamName: home?.team?.shortDisplayName || home?.team?.displayName || "TBD",
    homeTeamLogo: pickTeamLogo(home?.team),
    shortStatus: statusType.shortDetail || statusType.detail || statusType.description || "Scheduled",
    state: statusType.state || "pre",
    tv: tvName,
    location: [city, venue.fullName].filter(Boolean).join(" • ")
  };
}

function mapAstrosEvent(event) {
  const comp = (event && event.competitions && event.competitions[0]) || {};
  const teams = Array.isArray(comp.competitors) ? comp.competitors : [];
  const astros =
    teams.find((t) => String(t?.team?.id || "") === ASTROS_TEAM_ID) ||
    teams.find((t) => String(t?.team?.abbreviation || "").toUpperCase() === "HOU") ||
    null;
  const opponent = teams.find((t) => t !== astros) || {};
  const homeAway = String(astros?.homeAway || "").toLowerCase();
  const astrosName = astros?.team?.shortDisplayName || astros?.team?.displayName || "Astros";
  const opponentName = opponent?.team?.shortDisplayName || opponent?.team?.displayName || "TBD";
  const astrosLogo = pickTeamLogo(astros?.team);
  const opponentLogo = pickTeamLogo(opponent?.team);
  const astrosScore = pickRunsForCompetitor(astros);
  const oppScore = pickRunsForCompetitor(opponent);
  const scoreLine =
    astrosScore !== null && oppScore !== null ? `${astrosName} ${astrosScore} - ${opponentName} ${oppScore}` : "";
  const statusType = (comp.status && comp.status.type) || {};
  return {
    id: String(event?.id || comp?.id || `${event?.name || "game"}-${event?.date || ""}`),
    date: event?.date || comp?.date || null,
    homeAway,
    astrosName,
    astrosLogo,
    astrosScore,
    opponentName,
    opponentLogo,
    opponentScore: oppScore,
    scoreLine,
    shortStatus: statusType.shortDetail || statusType.detail || statusType.description || "Scheduled",
    state: statusType.state || "pre"
  };
}

function flattenWbcPools(node, out = []) {
  if (!node || typeof node !== "object") return out;
  if (String(node.name || "").startsWith("Pool ") && node.standings && Array.isArray(node.standings.entries)) {
    out.push(node);
  }
  const children = Array.isArray(node.children) ? node.children : [];
  for (const child of children) flattenWbcPools(child, out);
  return out;
}

function pickStat(entry, type, fallbackType) {
  const stats = Array.isArray(entry?.stats) ? entry.stats : [];
  return stats.find((s) => s.type === type || (fallbackType && s.type === fallbackType));
}

function mapWbcStandings(payload) {
  const pools = flattenWbcPools(payload, []);
  return pools.map((pool) => {
    const rows = (pool.standings.entries || []).map((entry) => {
      const team = entry.team || {};
      const wins = pickStat(entry, "wins");
      const losses = pickStat(entry, "losses");
      const pct = pickStat(entry, "winpercent");
      const gb = pickStat(entry, "gamesbehind");
      const diff = pickStat(entry, "pointdifferential");
      return {
        team: team.shortDisplayName || team.displayName || team.abbreviation || "Team",
        teamLogo: pickTeamLogo(team),
        w: wins?.displayValue || "0",
        l: losses?.displayValue || "0",
        pct: pct?.displayValue || ".000",
        gb: gb?.displayValue || "-",
        diff: diff?.displayValue || "0"
      };
    });
    return { pool: pool.name || "Pool", rows };
  });
}

function tryParseJson(text) {
  try {
    return JSON.parse(text);
  } catch (err) {
    return null;
  }
}

function parseJinaJson(text) {
  const direct = tryParseJson(String(text || "").trim());
  if (direct) return direct;
  const marker = "Markdown Content:";
  const idx = String(text || "").indexOf(marker);
  if (idx < 0) return null;
  const body = String(text || "").slice(idx + marker.length).trim();
  return tryParseJson(body);
}

async function fetchJsonWithJinaFallback(url) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (err) {
    // fall through to proxy
  }
  const proxied = `${JINA_HTTP_PREFIX}${String(url).replace(/^https?:\/\//, "")}`;
  const proxyRes = await fetch(`${proxied}${url.includes("?") ? "&" : "?"}v=${Date.now()}`, { cache: "no-store" });
  if (!proxyRes.ok) throw new Error(`Proxy fetch failed (${proxyRes.status})`);
  const text = await proxyRes.text();
  const parsed = parseJinaJson(text);
  if (!parsed) throw new Error("Proxy JSON parse failed");
  return parsed;
}

function renderWbcPanel() {
  const panel = document.getElementById("wbcPanel");
  const section = document.getElementById("wbcCard");
  if (!panel || !section) return;

  if (!state.wbc.visible) {
    section.hidden = true;
    return;
  }
  section.hidden = false;

  if (state.wbc.status === "loading") {
    panel.innerHTML = `<div class="weather-loading">Loading WBC schedule...</div>`;
    return;
  }
  if (state.wbc.status === "error") {
    panel.innerHTML = `<div class="weather-loading">WBC data unavailable right now.</div>`;
    return;
  }

  const collapsedRows = state.wbc.todayGames
    .map(
      (g) => `<div class="wbc-game-row">
        <span class="wbc-matchup">
          ${renderTeamChip(g.awayTeamName, g.awayTeamLogo)}
          <span class="team-vs">vs</span>
          ${renderTeamChip(g.homeTeamName, g.homeTeamLogo)}
        </span>
        <span class="wbc-time">${formatCtTime(g.date)} CT</span>
        <span class="wbc-tv">${g.tv}</span>
        <span class="wbc-location">${g.location || "TBD"}</span>
      </div>`
    )
    .join("");

  const gamesByDate = new Map();
  state.wbc.allGames.forEach((game) => {
    const key = ctDateYmd(game.date);
    if (!key) return;
    if (!gamesByDate.has(key)) gamesByDate.set(key, []);
    gamesByDate.get(key).push(game);
  });

  const allRows = Array.from(gamesByDate.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(
      ([, games]) => `<div class="wbc-day-block">
        <div class="wbc-day-head">${formatCtDayLabel(games[0].date)}</div>
        <div class="wbc-day-games">
          ${games
            .map(
              (g) => `<div class="wbc-game-row">
                <span class="wbc-matchup">
                  ${renderTeamChip(g.awayTeamName, g.awayTeamLogo)}
                  <span class="team-vs">vs</span>
                  ${renderTeamChip(g.homeTeamName, g.homeTeamLogo)}
                </span>
                <span class="wbc-time">${formatCtTime(g.date)} CT</span>
                <span class="wbc-tv">${g.tv}</span>
                <span class="wbc-location">${g.location || "TBD"}</span>
              </div>`
            )
            .join("")}
        </div>
      </div>`
    )
    .join("");

  const standingsMarkup =
    Array.isArray(state.wbc.standings) && state.wbc.standings.length
      ? `<div class="wbc-subtitle">Standings (Pools)</div>
         <div class="wbc-standings-simple">
           ${state.wbc.standings
             .slice(0, 4)
             .map(
               (pool) => `<div class="wbc-pool-col">
                 <h4>${pool.pool}</h4>
                 <div class="wbc-pool-head"><span>Team</span><span>W</span><span>L</span></div>
                 ${(pool.rows || [])
                   .map(
                     (r) =>
                       `<div class="wbc-pool-row"><span>${renderTeamChip(r.team, r.teamLogo)}</span><span>${r.w}</span><span>${r.l}</span></div>`
                   )
                   .join("")}
               </div>`
             )
             .join("")}
         </div>`
      : `<div class="wbc-subtitle">Standings (Pools)</div><div class="weather-loading">Standings unavailable right now.</div>`;

  panel.innerHTML = `
    <div class="wbc-shell ${state.wbc.expanded ? "is-expanded" : "is-collapsed"}">
      <div class="wbc-top">
        <div class="wbc-title">World Baseball Classic</div>
        <div class="wbc-updated">Updated ${state.wbc.updatedAt || "now"}</div>
      </div>
      <div class="wbc-subtitle">Today's Matchups (CT)</div>
      <div class="wbc-games">${collapsedRows || `<div class="weather-loading">No games today.</div>`}</div>
      <div class="wbc-expand-hint">${state.wbc.expanded ? "Tap to collapse" : "Tap to expand full schedule"}</div>
      <div class="wbc-expanded">
        <div class="wbc-subtitle">Rest of Tournament Schedule</div>
        <div class="wbc-games wbc-games-all">${allRows || `<div class="weather-loading">No upcoming games.</div>`}</div>
      </div>
      ${standingsMarkup}
    </div>
  `;
}

function renderAstrosPanel() {
  const panel = document.getElementById("astrosPanel");
  const card = document.getElementById("astrosCard");
  if (!panel || !card) return;
  card.hidden = false;

  if (state.astros.status === "loading") {
    panel.innerHTML = `<div class="weather-loading">Loading Astros games...</div>`;
    return;
  }
  if (state.astros.status === "error") {
    panel.innerHTML = `<div class="weather-loading">Astros data unavailable right now.</div>`;
    return;
  }

  const prev = state.astros.previousGame;
  const next = state.astros.nextGame;
  const renderTeamWithScore = (name, logo, score) => {
    const scoreMarkup = score !== null && score !== undefined ? `<span class="team-score">${score}</span>` : "";
    return `${renderTeamChip(name, logo)}${scoreMarkup}`;
  };
  const renderAstrosMatchup = (g) => {
    if (!g) return "";
    const left =
      g.homeAway === "home"
        ? renderTeamWithScore(g.opponentName || "TBD", g.opponentLogo || "", g.opponentScore)
        : renderTeamWithScore(g.astrosName || "Astros", g.astrosLogo || "", g.astrosScore);
    const right =
      g.homeAway === "home"
        ? renderTeamWithScore(g.astrosName || "Astros", g.astrosLogo || "", g.astrosScore)
        : renderTeamWithScore(g.opponentName || "TBD", g.opponentLogo || "", g.opponentScore);
    const statusTag =
      g.state === "post"
        ? `<span class="game-status-pill">F</span>`
        : g.state === "in"
          ? `<span class="game-status-pill">${escapeHtml(g.shortStatus || "Live")}</span>`
          : "";
    return `${left}<span class="team-vs">vs</span>${right}${statusTag}`;
  };
  panel.innerHTML = `
    <div class="astros-shell">
      <div class="wbc-updated">Updated ${state.astros.updatedAt || "now"}</div>
      <div class="astros-grid">
        <div class="astros-block">
          <div class="astros-label">${prev && prev.state === "in" ? "Live Game" : "Previous Game"}</div>
          ${
            prev
              ? `<div class="astros-date">${formatCtDayLabel(prev.date)} • ${formatCtTime(prev.date)} CT</div>
                 <div class="astros-matchup">${renderAstrosMatchup(prev)}</div>`
              : `<div class="weather-loading">No completed game found.</div>`
          }
        </div>
        <div class="astros-block">
          <div class="astros-label">Next Game</div>
          ${
            next
              ? `<div class="astros-date">${formatCtDayLabel(next.date)} • ${formatCtTime(next.date)} CT</div>
                 <div class="astros-matchup">${renderAstrosMatchup(next)}</div>`
              : `<div class="weather-loading">No upcoming game found.</div>`
          }
        </div>
      </div>
    </div>
  `;
}

async function refreshWbcData() {
  state.wbc.visible = wbcIsVisibleNow();
  if (!state.wbc.visible) {
    renderWbcPanel();
    return;
  }

  state.wbc.status = "loading";
  renderWbcPanel();
  try {
    const boardPayload = await fetchJsonWithJinaFallback(`${WBC_SCOREBOARD_URL}?${Date.now()}`);

    const todayYmd = ctDateYmd();
    const todayEvents = Array.isArray(boardPayload.events) ? boardPayload.events : [];
    const todayGames = todayEvents.map(mapWbcEvent);

    const calendar = (((boardPayload || {}).leagues || [])[0] || {}).calendar || [];
    const dateKeys = Array.from(new Set(calendar.map((d) => toYmdCompact(d)).filter(Boolean)));
    const datePayloads = await Promise.all(
      dateKeys.map(async (dateKey) => {
        try {
          return await fetchJsonWithJinaFallback(`${WBC_SCOREBOARD_URL}?dates=${dateKey}&v=${Date.now()}`);
        } catch (err) {
          return null;
        }
      })
    );
    const allGames = datePayloads
      .flatMap((p) => (Array.isArray(p?.events) ? p.events : []))
      .map(mapWbcEvent)
      .filter((g) => Boolean(g.date) && Boolean(ctDateYmd(g.date)))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let standings = [];
    try {
      const standingsPayload = await fetchJsonWithJinaFallback(`${WBC_STANDINGS_URL}&v=${Date.now()}`);
      standings = mapWbcStandings(standingsPayload);
    } catch (err) {
      standings = [];
    }

    state.wbc = {
      ...state.wbc,
      visible: true,
      todayGames: todayGames.filter((g) => g.date && ctDateYmd(g.date) === todayYmd),
      allGames: allGames.filter((g) => ctDateYmd(g.date) > todayYmd),
      standings,
      updatedAt: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      status: "ready"
    };
  } catch (err) {
    state.wbc = { ...state.wbc, status: "error" };
  }
  renderWbcPanel();
}

async function refreshAstrosData() {
  state.astros.status = "loading";
  renderAstrosPanel();
  try {
    const payload = await fetchJsonWithJinaFallback(`${ASTROS_SCHEDULE_URL}?v=${Date.now()}`);
    const events = Array.isArray(payload?.events) ? payload.events : [];
    const games = events
      .map(mapAstrosEvent)
      .filter((g) => Boolean(g.date))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const now = Date.now();
    const liveGame = games.find((g) => g.state === "in") || null;
    const previousGame =
      liveGame ||
      [...games].reverse().find((g) => g.state === "post") ||
      [...games].reverse().find((g) => new Date(g.date).getTime() < now) ||
      null;
    const nextGame =
      games.find((g) => g.state === "pre" && new Date(g.date).getTime() >= now) ||
      games.find((g) => new Date(g.date).getTime() >= now) ||
      null;

    state.astros = {
      previousGame,
      nextGame,
      updatedAt: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      status: "ready"
    };
  } catch (err) {
    state.astros = {
      previousGame: null,
      nextGame: null,
      updatedAt: "",
      status: "error"
    };
  }
  renderAstrosPanel();
}

function nodeLabelById(map, id) {
  const hit = map.nodes.find((n) => n.node_id === id);
  return hit ? hit.label : id;
}

function applyFilters(map) {
  const search = state.filters.search.trim().toLowerCase();
  const lane = state.filters.lane;
  const nodeType = state.filters.nodeType;

  const nodes = map.nodes.filter((n) => {
    if (lane !== "all" && n.lane_id !== lane) return false;
    if (nodeType !== "all" && n.node_type !== nodeType) return false;
    if (!search) return true;
    const haystack = `${n.label} ${n.node_id} ${n.skill_path}`.toLowerCase();
    return haystack.includes(search);
  });

  const nodeIds = new Set(nodes.map((n) => n.node_id));
  const edges = map.edges.filter((e) => nodeIds.has(e.from) && nodeIds.has(e.to));
  const lanes = map.layout.lanes.filter((laneRow) => nodes.some((n) => n.lane_id === laneRow.lane_id));

  return {
    ...map,
    layout: { lanes },
    nodes,
    edges
  };
}

function renderGraph(map) {
  const root = document.getElementById("graphLanes");
  const edgeFlow = document.getElementById("edgeFlow");
  root.innerHTML = "";
  edgeFlow.innerHTML = "";

  for (const lane of map.layout.lanes) {
    const col = document.createElement("div");
    col.className = "lane";
    const title = document.createElement("h3");
    title.textContent = lane.label || lane.lane_id;
    col.appendChild(title);

    const laneNodes = map.nodes.filter((n) => n.lane_id === lane.lane_id);
    for (const n of laneNodes) {
      const card = document.createElement("div");
      card.className = "node";
      card.innerHTML = `<div class="label">${n.label}</div><div class="meta">${n.node_id} | ${n.node_type}</div>`;
      col.appendChild(card);
    }
    root.appendChild(col);
  }

  for (const e of map.edges) {
    const chip = document.createElement("span");
    chip.className = "edge-chip";
    chip.textContent = `${nodeLabelById(map, e.from)} -> ${nodeLabelById(map, e.to)} (${e.relation})`;
    edgeFlow.appendChild(chip);
  }
}

function renderRows(targetId, rows) {
  const root = document.getElementById(targetId);
  root.innerHTML = "";
  const container = document.createElement("div");
  container.className = "kv-list";
  for (const row of rows) {
    const el = document.createElement("div");
    el.className = "kv-row";
    el.innerHTML = `<span class="k">${row.k}</span><span class="v">${row.v}</span>`;
    container.appendChild(el);
  }
  root.appendChild(container);
}

function renderPanels(map) {
  renderRows(
    "skillsPanel",
    map.nodes.map((n) => ({ k: n.label, v: n.skill_path || "none" }))
  );

  renderRows(
    "promptsPanel",
    map.nodes.flatMap((n) =>
      (n.prompt_sources || []).length
        ? n.prompt_sources.map((p, i) => ({
            k: i === 0 ? n.label : `${n.label} (cont.)`,
            v: p
          }))
        : [{ k: n.label, v: "none" }]
    )
  );

  renderRows(
    "permissionsPanel",
    map.nodes.map((n) => ({
      k: n.label,
      v: `${n.permissions || "n/a"} (${n.node_type})`
    }))
  );

  renderRows(
    "costPanel",
    map.nodes.map((n) => ({
      k: n.label,
      v: `model=${n.model || "n/a"}, max_turns=${n.max_turns || "n/a"}`
    }))
  );

  const scopePath = map.validation.require_scope_policy_path || ".claude/scope.json";
  renderRows("scopePanel", [
    { k: "Scope policy path", v: scopePath },
    {
      k: "Validation flags",
      v: Object.entries(map.validation)
        .map(([k, v]) => `${k}=${v}`)
        .join(" | ")
    }
  ]);
}

function renderHealth(map, logs) {
  const panel = document.getElementById("healthPanel");
  const last = logs[logs.length - 1] || null;
  const qa = [...logs].reverse().find((r) => r.agent_id === "qa");
  const specialist = [...logs].reverse().find((r) => r.agent_id === "specialist_auditor");

  const mapCompleteness = map.nodes.every((n) => n.skill_path);
  const verdict = (last && last.verdict) || "unknown";
  const verdictClass = verdict === "pass" ? "ok" : "warn";

  panel.innerHTML = `
    <div class="health-grid">
      <div class="health-box">
        <div class="k">Latest Run</div>
        <div class="v">${last ? `${last.timestamp_utc} (${last.task_id})` : "No rows found"}</div>
      </div>
      <div class="health-box">
        <div class="k">Latest Verdict</div>
        <div class="v ${verdictClass}">${verdict}</div>
      </div>
      <div class="health-box">
        <div class="k">QA Gate</div>
        <div class="v">${qa ? `${qa.verdict} @ ${qa.timestamp_utc}` : "No QA gate row"}</div>
      </div>
      <div class="health-box">
        <div class="k">Specialist Gate</div>
        <div class="v">${specialist ? `${specialist.verdict} @ ${specialist.timestamp_utc}` : "No specialist row"}</div>
      </div>
      <div class="health-box">
        <div class="k">Map Integrity</div>
        <div class="v ${mapCompleteness ? "ok" : "warn"}">${mapCompleteness ? "skill paths present" : "missing skill path(s)"}</div>
      </div>
    </div>
  `;
}

function renderRtahPanel(filteredMap, logs, rtahData, tunnelStatus) {
  const panel = document.getElementById("rtahPanel");
  if (!panel) return;
  const dashboardLast = logs[logs.length - 1] || null;
  const profile = rtahData || {};
  const liveTunnel = tunnelStatus || {};
  const publishedPublicUrl = profile.public_url || "";
  const effectivePublicUrl = publishedPublicUrl || liveTunnel.url || "";
  const tunnelState = liveTunnel.status || (effectivePublicUrl ? "active" : "unknown");
  const latestRun = profile.latest_agent_run || {};
  const latestVerdict = latestRun.verdict || (dashboardLast && dashboardLast.verdict) || "unknown";
  const verdictClass = latestVerdict === "pass" ? "good" : "warn";
  const files = profile.files_snapshot || {};
  const highlights = Array.isArray(profile.highlights) ? profile.highlights : [];

  panel.innerHTML = `
    <div class="rtah-grid">
      <div class="rtah-box">
        <h3>Deployment</h3>
        <div class="kv-list">
          <div class="kv-row"><span class="k">App Name</span><span class="v">${profile.app_name || RTAH_APP_FALLBACK.appName}</span></div>
          <div class="kv-row"><span class="k">Host</span><span class="v">${profile.deployment_host || RTAH_APP_FALLBACK.deploymentHost}</span></div>
          <div class="kv-row"><span class="k">Primary User</span><span class="v">${profile.primary_user || RTAH_APP_FALLBACK.primaryUser}</span></div>
          <div class="kv-row"><span class="k">App Entry</span><span class="v">${profile.app_public_entry || "public/index.html"}</span></div>
          <div class="kv-row"><span class="k">Live Testing Link</span><span class="v">${profile.live_testing_url ? `<a href="${profile.live_testing_url}" target="_blank" rel="noopener noreferrer">${profile.live_testing_url}</a>` : "n/a"}</span></div>
          <div class="kv-row"><span class="k">Testing Public Link</span><span class="v">${profile.testing_public_url ? `<a href="${profile.testing_public_url}" target="_blank" rel="noopener noreferrer">${profile.testing_public_url}</a>` : "n/a"}</span></div>
          <div class="kv-row"><span class="k">Public Link</span><span class="v">${effectivePublicUrl ? `<a href="${effectivePublicUrl}" target="_blank" rel="noopener noreferrer">${effectivePublicUrl}</a>` : "n/a"}</span></div>
          <div class="kv-row"><span class="k">Tunnel Link</span><span class="v">${liveTunnel.url ? `<a href="${liveTunnel.url}" target="_blank" rel="noopener noreferrer">${liveTunnel.url}</a>` : "n/a"}</span></div>
          <div class="kv-row"><span class="k">Tunnel Status</span><span class="v">${tunnelState}</span></div>
          <div class="kv-row"><span class="k">Tunnel Updated</span><span class="v">${liveTunnel.updated_at || "n/a"}</span></div>
          <div class="kv-row"><span class="k">Snapshot Captured</span><span class="v">${profile.captured_at || RTAH_APP_FALLBACK.capturedAt}</span></div>
        </div>
      </div>
      <div class="rtah-box">
        <h3>Operational Snapshot</h3>
        <div class="kv-list">
          <div class="kv-row"><span class="k">Latest RTAH Run</span><span class="v">${latestRun.timestamp_utc ? `${latestRun.timestamp_utc} (${latestRun.task_id || "n/a"})` : "No run rows found"}</span></div>
          <div class="kv-row"><span class="k">Latest Verdict</span><span class="v"><span class="status-pill ${verdictClass}">${latestVerdict}</span></span></div>
          <div class="kv-row"><span class="k">English OP Docs</span><span class="v">${files.english_docs_total ?? "n/a"}</span></div>
          <div class="kv-row"><span class="k">PDF / DOCX</span><span class="v">${files.english_pdf_count ?? "n/a"} / ${files.english_docx_count ?? "n/a"}</span></div>
          <div class="kv-row"><span class="k">Icons / Public Files</span><span class="v">${files.icons_count ?? "n/a"} / ${files.public_files_count ?? "n/a"}</span></div>
        </div>
      </div>
      <div class="rtah-box">
        <h3>Highlights</h3>
        <div class="kv-list">
          ${highlights.length
            ? highlights.map((h) => `<div class="kv-row"><span class="k">Feature</span><span class="v">${h}</span></div>`).join("")
            : `<div class="kv-row"><span class="k">Feature</span><span class="v">No highlights found</span></div>`}
          <div class="kv-row"><span class="k">Source Project Path</span><span class="v">${profile.source_project_path || "n/a"}</span></div>
          <div class="kv-row"><span class="k">Dashboard Agent View</span><span class="v">${filteredMap.nodes.length} agents, ${filteredMap.edges.length} flows</span></div>
        </div>
      </div>
    </div>
  `;
}

function normalizeQuickAccessLinks(quickAccess, accessData, rtahData, tunnelStatus) {
  const access = { ...COMMAND_CENTER_ACCESS_FALLBACK, ...(accessData || {}) };
  const profile = rtahData || {};
  const tunnel = tunnelStatus || {};

  const merged = [...QUICK_ACCESS_FALLBACK.links];

  if (access.local_url) {
    merged.push({
      label: "Command Center Local",
      url: access.local_url,
      group: "Dashboard",
      note: "Local network"
    });
  }
  if (access.public_url) {
    merged.push({
      label: "Command Center Public",
      url: access.public_url,
      group: "Dashboard",
      note: "Anywhere access"
    });
  }
  if (access.testing_url) {
    merged.push({
      label: "Command Center Testing",
      url: access.testing_url,
      group: "Dashboard",
      note: "Latest staged deploy"
    });
  }

  if (profile.live_testing_url) {
    merged.push({
      label: "RTAH Live Testing",
      url: profile.live_testing_url,
      group: "RTAH",
      note: "Pi live test URL"
    });
  }
  if (profile.testing_public_url) {
    merged.push({
      label: "RTAH Testing Public",
      url: profile.testing_public_url,
      group: "RTAH",
      note: "External testing URL"
    });
  }
  if (profile.public_url) {
    merged.push({
      label: "RTAH Public",
      url: profile.public_url,
      group: "RTAH",
      note: "Stable public URL"
    });
  }
  if (tunnel.url) {
    merged.push({
      label: "RTAH Tunnel",
      url: tunnel.url,
      group: "RTAH",
      note: "Live tunnel endpoint"
    });
  }

  const customLinks = Array.isArray(quickAccess && quickAccess.links) ? quickAccess.links : [];
  for (const link of customLinks) {
    merged.push({
      label: link.label || "Quick Link",
      url: link.url || "",
      group: link.group || "Quick Access",
      note: link.note || ""
    });
  }

  const seen = new Set();
  const deduped = [];
  for (const link of merged) {
    const key = `${String(link.label || "").trim().toLowerCase()}|${String(link.url || "").trim()}`;
    if (!link.url || seen.has(key)) continue;
    seen.add(key);
    deduped.push(link);
  }
  return deduped;
}

function renderQuickAccessPanel(quickAccess, accessData, rtahData, tunnelStatus) {
  const panel = document.getElementById("quickAccessPanel");
  if (!panel) return;

  const links = normalizeQuickAccessLinks(quickAccess, accessData, rtahData, tunnelStatus);
  if (!links.length) {
    panel.innerHTML = `<div class="quick-empty">No quick links configured yet. Add entries in <code>data/quick-access.json</code>.</div>`;
    return;
  }

  panel.innerHTML = `
    <div class="quick-grid">
      ${links
        .map(
          (link) => `
            <div class="quick-link-card">
              <div class="quick-link-top">
                <div class="quick-link-group">${link.group || "Quick Access"}</div>
                <span class="status-pill good">Open</span>
              </div>
              <div class="quick-link-label">${link.label}</div>
              <div class="quick-link-note">${link.note || "One-tap access."}</div>
              <a class="quick-link-url" href="${link.url}" target="_blank" rel="noopener noreferrer">${link.url}</a>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function shortcutRunUrl(name) {
  return `shortcuts://x-callback-url/run-shortcut?name=${encodeURIComponent(String(name || ""))}`;
}

function isMobileClient() {
  const ua = navigator.userAgent || "";
  const isAppleTouchDesktop = /Macintosh/i.test(ua) && Number(navigator.maxTouchPoints || 0) > 1;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || isAppleTouchDesktop;
}

function isMacDesktopClient() {
  const ua = navigator.userAgent || "";
  return /Macintosh|Mac OS X/i.test(ua) && !isMobileClient();
}

function isSafariBrowser() {
  const ua = navigator.userAgent || "";
  return /Safari/i.test(ua) && !/Chrome|Chromium|Edg|OPR/i.test(ua);
}

async function openConventionFolder() {
  const hint = document.getElementById("jwConventionHint");
  if (isMobileClient()) {
    if (hint) hint.textContent = "Opening Drive folder...";
    // Universal link targets the specific folder and can hand off to the Drive app on iOS/iPadOS.
    window.location.href = JW_CONVENTION.driveUrl;
    return;
  }

  if (isMacDesktopClient()) {
    const runUrl = shortcutRunUrl(JW_CONVENTION.macShortcutName);
    if (hint) {
      hint.textContent = `Running shortcut "${JW_CONVENTION.macShortcutName}"...`;
    }
    try {
      await navigator.clipboard.writeText(JW_CONVENTION.macPath);
    } catch (err) {
      // best effort
    }
    let fallbackTimer = null;
    let setupTimer = null;
    const clearHelperTimer = () => {
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }
      if (setupTimer) {
        clearTimeout(setupTimer);
        setupTimer = null;
      }
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") clearHelperTimer();
    };
    const onPageHide = () => {
      clearHelperTimer();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);
    fallbackTimer = setTimeout(() => {
      if (document.visibilityState !== "visible") return;
      window.location.href = runUrl;
    }, 250);
    setupTimer = setTimeout(() => {
      clearHelperTimer();
      if (document.visibilityState !== "visible" || !hint) return;
      hint.textContent =
        `If nothing opened: verify Shortcut "${JW_CONVENTION.macShortcutName}" exists and opens ${JW_CONVENTION.macPath}. Path already copied (Shift+Cmd+G works now).`;
    }, 1400);
    if (isSafariBrowser() && hint) {
      hint.textContent = `Running shortcut "${JW_CONVENTION.macShortcutName}" (Safari-safe flow).`;
    }
    window.location.href = runUrl;
    return;
  }

  if (hint) {
    hint.textContent = "Opening Drive web.";
  }
  window.open(JW_CONVENTION.driveUrl, "_blank", "noopener,noreferrer");
}

async function copyConventionPath() {
  const hint = document.getElementById("jwConventionHint");
  try {
    await navigator.clipboard.writeText(JW_CONVENTION.macPath);
    if (hint) hint.textContent = "Mac path copied. In Finder press Shift+Cmd+G and paste.";
  } catch (err) {
    if (hint) hint.textContent = "Could not copy automatically. Copy this path manually from the section.";
  }
}

async function openContractsSupportFolder() {
  if (isMobileClient()) {
    window.location.href = CONTRACTS_SUPPORT.driveUrl;
    return;
  }

  if (isMacDesktopClient()) {
    const runUrl = shortcutRunUrl(CONTRACTS_SUPPORT.macShortcutName);
    try {
      await navigator.clipboard.writeText(CONTRACTS_SUPPORT.macPath);
    } catch (err) {
      // best effort
    }
    window.location.href = runUrl;
    return;
  }

  window.open(CONTRACTS_SUPPORT.driveUrl, "_blank", "noopener,noreferrer");
}

async function openContractsSeTexasFolder() {
  if (isMobileClient()) {
    window.location.href = CONTRACTS_SE_TEXAS.driveUrl;
    return;
  }

  if (isMacDesktopClient()) {
    const runUrl = shortcutRunUrl(CONTRACTS_SE_TEXAS.macShortcutName);
    try {
      await navigator.clipboard.writeText(CONTRACTS_SE_TEXAS.macPath);
    } catch (err) {
      // best effort
    }
    window.location.href = runUrl;
    return;
  }

  window.open(CONTRACTS_SE_TEXAS.driveUrl, "_blank", "noopener,noreferrer");
}

function renderJwPanel() {
  const panel = document.getElementById("jwPanel");
  if (!panel) return;

  panel.innerHTML = `
    <div class="jw-grid">
      <div class="jw-box jw-convention-card">
        <h3>2026 Convention</h3>
        <div class="jw-actions">
          <button id="openConventionFolderBtn" class="action-btn action-btn-lg" type="button">2026 Convention Google Drive</button>
          <button id="openConventionNotebookBtn" class="action-btn action-btn-lg" type="button">Convention Guideline and Operating Plan AI</button>
          <a class="action-btn secondary-btn action-link" href="./personnel-list.html">Personnel List</a>
        </div>
      </div>
      <div class="jw-box">
        <h3>Operating Plan</h3>
        <div class="jw-actions">
          <a class="action-btn action-btn-lg action-link" href="https://rtah-op-app.vercel.app/public/index.html" target="_blank" rel="noopener noreferrer">RTAH OP App</a>
        </div>
      </div>
      <div class="jw-box">
        <h3>Contracts Team</h3>
        <div class="jw-actions">
          <button id="openContractsSupportBtn" class="action-btn action-btn-lg" type="button">Contracts Support Team</button>
          <button id="openContractsSeTexasBtn" class="action-btn action-btn-lg" type="button">Contract Team - SE Texas</button>
        </div>
      </div>
    </div>
  `;
}

function renderCommandCenterAccessPanel(accessData) {
  const panel = document.getElementById("commandCenterAccessPanel");
  if (!panel) return;

  const access = {
    ...COMMAND_CENTER_ACCESS_FALLBACK,
    ...(accessData || {})
  };
  const publicLink = access.public_url || "";
  const testingLink = access.testing_url || "";

  panel.innerHTML = `
    <div class="rtah-grid">
      <div class="rtah-box">
        <h3>Access Links</h3>
        <div class="kv-list">
          <div class="kv-row"><span class="k">Local (Home Network)</span><span class="v"><a href="${access.local_url}" target="_blank" rel="noopener noreferrer">${access.local_url}</a></span></div>
          <div class="kv-row"><span class="k">Public Link (Anywhere)</span><span class="v">${publicLink ? `<a href="${publicLink}" target="_blank" rel="noopener noreferrer">${publicLink}</a>` : "Not set yet"}</span></div>
          <div class="kv-row"><span class="k">Testing Link</span><span class="v">${testingLink ? `<a href="${testingLink}" target="_blank" rel="noopener noreferrer">${testingLink}</a>` : "Not set yet"}</span></div>
          <div class="kv-row"><span class="k">Access Notes</span><span class="v">${access.notes || "n/a"}</span></div>
          <div class="kv-row"><span class="k">Last Published</span><span class="v">${access.last_published_utc || "n/a"}</span></div>
        </div>
      </div>
      <div class="rtah-box">
        <h3>Publish Workflow</h3>
        <div class="kv-list">
          <div class="kv-row"><span class="k">Step 1</span><span class="v">Test changes locally at ${access.local_url}</span></div>
          <div class="kv-row"><span class="k">Step 2</span><span class="v"><code>cd /Users/obed/Desktop/Coding/Raspberry-PI-Zero/deliverables/dashboard</code></span></div>
          <div class="kv-row"><span class="k">Step 3</span><span class="v"><code>npx vercel --prod --yes</code></span></div>
          <div class="kv-row"><span class="k">Step 4</span><span class="v">Write the new URL into <code>data/command-center-access.json</code> if it changed.</span></div>
        </div>
      </div>
    </div>
  `;
}

function setMetrics(rows) {
  const root = document.getElementById("widgetMetrics");
  root.innerHTML = rows
    .map((row) => `<div class="metric-row"><span class="k">${row.k}</span><span class="v">${row.v}</span></div>`)
    .join("");
}

function renderWidgetMetrics(rawMap, filteredMap, logs) {
  const passCount = logs.filter((r) => r.verdict === "pass").length;
  const passRate = logs.length ? `${Math.round((passCount / logs.length) * 100)}%` : "n/a";
  const last = logs[logs.length - 1];

  setMetrics([
    { k: "Visible nodes", v: `${filteredMap.nodes.length}/${rawMap.nodes.length}` },
    { k: "Visible edges", v: `${filteredMap.edges.length}/${rawMap.edges.length}` },
    { k: "Run rows", v: String(logs.length) },
    { k: "Pass rate", v: passRate },
    { k: "Last run", v: last ? last.timestamp_utc : "n/a" }
  ]);
}

function renderAll() {
  if (!state.rawMap) return;
  const filteredMap = applyFilters(state.rawMap);

  renderDailyTextHero();
  renderWbcPanel();
  renderAstrosPanel();
  renderJwPanel();
  renderQuickAccessPanel(state.quickAccess, state.commandCenterAccess, state.rtahData, state.tunnelStatus);
  renderRtahPanel(filteredMap, state.logs, state.rtahData, state.tunnelStatus);
  renderCommandCenterAccessPanel(state.commandCenterAccess);
  renderWeatherWidget();
  renderAllergyWidget();
}

function bindPullToRefresh() {
  if (state.pullRefreshBound) return;
  const indicator = document.getElementById("pullRefreshIndicator");
  const label = document.getElementById("pullRefreshLabel");
  if (!indicator || !label) return;

  let startY = 0;
  let distance = 0;
  let pulling = false;
  let refreshing = false;

  const applyIndicatorPosition = (offset) => {
    const clamped = Math.max(0, Math.min(140, offset));
    const y = -140 + clamped;
    indicator.style.transform = `translate(-50%, ${y}%)`;
  };

  const resetIndicator = () => {
    distance = 0;
    pulling = false;
    indicator.classList.remove("is-visible", "is-ready");
    applyIndicatorPosition(0);
    label.textContent = "Pull to refresh";
  };

  const triggerRefresh = async () => {
    refreshing = true;
    indicator.classList.add("is-visible", "is-ready", "is-refreshing");
    applyIndicatorPosition(140);
    label.textContent = "Refreshing...";
    try {
      await refreshData();
    } catch (err) {
      // Keep UI resilient if refresh fails.
    } finally {
      refreshing = false;
      setTimeout(() => {
        indicator.classList.remove("is-refreshing");
        resetIndicator();
      }, 220);
    }
  };

  document.addEventListener(
    "touchstart",
    (event) => {
      if (refreshing || window.scrollY > 0) return;
      if (!event.touches || event.touches.length !== 1) return;
      startY = event.touches[0].clientY;
      distance = 0;
      pulling = true;
    },
    { passive: true }
  );

  document.addEventListener(
    "touchmove",
    (event) => {
      if (!pulling || refreshing) return;
      const touchY = event.touches && event.touches[0] ? event.touches[0].clientY : startY;
      distance = Math.max(0, touchY - startY);
      if (distance <= 0) {
        resetIndicator();
        return;
      }
      if (window.scrollY > 0) {
        resetIndicator();
        return;
      }
      event.preventDefault();
      indicator.classList.add("is-visible");
      const ready = distance >= PULL_REFRESH_TRIGGER_PX;
      indicator.classList.toggle("is-ready", ready);
      label.textContent = ready ? "Release to refresh" : "Pull to refresh";
      applyIndicatorPosition(distance);
    },
    { passive: false }
  );

  document.addEventListener(
    "touchend",
    () => {
      if (!pulling || refreshing) return;
      const shouldRefresh = distance >= PULL_REFRESH_TRIGGER_PX;
      resetIndicator();
      if (shouldRefresh) {
        triggerRefresh();
      }
    },
    { passive: true }
  );

  state.pullRefreshBound = true;
}

function setSelectOptions(selectId, values, allLabel) {
  const el = document.getElementById(selectId);
  const selected = el.value || "all";
  el.innerHTML = `<option value="all">${allLabel}</option>${values
    .map((value) => `<option value="${value}">${value}</option>`)
    .join("")}`;
  el.value = values.includes(selected) || selected === "all" ? selected : "all";
}

function syncFilterControls() {
  const laneFilter = document.getElementById("laneFilter");
  const nodeTypeFilter = document.getElementById("nodeTypeFilter");
  const nodeSearch = document.getElementById("nodeSearch");
  const autoRefreshToggle = document.getElementById("autoRefreshToggle");
  const refreshInterval = document.getElementById("refreshInterval");
  if (!laneFilter || !nodeTypeFilter || !nodeSearch || !autoRefreshToggle || !refreshInterval) return;

  const lanes = [...new Set(state.rawMap.nodes.map((n) => n.lane_id))].sort();
  const nodeTypes = [...new Set(state.rawMap.nodes.map((n) => n.node_type))].sort();
  setSelectOptions("laneFilter", lanes, "All lanes");
  setSelectOptions("nodeTypeFilter", nodeTypes, "All types");

  document.getElementById("laneFilter").value = state.filters.lane;
  document.getElementById("nodeTypeFilter").value = state.filters.nodeType;
  document.getElementById("nodeSearch").value = state.filters.search;
  document.getElementById("autoRefreshToggle").checked = state.autoRefreshEnabled;
  document.getElementById("refreshInterval").value = String(state.autoRefreshMs);
}

function bindControls() {
  if (state.controlsBound) return;
  bindPullToRefresh();

  const laneFilter = document.getElementById("laneFilter");
  if (laneFilter) {
    laneFilter.addEventListener("change", (e) => {
      state.filters.lane = e.target.value;
      renderAll();
    });
  }
  const nodeTypeFilter = document.getElementById("nodeTypeFilter");
  if (nodeTypeFilter) {
    nodeTypeFilter.addEventListener("change", (e) => {
      state.filters.nodeType = e.target.value;
      renderAll();
    });
  }
  const nodeSearch = document.getElementById("nodeSearch");
  if (nodeSearch) {
    nodeSearch.addEventListener("input", (e) => {
      state.filters.search = e.target.value;
      renderAll();
    });
  }
  const refreshNowBtn = document.getElementById("refreshNowBtn");
  if (refreshNowBtn) {
    refreshNowBtn.addEventListener("click", () => {
      refreshData();
    });
  }
  const autoRefreshToggle = document.getElementById("autoRefreshToggle");
  if (autoRefreshToggle) {
    autoRefreshToggle.addEventListener("change", (e) => {
      state.autoRefreshEnabled = e.target.checked;
      updateAutoRefreshTimer();
    });
  }
  const refreshInterval = document.getElementById("refreshInterval");
  if (refreshInterval) {
    refreshInterval.addEventListener("change", (e) => {
      state.autoRefreshMs = Number(e.target.value);
      updateAutoRefreshTimer();
    });
  }

  const weatherRefreshBtn = document.getElementById("weatherRefreshBtn");
  if (weatherRefreshBtn) {
    weatherRefreshBtn.addEventListener("click", () => {
      refreshWeatherData(true);
    });
  }
  const allergyRefreshBtn = document.getElementById("allergyRefreshBtn");
  if (allergyRefreshBtn) {
    allergyRefreshBtn.addEventListener("click", () => {
      refreshAllergyData(true);
    });
  }
  const dailyTextLangToggle = document.getElementById("dailyTextLangToggle");
  if (dailyTextLangToggle instanceof HTMLInputElement) {
    dailyTextLangToggle.addEventListener("change", () => {
      state.dailyTextLang = dailyTextLangToggle.checked ? "es" : "en";
      localStorage.setItem(DAILY_TEXT_LANG_KEY, state.dailyTextLang);
      const cached = loadDailyTextCacheForLang(state.dailyTextLang);
      if (cached) {
        state.dailyText = {
          ...state.dailyText,
          ...cached,
          status: "ready"
        };
      }
      state.dailyTextFetchedAtByLang[state.dailyTextLang] = 0;
      renderDailyTextHero();
      refreshDailyText(true, state.dailyTextLang).catch(() => {});
    });
  }
  const dailyTextHero = document.getElementById("dailyTextHero");
  if (dailyTextHero) {
    dailyTextHero.addEventListener("click", (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("a, button, input, label")) return;
      state.dailyTextExpanded = !state.dailyTextExpanded;
      localStorage.setItem(DAILY_TEXT_EXPANDED_KEY, state.dailyTextExpanded ? "1" : "0");
      renderDailyTextHero();
    });
  }
  const weatherWidget = document.getElementById("weatherWidget");
  if (weatherWidget) {
    weatherWidget.addEventListener("click", (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("a, button, input, label")) return;
      state.weatherExpanded = !state.weatherExpanded;
      localStorage.setItem(WEATHER_EXPANDED_KEY, state.weatherExpanded ? "1" : "0");
      renderWeatherWidget();
    });
  }
  const allergyWidget = document.getElementById("allergyWidget");
  if (allergyWidget) {
    allergyWidget.addEventListener("click", (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("a, button, input, label")) return;
      state.allergyExpanded = !state.allergyExpanded;
      localStorage.setItem(ALLERGY_EXPANDED_KEY, state.allergyExpanded ? "1" : "0");
      renderAllergyWidget();
    });
  }
  const wbcPanel = document.getElementById("wbcPanel");
  if (wbcPanel) {
    wbcPanel.addEventListener("click", (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("a, button, input, label")) return;
      state.wbc.expanded = !state.wbc.expanded;
      renderWbcPanel();
    });
  }
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.id === "openConventionFolderBtn") {
      openConventionFolder();
    }
    if (target.id === "copyConventionPathBtn") {
      copyConventionPath();
    }
    if (target.id === "contractsChatSendBtn") {
      sendContractsChatMessage();
    }
    if (target.id === "contractsChatClearBtn") {
      clearContractsChatMessages();
    }
    if (target.id === "openNotebookPopupBtn") {
      openNotebookLmPopup();
    }
    if (target.id === "openConventionNotebookBtn") {
      openNotebookLmPopup();
    }
    if (target.id === "openContractsSupportBtn") {
      openContractsSupportFolder();
    }
    if (target.id === "openContractsSeTexasBtn") {
      openContractsSeTexasFolder();
    }
  });
  document.addEventListener("keydown", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.id === "contractsChatInput" && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendContractsChatMessage();
    }
  });

  state.controlsBound = true;
}

function updateAutoRefreshTimer() {
  if (state.autoRefreshTimer) {
    clearInterval(state.autoRefreshTimer);
    state.autoRefreshTimer = null;
  }
  if (!state.autoRefreshEnabled) return;

  state.autoRefreshTimer = setInterval(() => {
    refreshData();
  }, state.autoRefreshMs);
}

async function refreshData() {
  const savedLang = localStorage.getItem(DAILY_TEXT_LANG_KEY);
  state.dailyTextLang = savedLang === "es" ? "es" : "en";
  state.dailyTextExpanded = localStorage.getItem(DAILY_TEXT_EXPANDED_KEY) === "1";
  state.weatherExpanded = localStorage.getItem(WEATHER_EXPANDED_KEY) === "1";
  state.allergyExpanded = localStorage.getItem(ALLERGY_EXPANDED_KEY) === "1";
  const [mapText, logText, rtahData, tunnelStatus, commandCenterAccess, quickAccess] = await Promise.all([
    loadText(MAP_PATHS),
    loadText(LOG_PATHS),
    loadJson(RTAH_DATA_PATHS).catch(() => null),
    loadJson(TUNNEL_STATUS_PATHS).catch(() => null),
    loadJson(COMMAND_CENTER_ACCESS_PATHS).catch(() => null),
    loadJson(QUICK_ACCESS_PATHS).catch(() => null)
  ]);
  state.rawMap = parseMapYaml(mapText);
  state.logs = parseCsv(logText);
  state.rtahData = rtahData;
  state.tunnelStatus = tunnelStatus;
  state.commandCenterAccess = commandCenterAccess;
  state.quickAccess = quickAccess;
  refreshDailyText(true).catch(() => {});
  await refreshWbcData();
  await refreshAstrosData();
  await refreshWeatherData();
  await refreshAllergyData(true);

  bindControls();
  syncFilterControls();
  renderAll();
}

refreshData().catch((err) => {
  console.error("Dashboard failed to load data:", err);
  const body = document.getElementById("dailyTextBody");
  if (body) {
    body.textContent = `Dashboard failed to load data: ${err.message}`;
  }
});
