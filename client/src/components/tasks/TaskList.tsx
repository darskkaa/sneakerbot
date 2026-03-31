import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  EyeIcon, 
  PauseIcon, 
  PlayIcon, 
  TrashIcon,
  PlusIcon,
  ArrowPathIcon,
  CheckIcon,
  ExclamationCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../App';
import { LoadingSpinner } from '../common';

// Type guard for profile object with name
function isProfileObjWithName(profile: unknown): profile is { name: string } {
  return typeof profile === 'object' && profile !== null && 'name' in profile && typeof (profile as any).name === 'string';
}

interface TaskListProps {
  onAddTask: () => void;
}

interface Task {
  id: number;
  status: "idle" | "running" | "success" | "error";
  product?: {
    name?: string;
    sku?: string;
  };
  sizes?: string[];
  size?: string;
  profile?: string;
  [key: string]: any;
}

export default function TaskList({ onAddTask }: TaskListProps) {
  const navigate = useNavigate();
  const { tasks, updateTask, deleteTask, loading } = useAppContext();
  const { addToast } = useToast();
  
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);
  
  // Handle task selection
  const toggleTaskSelection = (taskId: number) => {
    if (selectedTasks.includes(taskId)) {
      setSelectedTasks(selectedTasks.filter(id => id !== taskId));
    } else {
      setSelectedTasks([...selectedTasks, taskId]);
    }
  };
  
  // Select/deselect all tasks
  const toggleSelectAll = () => {
    if (selectedTasks.length === tasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(tasks.map(task => task.id));
    }
  };
  
  // Toggle task status (start/pause monitoring)
  const toggleTaskStatus = async (taskId: number) => {
    setActionInProgress(taskId);
    
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      const newStatus = task.status === 'running' ? 'idle' : 'running';
      
      await updateTask(taskId, { status: newStatus });
      
      addToast({
        type: 'success',
        title: newStatus === 'running' ? 'Monitoring Started' : 'Monitoring Paused',
        message: newStatus === 'running' 
          ? `Now monitoring for ${task.product?.name || task.product?.sku || task.sku}` 
          : `Paused monitoring for ${task.product?.name || task.product?.sku || task.sku}`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error toggling task status:', error);
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: 'Failed to update task status',
        duration: 5000,
      });
    } finally {
      setActionInProgress(null);
    }
  };
  
  // Delete a task
  const handleDeleteTask = async (taskId: number) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    setActionInProgress(taskId);
    
    try {
      await deleteTask(taskId);
      
      addToast({
        type: 'success',
        title: 'Task Deleted',
        message: 'Task was successfully deleted',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete the task',
        duration: 5000,
      });
    } finally {
      setActionInProgress(null);
    }
  };
  
  // Delete selected tasks
  const deleteSelectedTasks = async () => {
    if (selectedTasks.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedTasks.length} selected tasks?`)) return;
    
    try {
      // Delete tasks sequentially to avoid overwhelming the API
      for (const taskId of selectedTasks) {
        setActionInProgress(taskId);
        await deleteTask(taskId);
      }
      
      addToast({
        type: 'success',
        title: 'Tasks Deleted',
        message: `Successfully deleted ${selectedTasks.length} tasks`,
        duration: 3000,
      });
      
      setSelectedTasks([]);
    } catch (error) {
      console.error('Error deleting selected tasks:', error);
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete one or more tasks',
        duration: 5000,
      });
    } finally {
      setActionInProgress(null);
    }
  };
  
  // Start all selected tasks
  const startSelectedTasks = async () => {
    if (selectedTasks.length === 0) return;
    
    try {
      for (const taskId of selectedTasks) {
        setActionInProgress(taskId);
        await updateTask(taskId, { status: 'running' });
      }
      
      addToast({
        type: 'success',
        title: 'Tasks Started',
        message: `Started monitoring for ${selectedTasks.length} tasks`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error starting selected tasks:', error);
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: 'Failed to start one or more tasks',
        duration: 5000,
      });
    } finally {
      setActionInProgress(null);
    }
  };
  
  // Pause all selected tasks
  const pauseSelectedTasks = async () => {
    if (selectedTasks.length === 0) return;
    
    try {
      for (const taskId of selectedTasks) {
        setActionInProgress(taskId);
        await updateTask(taskId, { status: 'idle' });
      }
      
      addToast({
        type: 'success',
        title: 'Tasks Paused',
        message: `Paused ${selectedTasks.length} tasks`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error pausing selected tasks:', error);
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: 'Failed to pause one or more tasks',
        duration: 5000,
      });
    } finally {
      setActionInProgress(null);
    }
  };
  
  // Navigate to task detail page
  const viewTaskDetails = (taskId: number) => {
    navigate(`/tasks/${taskId}`);
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'idle':
        return <ClockIcon className="h-5 w-5 text-wsb-text-secondary" />;
      case 'running':
        return <ArrowPathIcon className="h-5 w-5 text-indigo-400 animate-spin" />;
      case 'ready':
        return <CheckIcon className="h-5 w-5 text-yellow-400" />;
      case 'success':
        return <CheckIcon className="h-5 w-5 text-green-400" />;
      case 'error':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-400" />;
      default:
        return <ClockIcon className="h-5 w-5 text-wsb-text-secondary" />;
    }
  };
  
  if (loading?.tasks) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-wsb-dark-panel mb-4">
          <ClockIcon className="h-8 w-8 text-wsb-text-secondary" />
        </div>
        <h2 className="text-xl font-medium text-wsb-text mb-2">No tasks yet</h2>
        <p className="text-wsb-text-secondary mb-6">
          Create your first task to start monitoring products
        </p>
        <button 
          className="btn-primary"
          onClick={onAddTask}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Task
        </button>
      </div>
    );
  }
  
  return (
    <div>
      {/* Bulk actions */}
      {selectedTasks.length > 0 && (
        <div className="mb-4 p-3 bg-wsb-dark-panel rounded-lg flex items-center justify-between">
          <div className="text-sm text-wsb-text-secondary">
            {selectedTasks.length} {selectedTasks.length === 1 ? 'task' : 'tasks'} selected
          </div>
          <div className="flex space-x-3">
            <button
              className="btn-secondary btn-sm"
              onClick={startSelectedTasks}
            >
              <PlayIcon className="h-4 w-4 mr-1" />
              Start All
            </button>
            <button
              className="btn-secondary btn-sm"
              onClick={pauseSelectedTasks}
            >
              <PauseIcon className="h-4 w-4 mr-1" />
              Pause All
            </button>
            <button
              className="btn-danger btn-sm"
              onClick={deleteSelectedTasks}
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Delete
            </button>
          </div>
        </div>
      )}
      
      {/* Task table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-gray-800">
            <tr>
              <th scope="col" className="px-3 py-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-wsb-primary focus:ring-wsb-primary focus:ring-opacity-25"
                  checked={selectedTasks.length === tasks.length && tasks.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-wsb-text-secondary uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-wsb-text-secondary uppercase tracking-wider">Product</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-wsb-text-secondary uppercase tracking-wider">Site</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-wsb-text-secondary uppercase tracking-wider">Size</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-wsb-text-secondary uppercase tracking-wider">Profile</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-wsb-text-secondary uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-wsb-dark-panel divide-y divide-gray-800">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-800">
                <td className="px-3 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-wsb-primary focus:ring-wsb-primary focus:ring-opacity-25"
                    checked={selectedTasks.includes(task.id)}
                    onChange={() => toggleTaskSelection(task.id)}
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {getStatusIcon(task.status)}
                    </div>
                    <div className="ml-2 text-xs text-wsb-text-secondary">
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-wsb-text">
                    {task.product?.name || 'Unnamed Product'}
                  </div>
                  <div className="text-xs text-wsb-text-secondary">
                    {task.product?.sku || 'No SKU'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-wsb-text">
  {task.site}
</td>
<td className="px-6 py-4 whitespace-nowrap text-sm text-wsb-text">
  {task.size || 'Any'}
</td>
<td className="px-6 py-4 whitespace-nowrap text-sm text-wsb-text">
  {isProfileObjWithName(task.profile) ? (task.profile.name || 'None') : (task.profile || 'None')}
</td>
<td className="px-6 py-4 whitespace-nowrap text-right text-sm">
  <div className="flex justify-end space-x-3">
    <button
      onClick={() => toggleTaskStatus(task.id)}
      disabled={actionInProgress === task.id}
      className="text-wsb-text-secondary hover:text-wsb-primary"
      aria-label={task.status === 'running' ? 'Pause task' : 'Start task'}
    >
      {actionInProgress === task.id ? (
        <LoadingSpinner size="sm" />
      ) : task.status === 'running' ? (
        <PauseIcon className="h-5 w-5" />
      ) : (
        <PlayIcon className="h-5 w-5" />
      )}
    </button>
    <button
      onClick={() => viewTaskDetails(task.id)}
      className="text-wsb-text-secondary hover:text-wsb-primary"
      aria-label="View task details"
    >
      <EyeIcon className="h-5 w-5" />
    </button>
    <button
      onClick={() => handleDeleteTask(task.id)}
      disabled={actionInProgress === task.id}
      className="text-wsb-text-secondary hover:text-wsb-error"
      aria-label="Delete task"
    >
      {actionInProgress === task.id ? (
        <LoadingSpinner size="sm" />
      ) : (
        <TrashIcon className="h-5 w-5" />
      )}
    </button>
  </div>
</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
