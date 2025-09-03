import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task } from '../types/models';

// Define types for our context
interface Profile {
  id: string;
  name: string;
  shippingInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billingInfo: {
    cardholderName: string;
    cardNumber: string; // This should be encrypted in actual implementation
    expiryMonth: string;
    expiryYear: string;
    cvv: string; // This should be encrypted in actual implementation
    useShippingAsBilling: boolean;
  };
}

interface Proxy {
  id: string;
  name: string;
  host: string;
  port: number;
  username?: string;
  password?: string;
  type: 'http' | 'https' | 'socks4' | 'socks5';
  status: 'untested' | 'working' | 'failed' | 'Healthy' | 'Slow' | 'Banned' | 'Unknown';
  lastTested?: Date;
}

interface Settings {
  captchaProvider: 'manual' | '2captcha' | 'capmonster' | 'aycd';
  captchaApiKey?: string;
  discordWebhook?: string;
  slackWebhook?: string;
  defaultCheckoutDelay: number;
  riskMode: 'safe' | 'balanced' | 'fast';
  autoUpdateEnabled: boolean;
}

interface DashboardStats {
  totalCheckouts: number;
  successRate: number; // percentage
  activeTasks: number;
  failedAttempts: number;
  // Potentially add more stats as needed
}

export interface ActivityLog {
  id: string; // or number
  type: 'checkout_success' | 'task_created' | 'proxy_failed' | 'profile_updated' | 'settings_changed' | 'success' | 'failure' | 'info' | 'warning'; // Example types
  content: string;
  timestamp: string; // ISO string or Date object
  user?: string; // Optional: if actions are user-specific
  relatedId?: string | number; // Optional: ID of related task, profile, proxy etc.
}

