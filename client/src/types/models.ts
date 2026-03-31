// src/types/models.ts

/**
 * Represents a single task within the application.
 */
export interface Task {
  id: number;
  site: string;
  productUrl: string;
  sku: string;
  size: string;
  status: 'idle' | 'running' | 'success' | 'error' | 'monitoring' | 'ready';
  message?: string;
  createdAt: Date;
  updatedAt: Date;
  profile?: string; // ID or name of the profile used
  product?: { // Optional product details, if fetched separately or part of the task object
    name?: string;
    sku?: string;
    // any other product specific details
  };
  name?: string; // Sometimes task might have its own name/alias given by user
  logs?: Array<{ timestamp: string; message: string; type: 'info' | 'error' | 'warning' | 'success' }>;
  // Add any other relevant fields for a task
}

// You can add other shared model interfaces here in the future,
// for example: Profile, Proxy, Settings, etc.
