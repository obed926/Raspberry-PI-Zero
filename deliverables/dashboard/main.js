const MAP_PATHS = ["../../registry/command-center-map.yaml", "./data/command-center-map.yaml"];
const LOG_PATHS = ["../../knowledge/agent-logs/agent-runs.csv", "./data/agent-runs.csv"];
const RTAH_DATA_PATHS = ["./data/rtah-op-app.json"];
const TUNNEL_STATUS_PATHS = ["/rtah-op-live/data/tunnel-status.json", "./data/tunnel-status.json"];
const COMMAND_CENTER_ACCESS_PATHS = ["./data/command-center-access.json"];
const WEATHER_FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const ALLERGY_DATA_PATHS = ["./data/houston-allergy.json"];
const WEATHER_REFRESH_WINDOW_MS = 10 * 60 * 1000;
const HOUSTON_WEATHER = {
  place: "Houston, TX",
  latitude: 29.7604,
  longitude: -95.3698
};

const state = {
  rawMap: null,
  logs: [],
  rtahData: null,
  tunnelStatus: null,
  commandCenterAccess: null,
  filters: {
    lane: "all",
    nodeType: "all",
    search: ""
  },
  autoRefreshEnabled: false,
  autoRefreshMs: 30000,
  autoRefreshTimer: null,
  controlsBound: false,
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
  allergyFetchedAt: 0
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
    <div class="weather-shell">
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

function renderAllergyWidget() {
  const root = document.getElementById("allergyWidget");
  if (!root) return;

  const allergy = state.allergy;
  if (allergy.status !== "ready") {
    root.innerHTML = `<div class="weather-loading">${allergy.overallCategory || "Loading allergy forecast..."}</div>`;
    return;
  }

  root.innerHTML = `
    <div class="weather-shell allergy-shell">
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
      <div class="weather-section-title">Houston Allergy Breakdown</div>
      <div class="allergy-list">
        ${allergy.items
          .map(
            (item) => `
              <div class="allergy-row">
                <div class="allergy-name">${item.name}</div>
                <div class="allergy-bar-track">
                  <span class="allergy-bar-fill" style="width:${Math.max(0, Math.min(100, (Number(item.value || 0) / 5) * 100))}%"></span>
                </div>
                <div class="allergy-value">${item.value}/5</div>
                <div class="allergy-cat ${allergyClass(item.category)}">${item.category}</div>
              </div>
            `
          )
          .join("")}
      </div>
      <div class="allergy-footnote">
        Source date: ${allergy.sourceDate || "n/a"} |
        <a href="${allergy.sourceUrl}" target="_blank" rel="noopener noreferrer">AccuWeather Houston Health</a>
      </div>
    </div>
  `;
}

async function refreshAllergyData(force = false) {
  state.allergy.status = "loading";
  state.allergy.overallCategory = "Loading allergy forecast...";
  renderAllergyWidget();

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
  } catch (err) {
    state.allergy = {
      ...state.allergy,
      overallCategory: `Allergy unavailable: ${err.message}`,
      status: "error"
    };
  }

  renderAllergyWidget();
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

  document.getElementById("updatedOn").textContent = `updated_on: ${state.rawMap.updated_on || "n/a"}`;
  document.getElementById("nodeCount").textContent = `nodes: ${filteredMap.nodes.length}/${state.rawMap.nodes.length}`;
  document.getElementById("edgeCount").textContent = `edges: ${filteredMap.edges.length}/${state.rawMap.edges.length}`;

  renderGraph(filteredMap);
  renderRtahPanel(filteredMap, state.logs, state.rtahData, state.tunnelStatus);
  renderCommandCenterAccessPanel(state.commandCenterAccess);
  renderPanels(filteredMap);
  renderHealth(filteredMap, state.logs);
  renderWidgetMetrics(state.rawMap, filteredMap, state.logs);
  renderWeatherWidget();
  renderAllergyWidget();
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

  document.getElementById("laneFilter").addEventListener("change", (e) => {
    state.filters.lane = e.target.value;
    renderAll();
  });

  document.getElementById("nodeTypeFilter").addEventListener("change", (e) => {
    state.filters.nodeType = e.target.value;
    renderAll();
  });

  document.getElementById("nodeSearch").addEventListener("input", (e) => {
    state.filters.search = e.target.value;
    renderAll();
  });

  document.getElementById("refreshNowBtn").addEventListener("click", () => {
    refreshData();
  });

  document.getElementById("autoRefreshToggle").addEventListener("change", (e) => {
    state.autoRefreshEnabled = e.target.checked;
    updateAutoRefreshTimer();
  });

  document.getElementById("refreshInterval").addEventListener("change", (e) => {
    state.autoRefreshMs = Number(e.target.value);
    updateAutoRefreshTimer();
  });

  document.getElementById("weatherRefreshBtn").addEventListener("click", () => {
    refreshWeatherData(true);
  });
  document.getElementById("allergyRefreshBtn").addEventListener("click", () => {
    refreshAllergyData(true);
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
  const [mapText, logText, rtahData, tunnelStatus, commandCenterAccess] = await Promise.all([
    loadText(MAP_PATHS),
    loadText(LOG_PATHS),
    loadJson(RTAH_DATA_PATHS).catch(() => null),
    loadJson(TUNNEL_STATUS_PATHS).catch(() => null),
    loadJson(COMMAND_CENTER_ACCESS_PATHS).catch(() => null)
  ]);
  state.rawMap = parseMapYaml(mapText);
  state.logs = parseCsv(logText);
  state.rtahData = rtahData;
  state.tunnelStatus = tunnelStatus;
  state.commandCenterAccess = commandCenterAccess;
  await refreshWeatherData();
  await refreshAllergyData(true);

  bindControls();
  syncFilterControls();
  renderAll();
}

refreshData().catch((err) => {
  const panel = document.getElementById("healthPanel");
  panel.innerHTML = `<div class="health-box"><div class="warn">Dashboard failed to load data: ${err.message}</div></div>`;
});
