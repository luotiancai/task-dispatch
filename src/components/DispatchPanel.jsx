import { useState } from 'react';
import MemberPicker from './MemberPicker';
import HistoryList from './HistoryList';

export default function DispatchPanel({
  state,
  isAdmin,
  currentType,
  dispatchMode,
  selectedMemberId,
  selectedMemberType,
  removingIdx,
  onSetCurrentType,
  onSetDispatchMode,
  onSelectMember,
  onDispatchTask,
  onDispatchDirect,
  onDeleteTask,
  onOpenReassignModal,
}) {
  const [taskInput, setTaskInput] = useState('');
  const [contribution, setContribution] = useState(1);
  const [directTaskInput, setDirectTaskInput] = useState('');
  const [directContribution, setDirectContribution] = useState(1);

  const handleDispatch = () => {
    onDispatchTask(taskInput.trim(), Number(contribution) || 1);
    setTaskInput('');
    setContribution(1);
  };

  const handleDispatchDirect = () => {
    onDispatchDirect(directTaskInput.trim(), Number(directContribution) || 1);
    setDirectTaskInput('');
    setDirectContribution(1);
  };

  return (
    <div className="dispatch-panel">
      <p className="section-label">
        {isAdmin ? '分发任务' : '查看模式（只读）'}
      </p>

      {isAdmin && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Mode toggle */}
          <div className="mode-toggle">
            <button
              className={`mode-btn${dispatchMode === 'auto' ? ' active' : ''}`}
              onClick={() => onSetDispatchMode('auto')}
            >
              ⟳ 自动轮转
            </button>
            <button
              className={`mode-btn${dispatchMode === 'direct' ? ' active' : ''}`}
              onClick={() => onSetDispatchMode('direct')}
            >
              ✎ 指定分配
            </button>
          </div>

          {/* Auto rotate mode */}
          {dispatchMode === 'auto' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="type-toggle">
                <button
                  className={`type-btn${currentType === 'fe' ? ' active-fe' : ''}`}
                  onClick={() => onSetCurrentType('fe')}
                >
                  前端 FE
                </button>
                <button
                  className={`type-btn${currentType === 'be' ? ' active-be' : ''}`}
                  onClick={() => onSetCurrentType('be')}
                >
                  后端 BE
                </button>
              </div>
              <input
                type="text"
                className="task-input"
                placeholder="任务名称（可选）"
                value={taskInput}
                onChange={e => setTaskInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleDispatch(); }}
              />
              <input
                type="number"
                className="task-input"
                placeholder="贡献值（默认 1）"
                min="0.1"
                step="0.5"
                value={contribution}
                onChange={e => setContribution(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleDispatch(); }}
              />
              <button
                className={`dispatch-btn ${currentType}`}
                onClick={handleDispatch}
              >
                → 分发给{currentType === 'fe' ? '前端' : '后端'}
              </button>
            </div>
          )}

          {/* Direct assign mode */}
          {dispatchMode === 'direct' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <MemberPicker
                state={state}
                selectedMemberId={selectedMemberId}
                onSelect={onSelectMember}
              />
              <input
                type="text"
                className="task-input"
                placeholder="任务名称（可选）"
                value={directTaskInput}
                onChange={e => setDirectTaskInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleDispatchDirect(); }}
              />
              <input
                type="number"
                className="task-input"
                placeholder="贡献值（默认 1）"
                min="0.1"
                step="0.5"
                value={directContribution}
                onChange={e => setDirectContribution(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleDispatchDirect(); }}
              />
              <button
                className="dispatch-btn"
                style={{ background: 'var(--ink)', color: 'var(--highlight)' }}
                onClick={handleDispatchDirect}
              >
                → 指定分配
              </button>
            </div>
          )}
        </div>
      )}

      <div className="divider" />
      <p className="section-label" style={{ marginBottom: 8 }}>分发记录</p>
      <div className="history-list">
        <HistoryList
          state={state}
          isAdmin={isAdmin}
          removingIdx={removingIdx}
          onDeleteTask={onDeleteTask}
          onOpenReassignModal={onOpenReassignModal}
        />
      </div>
    </div>
  );
}
