export default function MemberPicker({ state, selectedMemberId, onSelect }) {
  if (!state) return null;

  const hasMembers = state.members.fe.length > 0 || state.members.be.length > 0;
  if (!hasMembers) {
    return <span className="picker-none">暂无成员</span>;
  }

  return (
    <div className="member-picker">
      {['fe', 'be'].map(type => {
        const members = state.members[type];
        if (!members.length) return null;
        return (
          <div key={type}>
            <div className="picker-group-label">
              {type === 'fe' ? '前端 FE' : '后端 BE'}
            </div>
            <div className="picker-members">
              {members.map(m => (
                <button
                  key={m.id}
                  className={`picker-btn ${type}${m.id === selectedMemberId ? ' selected' : ''}`}
                  onClick={() => onSelect(m.id, m.type)}
                >
                  {m.name} · {m.contribution ?? 0}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
