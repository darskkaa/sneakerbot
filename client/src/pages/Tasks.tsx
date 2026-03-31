import { useState } from 'react';
import { Plus } from 'lucide-react';
import TaskWizard from '../components/tasks/TaskWizard';
import TaskList from '../components/tasks/TaskList';
import { useToast } from '../App';

export default function Tasks() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const { addToast } = useToast();

  const handleTaskCreated = (count: number) => {
    setIsWizardOpen(false);
    addToast({
      type: 'success',
      title: 'Tasks Created',
      message: `Successfully created ${count} ${count === 1 ? 'task' : 'tasks'}.`,
    });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your auto-checkout tasks</p>
        </div>
        <button className="btn-primary text-xs gap-1.5" onClick={() => setIsWizardOpen(true)}>
          <Plus className="w-3.5 h-3.5" />
          New Task
        </button>
      </div>

      <TaskList onAddTask={() => setIsWizardOpen(true)} />

      {isWizardOpen && (
        <TaskWizard
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          onTaskCreated={handleTaskCreated}
        />
      )}
    </div>
  );
}
