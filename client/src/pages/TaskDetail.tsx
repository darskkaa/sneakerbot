import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Tag,
  Globe,
  CreditCard,
  Package,
  Pause,
  Play,
  Trash2,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../App';
import { LoadingSpinner } from '../components/common';
import ProductMonitor from '../components/tasks/ProductMonitor';
import { ConfirmDialog } from '../components/ui/confirm-dialog';
import { Task } from '../types/models';

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  let badgeClass = 'badge badge-idle';

  switch (status) {
    case 'idle':
      badgeClass = 'badge badge-idle';
      break;
    case 'monitoring':
      badgeClass = 'badge badge-monitoring';
      break;
    case 'ready':
      badgeClass = 'badge badge-ready';
      break;
    case 'running':
      badgeClass = 'badge badge-running';
      break;
    case 'success':
      badgeClass = 'badge badge-success';
      break;
    case 'error':
      badgeClass = 'badge badge-error';
      break;
  }

  return (
    <span className={badgeClass}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tasks, getTask, deleteTask, updateTask } = useAppContext();
  const { addToast } = useToast();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load task details
  useEffect(() => {
    const loadTask = async () => {
      setLoading(true);
      try {
        // First check if we have the task in the tasks array
        const existingTask = tasks.find(t => t.id.toString() === id);

        if (existingTask) {
          setTask(existingTask);
        } else {
          // If not found in the array, try to fetch it individually
          const fetchedTask = await getTask(parseInt(id || '0'));
          setTask(fetchedTask || null);
        }
      } catch (err) {
        console.error('Error loading task:', err);
        setError('Failed to load task details');
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, [id, tasks, getTask]);

  // Handle task deletion
  const handleDeleteTask = async () => {
    if (!task) return;

    try {
      await deleteTask(task.id);
      addToast({
        type: 'success',
        title: 'Task Deleted',
        message: 'Task was successfully deleted',
        duration: 3000,
      });
      navigate('/tasks');
    } catch (err) {
      console.error('Error deleting task:', err);
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete the task',
        duration: 5000,
      });
    }
  };

  // Toggle task status (pause/resume)
  const toggleTaskStatus = async () => {
    if (!task) return;

    try {
      const newStatus = task.status === 'monitoring' ? 'idle' : 'monitoring';
      const updatedTaskData = await updateTask(task.id, { status: newStatus });
      setTask(updatedTaskData || null);

      addToast({
        type: 'success',
        title: newStatus === 'monitoring' ? 'Task Resumed' : 'Task Paused',
        message: newStatus === 'monitoring' ? 'Task monitoring has been resumed' : 'Task has been paused',
        duration: 3000,
      });
    } catch (err) {
      console.error('Error updating task status:', err);
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update task status',
        duration: 5000,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-medium text-foreground mb-2">
          {error || 'Task not found'}
        </h2>
        <button
          className="btn-secondary mt-4"
          onClick={() => navigate('/tasks')}
        >
          Go Back to Tasks
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            className="btn-icon"
            onClick={() => navigate('/tasks')}
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Task Details</h1>
            <p className="text-sm text-muted-foreground">SKU: {task.product?.sku || 'N/A'}</p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            className="btn-secondary"
            onClick={toggleTaskStatus}
          >
            {task.status === 'monitoring' || task.status === 'running' ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Resume
              </>
            )}
          </button>

          <button
            className="btn-destructive"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Task Info Card */}
        <div className="card md:col-span-1">
          <h3 className="text-lg font-medium text-foreground">{task.product?.name || 'Product Name N/A'}</h3>

          <div className="space-y-4">
            <div>
              <div className="flex items-center text-muted-foreground mb-2">
                <Globe className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Site</span>
              </div>
              <p className="text-foreground ml-7">{task.site}</p>
            </div>

            <div>
              <div className="flex items-center text-muted-foreground mb-2">
                <Package className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Product</span>
              </div>
              <p className="text-foreground ml-7 break-all">
                {task.product?.name || 'N/A'}
              </p>
              <p className="text-muted-foreground text-sm ml-7">
                SKU: {task.product?.sku || 'N/A'}
              </p>
              <p className="text-muted-foreground text-sm ml-7 break-all">
                URL: {task.productUrl}
              </p>
            </div>

            <div>
              <div className="flex items-center text-muted-foreground mb-2">
                <Tag className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Size Range</span>
              </div>
              <p className="text-foreground ml-7">
                {task.size || 'Any Size'}
              </p>
            </div>

            <div>
              <div className="flex items-center text-muted-foreground mb-2">
                <CreditCard className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Profile</span>
              </div>
              <p className="text-foreground ml-7">
                {task.profile || 'N/A'}
              </p>
            </div>

            <div>
              <div className="flex items-center text-muted-foreground mb-2">
                <Clock className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Status</span>
              </div>
              <div className="flex items-center ml-7">
                <StatusBadge status={task.status} />
                <span className="ml-2 text-muted-foreground text-sm">
                  {task.message || ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Monitor */}
        <div className="md:col-span-2">
          <ProductMonitor
            productUrl={task.productUrl}
            sku={task.product?.sku || task.sku || ''}
            site={task.site}
            autoCheckout={true}
            taskId={task.id}
          />
        </div>
      </div>

      {/* Task Log */}
      <div className="card">
        <h3 className="text-lg font-medium text-foreground mb-4">Task Activity Log</h3>

        <div className="glass rounded-xl p-4 max-h-60 overflow-y-auto font-mono text-sm">
          {task.logs && task.logs.length > 0 && task.status !== 'idle' ? (
            <ul className="space-y-2">
              {task.logs?.map((log, index) => (
                <li key={index} className="border-b border-[rgba(255,255,255,0.06)] pb-2">
                  <span className="text-muted-foreground">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                  <span className={`
                    ${log.type === 'info' ? 'text-primary' : ''}
                    ${log.type === 'success' ? 'text-success' : ''}
                    ${log.type === 'warning' ? 'text-warning' : ''}
                    ${log.type === 'error' ? 'text-destructive' : ''}
                  `}>
                    {log.type.toUpperCase()}
                  </span>:{' '}
                  <span className="text-foreground">{log.message}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground italic">No activity logged yet.</p>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Task"
        description="This task will be permanently removed."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDeleteTask}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
