import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  Trash2,
  Eye,
  Plus,
  RefreshCw,
  Check,
  AlertCircle,
  Clock,
  ListTodo
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../App';
import { LoadingSpinner } from '../common';
import { cn } from '../../lib/utils';

function isProfileWithName(p: unknown): p is { name: string } {
  return typeof p === 'object' && p !== null && 'name' in p && typeof (p as any).name === 'string';
}

interface TaskListProps {
  onAddTask: () => void;
}

const STATUS_CONFIG = {
  idle:    { label: 'Idle',    class: 'badge-idle',    dot: 'bg-muted-foreground' },
  running: { label: 'Running', class: 'badge-running', dot: 'bg-primary animate-pulse' },
  success: { label: 'Success', class: 'badge-success', dot: 'bg-success' },
  error:   { label: 'Failed',  class: 'badge-error',   dot: 'bg-destructive' },
  ready:   { label: 'Ready',   class: 'badge-warning', dot: 'bg-warning' },
} as const;

export default function TaskList({ onAddTask }: TaskListProps) {
  const navigate = useNavigate();
  const { tasks, updateTask, deleteTask, loading } = useAppContext();
  const { addToast } = useToast();
  const [selected, setSelected] = useState<number[]>([]);
  const [busy, setBusy] = useState<number | null>(null);

  const toggleSelect = (id: number) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleSelectAll = () =>
    setSelected(selected.length === tasks.length ? [] : tasks.map(t => t.id));

  const toggleStatus = async (taskId: number) => {
    setBusy(taskId);
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      const next = task.status === 'running' ? 'idle' : 'running';
      await updateTask(taskId, { status: next });
    } catch {
      addToast({ type: 'error', title: 'Action Failed', message: 'Could not update task status' });
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async (taskId: number) => {
    if (!window.confirm('Delete this task?')) return;
    setBusy(taskId);
    try {
      await deleteTask(taskId);
      addToast({ type: 'success', title: 'Task Deleted', message: 'Task removed successfully' });
    } catch {
      addToast({ type: 'error', title: 'Delete Failed', message: 'Could not delete task' });
    } finally {
      setBusy(null);
    }
  };

  const bulkStart = async () => {
    for (const id of selected) {
      setBusy(id);
      await updateTask(id, { status: 'running' }).catch(() => {});
    }
    setBusy(null);
    addToast({ type: 'success', title: 'Tasks Started', message: `${selected.length} tasks running` });
  };

  const bulkPause = async () => {
    for (const id of selected) {
      setBusy(id);
      await updateTask(id, { status: 'idle' }).catch(() => {});
    }
    setBusy(null);
    addToast({ type: 'success', title: 'Tasks Paused', message: `${selected.length} tasks paused` });
  };

  const bulkDelete = async () => {
    if (!window.confirm(`Delete ${selected.length} tasks?`)) return;
    for (const id of selected) {
      setBusy(id);
      await deleteTask(id).catch(() => {});
    }
    setBusy(null);
    setSelected([]);
    addToast({ type: 'success', title: 'Tasks Deleted', message: `${selected.length} tasks removed` });
  };

  if (loading?.tasks) {
    return <div className="flex items-center justify-center py-24"><LoadingSpinner size="lg" /></div>;
  }

  if (!tasks?.length) {
    return (
      <div className="card flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
          <ListTodo className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-semibold text-foreground mb-1">No tasks yet</h3>
        <p className="text-sm text-muted-foreground mb-5">Create your first task to start monitoring products</p>
        <button className="btn-primary text-xs gap-1.5" onClick={onAddTask}>
          <Plus className="w-3.5 h-3.5" />
          Create Task
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Bulk action bar */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-primary/5 border border-primary/20 animate-fade-in">
          <span className="text-xs font-medium text-primary">{selected.length} selected</span>
          <div className="flex items-center gap-2 ml-auto">
            <button className="btn-secondary btn-sm gap-1.5" onClick={bulkStart}>
              <Play className="w-3 h-3" /> Start All
            </button>
            <button className="btn-secondary btn-sm gap-1.5" onClick={bulkPause}>
              <Pause className="w-3 h-3" /> Pause All
            </button>
            <button className="btn-destructive btn-sm gap-1.5" onClick={bulkDelete}>
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr className="border-b border-border bg-secondary/20">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selected.length === tasks.length && tasks.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-border bg-secondary accent-primary w-3.5 h-3.5"
                  />
                </th>
                <th>Status</th>
                <th>Product</th>
                <th>Site</th>
                <th>Size</th>
                <th>Profile</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const statusKey = (task.status in STATUS_CONFIG ? task.status : 'idle') as keyof typeof STATUS_CONFIG;
                const s = STATUS_CONFIG[statusKey];
                return (
                  <tr key={task.id}>
                    <td className="px-4">
                      <input
                        type="checkbox"
                        checked={selected.includes(task.id)}
                        onChange={() => toggleSelect(task.id)}
                        className="rounded border-border bg-secondary accent-primary w-3.5 h-3.5"
                      />
                    </td>
                    <td>
                      <span className={cn('badge', s.class)}>
                        <span className={cn('status-dot', s.dot)} />
                        {s.label}
                      </span>
                    </td>
                    <td>
                      <p className="font-medium text-foreground text-sm leading-tight">
                        {task.product?.name ?? 'Unnamed Product'}
                      </p>
                      <p className="text-xs text-muted-foreground">{task.product?.sku ?? task.sku ?? 'No SKU'}</p>
                    </td>
                    <td>
                      <span className="text-sm text-foreground">{task.site ?? '—'}</span>
                    </td>
                    <td>
                      <span className="text-sm text-foreground">{task.size ?? 'Any'}</span>
                    </td>
                    <td>
                      <span className="text-sm text-foreground">
                        {isProfileWithName(task.profile) ? task.profile.name : (task.profile ?? 'None')}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => toggleStatus(task.id)}
                          disabled={busy === task.id}
                          className="btn-icon text-muted-foreground hover:text-primary"
                          title={task.status === 'running' ? 'Pause' : 'Start'}
                        >
                          {busy === task.id ? (
                            <LoadingSpinner size="sm" />
                          ) : task.status === 'running' ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => navigate(`/tasks/${task.id}`)}
                          className="btn-icon text-muted-foreground hover:text-foreground"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          disabled={busy === task.id}
                          className="btn-icon text-muted-foreground hover:text-destructive"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
