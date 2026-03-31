import { createContext, useContext, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import Profiles from './pages/Profiles';
import Proxies from './pages/Proxies';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import { AppContextProvider } from './context/AppContext';
import LoadingSpinner from './components/common/LoadingSpinner';
import { Toaster, toast as sonnerToast } from 'sonner';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AuthLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-[1400px] mx-auto">
          <Routes>
            <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/tasks" element={<RequireAuth><Tasks /></RequireAuth>} />
            <Route path="/tasks/:id" element={<RequireAuth><TaskDetail /></RequireAuth>} />
            <Route path="/profiles" element={<RequireAuth><Profiles /></RequireAuth>} />
            <Route path="/proxies" element={<RequireAuth><Proxies /></RequireAuth>} />
            <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  const addToast = useCallback(({ type, title, message, duration = 4000 }: Omit<Toast, 'id'>) => {
    const options = { description: message, duration };
    switch (type) {
      case 'success': sonnerToast.success(title, options); break;
      case 'error':   sonnerToast.error(title, options); break;
      case 'warning': sonnerToast.warning(title, options); break;
      default:        sonnerToast(title, options); break;
    }
  }, []);

  const removeToast = useCallback((_id: string) => {}, []);

  return (
    <AuthProvider>
      <AppContextProvider>
        <ToastContext.Provider value={{ addToast, removeToast }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/*" element={<AuthLayout />} />
          </Routes>
          <Toaster
            position="bottom-right"
            theme="dark"
            toastOptions={{
              classNames: {
                toast: 'bg-card border border-border text-foreground shadow-lg',
                title: 'text-foreground font-medium',
                description: 'text-muted-foreground',
              },
            }}
          />
        </ToastContext.Provider>
      </AppContextProvider>
    </AuthProvider>
  );
}

export default App;
