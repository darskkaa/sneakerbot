import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  ClockIcon, 
  TagIcon, 
  GlobeAltIcon,
  CreditCardIcon,
  CubeIcon,
  PauseIcon,
  PlayIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../App';
import { LoadingSpinner } from '../components/common';
import ProductMonitor from '../components/tasks/ProductMonitor';
import { Task } from '../types/models';

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  let bgColor = 'bg-gray-700';
  let textColor = 'text-wsb-text-secondary';
  
  switch (status) {
    case 'idle':
      bgColor = 'bg-gray-700';
      textColor = 'text-wsb-text-secondary';
      break;
    case 'monitoring':
      bgColor = 'bg-blue-900';
      textColor = 'text-blue-100';
      break;
    case 'ready':
      bgColor = 'bg-yellow-900';
      textColor = 'text-yellow-100';
      break;
    case 'running':
      bgColor = 'bg-indigo-900';
      textColor = 'text-indigo-100';
      break;
    case 'success':
      bgColor = 'bg-green-900';
      textColor = 'text-green-100';
      break;
    case 'error':
      bgColor = 'bg-red-900';
      textColor = 'text-red-100';
      break;
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
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
    
    if (window.confirm('Are you sure you want to delete this task?')) {
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
        <h2 className="text-xl font-medium text-wsb-text mb-2">
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
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-wsb-text">Task Details</h1>
            <p className="text-sm text-wsb-text-secondary">SKU: {task.product?.sku || 'N/A'}</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            className="btn-secondary"
            onClick={toggleTaskStatus}
          >
            {task.status === 'monitoring' || task.status === 'running' ? (
              <>
                <PauseIcon className="h-5 w-5 mr-2" />
                Pause
              </>
            ) : (
              <>
                <PlayIcon className="h-5 w-5 mr-2" />
                Resume
              </>
            )}
          </button>
          
          <button
            className="btn-danger"
            onClick={handleDeleteTask}
          >
            <TrashIcon className="h-5 w-5 mr-2" />
            Delete
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Task Info Card */}
        <div className="card md:col-span-1">
          <h3 className="text-lg font-medium text-wsb-text">{task.product?.name || 'Product Name N/A'}</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center text-wsb-text-secondary mb-2">
                <GlobeAltIcon className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Site</span>
              </div>
              <p className="text-wsb-text ml-7">{task.site}</p>
            </div>
            
            <div>
              <div className="flex items-center text-wsb-text-secondary mb-2">
                <CubeIcon className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Product</span>
              </div>
              <p className="text-wsb-text ml-7 break-all">
                {task.product?.name || 'N/A'}
              </p>
              <p className="text-wsb-text-secondary text-sm ml-7">
                SKU: {task.product?.sku || 'N/A'}
              </p>
              <p className="text-wsb-text-secondary text-sm ml-7 break-all">
                URL: {task.productUrl}
              </p>
            </div>
            
            <div>
              <div className="flex items-center text-wsb-text-secondary mb-2">
                <TagIcon className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Size Range</span>
              </div>
              <p className="text-wsb-text ml-7">
                {task.size || 'Any Size'}
              </p>
            </div>
            
            <div>
              <div className="flex items-center text-wsb-text-secondary mb-2">
                <CreditCardIcon className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Profile</span>
              </div>
              <p className="text-wsb-text ml-7">
                {task.profile || 'N/A'}
              </p>
            </div>
            
            <div>
              <div className="flex items-center text-wsb-text-secondary mb-2">
                <ClockIcon className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Status</span>
              </div>
              <div className="flex items-center ml-7">
                <StatusBadge status={task.status} />
                <span className="ml-2 text-wsb-text-secondary text-sm">
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
            sku={task.product?.sku || task.sku || ''} // Use task.sku as fallback if product.sku is not available
            site={task.site}
            autoCheckout={true}
            taskId={task.id} // Added missing taskId prop
          />
        </div>
      </div>
      
      {/* Task Log */}
      <div className="card">
        <h3 className="text-lg font-medium text-wsb-text mb-4">Task Activity Log</h3>
        
        <div className="bg-gray-900 rounded-lg p-4 max-h-60 overflow-y-auto font-mono text-sm">
          {task.logs && task.logs.length > 0 && task.status !== 'idle' ? (
            <ul className="space-y-2">
              {task.logs?.map((log, index) => (
                <li key={index} className="border-b border-gray-800 pb-2">
                  <span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                  <span className={`
                    ${log.type === 'info' ? 'text-blue-400' : ''}
                    ${log.type === 'success' ? 'text-green-400' : ''}
                    ${log.type === 'warning' ? 'text-yellow-400' : ''}
                    ${log.type === 'error' ? 'text-red-400' : ''}
                  `}>
                    {log.type.toUpperCase()}
                  </span>:{' '}
                  <span className="text-wsb-text">{log.message}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-wsb-text-secondary italic">No activity logged yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
