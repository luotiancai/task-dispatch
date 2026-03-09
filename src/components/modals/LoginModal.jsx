import { useState, useEffect, useRef } from 'react';

export default function LoginModal({ open, onClose, onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setPassword('');
      setError('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const ok = await onLogin(password);
      if (!ok) {
        setError('密码错误');
        inputRef.current?.classList.add('error');
      }
    } catch (e) {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
    if (e.key === 'Escape') onClose();
  };

  if (!open) return null;

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h3>管理员登录</h3>
        <p>输入密码以获得分发权限</p>
        <input
          ref={inputRef}
          type="password"
          className={`modal-input${error ? ' error' : ''}`}
          placeholder="密码"
          value={password}
          onChange={e => { setPassword(e.target.value); setError(''); }}
          onKeyDown={handleKeyDown}
        />
        {error && <p className="modal-error">{error}</p>}
        <div className="modal-actions">
          <button className="modal-cancel" onClick={onClose}>取消</button>
          <button className="modal-save" onClick={handleLogin} disabled={loading}>
            {loading ? '验证中…' : '登录'}
          </button>
        </div>
      </div>
    </div>
  );
}
