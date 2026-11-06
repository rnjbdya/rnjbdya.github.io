(function () {
  "use strict";

  const data = window.SITE_DATA || { sources: [], experiments: [] };
  const colors = ["#0a7976", "#df6548", "#537fa3", "#d9a53b", "#7d6aa5", "#62bdb1", "#a65b71"];
  const statusLabels = { complete: "Complete", running: "Running", ready: "Framework ready" };
  let activeTabIndex = 0;

  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function statusPill(status) {
    return `<span class="status-pill ${escapeHTML(status)}">${escapeHTML(statusLabels[status] || status)}</span>`;
  }

  function metricMarkup(metrics) {
    if (!metrics?.length) return "";
    return `<div class="metric-grid">${metrics.map(metric => `
      <div class="metric">
        <span class="metric-label">${escapeHTML(metric.label)}</span>
        <strong class="metric-value">${escapeHTML(metric.value)}</strong>
        <span class="metric-detail">${escapeHTML(metric.detail)}</span>
      </div>`).join("")}</div>`;
  }

  function tableMarkup(table) {
    if (!table?.columns?.length) return "";
    return `
      <div class="details-wrap">
        <button class="details-toggle" type="button" aria-expanded="false">View the underlying values</button>
        <div class="details-table table-wrap" hidden>
          <table>
            <thead><tr>${table.columns.map(column => `<th>${escapeHTML(column)}</th>`).join("")}</tr></thead>
            <tbody>${table.rows.map(row => `<tr>${row.map(cell => `<td>${escapeHTML(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
          </table>
        </div>
      </div>`;
  }

  function architectureMarkup(architecture) {
    if (!architecture?.streams?.length) return "";
    return `
      <section class="research-visual" aria-labelledby="architecture-title">
        <div class="visual-intro">
          <span class="visual-number">01</span>
          <div><p class="visual-kicker">The mechanism</p><h4 id="architecture-title">${escapeHTML(architecture.title)}</h4><p>${escapeHTML(architecture.summary)}</p></div>
        </div>
        <div class="architecture-flow">
          <div class="architecture-node input-node"><small>Input</small><strong>${escapeHTML(architecture.input)}</strong></div>
          <div class="split-connector" aria-hidden="true"><span></span><span></span></div>
          <div class="stream-grid">
            ${architecture.streams.map(stream => `<div class="architecture-node stream-node ${escapeHTML(stream.tone)}"><small>${escapeHTML(stream.symbol)}</small><strong>${escapeHTML(stream.title)}</strong><span>${escapeHTML(stream.detail)}</span></div>`).join("")}
          </div>
          <div class="merge-connector" aria-hidden="true"><span></span></div>
          <div class="architecture-node fusion-node"><small>${escapeHTML(architecture.fusion.symbol)}</small><strong>${escapeHTML(architecture.fusion.title)}</strong><span>${escapeHTML(architecture.fusion.detail)}</span></div>
          <div class="down-arrow" aria-hidden="true">↓</div>
          <div class="architecture-node output-node"><small>Grounding score</small><strong>${escapeHTML(architecture.output)}</strong></div>
        </div>
        <div class="equation-strip"><code>${escapeHTML(architecture.equation)}</code><span>${escapeHTML(architecture.equation_note)}</span></div>
      </section>`;
  }

  function journeyMarkup(journey) {
    if (!journey?.steps?.length) return "";
    return `
      <section class="research-visual" aria-labelledby="journey-title">
        <div class="visual-intro">
          <span class="visual-number">02</span>
          <div><p class="visual-kicker">Why each experiment existed</p><h4 id="journey-title">${escapeHTML(journey.title)}</h4><p>${escapeHTML(journey.summary)}</p></div>
        </div>
        <div class="journey-grid">${journey.steps.map((step, index) => `
          <article class="journey-step ${escapeHTML(step.tone || "")}">
            <span>${String(index + 1).padStart(2, "0")}</span>
            <h5>${escapeHTML(step.title)}</h5>
            <p>${escapeHTML(step.detail)}</p>
            <strong>${escapeHTML(step.result)}</strong>
          </article>`).join("")}</div>
      </section>`;
  }

  function claimsMarkup(claims) {
    if (!claims?.length) return "";
    return `
      <section class="research-visual" aria-labelledby="claims-title">
        <div class="visual-intro">
          <span class="visual-number">04</span>
          <div><p class="visual-kicker">Scientific conclusion</p><h4 id="claims-title">What the evidence does—and does not—support</h4></div>
        </div>
        <div class="claims-grid">${claims.map(claim => `<article class="claim ${escapeHTML(claim.status)}"><span>${escapeHTML(claim.status)}</span><h5>${escapeHTML(claim.title)}</h5><p>${escapeHTML(claim.detail)}</p></article>`).join("")}</div>
      </section>`;
  }

  function renderExperiments() {
    const host = document.querySelector("#experiment-list");
    host.innerHTML = data.experiments.map((experiment, index) => `
      <article class="experiment" id="${escapeHTML(experiment.id)}" data-status="${escapeHTML(experiment.status)}" role="tabpanel" aria-labelledby="tab-${escapeHTML(experiment.id)}" ${index === 0 ? "" : "hidden"}>
        <div class="experiment-header">
          <div>
            <div class="eyebrow-row">
              <span class="eyebrow">${escapeHTML(experiment.eyebrow)}</span>
              ${statusPill(experiment.status)}
            </div>
            <h3>${escapeHTML(experiment.title)}</h3>
          </div>
          <span class="source-tag">${String(index + 1).padStart(2, "0")} / ${escapeHTML(experiment.source_id)}</span>
        </div>
        <div class="experiment-story">
          <div class="story-block"><h4>Question</h4><p>${escapeHTML(experiment.question)}</p></div>
          <div class="story-block"><h4>Intuition</h4><p>${escapeHTML(experiment.intuition)}</p></div>
          <div class="story-block"><h4>What was done</h4><p>${escapeHTML(experiment.method)}</p></div>
          <div class="story-block takeaway"><h4>What we learned</h4><p>${escapeHTML(experiment.takeaway)}</p></div>
          <div class="story-block caveat"><h4>Interpret with care</h4><p>${escapeHTML(experiment.caveat)}</p></div>
          <div class="story-block"><h4>Snapshot</h4><p>${escapeHTML(experiment.snapshot_date)} · sanitized bundle ${escapeHTML(experiment.source_id)}</p></div>
        </div>
        ${metricMarkup(experiment.metrics)}
        ${architectureMarkup(experiment.architecture)}
        ${journeyMarkup(experiment.journey)}
        <div class="visual-panel">
          <div class="visual-topline">
            ${experiment.architecture ? `<span class="visual-number">03</span>` : ""}
            <h4>${escapeHTML(experiment.chart?.title || "Result view")}</h4>
            <span class="chart-hint">Hover or focus for exact values</span>
          </div>
          <div class="chart" data-chart-for="${escapeHTML(experiment.id)}"></div>
        </div>
        ${claimsMarkup(experiment.claims)}
        ${experiment.notes?.length ? `<ul class="notes-list">${experiment.notes.map(note => `<li>${escapeHTML(note)}</li>`).join("")}</ul>` : ""}
        ${tableMarkup(experiment.table)}
      </article>`).join("");

    data.experiments.forEach(experiment => renderChart(experiment));
  }

  function renderResultTabs() {
    const tablist = document.querySelector("#result-tabs");
    tablist.innerHTML = data.experiments.map((experiment, index) => `
      <button
        class="result-tab"
        id="tab-${escapeHTML(experiment.id)}"
        type="button"
        role="tab"
        aria-selected="${index === 0}"
        aria-controls="${escapeHTML(experiment.id)}"
        tabindex="${index === 0 ? "0" : "-1"}"
        data-tab-index="${index}"
      ><span class="tab-dot ${escapeHTML(experiment.status)}" aria-hidden="true"></span>${escapeHTML(experiment.tab_label || experiment.title)}</button>`).join("");

    const tabs = [...tablist.querySelectorAll(".result-tab")];
    const panels = [...document.querySelectorAll(".experiment")];
    const summary = document.querySelector("#tab-summary");

    const activate = (index, options = {}) => {
      const normalized = (index + tabs.length) % tabs.length;
      activeTabIndex = normalized;
      tabs.forEach((tab, tabIndex) => {
        const selected = tabIndex === normalized;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });
      panels.forEach((panel, panelIndex) => { panel.hidden = panelIndex !== normalized; });

      const experiment = data.experiments[normalized];
      summary.textContent = `${normalized + 1} of ${tabs.length} · ${statusLabels[experiment.status] || experiment.status} · snapshot ${experiment.snapshot_date}`;
      tabs[normalized].scrollIntoView({ behavior: options.instant ? "auto" : "smooth", block: "nearest", inline: "center" });

      if (options.focus) tabs[normalized].focus();
      if (options.updateHash && location.hash !== `#${experiment.id}`) {
        history.pushState({ resultTab: experiment.id }, "", `#${experiment.id}`);
      }
    };

    const activateFromHash = (instant = false) => {
      const id = decodeURIComponent(location.hash.slice(1));
      const index = data.experiments.findIndex(experiment => experiment.id === id);
      if (index >= 0) activate(index, { instant });
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(index, { updateHash: true }));
    });

    tablist.addEventListener("keydown", event => {
      const destinations = {
        ArrowRight: activeTabIndex + 1,
        ArrowLeft: activeTabIndex - 1,
        Home: 0,
        End: tabs.length - 1
      };
      if (!(event.key in destinations)) return;
      event.preventDefault();
      activate(destinations[event.key], { focus: true, updateHash: true });
    });

    document.querySelectorAll("[data-tab-step]").forEach(button => {
      button.addEventListener("click", () => activate(activeTabIndex + Number(button.dataset.tabStep), { updateHash: true }));
    });

    window.addEventListener("popstate", () => activateFromHash(true));
    window.addEventListener("hashchange", () => activateFromHash(true));

    document.querySelector("#ledger-body").addEventListener("click", event => {
      const link = event.target.closest("a[href^='#']");
      if (!link) return;
      const id = decodeURIComponent(link.getAttribute("href").slice(1));
      const index = data.experiments.findIndex(experiment => experiment.id === id);
      if (index < 0) return;
      event.preventDefault();
      activate(index, { updateHash: true });
      document.querySelector("#results").scrollIntoView({ behavior: "smooth", block: "start" });
    });

    activateFromHash(true);
    if (!location.hash || !data.experiments.some(experiment => `#${experiment.id}` === location.hash)) {
      activate(0, { instant: true });
    }
  }

  function renderChart(experiment) {
    const host = document.querySelector(`[data-chart-for="${CSS.escape(experiment.id)}"]`);
    const chart = experiment.chart;
    if (!host || !chart) return;
    if (chart.type === "protocol-bars") renderProtocolBars(host, chart);
    else if (chart.type === "depth-lines" || chart.type === "trajectory-lines") renderLineChart(host, chart);
    else if (chart.type === "head-bars") renderHeadBars(host, chart);
    else if (chart.type === "progress") renderProgress(host, chart);
    else if (chart.type === "matrix") renderMatrix(host, chart);
    else if (chart.type === "paired-bars") renderPairedBars(host, chart);
  }

  function renderPairedBars(host, chart) {
    const width = 820;
    const height = 360;
    const margin = { top: 34, right: 34, bottom: 86, left: 62 };
    const max = chart.max || 100;
    const yAt = value => margin.top + (max - value) * (height - margin.top - margin.bottom) / max;
    const groupWidth = (width - margin.left - margin.right) / chart.groups.length;
    const barWidth = Math.min(72, groupWidth * 0.28);
    const ticks = [0, 20, 40, 60, 80, 100].filter(value => value <= max);
    const grid = ticks.map(value => `<line class="grid-line" x1="${margin.left}" y1="${yAt(value)}" x2="${width - margin.right}" y2="${yAt(value)}"/><text x="${margin.left - 10}" y="${yAt(value) + 4}" text-anchor="end">${value}%</text>`).join("");
    const bars = chart.groups.map((group, index) => {
      const center = margin.left + groupWidth * (index + 0.5);
      const learnedX = center - barWidth - 4;
      const uniformX = center + 4;
      const learnedY = yAt(group.learned);
      const uniformY = yAt(group.uniform);
      return `<g tabindex="0"><title>${escapeHTML(group.label)} · learned ${group.learned.toFixed(2)}%, uniform ${group.uniform.toFixed(2)}%</title>
        <rect x="${learnedX}" y="${learnedY}" width="${barWidth}" height="${height - margin.bottom - learnedY}" rx="6" fill="${colors[0]}"/>
        <rect x="${uniformX}" y="${uniformY}" width="${barWidth}" height="${height - margin.bottom - uniformY}" rx="6" fill="${colors[3]}"/>
        <text x="${learnedX + barWidth / 2}" y="${learnedY - 8}" text-anchor="middle" font-weight="700">${group.learned.toFixed(1)}</text>
        <text x="${uniformX + barWidth / 2}" y="${uniformY - 8}" text-anchor="middle" font-weight="700">${group.uniform.toFixed(1)}</text>
        <text x="${center}" y="${height - 55}" text-anchor="middle">${escapeHTML(group.label)}</text>
      </g>`;
    }).join("");
    host.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHTML(chart.title)}">${grid}${bars}<text x="${margin.left}" y="18" font-weight="700">Accuracy ↑</text></svg><div class="legend"><span><i style="background:${colors[0]}"></i>Learned attention</span><span><i style="background:${colors[3]}"></i>Uniform pooling</span></div><p class="chart-conclusion">${escapeHTML(chart.conclusion)}</p>`;
  }

  function renderProtocolBars(host, chart) {
    const tabs = [
      ["none", "Canonical"],
      ["z", "Z rotation"],
      ["so3", "SO(3) rotation"]
    ];
    host.innerHTML = `<div class="protocol-tabs">${tabs.map(([key, label], index) => `<button class="protocol-tab ${index === 2 ? "active" : ""}" type="button" data-protocol="${key}">${label}</button>`).join("")}</div><div class="protocol-chart"></div>`;

    const draw = protocol => {
      const target = host.querySelector(".protocol-chart");
      const width = 820;
      const left = 180;
      const right = 55;
      const top = 18;
      const row = 34;
      const height = top + chart.series.length * row + 48;
      const min = 75;
      const max = 95;
      const scale = value => left + ((value - min) / (max - min)) * (width - left - right);
      const ticks = [75, 80, 85, 90, 95];
      const grid = ticks.map(tick => `<line class="grid-line" x1="${scale(tick)}" y1="${top}" x2="${scale(tick)}" y2="${height - 30}"/><text x="${scale(tick)}" y="${height - 10}" text-anchor="middle">${tick}%</text>`).join("");
      const bars = chart.series.map((series, index) => {
        const value = series[protocol];
        if (value == null) return "";
        const y = top + index * row + 5;
        const barWidth = Math.max(0, scale(value) - scale(min));
        return `<g tabindex="0"><title>${escapeHTML(series.name)}: ${value.toFixed(2)}%</title><text x="${left - 10}" y="${y + 15}" text-anchor="end">${escapeHTML(series.name)}</text><rect x="${scale(min)}" y="${y}" width="${barWidth}" height="20" rx="5" fill="${colors[index % colors.length]}"/><text x="${scale(value) + 7}" y="${y + 15}" font-weight="700">${value.toFixed(2)}</text></g>`;
      }).join("");
      target.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Overall accuracy bars for ${protocol}">${grid}${bars}</svg>`;
    };

    host.querySelectorAll(".protocol-tab").forEach(button => {
      button.addEventListener("click", () => {
        host.querySelectorAll(".protocol-tab").forEach(item => item.classList.remove("active"));
        button.classList.add("active");
        draw(button.dataset.protocol);
      });
    });
    draw("so3");
  }

  function renderLineChart(host, chart) {
    const width = 820;
    const height = 320;
    const margin = { top: 22, right: 30, bottom: 52, left: 62 };
    const values = chart.series.flatMap(series => series.values);
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    let yMin = Math.max(0, Math.floor((rawMin - 0.04) * 10) / 10);
    let yMax = Math.min(1, Math.ceil((rawMax + 0.02) * 10) / 10);
    if (chart.type === "trajectory-lines") {
      yMin = 0.2;
      yMax = 0.7;
    }
    const xAt = index => margin.left + index * (width - margin.left - margin.right) / Math.max(1, chart.x.length - 1);
    const yAt = value => margin.top + (yMax - value) * (height - margin.top - margin.bottom) / (yMax - yMin);
    const yTicks = Array.from({ length: 6 }, (_, i) => yMin + i * (yMax - yMin) / 5);
    const grid = yTicks.map(value => `<line class="grid-line" x1="${margin.left}" y1="${yAt(value)}" x2="${width - margin.right}" y2="${yAt(value)}"/><text x="${margin.left - 10}" y="${yAt(value) + 4}" text-anchor="end">${value.toFixed(2)}</text>`).join("");
    const xLabels = chart.x.map((value, index) => `<text x="${xAt(index)}" y="${height - 25}" text-anchor="middle">${escapeHTML(value)}</text>`).join("");
    const series = chart.series.map((item, seriesIndex) => {
      const points = item.values.map((value, index) => `${xAt(index)},${yAt(value)}`).join(" ");
      const dots = item.values.map((value, index) => `<circle cx="${xAt(index)}" cy="${yAt(value)}" r="4" fill="${colors[seriesIndex]}"><title>${escapeHTML(item.name)} · ${chart.x[index]}: ${value.toFixed(4)}</title></circle>`).join("");
      return `<g tabindex="0"><title>${escapeHTML(item.name)}</title><polyline points="${points}" fill="none" stroke="${colors[seriesIndex]}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>${dots}</g>`;
    }).join("");
    const legend = `<div class="legend">${chart.series.map((item, index) => `<span><i style="background:${colors[index]}"></i>${escapeHTML(item.name)}</span>`).join("")}</div>`;
    host.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHTML(chart.title)}"><line class="axis-line" x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}"/>${grid}${xLabels}${series}<text x="${(margin.left + width - margin.right) / 2}" y="${height - 2}" text-anchor="middle">${escapeHTML(chart.x_label)}</text></svg>${legend}`;
  }

  function renderHeadBars(host, chart) {
    const width = 820;
    const height = 300;
    const margin = { top: 24, right: 20, bottom: 80, left: 55 };
    const groupWidth = (width - margin.left - margin.right) / chart.series.length;
    const yAt = value => margin.top + (1 - value) * (height - margin.top - margin.bottom);
    const grid = [0, 0.25, 0.5, 0.75, 1].map(value => `<line class="grid-line" x1="${margin.left}" y1="${yAt(value)}" x2="${width - margin.right}" y2="${yAt(value)}"/><text x="${margin.left - 8}" y="${yAt(value) + 4}" text-anchor="end">${value.toFixed(2)}</text>`).join("");
    const bars = chart.series.map((item, index) => {
      const x = margin.left + index * groupWidth + groupWidth * 0.18;
      const w = groupWidth * 0.26;
      const cosineHeight = height - margin.bottom - yAt(item.cosine);
      const orbitHeight = height - margin.bottom - yAt(item.orbit_variance);
      return `<g tabindex="0"><title>${escapeHTML(item.name)} · cosine ${item.cosine.toFixed(4)}, orbit variance ${item.orbit_variance.toFixed(4)}</title><rect x="${x}" y="${yAt(item.cosine)}" width="${w}" height="${cosineHeight}" rx="4" fill="${colors[0]}"/><rect x="${x + w + 5}" y="${yAt(item.orbit_variance)}" width="${w}" height="${orbitHeight}" rx="4" fill="${colors[1]}"/><text x="${x + w}" y="${height - 55}" text-anchor="middle"><tspan x="${x + w}" dy="0">${escapeHTML(item.name.split(" · ")[0])}</tspan><tspan x="${x + w}" dy="14">${escapeHTML(item.name.split(" · ")[1])}</tspan></text></g>`;
    }).join("");
    host.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Projected-head rotation response">${grid}${bars}</svg><div class="legend"><span><i style="background:${colors[0]}"></i>Cosine to canonical</span><span><i style="background:${colors[1]}"></i>Orbit variance fraction</span></div>`;
  }

  function renderProgress(host, chart) {
    host.innerHTML = `<div class="progress-list">${chart.series.map((item, index) => {
      const percentage = Math.min(100, item.value / item.total * 100);
      return `<div class="progress-row"><div class="progress-name"><strong>${escapeHTML(item.name)}</strong><small>${escapeHTML(item.detail)}</small></div><div class="progress-track"><div class="progress-fill" style="width:${percentage}%;background:linear-gradient(90deg, ${colors[index]}, ${colors[(index + 1) % colors.length]})"></div></div><div class="progress-value">${item.value} / ${item.total}</div></div>`;
    }).join("")}</div>`;
  }

  function renderMatrix(host, chart) {
    const headers = `<div class="matrix-cell header"></div>${chart.protocols.map(protocol => `<div class="matrix-cell header">${escapeHTML(protocol)}</div>`).join("")}`;
    const rows = chart.methods.map(method => {
      const excluded = chart.segmentation_excludes.includes(method);
      return `<div class="matrix-cell method">${escapeHTML(method)}</div>${chart.protocols.map(() => `<div class="matrix-cell ${excluded ? "excluded" : ""}" title="${excluded ? "Classification only; excluded from segmentation" : "Configured for classification and segmentation where supported"}">${excluded ? "classification only" : "3 seeds configured"}</div>`).join("")}`;
    }).join("");
    host.innerHTML = `<div class="matrix-chart">${headers}${rows}</div><div class="legend"><span><i style="background:rgba(98,189,177,0.25)"></i>Configured cell</span><span><i style="background:rgba(21,43,45,0.09)"></i>Task-specific exclusion</span></div>`;
  }

  function renderHeadlineMetrics() {
    const items = [
      ["78.13 vs 78.91%", "Structured: learned attention vs uniform pooling"],
      ["62.50 vs 65.63%", "Text-driven: learned attention vs uniform pooling"],
      ["100%", "Joint-rotation and common-translation consistency"],
      ["No gain", "Learned attention did not beat uniform pooling"]
    ];
    document.querySelector("#headline-metrics").innerHTML = items.map(([value, label]) => `<div class="headline-stat"><strong>${escapeHTML(value)}</strong><span>${escapeHTML(label)}</span></div>`).join("");
  }

  function renderLedger() {
    document.querySelector("#ledger-body").innerHTML = data.experiments.map(experiment => `
      <tr>
        <td><a href="#${escapeHTML(experiment.id)}">${escapeHTML(experiment.title)}</a></td>
        <td>${statusPill(experiment.status)}</td>
        <td>${escapeHTML(experiment.metrics?.[0]?.value || "See result card")} · ${escapeHTML(experiment.metrics?.[0]?.label || "")}</td>
        <td>${escapeHTML(experiment.snapshot_date)}</td>
      </tr>`).join("");
  }

  function attachInteractions() {
    document.querySelectorAll(".details-toggle").forEach(button => {
      button.addEventListener("click", () => {
        const expanded = button.getAttribute("aria-expanded") === "true";
        button.setAttribute("aria-expanded", String(!expanded));
        button.nextElementSibling.hidden = expanded;
      });
    });
  }

  function drawPointCloud() {
    const canvas = document.querySelector("#point-cloud");
    if (!canvas) return;
    const context = canvas.getContext("2d");
    const points = [];
    const addPlane = (origin, u, v, nu, nv) => {
      for (let i = 0; i < nu; i += 1) {
        for (let j = 0; j < nv; j += 1) {
          const jitter = ((i * 17 + j * 31) % 11 - 5) * 0.0025;
          points.push([
            origin[0] + u[0] * i / (nu - 1) + v[0] * j / (nv - 1) + jitter,
            origin[1] + u[1] * i / (nu - 1) + v[1] * j / (nv - 1),
            origin[2] + u[2] * i / (nu - 1) + v[2] * j / (nv - 1)
          ]);
        }
      }
    };
    addPlane([-0.8, -0.1, -0.65], [1.6, 0, 0], [0, 0, 1.3], 14, 11);
    addPlane([-0.8, -0.1, 0.62], [1.6, 0, 0], [0, 1.35, 0], 14, 12);
    [[-0.68, -0.15, -0.5], [0.68, -0.15, -0.5], [-0.68, -0.15, 0.48], [0.68, -0.15, 0.48]].forEach(([x, y, z]) => {
      for (let i = 0; i < 13; i += 1) points.push([x, y - i * 0.09, z]);
    });

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const render = time => {
      const targetWidth = Math.max(1, Math.round(canvas.clientWidth * window.devicePixelRatio));
      const targetHeight = Math.max(1, Math.round(canvas.clientHeight * window.devicePixelRatio));
      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }
      context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      const cx = canvas.clientWidth / 2;
      const cy = canvas.clientHeight / 2;
      const radius = Math.min(canvas.clientWidth, canvas.clientHeight) * 0.34;
      const angle = reducedMotion ? 0.65 : time * 0.00017;
      const tilt = -0.32;

      context.save();
      context.translate(cx, cy);
      context.strokeStyle = "rgba(10,121,118,0.18)";
      context.lineWidth = 1;
      [0.72, 1, 1.25].forEach((factor, index) => {
        context.beginPath();
        context.ellipse(0, 0, radius * factor, radius * (0.24 + index * 0.08), index * 0.62, 0, Math.PI * 2);
        context.stroke();
      });
      context.restore();

      const projected = points.map(point => {
        const x1 = point[0] * Math.cos(angle) + point[2] * Math.sin(angle);
        const z1 = -point[0] * Math.sin(angle) + point[2] * Math.cos(angle);
        const y1 = point[1] * Math.cos(tilt) - z1 * Math.sin(tilt);
        const z2 = point[1] * Math.sin(tilt) + z1 * Math.cos(tilt);
        const perspective = 1 / (3.8 - z2 * 0.35);
        return { x: cx + x1 * radius * perspective * 2.25, y: cy - y1 * radius * perspective * 2.25, z: z2, size: 1.7 + (z2 + 1.5) * 0.65 };
      }).sort((a, b) => a.z - b.z);

      projected.forEach((point, index) => {
        const mix = index / projected.length;
        context.beginPath();
        context.arc(point.x, point.y, Math.max(1.2, point.size), 0, Math.PI * 2);
        context.fillStyle = mix > 0.66 ? "rgba(223,101,72,0.82)" : mix > 0.3 ? "rgba(10,121,118,0.78)" : "rgba(83,127,163,0.68)";
        context.fill();
      });
      if (!reducedMotion) requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  function init() {
    if (data.sources.length) {
      const latest = [...data.sources].sort((a, b) => b.snapshot_date.localeCompare(a.snapshot_date))[0];
      document.querySelector("#snapshot-date").textContent = latest.snapshot_date;
    }
    renderHeadlineMetrics();
    renderExperiments();
    renderLedger();
    renderResultTabs();
    attachInteractions();
    drawPointCloud();
  }

  init();
})();
