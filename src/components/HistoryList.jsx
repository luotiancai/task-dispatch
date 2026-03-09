export default function HistoryList({
  state,
  isAdmin,
  removingIdx,
  onDeleteTask,
  onOpenReassignModal,
}) {
  const history = state?.history || [];

  if (history.length === 0) {
    return <p className="no-history">暂无记录</p>;
  }

  const items = [...history].reverse().slice(0, 30).map((h, i) => {
    const realIdx = history.length - 1 - i;
    return { h, realIdx };
  });

  return (
    <>
      {items.map(({ h, realIdx }) => (
        <div
          key={realIdx}
          id={`h-${realIdx}`}
          className={`history-item ${h.type}${removingIdx === realIdx ? ' removing' : ''}`}
        >
          <span className="h-idx">{realIdx + 1}</span>
          <span className={`h-badge ${h.type}`}>{h.type.toUpperCase()}</span>
          <span className="h-who">{h.name}</span>
          <span className="h-task">{h.task || '—'}</span>
          {h.direct && (
            <span style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '0.55rem',
              padding: '1px 5px',
              borderRadius: '2px',
              background: '#6c5ce7',
              color: 'white',
              fontWeight: 700,
            }}>
              指定
            </span>
          )}
          {isAdmin && (
            <button
              className="h-reassign"
              onClick={() => onOpenReassignModal(realIdx)}
              title="重新分配"
            >
              ↻
            </button>
          )}
          {isAdmin && (
            <button
              className="h-del"
              onClick={() => onDeleteTask(realIdx)}
              title="删除"
            >
              ✕
            </button>
          )}
        </div>
      ))}
    </>
  );
}
