import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  actionText?: string;
  onAction?: () => void;
  actionType?: 'primary' | 'secondary';
}

export default function EmptyState({
  title,
  description,
  icon: Icon,
  actionText,
  onAction,
  actionType = 'primary'
}: EmptyStateProps) {
  const IconComponent = Icon || PlusIcon;
  
  return (
    <div className="flex flex-col items-center justify-center text-center p-12">
      <div className="rounded-full bg-secondary p-3 mb-4">
        <IconComponent className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-5">{description}</p>
      
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className={`btn-${actionType}`}
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
