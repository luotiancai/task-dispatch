export default function StatsBar({ state }) {
  const history = state?.history || [];
  const fe = history.filter(h => h.type === 'fe').length;
  const be = history.filter(h => h.type === 'be').length;
  const total = fe + be;

  let fairnessPct = '—';
  let fairnessWidth = '0%';

  if (total > 0) {
    const countMap = {};
    history.forEach(h => {
      const key = `${h.type}:${h.name}`;
      countMap[key] = (countMap[key] || 0) + 1;
    });
    const allMembers = [...(state.members.fe || []), ...(state.members.be || [])];
    const counts = allMembers.map(m => countMap[`${m.type}:${m.name}`] || 0);
    const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
    const variance = counts.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / counts.length;
    const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;
    const fairness = Math.max(0, Math.min(100, Math.round((1 - cv) * 100)));
    fairnessPct = `${fairness}%`;
    fairnessWidth = `${fairness}%`;
  }

  return (
    <div className="stats-bar">
      <div className="stat-item fe">
        <span className="stat-num">{fe}</span>
        <span className="stat-lbl">前端任务</span>
      </div>
      <div className="stat-item be">
        <span className="stat-num">{be}</span>
        <span className="stat-lbl">后端任务</span>
      </div>
      <div className="stat-item">
        <span className="stat-num" style={{ color: 'var(--ink)' }}>{total}</span>
        <span className="stat-lbl">总计</span>
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
