import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    // Task Management
    startTask: (taskConfig: any) => ipcRenderer.invoke('start-task', taskConfig),
    stopTask: (taskId: number) => ipcRenderer.invoke('stop-task', taskId),
    getTaskStatus: (taskId: number) => ipcRenderer.invoke('get-task-status', taskId),
    getAllTasks: () => ipcRenderer.invoke('get-all-tasks'),
    
    // Profile Management
    saveProfile: (profile: any) => ipcRenderer.invoke('save-profile', profile),
    deleteProfile: (profileId: string) => ipcRenderer.invoke('delete-profile', profileId),
    getProfiles: () => ipcRenderer.invoke('get-profiles'),
    
    // Proxy Management
    saveProxy: (proxy: any) => ipcRenderer.invoke('save-proxy', proxy),
    deleteProxy: (proxyId: string) => ipcRenderer.invoke('delete-proxy', proxyId),
    testProxy: (proxy: any) => ipcRenderer.invoke('test-proxy', proxy),
    getProxies: () => ipcRenderer.invoke('get-proxies'),
    
    // Product Monitor
    monitorProduct: (url: string, interval: number) => ipcRenderer.invoke('monitor-product', url, interval),
    stopMonitor: (monitorId: string) => ipcRenderer.invoke('stop-monitor', monitorId),
    
    // Settings
    getSettings: () => ipcRenderer.invoke('get-settings'),
    updateSettings: (settings: any) => ipcRenderer.invoke('update-settings', settings),
    
    // App Updates
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    
    // Listeners
    on: (channel: string, callback: (...args: any[]) => void) => {
      // Whitelist channels that can be listened to
      const validChannels = [
        'task-update', 
        'monitor-update', 
        'checkout-success',
        'checkout-failure',
        'proxy-status-change',
        'update-available',
        'update-downloaded'
      ];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        const subscription = (_event: any, ...args: any[]) => callback(...args);
        ipcRenderer.on(channel, subscription);
        
        // Return a function to remove the event listener
        return () => {
          ipcRenderer.removeListener(channel, subscription);
        };
      }
      return undefined;
    }
  }
);
