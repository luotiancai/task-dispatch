export default function MemberCard({
  member,
  type,
  isNext,
  isAdmin,
  justAssigned,
  onEdit,
  onDelete,
}) {
  const contribution = member.contribution ?? 0;
  const dots = Math.min(Math.ceil(contribution), 20);

  return (
    <div
      className={[
        'member-card',
        type,
        isNext ? 'next-up' : '',
        isAdmin ? 'clickable' : '',
        justAssigned ? 'just-assigned' : '',
      ].filter(Boolean).join(' ')}
      id={`card-${member.id}`}
      onClick={isAdmin ? onEdit : undefined}
    >
      {isAdmin && (
        <button
          className="card-del-btn"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="删除成员"
        >
          ✕
        </button>
      )}
      <div className="member-avatar">{member.name.charAt(0)}</div>
      <div className="member-name">{member.name}</div>
      <div className="member-tasks">
        <strong>{contribution}</strong>贡献
      </div>
      <div className="task-dots">
        {Array.from({ length: dots }, (_, i) => (
          <div key={i} className="task-dot" />
        ))}
      </div>
    </div>
  );
}
