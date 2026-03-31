import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import TaskWizard from '../components/tasks/TaskWizard';
import TaskList from '../components/tasks/TaskList';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../App';

export default function Tasks() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const { addToast } = useToast();
  
  // Open task wizard
  const openTaskWizard = () => {
    setIsWizardOpen(true);
  };
  
  // Close task wizard
  const closeTaskWizard = () => {
    setIsWizardOpen(false);
  };
  
  // Handle task creation success
  const handleTaskCreated = (count: number) => {
    setIsWizardOpen(false);
    
    addToast({
      type: 'success',
      title: 'Tasks Created',
      message: `Successfully created ${count} ${count === 1 ? 'task' : 'tasks'}.`,
      duration: 5000,
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-wsb-text">Tasks</h1>
        <button 
          className="btn-primary"
          onClick={openTaskWizard}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Task
        </button>
      </div>
      
      <TaskList onAddTask={openTaskWizard} />
      
      {isWizardOpen && (
        <TaskWizard
          isOpen={isWizardOpen}
          onClose={closeTaskWizard}
          onTaskCreated={handleTaskCreated}
        />
      )}
    </div>
  );
}
