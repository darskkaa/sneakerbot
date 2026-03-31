import { AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  description,
  confirmLabel = 'Confirm',
  destructive = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm mx-4 bg-card border border-border rounded-lg shadow-2xl p-5 animate-fade-in">
        <div className="flex items-start gap-3 mb-4">
          <div className={cn('flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center', destructive ? 'bg-destructive/15' : 'bg-warning/15')}>
            <AlertTriangle className={cn('w-4 h-4', destructive ? 'text-destructive' : 'text-warning')} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <button onClick={onCancel} className="btn-secondary btn-sm">Cancel</button>
          <button
            onClick={onConfirm}
            className={cn('btn-sm', destructive ? 'btn-destructive' : 'btn-primary')}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
