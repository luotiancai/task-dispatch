import { useState, useEffect } from 'react';

const inputStyle = { width: '100%', padding: '6px 10px', fontSize: '1rem', borderRadius: 6, border: '1px solid var(--border)', marginBottom: 14, boxSizing: 'border-box' };

export default function EditContribModal({ open, taskIdx, state, onClose, onSave }) {
  const [task, setTask] = useState('');
  const [value, setValue] = useState(1);

  useEffect(() => {
    if (open && taskIdx !== null && state) {
      const h = state.history[taskIdx];
      if (h) {
        setTask(h.task || '');
        setValue(h.contribution ?? 1);
      }
    }
  }, [open, taskIdx, state]);

  if (!open || taskIdx === null || !state) return null;
  const h = state.history[taskIdx];
  if (!h) return null;

  const handleSave = () => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    onSave(task.trim(), Math.round(num * 100) / 100);
  };

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h3>编辑任务</h3>
        <p style={{ marginBottom: 12, fontSize: '0.8rem', color: 'var(--muted)' }}>
          {h.name}
        </p>
        <input
          type="text"
          placeholder="任务名称"
          value={task}
          onChange={e => setTask(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          style={inputStyle}
          autoFocus
        />
        <input
          type="number"
          step="0.5"
          placeholder="贡献值"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          style={inputStyle}
        />
        <div className="modal-actions">
          <button className="modal-cancel" onClick={onClose}>取消</button>
          <button className="modal-save" onClick={handleSave}>保存</button>
        </div>
      </div>
    </div>
  );
}
