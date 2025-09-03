import { useState, createContext, useContext, useCallback, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import Profiles from './pages/Profiles';
import Proxies from './pages/Proxies';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import { AppContextProvider } from './context/AppContext';
import ToastContainer from './components/notifications/ToastContainer';

// Extend Window interface to include Electron and Node.js types
interface CustomWindow extends Window {
  // Allow require in the renderer process
  require: NodeRequire;
  
  // Electron specific APIs
  electron?: {
    onUpdateAvailable: (callback: () => void) => () => void;
    onUpdateDownloaded: (callback: () => void) => () => void;
    installUpdate: () => void;
  };
  
  // Add this to fix TypeScript errors for process
  process?: {
    env: {
      NODE_ENV: string;
      [key: string]: string | undefined;
    };
  };
}

declare const window: CustomWindow;

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && 
  typeof window.require === 'function' && 
  window.require('electron');

// Update notification component type
interface UpdateNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
}

// Only import Electron-specific components when in Electron
let UpdateNotification: React.FC<UpdateNotificationProps> = ({ isOpen, onClose, onInstall }) => 
  isOpen ? (
    <div className="fixed bottom-4 right-4 bg-wsb-dark-panel p-4 rounded-lg shadow-lg z-50">
      <p className="text-wsb-text">Update available! Restart the app to install.</p>
      <div className="flex justify-end mt-2 space-x-2">
        <button 
          onClick={onClose}
          className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded text-wsb-text"
        >
          Later
        </button>
        <button 
          onClick={onInstall}
          className="px-3 py-1 text-sm bg-wsb-primary hover:bg-blue-700 rounded text-white"
        >
          Restart & Install
        </button>
      </div>
    </div>
  ) : null;

// Toast notification type
export type ToastType = 'success' | 'error' | 'info' | 'warning';

// Toast notification interface
export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

// Toast context interface
interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

// Create toast context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast context hook
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function App() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Listen for update events from Electron
  useEffect(() => {
    if (isElectron && window.electron) {
      const cleanup1 = window.electron.onUpdateAvailable(() => {
        setUpdateAvailable(true);
      });

      const cleanup2 = window.electron.onUpdateDownloaded(() => {
        setUpdateDownloaded(true);
      });

      return () => {
        if (cleanup1) cleanup1();
        if (cleanup2) cleanup2();
      };
    }
  }, []);

  // Add toast notification
  const addToast = useCallback(({ type, title, message, duration = 3000 }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 11);
    setToasts((prevToasts) => [...prevToasts, { id, type, title, message, duration }]);

    // Auto-remove toast after duration
    if (duration !== Infinity) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  // Remove toast notification
  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <AppContextProvider>
      <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
        <div className="flex h-screen overflow-hidden bg-wsb-dark-base">
          {/* Sidebar */}
          <Sidebar />

          {/* Main content */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/tasks/:id" element={<TaskDetail />} />
                <Route path="/profiles" element={<Profiles />} />
                <Route path="/proxies" element={<Proxies />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>

          {/* Update notification - only shown in Electron */}
          {isElectron && (updateAvailable || updateDownloaded) && (
            <UpdateNotification
              isOpen={updateAvailable}
              onClose={() => setUpdateAvailable(false)}
              onInstall={() => {
                if (window.electron) {
                  window.electron.installUpdate();
                }
                setUpdateAvailable(false);
                setUpdateDownloaded(false);
              }}
            />
          )}

          {/* Toast notifications */}
          <ToastContainer />
        </div>
      </ToastContext.Provider>
    </AppContextProvider>
  );
}

export default App;
