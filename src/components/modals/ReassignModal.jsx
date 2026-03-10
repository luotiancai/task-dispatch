export default function ReassignModal({ open, taskIdx, state, onClose, onReassign }) {
  if (!open || taskIdx === null || !state) return null;

  const h = state.history[taskIdx];
  if (!h) return null;

  const allMembers = [...state.members.fe, ...state.members.be].filter(m => m.name !== h.name);

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h3>重新分配任务</h3>
        <p style={{ marginBottom: 12 }}>
          将「{h.task || '任务'}」从 {h.name} 重新分配给：
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14, maxHeight: 240, overflowY: 'auto' }}>
          {allMembers.map(m => (
            <button
              key={m.id}
              className="modal-save"
              style={{ width: '100%', marginBottom: 4, fontSize: '0.8rem' }}
              onClick={() => onReassign(m.id, m.type)}
            >
              {m.name} ({m.type.toUpperCase()}) · {m.contribution ?? 0} 贡献
            </button>
          ))}
        </div>
        <div className="modal-actions">
          <button className="modal-cancel" onClick={onClose}>取消</button>
        </div>
      </div>
    </div>
  );
}
