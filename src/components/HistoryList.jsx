import { useState } from 'react';

export default function HistoryList({
  state,
  isAdmin,
  removingIdx,
  onDeleteTask,
  onOpenReassignModal,
  onOpenEditContribModal,
}) {
  const [expandedSet, setExpandedSet] = useState(new Set());
  const [page, setPage] = useState(0);
  const history = state?.history || [];

  if (history.length === 0) {
    return <p className="no-history">暂无记录</p>;
  }

  const PAGE_SIZE = 10;
  const reversed = [...history].reverse().map((h, i) => ({
    h,
    realIdx: history.length - 1 - i,
  }));
  const totalPages = Math.ceil(reversed.length / PAGE_SIZE);
  const safePage = Math.min(page, totalPages - 1);
  const items = reversed.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const toggleExpand = (idx) => {
    setExpandedSet(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  return (
    <>
      {items.map(({ h, realIdx }) => {
        const expanded = expandedSet.has(realIdx);
        const taskText = h.task || '—';
        return (
          <div
            key={realIdx}
            id={`h-${realIdx}`}
            className={`history-item ${h.type}${removingIdx === realIdx ? ' removing' : ''}`}
          >
            {/* 上行：序号、徽章、人名、标签、操作按钮 */}
            <div className="h-top">
              <span className="h-idx">{realIdx + 1}</span>
              <span className={`h-badge ${h.type}`}>{h.type.toUpperCase()}</span>
              <span className="h-who">{h.name}</span>
              <span className="h-contrib">+{h.contribution ?? 1}</span>
              {h.direct && <span className="h-direct">指定</span>}
              <span style={{ flex: 1 }} />
              {isAdmin && (
                <button
                  className="h-edit-contrib"
                  onClick={() => onOpenEditContribModal(realIdx)}
                  title="修改贡献值"
                >
                  ✎
                </button>
              )}
              {isAdmin && (
                <button
                  className="h-reassign"
                  onClick={() => onOpenReassignModal(realIdx)}
                  title="重新分配"
                >
                  ↻
                </button>
              )}
              {isAdmin && (
                <button
                  className="h-del"
                  onClick={() => onDeleteTask(realIdx)}
                  title="删除"
                >
                  ✕
                </button>
              )}
            </div>
            {/* 下行：任务名称，最多3行，点击展开 */}
            <div
              className={`h-task${expanded ? ' expanded' : ''}`}
              onClick={() => toggleExpand(realIdx)}
              title={expanded ? '点击收起' : '点击展开'}
            >
              {taskText}
            </div>
          </div>
        );
      })}
      {totalPages > 1 && (
        <div className="h-pagination">
          <button
            className="h-page-btn"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={safePage === 0}
          >‹</button>
          <span className="h-page-info">{safePage + 1} / {totalPages}</span>
          <button
            className="h-page-btn"
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={safePage === totalPages - 1}
          >›</button>
        </div>
      )}
    </>
  );
}
