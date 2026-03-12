import { useState, useEffect, useRef, useCallback } from 'react';
import { ref, onValue, set, get } from 'firebase/database';
import { db } from './firebase';
import Header from './components/Header';
import TeamPanel from './components/TeamPanel';
import DispatchPanel from './components/DispatchPanel';
import LoginModal from './components/modals/LoginModal';
import NameModal from './components/modals/NameModal';
import AddModal from './components/modals/AddModal';
import DeleteModal from './components/modals/DeleteModal';
import ReassignModal from './components/modals/ReassignModal';
import EditContribModal from './components/modals/EditContribModal';

const stateRef = ref(db, 'dispatch/state');

function defaultState() {
  return {
    members: {
      fe: [0, 1, 2, 3, 4].map(i => ({ id: `fe${i}`, name: `前端-${i + 1}`, type: 'fe', contribution: 0 })),
      be: [0, 1, 2, 3, 4].map(i => ({ id: `be${i}`, name: `后端-${i + 1}`, type: 'be', contribution: 0 })),
    },
    pointers: { fe: 0, be: 0 },
    history: [],
    lastAssigned: null,
  };
}

function normalizeContributions(s, type) {
  const members = s.members[type];
  if (members.length === 0) return;
  const minC = Math.min(...members.map(m => m.contribution));
  if (minC > 0) {
    members.forEach(m => { m.contribution = Math.round((m.contribution - minC) * 100) / 100; });
  }
}

