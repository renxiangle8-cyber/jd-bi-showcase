// SVG renderers reused from jdbi-showcase; dynamic labels and missing/zero handling added.
(()=>{
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;", "'":"&#39;"})[c]);
const wan=v=>`${(v/10000).toFixed(1)} 万`;const pct=v=>`${(v*100).toFixed(1)}%`;
function waterfall(b) {
  const W = 660, H = 300, L = 58, R = 12, T = 28, B = 38, iw = W - L - R, ih = H - T - B;
  const y = (v) => T + ih - ((v - b.min) / (Math.max(1, b.max - b.min))) * ih;
  const slot = iw / b.rows.length, bw = slot * 0.58;
  let run = 0;
  let s = `<svg class="ch" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(b.title)}">`;
  b.ticks.forEach((t) => { s += `<line class="g" x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}"/><text class="axn" x="${L - 8}" y="${y(t) + 4}" text-anchor="end">${Number((t / 10000).toFixed(1))} 万</text>`; });
  if(b.min !== 0) s += `<path class="brk" d="M${L - 7} ${T + ih - 2}l7-6M${L - 7} ${T + ih + 4}l7-6"/>`;
  b.rows.forEach((r, k) => {
    const cx = L + slot * k + slot / 2;
    let lo, hi, kind, label, level;
    if (r.total) { lo = b.min; hi = r.v; run = r.v; kind = "total"; label = wan(r.v); level = r.v; }
    else { const a = run; run += r.v; lo = Math.min(a, run); hi = Math.max(a, run); kind = r.v >= 0 ? "up" : "down"; label = Math.abs(r.v) >= 10000 ? `${r.v >= 0 ? "+" : "−"}${(Math.abs(r.v) / 10000).toFixed(1)} 万` : `${r.v >= 0 ? "+" : "−"}${Math.abs(r.v).toLocaleString("zh-CN")}`; level = run; }
    const top = y(hi), bot = y(lo), h = Math.max(2, bot - top);
    const origin = kind === "down" ? top : bot;
    s += `<rect class="bar b-${kind}" style="--i:${k};transform-origin:${cx}px ${origin}px" x="${(cx - bw / 2).toFixed(1)}" y="${top.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="3"/>`;
    if (k < b.rows.length - 1) s += `<line class="conn" x1="${(cx + bw / 2).toFixed(1)}" x2="${(cx + slot - bw / 2).toFixed(1)}" y1="${y(level).toFixed(1)}" y2="${y(level).toFixed(1)}"/>`;
    s += `<text class="lbl l-${kind}" style="--i:${k}" x="${cx}" y="${(top - 8).toFixed(1)}" text-anchor="middle">${label}</text>`;
    s += `<text class="ax" x="${cx}" y="${H - 13}" text-anchor="middle">${esc(r.x)}</text>`;
  });
  return `${s}</svg>`;
}
function hbars(b) {
  const W = 660, L = 112, R = 70, T = 34, rowH = 40, B = 30, H = T + b.rows.length * rowH + B, iw = W - L - R;
  const x = (v) => L + (v / Math.max(1, b.max)) * iw;
  let s = `<svg class="ch" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(b.title)}">`;
  s += `<rect x="${L}" y="9" width="12" height="8" rx="2" class="b-a"/><text class="lg" x="${L + 18}" y="17">${esc(b.previousLabel || "对比期")}</text><rect x="${L + 150}" y="9" width="12" height="8" rx="2" class="b-b"/><text class="lg" x="${L + 168}" y="17">${esc(b.currentLabel || "本期")}</text>`;
  b.ticks.forEach((t) => { s += `<line class="g" x1="${x(t)}" x2="${x(t)}" y1="${T - 4}" y2="${H - B + 2}"/><text class="axn" x="${x(t)}" y="${H - 10}" text-anchor="middle">${t === 0 ? "0" : `${Number((t / 10000).toFixed(1))} 万`}</text>`; });
  b.rows.forEach((r, k) => {
    const y0 = T + k * rowH;
    s += `<text class="nm" x="${L - 10}" y="${y0 + 21}" text-anchor="end">${esc(r.x)}</text>`;
    if (Number.isFinite(r.a) && r.a >= 0) s += `<rect class="hb b-a" style="--i:${k};transform-origin:${L}px ${y0 + 9}px" x="${L}" y="${y0 + 6}" width="${(x(r.a) - L).toFixed(1)}" height="9" rx="2"/>`;
    if (Number.isFinite(r.b) && r.b >= 0) s += `<rect class="hb b-b" style="--i:${k};transform-origin:${L}px ${y0 + 23}px" x="${L}" y="${y0 + 17}" width="${(x(r.b) - L).toFixed(1)}" height="13" rx="3"/>`;
    s += `<text class="pv" style="--i:${k}" x="${(x(Number.isFinite(r.b) ? Math.max(0, r.b) : 0) + 8).toFixed(1)}" y="${y0 + 28}">${Number.isFinite(r.b) ? "¥" + r.b.toLocaleString("zh-CN", {maximumFractionDigits:2}) : "未提供"}</text>`;
  });
  return `${s}</svg>`;
}
function progress(b) {
  const W = 660, L = 74, R = 64, T = 26, rowH = 42, B = 16, H = T + b.rows.length * rowH + B, iw = W - L - R;
  const x = (v) => L + v * iw;
  let s = `<svg class="ch" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(b.title)}">`;
  s += `<text class="mkt" x="${x(b.time)}" y="14" text-anchor="middle">时间进度 ${pct(b.time)}</text>`;
  b.rows.forEach((r, k) => {
    const y0 = T + k * rowH;
    const cls = r.v < b.time - 0.03 ? "f-lag" : r.v > b.time + 0.06 ? "f-ahead" : "f-ok";
    s += `<text class="nm" x="${L - 12}" y="${y0 + 20}" text-anchor="end">${esc(r.x)}</text>`;
    s += `<rect class="trk" x="${L}" y="${y0 + 9}" width="${iw}" height="14" rx="7"/>`;
    s += `<rect class="hb ${cls}" style="--i:${k};transform-origin:${L}px ${y0 + 16}px" x="${L}" y="${y0 + 9}" width="${(r.v * iw).toFixed(1)}" height="14" rx="7"/>`;
    s += `<text class="pv" style="--i:${k}" x="${W - R + 10}" y="${y0 + 21}">${pct(r.v)}</text>`;
  });
  s += `<line class="mk" x1="${x(b.time)}" x2="${x(b.time)}" y1="${T}" y2="${H - B + 2}"/>`;
  return `${s}</svg>`;
}
/* 走势线：一条线、一块面积、两段均值、一条事件线 */
function trendline(b) {
  const W = 660, H = 250, L = 46, R = 16, T = 30, B = 32, iw = W - L - R, ih = H - T - B;
  const n = b.values.length;
  const x = (i) => L + (n === 1 ? .5 : i / Math.max(1, n - 1)) * iw;
  const y = (v) => T + ih - ((v - (b.min || 0)) / Math.max(1, b.max - (b.min || 0))) * ih;
  let s = `<svg class="ch" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(b.title)}">`;
  b.ticks.forEach((t) => { s += `<line class="g" x1="${L}" x2="${W - R}" y1="${y(t).toFixed(1)}" y2="${y(t).toFixed(1)}"/><text class="axn" x="${L - 8}" y="${(y(t) + 4).toFixed(1)}" text-anchor="end">${Math.abs(t)>=10000?wan(t):Number(t.toFixed(2)).toLocaleString('zh-CN')}</text>`; });
  b.xlabels.forEach(([i, t]) => { s += `<text class="ax" x="${x(i).toFixed(1)}" y="${H - 10}" text-anchor="middle">${esc(t)}</text>`; });
  // Preserve gaps: a missing day must not turn into zero or connect across the gap.
  let segment = [];
  const flush = () => { if(segment.length) s += `<polyline class="ln" points="${segment.join(" ")}"/>`; segment=[]; };
  b.values.forEach((v,i)=>{if(!Number.isFinite(v)){flush();return;} const px=x(i).toFixed(1),py=y(v).toFixed(1);segment.push(`${px},${py}`);s+=`<circle class="end" cx="${px}" cy="${py}" r="3"><title>${esc(b.dates?.[i] || String(i+1))}：¥${v.toLocaleString("zh-CN",{maximumFractionDigits:2})}</title></circle>`;});
  flush();
  return `${s}</svg>`;
}

window.BICharts={waterfall,hbars,progress,trendline};
})();
