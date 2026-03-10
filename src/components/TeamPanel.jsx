import MemberCard from './MemberCard';
import StatsBar from './StatsBar';

export default function TeamPanel({
  state,
  isAdmin,
  currentType,
  justAssignedId,
  onOpenNameModal,
  onOpenAddModal,
  onOpenDeleteModal,
}) {
  if (!state) return null;

  const renderGroup = (type) => {
    const members = state.members[type] || [];
    const total = Math.round(members.reduce((s, m) => s + (m.contribution ?? 0), 0) * 100) / 100;
    const label = type === 'fe' ? '前端 FE' : '后端 BE';

    return (
      <>
        <div className="group-header" style={type === 'be' ? { marginTop: 24 } : undefined}>
          <span className={`group-tag ${type}`}>{label}</span>
          <span className="group-count">{total} 贡献</span>
          {isAdmin && (
            <button
              className={`add-member-btn ${type}`}
              onClick={() => onOpenAddModal(type)}
              title={`添加${type === 'fe' ? '前端' : '后端'}成员`}
            >
              ＋
            </button>
          )}
        </div>
        <div className="members-grid">
          {members.map((m, idx) => (
            <MemberCard
              key={m.id}
              member={m}
              type={type}
              isNext={currentType === type && idx === 0}
              isAdmin={isAdmin}
              justAssigned={m.id === justAssignedId}
              onEdit={() => onOpenNameModal(type, idx)}
              onDelete={() => onOpenDeleteModal(type, idx)}
            />
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="team-panel">
      <p className="section-label">
        {isAdmin ? '开发团队 · 点击成员可编辑姓名' : '开发团队'}
      </p>
      {renderGroup('fe')}
      {renderGroup('be')}
      <StatsBar state={state} />
    </div>
  );
}
