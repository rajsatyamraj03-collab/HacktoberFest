import React, { useState, useMemo } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Kanban, 
  List, 
  Trash2, 
  Edit, 
  X, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { 
  getTasks, 
  createTask, 
  updateTask, 
  deleteTask, 
  getCurrentUser 
} from '../services/storage';
import { StudentTask, TaskCategory, TaskPriority, TaskStatus } from '../types';
import { useToast } from '../components/common/Toast';
import { ConfirmModal } from '../components/common/ConfirmModal';
import confetti from 'canvas-confetti';

interface TasksPageProps {
  onNavigate: (page: string, entityId?: string) => void;
  isCreateOpen?: boolean;
}

const CATEGORIES: TaskCategory[] = [
  'Assignments',
  'Exams',
  'Projects',
  'Event registrations',
  'Hackathon milestones',
  'Personal tasks',
  'Club activities',
];

const PRIORITIES: TaskPriority[] = ['Urgent', 'High', 'Medium', 'Low'];

export const TasksPage: React.FC<TasksPageProps> = ({ onNavigate, isCreateOpen = false }) => {
  const currentUser = getCurrentUser();
  const tasks = getTasks();
  const { showToast } = useToast();

  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [filterMode, setFilterMode] = useState<'all' | 'today' | 'upcoming' | 'overdue' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');

  // Quick inline add task
  const [quickTitle, setQuickTitle] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(isCreateOpen);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  // Form fields
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskCategory, setTaskCategory] = useState<TaskCategory>('Assignments');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('High');
  const [taskDueDate, setTaskDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // Metrics
  const completedTasks = tasks.filter((t) => t.status === 'Completed');
  const pendingTasks = tasks.filter((t) => t.status !== 'Completed');
  const overdueTasks = tasks.filter((t) => t.status !== 'Completed' && t.dueDate < todayStr);
  const todayTasks = tasks.filter((t) => t.status !== 'Completed' && t.dueDate === todayStr);
  const completionPercentage = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Date filter mode
      if (filterMode === 'today' && (task.dueDate !== todayStr || task.status === 'Completed')) return false;
      if (filterMode === 'overdue' && (task.dueDate >= todayStr || task.status === 'Completed')) return false;
      if (filterMode === 'completed' && task.status !== 'Completed') return false;
      if (filterMode === 'upcoming' && (task.dueDate <= todayStr || task.status === 'Completed')) return false;

      // Search & category
      const matchSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCat = selectedCategory === 'All' || task.category === selectedCategory;
      const matchPri = selectedPriority === 'All' || task.priority === selectedPriority;

      return matchSearch && matchCat && matchPri;
    });
  }, [tasks, filterMode, searchQuery, selectedCategory, selectedPriority, todayStr]);

  // Handle Quick Add inline
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    createTask({
      userId: currentUser.id,
      title: quickTitle.trim(),
      category: 'Assignments',
      priority: 'Medium',
      status: 'Todo',
      dueDate: todayStr,
    });

    setQuickTitle('');
    showToast('Task Added', 'Quick task scheduled for today.', 'success');
  };

  // Handle Modal Save (Create or Edit)
  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    if (editingTaskId) {
      updateTask(editingTaskId, {
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        category: taskCategory,
        priority: taskPriority,
        dueDate: taskDueDate,
      });
      showToast('Task Updated', 'Changes saved successfully.', 'success');
    } else {
      createTask({
        userId: currentUser.id,
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        category: taskCategory,
        priority: taskPriority,
        status: 'Todo',
        dueDate: taskDueDate,
      });
      showToast('Task Created', 'New task added to your workspace.', 'success');
    }

    setIsModalOpen(false);
    setEditingTaskId(null);
    setTaskTitle('');
    setTaskDesc('');
  };

  // Toggle status
  const handleToggleStatus = (taskId: string, currentStatus: TaskStatus) => {
    const nextStatus = currentStatus === 'Completed' ? 'Todo' : 'Completed';
    updateTask(taskId, { status: nextStatus });
    if (nextStatus === 'Completed') {
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
      showToast('Task Done! 🎯', 'Great job finishing this student milestone.', 'success');
    }
  };

  // Move status in Kanban
  const handleMoveStatus = (taskId: string, nextStatus: TaskStatus) => {
    updateTask(taskId, { status: nextStatus });
    if (nextStatus === 'Completed') {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
      showToast('Completed! 🎉', 'Moved to Completed column.', 'success');
    }
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (!deleteTaskId) return;
    deleteTask(deleteTaskId);
    setDeleteTaskId(null);
    showToast('Task Removed', 'Task was deleted.', 'info');
  };

  const openEditModal = (task: StudentTask) => {
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskDesc(task.description || '');
    setTaskCategory(task.category);
    setTaskPriority(task.priority);
    setTaskDueDate(task.dueDate);
    setIsModalOpen(true);
  };

  const getPriorityBadge = (pri: TaskPriority) => {
    switch (pri) {
      case 'Urgent': return <span className="badge badge-rose">Urgent</span>;
      case 'High': return <span className="badge badge-amber">High</span>;
      case 'Medium': return <span className="badge badge-indigo">Medium</span>;
      case 'Low': return <span className="badge badge-neutral">Low</span>;
    }
  };

  return (
    <div className="content-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Student Task & Productivity Manager
            </h1>
            <span className="badge badge-emerald">MODULE E</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Track course assignments, hackathon deadlines, exam revisions, and event preparations.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTaskId(null);
            setTaskTitle('');
            setTaskDesc('');
            setIsModalOpen(true);
          }}
          className="btn btn-primary btn-sm"
        >
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Productivity Metric Widgets Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Weekly Completion</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success-text)', margin: '4px 0' }}>
            {completionPercentage}%
          </div>
          <div style={{ height: '5px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${completionPercentage}%`, height: '100%', background: 'var(--success)' }} />
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Due Today</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', margin: '4px 0' }}>
            {todayTasks.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Scheduled for today</div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Overdue Deadlines</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: overdueTasks.length > 0 ? 'var(--error)' : 'var(--text-main)', margin: '4px 0' }}>
            {overdueTasks.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: overdueTasks.length > 0 ? 'var(--error)' : 'var(--text-muted)' }}>
            {overdueTasks.length > 0 ? 'Requires immediate action' : 'All caught up!'}
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Completed Tasks</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0' }}>
            {completedTasks.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total finished milestones</div>
        </div>
      </div>

      {/* Quick Add Inline Form */}
      <form onSubmit={handleQuickAdd} className="card" style={{ padding: '10px 14px', marginBottom: '1.5rem', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <CheckSquare size={18} color="var(--primary)" />
        <input
          type="text"
          className="input-field"
          style={{ border: 'none', background: 'transparent', padding: '6px 0', fontSize: '0.9rem' }}
          placeholder="Quick add: Type a task title and press Enter..."
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
        />
        <button type="submit" className="btn btn-outline btn-sm">
          Add
        </button>
      </form>

      {/* Filter Tabs & View Mode Row */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
          <button
            className={`chip ${filterMode === 'all' ? 'chip-active' : ''}`}
            onClick={() => setFilterMode('all')}
          >
            All ({tasks.length})
          </button>
          <button
            className={`chip ${filterMode === 'today' ? 'chip-active' : ''}`}
            onClick={() => setFilterMode('today')}
          >
            Today ({todayTasks.length})
          </button>
          <button
            className={`chip ${filterMode === 'upcoming' ? 'chip-active' : ''}`}
            onClick={() => setFilterMode('upcoming')}
          >
            Upcoming
          </button>
          <button
            className={`chip ${filterMode === 'overdue' ? 'chip-active' : ''}`}
            onClick={() => setFilterMode('overdue')}
          >
            Overdue ({overdueTasks.length})
          </button>
          <button
            className={`chip ${filterMode === 'completed' ? 'chip-active' : ''}`}
            onClick={() => setFilterMode('completed')}
          >
            Completed ({completedTasks.length})
          </button>
        </div>

        {/* View Mode (Board vs List) */}
        <div style={{ display: 'flex', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <button
            onClick={() => setViewMode('board')}
            style={{
              background: viewMode === 'board' ? 'var(--primary-light)' : 'transparent',
              color: viewMode === 'board' ? 'var(--primary)' : 'var(--text-secondary)',
              border: 'none',
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Kanban size={15} /> Board
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              background: viewMode === 'list' ? 'var(--primary-light)' : 'transparent',
              color: viewMode === 'list' ? 'var(--primary)' : 'var(--text-secondary)',
              border: 'none',
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <List size={15} /> List
          </button>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'board' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {(['Todo', 'In Progress', 'Completed'] as TaskStatus[]).map((colStatus) => {
            const colTasks = filteredTasks.filter((t) => t.status === colStatus);
            return (
              <div
                key={colStatus}
                style={{
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  minHeight: '480px',
                }}
              >
                {/* Column Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: colStatus === 'Completed' ? 'var(--success)' : colStatus === 'In Progress' ? 'var(--warning)' : 'var(--primary)',
                      }}
                    />
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{colStatus}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({colTasks.length})</span>
                  </div>

                  <button
                    onClick={() => {
                      setEditingTaskId(null);
                      setTaskTitle('');
                      setTaskDesc('');
                      setIsModalOpen(true);
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Column Tasks list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  {colTasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      No tasks in {colStatus}
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const isOverdue = task.status !== 'Completed' && task.dueDate < todayStr;
                      return (
                        <div
                          key={task.id}
                          className="card card-hover"
                          style={{
                            padding: '14px',
                            background: 'var(--bg-card)',
                            borderLeft: `4px solid ${task.priority === 'Urgent' ? 'var(--error)' : task.priority === 'High' ? 'var(--warning)' : 'var(--primary)'}`,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                            <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>{task.category}</span>
                            {getPriorityBadge(task.priority)}
                          </div>

                          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '6px' }}>
                            {task.title}
                          </h4>

                          {task.description && (
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '8px' }}>
                              {task.description}
                            </p>
                          )}

                          {/* Linked event tag if any */}
                          {task.linkedEventTitle && (
                            <div
                              onClick={() => task.linkedEventId && onNavigate('events', task.linkedEventId)}
                              style={{
                                fontSize: '0.7rem',
                                color: 'var(--primary)',
                                background: 'var(--primary-light)',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                marginBottom: '8px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Calendar size={12} /> Linked: {task.linkedEventTitle.slice(0, 24)}...
                            </div>
                          )}

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.72rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isOverdue ? 'var(--error)' : 'var(--text-secondary)' }}>
                              <Clock size={12} /> {task.dueDate}
                              {isOverdue && <span style={{ fontWeight: 700 }}>!</span>}
                            </div>

                            {/* Move actions */}
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {colStatus !== 'Todo' && (
                                <button
                                  onClick={() => handleMoveStatus(task.id, 'Todo')}
                                  className="btn btn-ghost btn-sm"
                                  style={{ fontSize: '0.68rem', padding: '2px 6px' }}
                                  title="Move to Todo"
                                >
                                  Todo
                                </button>
                              )}
                              {colStatus !== 'In Progress' && (
                                <button
                                  onClick={() => handleMoveStatus(task.id, 'In Progress')}
                                  className="btn btn-ghost btn-sm"
                                  style={{ fontSize: '0.68rem', padding: '2px 6px' }}
                                  title="Move to In Progress"
                                >
                                  In Prog
                                </button>
                              )}
                              {colStatus !== 'Completed' && (
                                <button
                                  onClick={() => handleMoveStatus(task.id, 'Completed')}
                                  className="btn btn-ghost btn-sm"
                                  style={{ fontSize: '0.68rem', padding: '2px 6px', color: 'var(--success-text)' }}
                                  title="Mark Done"
                                >
                                  Done
                                </button>
                              )}
                              <button
                                onClick={() => openEditModal(task)}
                                className="btn btn-ghost btn-sm"
                                style={{ padding: '2px 4px' }}
                                title="Edit"
                              >
                                <Edit size={13} />
                              </button>
                              <button
                                onClick={() => setDeleteTaskId(task.id)}
                                className="btn btn-ghost btn-sm"
                                style={{ padding: '2px 4px', color: 'var(--error)' }}
                                title="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-hover)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', width: '40px' }}>Done</th>
                <th style={{ padding: '12px 16px' }}>Task Title</th>
                <th style={{ padding: '12px 16px' }}>Category</th>
                <th style={{ padding: '12px 16px' }}>Priority</th>
                <th style={{ padding: '12px 16px' }}>Due Date</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => {
                const isDone = task.status === 'Completed';
                const isOverdue = !isDone && task.dueDate < todayStr;
                return (
                  <tr key={task.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => handleToggleStatus(task.id, task.status)}
                        style={{ accentColor: 'var(--success)', cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, textDecoration: isDone ? 'line-through' : 'none', color: isDone ? 'var(--text-muted)' : 'var(--text-main)' }}>
                        {task.title}
                      </div>
                      {task.description && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{task.description}</div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{task.category}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {getPriorityBadge(task.priority)}
                    </td>
                    <td style={{ padding: '12px 16px', color: isOverdue ? 'var(--error)' : 'inherit', fontWeight: isOverdue ? 700 : 400 }}>
                      {task.dueDate} {isOverdue && '⚠️'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${isDone ? 'badge-emerald' : task.status === 'In Progress' ? 'badge-amber' : 'badge-indigo'}`}>
                        {task.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button onClick={() => openEditModal(task)} className="btn btn-ghost btn-sm" style={{ padding: '4px' }}>
                        <Edit size={14} />
                      </button>
                      <button onClick={() => setDeleteTaskId(task.id)} className="btn btn-ghost btn-sm" style={{ padding: '4px', color: 'var(--error)' }}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Task Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                {editingTaskId ? 'Edit Task' : 'Create Productivity Task'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTask}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Task Title *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. Finish Operating Systems Lab 4 Submission"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      className="select-field"
                      value={taskCategory}
                      onChange={(e) => setTaskCategory(e.target.value as any)}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Priority *</label>
                    <select
                      className="select-field"
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value as any)}
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Due Date *</label>
                  <input
                    type="date"
                    required
                    className="input-field"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Checkpoints</label>
                  <textarea
                    className="textarea-field"
                    rows={3}
                    placeholder="Add lab requirements, GitHub branch notes, or deliverables..."
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingTaskId ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Task Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTaskId}
        title="Delete Task?"
        message="Are you sure you want to remove this task from your productivity manager?"
        confirmLabel="Delete Task"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTaskId(null)}
      />
    </div>
  );
};
