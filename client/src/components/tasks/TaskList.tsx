import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Trash2, Eye, Plus, ListTodo } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../App';
import { Skeleton } from '../ui/skeleton';
import { ConfirmDialog } from '../ui/confirm-dialog';
import { cn } from '../../lib/utils';

function isProfileWithName(p: unknown): p is { name: string } {
  return typeof p === 'object' && p !== null && 'name' in p && typeof (p as any).name === 'string';
}

interface TaskListProps { onAddTask: () => void; }

const STATUS_CONFIG = {
  idle:    { label: 'Idle',    cls: 'badge-idle',    dot: 'bg-muted-foreground' },
  running: { label: 'Running', cls: 'badge-running', dot: 'bg-primary animate-pulse' },
  success: { label: 'Success', cls: 'badge-success', dot: 'bg-success' },
  error:   { label: 'Failed',  cls: 'badge-error',   dot: 'bg-destructive' },
  ready:   { label: 'Ready',   cls: 'badge-warning', dot: 'bg-warning' },
} as const;

const TableSkeleton = () => (
  <div className="card overflow-hidden">
    <div className="p-3 border-b border-border bg-secondary/20">
      <div className="flex gap-4">
        {[60, 120, 90, 70, 100, 80].map((w, i) => (
          <Skeleton key={i} className="h-3" style={{ width: w }} />
        ))}
      </div>
    </div>
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-border/50">
        <Skeleton className="h-3.5 w-3.5 rounded" />
        <Skeleton className="h-5 w-16 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-3.5 w-12" />
        <Skeleton className="h-3.5 w-20" />
        <div className="flex gap-1.5 ml-auto">
          {[1,2,3].map(j => <Skeleton key={j} className="h-6 w-6 rounded" />)}
        </div>
      </div>
    ))}
  </div>
);

export default function TaskList({ onAddTask }: TaskListProps) {
  const navigate = useNavigate();
  const { tasks, updateTask, deleteTask, loading } = useAppContext();
  const { addToast } = useToast();
  const [selected, setSelected] = useState<number[]>([]);
  const [busy, setBusy] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<{ type: 'single' | 'bulk'; id?: number } | null>(null);

  const toggleSelect = (id: number) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleSelectAll = () =>
    setSelected(selected.length === tasks.length ? [] : tasks.map(t => t.id));

  const toggleStatus = async (taskId: number) => {
    setBusy(taskId);
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      await updateTask(taskId, { status: task.status === 'running' ? 'idle' : 'running' });
    } catch {
      addToast({ type: 'error', title: 'Action Failed', message: 'Could not update task status' });
    } finally { setBusy(null); }
  };

  const doDelete = async (taskId: number) => {
    setBusy(taskId);
    try {
      await deleteTask(taskId);
      addToast({ type: 'success', title: 'Task Deleted', message: 'Task removed successfully' });
    } catch {
      addToast({ type: 'error', title: 'Delete Failed', message: 'Could not delete task' });
    } finally { setBusy(null); setConfirm(null); }
  };

  const doBulkDelete = async () => {
    for (const id of selected) {
      setBusy(id);
      await deleteTask(id).catch(() => {});
    }
    setBusy(null);
    setSelected([]);
    setConfirm(null);
    addToast({ type: 'success', title: 'Tasks Deleted', message: `${selected.length} tasks removed` });
  };

  const bulkStart = async () => {
    for (const id of selected) await updateTask(id, { status: 'running' }).catch(() => {});
    addToast({ type: 'success', title: 'Tasks Started', message: `${selected.length} tasks running` });
  };

  const bulkPause = async () => {
    for (const id of selected) await updateTask(id, { status: 'idle' }).catch(() => {});
    addToast({ type: 'success', title: 'Tasks Paused', message: `${selected.length} tasks paused` });
  };

  if (loading?.tasks) return <TableSkeleton />;

  if (!tasks?.length) {
    return (
      <div className="card flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
          <ListTodo className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-semibold text-foreground mb-1">No tasks yet</h3>
        <p className="text-sm text-muted-foreground mb-5">Create your first task to start monitoring</p>
        <button className="btn-primary text-xs gap-1.5" onClick={onAddTask}>
          <Plus className="w-3.5 h-3.5" /> Create Task
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {selected.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg animate-fade-in" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.22)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
            <span className="text-xs font-medium text-primary">{selected.length} selected</span>
            <div className="flex items-center gap-2 ml-auto">
              <button className="btn-secondary btn-sm gap-1.5" onClick={bulkStart}>
                <Play className="w-3 h-3" /> Start All
              </button>
              <button className="btn-secondary btn-sm gap-1.5" onClick={bulkPause}>
                <Pause className="w-3 h-3" /> Pause All
              </button>
              <button className="btn-destructive btn-sm gap-1.5" onClick={() => setConfirm({ type: 'bulk' })}>
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          </div>
        )}

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
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
                  const key = (task.status in STATUS_CONFIG ? task.status : 'idle') as keyof typeof STATUS_CONFIG;
                  const s = STATUS_CONFIG[key];
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
                        <span className={cn('badge', s.cls)}>
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
                      <td><span className="text-sm text-foreground">{task.site ?? '—'}</span></td>
                      <td><span className="text-sm text-foreground">{task.size ?? 'Any'}</span></td>
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
                            {task.status === 'running' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => navigate(`/tasks/${task.id}`)}
                            className="btn-icon text-muted-foreground hover:text-foreground"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirm({ type: 'single', id: task.id })}
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

      <ConfirmDialog
        isOpen={confirm?.type === 'single'}
        title="Delete Task"
        description="This task will be permanently removed. This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => confirm?.id && doDelete(confirm.id)}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        isOpen={confirm?.type === 'bulk'}
        title={`Delete ${selected.length} Tasks`}
        description="These tasks will be permanently removed. This action cannot be undone."
        confirmLabel={`Delete ${selected.length}`}
        destructive
        onConfirm={doBulkDelete}
        onCancel={() => setConfirm(null)}
      />
    </>
  );
}
