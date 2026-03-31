interface ElectronAPI {
  on: (channel: string, callback: (...args: any[]) => void) => (() => void) | undefined;
  send: (channel: string, ...args: any[]) => void;
  invoke: <T>(channel: string, ...args: any[]) => Promise<T>;
  checkForUpdates: () => void;

  // Methods used in AppContext
  getAllTasks?: () => Promise<any[]>;
  getProfiles?: () => Promise<any[]>;
  getProxies?: () => Promise<any[]>;
  getSettings?: () => Promise<any>;
  createTask?: (taskData: Omit<Task, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<Task>;
  startTask?: (taskId: number) => Promise<void>;
  updateTask?: (taskId: number, updates: any) => Promise<void>;
  deleteTask?: (taskId: number) => Promise<void>;
  stopTask?: (taskId: number) => Promise<void>;
  saveProfile?: (profile: any) => Promise<void>;
  deleteProfile?: (profileId: string) => Promise<void>;
  saveProxy?: (proxy: any) => Promise<void>;
  deleteProxy?: (proxyId: string) => Promise<void>;
  testProxy?: (proxyId: string) => Promise<any>;
  updateSettings?: (settings: any) => Promise<void>;
  getTask?: (id: number) => Promise<Task | undefined>; // Added for fetching a single task
}


declare global {
  interface Window {
    api: ElectronAPI;
  }
}

export {};
