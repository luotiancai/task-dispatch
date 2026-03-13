const MEDALS = ['🥇', '🥈', '🥉'];

export default function StatsBar({ state }) {
  const allMembers = [
    ...(state?.members?.fe || []),
    ...(state?.members?.be || []),
  ];

  if (allMembers.length === 0) return null;

  const histMap = {};
  (state?.history || []).forEach(h => {
    const key = `${h.type}:${h.name}`;
    histMap[key] = (histMap[key] || 0) + (h.contribution ?? 1);
  });

  const sorted = [...allMembers]
    .map(m => ({ ...m, total: Math.round((histMap[`${m.type}:${m.name}`] || 0) * 100) / 100 }))
    .sort((a, b) => b.total - a.total);
  const max = sorted[0]?.total ?? 0;

  return (
    <div className="leaderboard">
      <div className="leaderboard-title">贡献排名</div>
      <div className="leaderboard-list">
        {sorted.map((m, i) => {
          const c = m.total;
          const pct = max > 0 ? (c / max) * 100 : 0;
          return (
            <div key={m.id} className="lb-row">
              <span className="lb-rank">{i < 3 ? MEDALS[i] : i + 1}</span>
              <span className={`lb-badge ${m.type}`}>{m.type.toUpperCase()}</span>
              <span className="lb-name">{m.name}</span>
              <div className="lb-bar-wrap">
                <div className="lb-bar-fill" style={{ width: `${pct}%`, background: m.type === 'fe' ? 'var(--fe-color)' : 'var(--be-color)' }} />
              </div>
              <span className="lb-score">{c}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
