import { useState, useEffect, useRef } from 'react';

export default function NameModal({ open, target, state, onClose, onSave }) {
  const [name, setName] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && target && state) {
      const current = state.members[target.type]?.[target.idx]?.name || '';
      setName(current);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, target, state]);

  const handleSave = () => {
    const val = name.trim();
    if (!val) return;
    onSave(val);
  };

  if (!open) return null;

  const typeLabel = target?.type?.toUpperCase() || '';

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h3>编辑 {typeLabel} 成员姓名</h3>
        <p>修改后所有人实时看到更新</p>
        <input
          ref={inputRef}
          type="text"
          className="modal-input"
          placeholder="输入姓名"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onClose(); }}
        />
        <div className="modal-actions">
          <button className="modal-cancel" onClick={onClose}>取消</button>
          <button className="modal-save" onClick={handleSave}>保存</button>
        </div>
      </div>
    </div>
  );
}
