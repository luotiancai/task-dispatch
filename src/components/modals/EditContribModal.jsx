import { useState, useEffect } from 'react';

export default function EditContribModal({ open, taskIdx, state, onClose, onSave }) {
  const [value, setValue] = useState(1);

  useEffect(() => {
    if (open && taskIdx !== null && state) {
      const h = state.history[taskIdx];
      if (h) setValue(h.contribution ?? 1);
    }
  }, [open, taskIdx, state]);

  if (!open || taskIdx === null || !state) return null;
  const h = state.history[taskIdx];
  if (!h) return null;

  const handleSave = () => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) return;
    onSave(Math.round(num * 100) / 100);
  };

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h3>修改贡献值</h3>
        <p style={{ marginBottom: 12, fontSize: '0.8rem', color: 'var(--muted)' }}>
          {h.name} · {h.task || '任务'}
        </p>
        <input
          type="number"
          min="0"
          step="0.5"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          style={{ width: '100%', padding: '6px 10px', fontSize: '1rem', borderRadius: 6, border: '1px solid var(--border)', marginBottom: 14, boxSizing: 'border-box' }}
          autoFocus
        />
        <div className="modal-actions">
          <button className="modal-cancel" onClick={onClose}>取消</button>
          <button className="modal-save" onClick={handleSave}>保存</button>
        </div>
      </div>
    </div>
  );
}