export default function App() {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentType, setCurrentType] = useState('fe');
  const [dispatchMode, setDispatchMode] = useState('auto');
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [selectedMemberType, setSelectedMemberType] = useState(null);

  // Modal states
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [nameModalTarget, setNameModalTarget] = useState(null); // { type, idx }
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalTarget, setAddModalTarget] = useState(null); // { type }
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteModalTarget, setDeleteModalTarget] = useState(null); // { type, idx }
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [reassignTaskIdx, setReassignTaskIdx] = useState(null);
  const [editContribModalOpen, setEditContribModalOpen] = useState(false);
  const [editContribTaskIdx, setEditContribTaskIdx] = useState(null);

  // For flash animation on cards
  const [justAssignedId, setJustAssignedId] = useState(null);

  // For removing animation on history items
  const [removingIdx, setRemovingIdx] = useState(null);

  const syncTimerRef = useRef(null);

  const updateSyncStatus = useCallback((status) => {
    setSyncStatus(status);
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    if (status === 'saved') {
      syncTimerRef.current = setTimeout(() => setSyncStatus('idle'), 1500);
    }
  }, []);

  const saveState = useCallback(async (newState) => {
    updateSyncStatus('saving');
    try {
      await set(stateRef, newState);
      updateSyncStatus('saved');
    } catch (e) {
      updateSyncStatus('error');
      console.error('Save failed:', e);
    }
  }, [updateSyncStatus]);

  useEffect(() => {
    async function init() {
      try {
        const snap = await get(stateRef);
        if (!snap.exists()) await set(stateRef, defaultState());
      } catch (e) {}

      const unsubscribe = onValue(stateRef, (snapshot) => {
        const data = snapshot.val();
        let parsed;
        if (!data) {
          parsed = defaultState();
        } else {
          const parseMembers = (raw, type) => {
            if (!raw) return [];
            const arr = Array.isArray(raw) ? raw : Object.values(raw);
            return arr.map((m, i) => ({ id: m.id || `${type}${i}`, name: m.name, type, contribution: m.contribution ?? m.tasks ?? 0 }));
          };
          parsed = {
            ...defaultState(),
            ...data,
            members: {
              fe: parseMembers(data.members?.fe, 'fe'),
              be: parseMembers(data.members?.be, 'be'),
            },
            history: data.history
              ? Array.isArray(data.history)
                ? data.history
                : Object.values(data.history)
              : [],
            pointers: { fe: data.pointers?.fe || 0, be: data.pointers?.be || 0 },
            lastAssigned: data.lastAssigned || null,
          };
        }
        setState(parsed);
        setLoading(false);
      });

      return unsubscribe;
    }

    let cleanup;
    init().then(fn => { cleanup = fn; });
    return () => { if (cleanup) cleanup(); };
  }, []);

  // Dispatch auto (assign to index 0 = least loaded)
  const dispatchTask = useCallback((taskName, contribution) => {
    if (!isAdmin || !state) return;
    const arr = state.members[currentType];
    if (!arr || arr.length === 0) {
      alert(`${currentType === 'fe' ? '前端' : '后端'}组暂无成员，请先添加成员`);
      return;
    }

    const s = JSON.parse(JSON.stringify(state));
    const t = currentType;
    const member = s.members[t][0];
    s.members[t][0].contribution = Math.round((s.members[t][0].contribution + contribution) * 100) / 100;
    normalizeContributions(s, t);
    s.members[t].sort((a, b) => a.contribution - b.contribution);

    if (!s.history) s.history = [];
    s.history.push({ name: member.name, type: member.type, task: taskName, contribution, ts: Date.now() });
    s.lastAssigned = { name: member.name, type: member.type, task: taskName };

    setJustAssignedId(member.id);
    setTimeout(() => setJustAssignedId(null), 700);

    saveState(s);
  }, [isAdmin, state, currentType, saveState]);

  // Dispatch direct (assign to specific member)
  const dispatchDirect = useCallback((taskName, contribution) => {
    if (!isAdmin || !state) return;
    if (!selectedMemberId || !selectedMemberType) {
      alert('请先选择一个成员');
      return;
    }
    const s = JSON.parse(JSON.stringify(state));
    const member = s.members[selectedMemberType]?.find(m => m.id === selectedMemberId);
    if (!member) { alert('成员不存在，请重新选择'); return; }

    member.contribution = Math.round((member.contribution + contribution) * 100) / 100;
    normalizeContributions(s, selectedMemberType);
    s.members[selectedMemberType].sort((a, b) => a.contribution - b.contribution);

    if (!s.history) s.history = [];
    s.history.push({ name: member.name, type: member.type, task: taskName, contribution, ts: Date.now(), direct: true });
    s.lastAssigned = { name: member.name, type: member.type, task: taskName };

    setJustAssignedId(member.id);
    setTimeout(() => setJustAssignedId(null), 700);

    saveState(s);
  }, [isAdmin, state, selectedMemberId, selectedMemberType, saveState]);

  // Delete task from history
  const deleteTask = useCallback((idx) => {
    setRemovingIdx(idx);
    setTimeout(() => {
      setRemovingIdx(null);
      const s = JSON.parse(JSON.stringify(state));
      const h = s.history[idx];
      if (!h) return;
      const m = s.members[h.type]?.find(m => m.name === h.name);
      if (m) m.contribution = Math.max(0, Math.round((m.contribution - (h.contribution || 1)) * 100) / 100);
      if (s.members[h.type]) s.members[h.type].sort((a, b) => a.contribution - b.contribution);
      s.history.splice(idx, 1);
      saveState(s);
    }, 230);
  }, [state, saveState]);

  // Reassign task
  const reassignTask = useCallback((newMemberId, newMemberType) => {
    if (!isAdmin || reassignTaskIdx === null || !state) return;
    const s = JSON.parse(JSON.stringify(state));
    const h = s.history[reassignTaskIdx];
    if (!h) return;
    const oldMember = s.members[h.type]?.find(m => m.name === h.name);
    const newMember = s.members[newMemberType]?.find(m => m.id === newMemberId);
    if (!newMember) return;
    const c = h.contribution || 1;
    if (oldMember) oldMember.contribution = Math.max(0, Math.round((oldMember.contribution - c) * 100) / 100);
    newMember.contribution = Math.round((newMember.contribution + c) * 100) / 100;
    h.name = newMember.name;
    h.type = newMember.type;
    saveState(s);
    setReassignModalOpen(false);
    setReassignTaskIdx(null);
  }, [isAdmin, reassignTaskIdx, state, saveState]);

  // Edit contribution value of a history entry
  const editContrib = useCallback((newContrib) => {
    if (!isAdmin || editContribTaskIdx === null || !state) return;
    const s = JSON.parse(JSON.stringify(state));
    const h = s.history[editContribTaskIdx];
    if (!h) return;
    const oldC = h.contribution ?? 1;
    const diff = newContrib - oldC;
    const member = s.members[h.type]?.find(m => m.name === h.name);
    if (member) {
      member.contribution = Math.max(0, Math.round((member.contribution + diff) * 100) / 100);
    }
    h.contribution = newContrib;
    saveState(s);
    setEditContribModalOpen(false);
    setEditContribTaskIdx(null);
  }, [isAdmin, editContribTaskIdx, state, saveState]);

  // Add member
  const addMember = useCallback((name) => {
    if (!addModalTarget) return;
    const s = JSON.parse(JSON.stringify(state));
    const type = addModalTarget.type;
    const newId = `${type}${Date.now()}`;
    s.members[type].push({ id: newId, name, type, contribution: 0 });
    setAddModalOpen(false);
    setAddModalTarget(null);
    saveState(s);
  }, [addModalTarget, state, saveState]);

  // Delete member
  const deleteMember = useCallback(() => {
    if (!deleteModalTarget) return;
    const s = JSON.parse(JSON.stringify(state));
    const { type, idx } = deleteModalTarget;
    s.members[type].splice(idx, 1);
    if (s.members[type].length > 0) {
      s.pointers[type] = s.pointers[type] % s.members[type].length;
    } else {
      s.pointers[type] = 0;
    }
    setDeleteModalOpen(false);
    setDeleteModalTarget(null);
    saveState(s);
  }, [deleteModalTarget, state, saveState]);

  // Save member name
  const saveName = useCallback((name) => {
    if (!nameModalTarget) return;
    const s = JSON.parse(JSON.stringify(state));
    s.members[nameModalTarget.type][nameModalTarget.idx].name = name;
    setNameModalOpen(false);
    setNameModalTarget(null);
    saveState(s);
  }, [nameModalTarget, state, saveState]);

  // Admin login
  const handleLogin = useCallback(async (password) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (data.ok) {
      setIsAdmin(true);
      setLoginModalOpen(false);
      return true;
    }
    return false;
  }, []);

  const toggleAdmin = useCallback(() => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      setLoginModalOpen(true);
    }
  }, [isAdmin]);

  const openNameModal = useCallback((type, idx) => {
    setNameModalTarget({ type, idx });
    setNameModalOpen(true);
  }, []);

  const openAddModal = useCallback((type) => {
    setAddModalTarget({ type });
    setAddModalOpen(true);
  }, []);

  const openDeleteModal = useCallback((type, idx) => {
    setDeleteModalTarget({ type, idx });
    setDeleteModalOpen(true);
  }, []);

  const openReassignModal = useCallback((idx) => {
    setReassignTaskIdx(idx);
    setReassignModalOpen(true);
  }, []);

  const openEditContribModal = useCallback((idx) => {
    setEditContribTaskIdx(idx);
    setEditContribModalOpen(true);
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p className="loading-text">正在加载云端数据…</p>
      </div>
    );
  }

  return (
    <>
      <Header
        syncStatus={syncStatus}
        isAdmin={isAdmin}
        onToggleAdmin={toggleAdmin}
      />
      <div className="layout">
        <TeamPanel
          state={state}
          isAdmin={isAdmin}
          currentType={currentType}
          justAssignedId={justAssignedId}
          onOpenNameModal={openNameModal}
          onOpenAddModal={openAddModal}
          onOpenDeleteModal={openDeleteModal}
        />
        <DispatchPanel
          state={state}
          isAdmin={isAdmin}
          currentType={currentType}
          dispatchMode={dispatchMode}
          selectedMemberId={selectedMemberId}
          selectedMemberType={selectedMemberType}
          removingIdx={removingIdx}
          onSetCurrentType={setCurrentType}
          onSetDispatchMode={(mode) => {
            setDispatchMode(mode);
            setSelectedMemberId(null);
            setSelectedMemberType(null);
          }}
          onSelectMember={(id, type) => {
            setSelectedMemberId(id);
            setSelectedMemberType(type);
          }}
          onDispatchTask={dispatchTask}
          onDispatchDirect={dispatchDirect}
          onDeleteTask={deleteTask}
          onOpenReassignModal={openReassignModal}
          onOpenEditContribModal={openEditContribModal}
        />
      </div>

      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLogin={handleLogin}
      />
      <NameModal
        open={nameModalOpen}
        target={nameModalTarget}
        state={state}
        onClose={() => { setNameModalOpen(false); setNameModalTarget(null); }}
        onSave={saveName}
      />
      <AddModal
        open={addModalOpen}
        target={addModalTarget}
        onClose={() => { setAddModalOpen(false); setAddModalTarget(null); }}
        onSave={addMember}
      />
      <DeleteModal
        open={deleteModalOpen}
        target={deleteModalTarget}
        state={state}
        onClose={() => { setDeleteModalOpen(false); setDeleteModalTarget(null); }}
        onConfirm={deleteMember}
      />
      <ReassignModal
        open={reassignModalOpen}
        taskIdx={reassignTaskIdx}
        state={state}
        onClose={() => { setReassignModalOpen(false); setReassignTaskIdx(null); }}
        onReassign={reassignTask}
      />
      <EditContribModal
        open={editContribModalOpen}
        taskIdx={editContribTaskIdx}
        state={state}
        onClose={() => { setEditContribModalOpen(false); setEditContribTaskIdx(null); }}
        onSave={editContrib}
      />
    </>
  );
}
