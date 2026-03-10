export default function StatsBar({ state }) {
  const history = state?.history || [];
  const fe = Math.round(history.filter(h => h.type === 'fe').reduce((s, h) => s + (h.contribution || 1), 0) * 100) / 100;
  const be = Math.round(history.filter(h => h.type === 'be').reduce((s, h) => s + (h.contribution || 1), 0) * 100) / 100;
  const total = Math.round((fe + be) * 100) / 100;

  let fairnessPct = '—';
  let fairnessWidth = '0%';

  if (total > 0) {
    const contribMap = {};
    history.forEach(h => {
      const key = `${h.type}:${h.name}`;
      contribMap[key] = (contribMap[key] || 0) + (h.contribution || 1);
    });
    const allMembers = [...(state.members.fe || []), ...(state.members.be || [])];
    const contribs = allMembers.map(m => contribMap[`${m.type}:${m.name}`] || 0);
    const mean = contribs.reduce((a, b) => a + b, 0) / contribs.length;
    const variance = contribs.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / contribs.length;
    const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;
    const fairness = Math.max(0, Math.min(100, Math.round((1 - cv) * 100)));
    fairnessPct = `${fairness}%`;
    fairnessWidth = `${fairness}%`;
  }

  return (
    <div className="stats-bar">
      <div className="stat-item fe">
        <span className="stat-num">{fe}</span>
        <span className="stat-lbl">前端贡献</span>
      </div>
      <div className="stat-item be">
        <span className="stat-num">{be}</span>
        <span className="stat-lbl">后端贡献</span>
      </div>
      <div className="stat-item">
        <span className="stat-num" style={{ color: 'var(--ink)' }}>{total}</span>
        <span className="stat-lbl">总贡献</span>
      </div>
      <div className="fairness-wrap">
        <div className="fairness-lbl">
          <span>均衡度</span>
          <span>{fairnessPct}</span>
        </div>
        <div className="fairness-bg">
          <div className="fairness-fill" style={{ width: fairnessWidth }} />
        </div>
      </div>
    </div>
  );
}