interface AppContextType {
  tasks: Task[];
  profiles: Profile[];
  proxies: Proxy[];
  settings: Settings;
  stats: DashboardStats | null;
  activities: ActivityLog[];
  loading: {
    tasks: boolean;
    profiles: boolean;
    proxies: boolean;
    settings: boolean;
    stats: boolean; // Added for dashboard stats loading
    activities: boolean; // Added for activities loading
  };
  addTask: (task: Omit<Task, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: number, updates: Partial<Task>) => Promise<Task | undefined>;
  deleteTask: (id: number) => Promise<void>;
  startTask: (id: number) => Promise<void>;
  stopTask: (id: number) => Promise<void>;
  addProfile: (profile: Omit<Profile, 'id'>) => Promise<void>;
  updateProfile: (id: string, updates: Partial<Profile>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  addProxy: (proxy: Omit<Proxy, 'id' | 'status' | 'lastTested'>) => Promise<void>;
  updateProxy: (id: string, updates: Partial<Proxy>) => Promise<void>;
  deleteProxy: (id: string) => Promise<void>;
  testProxy: (id: string) => Promise<void>;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  getTask: (id: number) => Promise<Task | undefined>; // For fetching a single task
}

// Create the context with a default value
const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to get default settings
const getDefaultSettings = (): Settings => ({
  captchaProvider: 'manual',
  defaultCheckoutDelay: 3000,
  riskMode: 'balanced',
  autoUpdateEnabled: true,
  // Ensure all non-optional Settings fields have defaults
  captchaApiKey: undefined, // Or a default empty string if appropriate
  discordWebhook: undefined,
  slackWebhook: undefined,
});

// Placeholder for fetching/updating stats and activities
const fetchDashboardStats = async (): Promise<DashboardStats> => {
  // Simulate API call or fetch from window.api if available
  console.log('Fetching dashboard stats...');
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
  // In a real app, this might be: await window.api.getDashboardStats();
  return {
    totalCheckouts: 120,
    successRate: 85,
    activeTasks: 5,
    failedAttempts: 15,
  };
};

const fetchActivities = async (): Promise<ActivityLog[]> => {
  // Simulate API call or fetch from window.api if available
  console.log('Fetching activities...');
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
  // In a real app, this might be: await window.api.getActivities();
  return [
    { id: '1', type: 'checkout_success', content: 'Checkout for Yeezy Boost 350', timestamp: new Date().toISOString() },
    { id: '2', type: 'task_created', content: 'New task created for Supreme drop', timestamp: new Date().toISOString() },
  ];
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};

// Provider component that wraps the app
interface AppContextProviderProps {
  children: ReactNode;
}

export const AppContextProvider = ({ children }: AppContextProviderProps): JSX.Element => {
  // State for all our data
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [proxies, setProxies] = useState<Proxy[]>([]);
  const [settings, setSettings] = useState<Settings>(getDefaultSettings()); // Initialize with defaults
  const [stats, setStats] = useState<DashboardStats | null>(null); // Added stats state
  const [activities, setActivities] = useState<ActivityLog[]>([]); // Added activities state
  const [loading, setLoading] = useState({
    tasks: true,
    profiles: true,
    proxies: true,
    settings: true,
    stats: true, // Added stats loading state
    activities: true // Added activities loading state
  });

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load tasks
        setLoading(prev => ({ ...prev, tasks: true }));
        const tasksData = await (window.api.getAllTasks?.() ?? []);
        setTasks(tasksData);
        setLoading(prev => ({ ...prev, tasks: false }));
        
        // Load profiles
        setLoading(prev => ({ ...prev, profiles: true }));
        const profilesData = await (window.api.getProfiles?.() ?? []);
        setProfiles(profilesData);
        setLoading(prev => ({ ...prev, profiles: false }));
        
        // Load proxies
        setLoading(prev => ({ ...prev, proxies: true }));
        const proxiesData = await (window.api.getProxies?.() ?? []);
        setProxies(proxiesData);
        setLoading(prev => ({ ...prev, proxies: false }));
        
        // Load settings
        setLoading(prev => ({ ...prev, settings: true }));
        // Load settings
        setLoading(prev => ({ ...prev, settings: true }));
        if (window.api.getSettings) {
          const settingsData = await window.api.getSettings();
          if (settingsData) setSettings(settingsData); else setSettings(getDefaultSettings());
        } else {
          setSettings(getDefaultSettings()); // Fallback if API not present
        }
        setLoading(prev => ({ ...prev, settings: false }));
        
        // Load stats
        setLoading(prev => ({ ...prev, stats: true }));
        try {
          const statsData = await fetchDashboardStats();
          setStats(statsData);
        } catch (error) {
          console.error('Failed to fetch dashboard stats:', error);
          setStats(null); // Or some default error state for stats
        }
        setLoading(prev => ({ ...prev, stats: false }));
        
        // Load activities
        setLoading(prev => ({ ...prev, activities: true }));
        try {
          const activitiesData = await fetchActivities();
          setActivities(activitiesData);
        } catch (error) {
          console.error('Failed to fetch activities:', error);
          setActivities([]); // Or some default error state for activities
        }
        setLoading(prev => ({ ...prev, activities: false }));
      } catch (error) {
        console.error('Error loading data:', error);
        // Reset loading states
        setLoading({
          tasks: false,
          profiles: false,
          proxies: false,
          settings: false,
          stats: false,
          activities: false
        });
      }
    };
    
    loadData();
    
    // Set up listeners for real-time updates
    const removeTaskUpdateListener = window.api.on('task-update', (updatedTask: Task) => {
      setTasks(prevTasks => {
        const index = prevTasks.findIndex(task => task.id === updatedTask.id);
        if (index !== -1) {
          const newTasks = [...prevTasks];
          newTasks[index] = updatedTask;
          return newTasks;
        }
        return [...prevTasks, updatedTask];
      });
    });
    
    return () => {
      // Clean up listeners
      removeTaskUpdateListener?.();
    };
  }, []);

  // Functions for managing tasks
  const addTask = async (task: Omit<Task, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    try {
      let newTask = null;
      if (window.api.createTask) {
        newTask = await window.api.createTask(task);
      } else {
        // Fallback or error handling if createTask is not available
        console.error('createTask API method not found');
        // Optionally, simulate task creation for UI testing if needed
        // newTask = { ...task, id: Date.now(), status: 'idle', createdAt: new Date(), updatedAt: new Date() };
      }
      if (newTask) setTasks(prevTasks => [...prevTasks, newTask]);
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  const updateTask = async (id: number, updates: Partial<Task>) => {
    try {
      let updatedTask: Task | undefined = undefined;
      if (window.api.updateTask) {
        // Assuming window.api.updateTask itself might not return the full updated task
        // or we want to ensure our local state version is the source of truth after update.
        await window.api.updateTask(id, updates);
        setTasks(prevTasks => {
          const newTasks = prevTasks.map(t => {
            if (t.id === id) {
              updatedTask = { ...t, ...updates, updatedAt: new Date() };
              return updatedTask;
            }
            return t;
          });
          return newTasks;
        });
      } else {
        // Fallback if API is not available (e.g. web-only mode without Electron)
        setTasks(prevTasks => {
          const newTasks = prevTasks.map(t => {
            if (t.id === id) {
              updatedTask = { ...t, ...updates, updatedAt: new Date() };
              return updatedTask;
            }
            return t;
          });
          return newTasks;
        });
        console.warn('window.api.updateTask not available, updating locally.');
      }
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const deleteTask = async (id: number) => {
    try {
      if (window.api.deleteTask) await window.api.deleteTask(id);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  const startTask = async (id: number) => {
    try {
      if (window.api.startTask) await window.api.startTask(id);
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === id ? { ...task, status: 'running', updatedAt: new Date() } : task
        )
      );
    } catch (error) {
      console.error('Error starting task:', error);
      throw error;
    }
  };

  const stopTask = async (id: number) => {
    try {
      if (window.api.stopTask) await window.api.stopTask(id);
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === id ? { ...task, status: 'idle', updatedAt: new Date() } : task
        )
      );
    } catch (error) {
      console.error('Error stopping task:', error);
      throw error;
    }
  };

  // Functions for managing profiles
  const addProfile = async (profile: Omit<Profile, 'id'>) => {
    try {
      const newProfile = window.api.saveProfile ? await window.api.saveProfile(profile) : null;
      if (newProfile) setProfiles(prevProfiles => [...prevProfiles, newProfile]);
    } catch (error) {
      console.error('Error adding profile:', error);
      throw error;
    }
  };

  const updateProfile = async (id: string, updates: Partial<Profile>) => {
    try {
      if (window.api.saveProfile) await window.api.saveProfile({ id, ...updates });
      setProfiles(prevProfiles => 
        prevProfiles.map(profile => 
          profile.id === id ? { ...profile, ...updates } : profile
        )
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const deleteProfile = async (id: string) => {
    try {
      if (window.api.deleteProfile) await window.api.deleteProfile(id);
      setProfiles(prevProfiles => prevProfiles.filter(profile => profile.id !== id));
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  };

  // Functions for managing proxies
  const addProxy = async (proxy: Omit<Proxy, 'id' | 'status' | 'lastTested'>) => {
    try {
      const newProxy = window.api.saveProxy ? await window.api.saveProxy({
        ...proxy,
        status: 'untested',
      }) : null;
      if (newProxy) setProxies(prevProxies => [...prevProxies, newProxy]);
    } catch (error) {
      console.error('Error adding proxy:', error);
      throw error;
    }
  };

  const updateProxy = async (id: string, updates: Partial<Proxy>) => {
    try {
      if (window.api.saveProxy) await window.api.saveProxy({ id, ...updates });
      setProxies(prevProxies => 
        prevProxies.map(proxy => 
          proxy.id === id ? { ...proxy, ...updates } : proxy
        )
      );
    } catch (error) {
      console.error('Error updating proxy:', error);
      throw error;
    }
  };

  const deleteProxy = async (id: string) => {
    try {
      if (window.api.deleteProxy) await window.api.deleteProxy(id);
      setProxies(prevProxies => prevProxies.filter(proxy => proxy.id !== id));
    } catch (error) {
      console.error('Error deleting proxy:', error);
      throw error;
    }
  };

  // Patch testProxy to return void
  const testProxyPatched = async (id: string): Promise<void> => {
    try {
      setProxies(prevProxies => 
        prevProxies.map(proxy => 
          proxy.id === id ? { ...proxy, status: 'untested' } : proxy
        )
      );
      const result = window.api.testProxy ? await window.api.testProxy(id) : { success: false };
      setProxies(prevProxies => 
        prevProxies.map(proxy => 
          proxy.id === id ? { 
            ...proxy, 
            status: result.success ? 'working' : 'failed',
            lastTested: new Date()
          } : proxy
        )
      );
    } catch (error) {
      console.error('Error testing proxy:', error);
      setProxies(prevProxies => 
        prevProxies.map(proxy => 
          proxy.id === id ? { 
            ...proxy, 
            status: 'failed',
            lastTested: new Date()
          } : proxy
        )
      );
      throw error;
    }
  };

  // Function for updating settings
  const updateSettings = async (updates: Partial<Settings>) => {
    try {
      if (window.api.updateSettings) await window.api.updateSettings({ ...settings, ...updates });
      setSettings(prevSettings => ({ ...prevSettings, ...updates }));
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  const getTask = async (id: number): Promise<Task | undefined> => {
    try {
      if (window.api.getTask) {
        const task = await window.api.getTask(id);
        // Optionally, update the local tasks state if the fetched task is newer or not present
        if (task) {
          setTasks(prevTasks => {
            const existingIndex = prevTasks.findIndex(t => t.id === id);
            if (existingIndex !== -1) {
              const newTasks = [...prevTasks];
              newTasks[existingIndex] = task;
              return newTasks;
            }
            return [...prevTasks, task]; // Or handle as an error if task should already be in list
          });
        }
        return task;
      }
      console.warn('window.api.getTask is not available.');
      return undefined;
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error);
      throw error; // Or return undefined / handle error appropriately
    }
  };

  // Define the context value
  const contextValue = {
    tasks,
    profiles,
    proxies,
    settings, // Already initialized with getDefaultSettings()
    stats,
    activities,
    loading,
    addTask,
    updateTask,
    deleteTask,
    startTask,
    stopTask,
    addProfile,
    updateProfile,
    deleteProfile,
    addProxy,
    updateProxy,
    deleteProxy,
    testProxy: testProxyPatched, // Use the patched version
    updateSettings,
    getTask,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};
