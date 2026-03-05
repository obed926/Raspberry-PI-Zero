const MAP_PATHS = [
  "../../registry/command-center-map.yaml",
  "./data/command-center-map.yaml"
];
const LOG_PATHS = [
  "../../knowledge/agent-logs/agent-runs.csv",
  "./data/agent-runs.csv"
];

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

function nodeLabelById(map, id) {
  const hit = map.nodes.find((n) => n.node_id === id);
  return hit ? hit.label : id;
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

    const nodes = map.nodes.filter((n) => n.lane_id === lane.lane_id);
    for (const n of nodes) {
      const card = document.createElement("div");
      card.className = "node";
      card.innerHTML = `<div class="label">${n.label}</div><div class="meta">${n.node_id} • ${n.node_type}</div>`;
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

async function run() {
  const [mapText, logText] = await Promise.all([loadText(MAP_PATHS), loadText(LOG_PATHS)]);
  const map = parseMapYaml(mapText);
  const logs = parseCsv(logText);

  document.getElementById("updatedOn").textContent = `updated_on: ${map.updated_on || "n/a"}`;
  document.getElementById("nodeCount").textContent = `nodes: ${map.nodes.length}`;
  document.getElementById("edgeCount").textContent = `edges: ${map.edges.length}`;

  renderGraph(map);
  renderPanels(map);
  renderHealth(map, logs);
}

run().catch((err) => {
  const panel = document.getElementById("healthPanel");
  panel.innerHTML = `<div class="health-box"><div class="warn">Dashboard failed to load data: ${err.message}</div></div>`;
});
