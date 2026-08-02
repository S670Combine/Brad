
const state = { query: "", category: "All" };

function band(score) {
  if (score >= 0.90) return "Excellent";
  if (score >= 0.75) return "High";
  if (score >= 0.50) return "Moderate";
  return "Low";
}

function render() {
  const q = state.query.trim().toLowerCase();
  const items = PROTEINS
    .filter(p => state.category === "All" || p.category === state.category)
    .filter(p => {
      const hay = [p.name, p.category, p.limiting, ...(p.aliases || [])].join(" ").toLowerCase();
      return hay.includes(q);
    })
    .sort((a, b) => b.score - a.score);

  const out = document.querySelector("#results");
  out.innerHTML = items.map(p => `
    <article class="card">
      <div class="card-head">
        <div>
          <h3 style="margin:0">${p.name}</h3>
          <div class="meta">
            <span class="tag">${p.category}</span>
            <span class="tag">${band(p.score)} quality band</span>
          </div>
        </div>
        <div class="score">${p.score.toFixed(2)}</div>
      </div>
      <p><strong>Representative value:</strong> ${p.range}</p>
      <p><strong>Limiting amino acid:</strong> ${p.limiting}</p>
      <p class="muted small">${p.evidence}</p>
      <a href="${p.source}" target="_blank" rel="noopener">Open source</a>
    </article>
  `).join("") || `<p class="muted">No matching protein source. Add a custom entry below.</p>`;

  const select = document.querySelector("#proteinSelect");
  const current = select.value;
  select.innerHTML = PROTEINS
    .slice().sort((a,b)=>b.score-a.score)
    .map(p => `<option value="${p.name}">${p.name} — ${p.score.toFixed(2)}</option>`)
    .join("");
  if ([...select.options].some(o => o.value === current)) select.value = current;
  calculate();
}

function calculate() {
  const grams = Number(document.querySelector("#grams").value || 0);
  const name = document.querySelector("#proteinSelect").value;
  const p = PROTEINS.find(x => x.name === name) || PROTEINS[0];
  const adjusted = grams * p.score;
  document.querySelector("#calcOutput").textContent =
    grams > 0
      ? `${grams.toFixed(1)} g × ${p.score.toFixed(2)} ≈ ${adjusted.toFixed(1)} g quality-adjusted protein`
      : "Enter the grams of protein shown on the nutrition label.";
}

document.addEventListener("DOMContentLoaded", () => {
  const categories = ["All", ...new Set(PROTEINS.map(p => p.category))];
  document.querySelector("#category").innerHTML = categories.map(c => `<option>${c}</option>`).join("");

  document.querySelector("#search").addEventListener("input", e => {
    state.query = e.target.value;
    render();
  });
  document.querySelector("#category").addEventListener("change", e => {
    state.category = e.target.value;
    render();
  });
  document.querySelector("#grams").addEventListener("input", calculate);
  document.querySelector("#proteinSelect").addEventListener("change", calculate);

  render();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js"));
}
