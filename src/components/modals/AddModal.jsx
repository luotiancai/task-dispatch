import { useState, useEffect, useRef } from 'react';

export default function AddModal({ open, target, onClose, onSave }) {
  const [name, setName] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setName('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSave = () => {
    const val = name.trim();
    if (!val) return;
    onSave(val);
    setName('');
  };

  if (!open || !target) return null;

  const typeLabel = target.type === 'fe' ? '前端' : '后端';

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h3>添加{typeLabel}成员</h3>
        <p>新成员将加入{typeLabel}组队列末尾</p>
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
          <button className="modal-save" onClick={handleSave}>添加</button>
        </div>
      </div>
    </div>
  );
}
