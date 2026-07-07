export default function DeleteModal({ open, target, state, onClose, onConfirm }) {
  if (!open || !target || !state) return null;

  const member = state.members[target.type]?.[target.idx];
  if (!member) return null;

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h3>删除成员</h3>
        <p>
          确定删除「{member.name}」？删除后该成员的贡献度清零，历史记录将一并删除，不可恢复。
        </p>
        <div className="modal-actions">
          <button className="modal-cancel" onClick={onClose}>取消</button>
          <button className="modal-danger" onClick={onConfirm}>确认删除</button>
        </div>
      </div>
    </div>
  );
}
