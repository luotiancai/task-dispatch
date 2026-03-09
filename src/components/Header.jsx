const SYNC_TEXT = {
  idle: '☁ 云端共享',
  saving: '⟳ 同步中…',
  saved: '✓ 已同步',
  error: '✗ 同步失败',
};

export default function Header({ syncStatus, isAdmin, onToggleAdmin }) {
  return (
    <header>
      <h1>任务分发</h1>
      <div className="header-right">
        <span className={`sync-status sync-${syncStatus}`}>
          {SYNC_TEXT[syncStatus]}
        </span>
        <button
          className={`admin-btn ${isAdmin ? 'logged-in' : 'logged-out'}`}
          onClick={onToggleAdmin}
        >
          {isAdmin ? '管理员 ✓' : '管理员登录'}
        </button>
      </div>
    </header>
  );
}
