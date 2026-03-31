import { createContext, useContext, useCallback } from 'react';
import ParticlesWaves from './components/common/ParticlesWaves';
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

const MESH_GRADIENT =
  'radial-gradient(ellipse 55% 40% at 12% 18%, rgba(99,102,241,0.14) 0%, transparent 70%),' +
  'radial-gradient(ellipse 45% 45% at 88% 80%, rgba(16,185,129,0.09) 0%, transparent 70%),' +
  'radial-gradient(ellipse 38% 32% at 72% 8%,  rgba(245,158,11,0.07)  0%, transparent 60%),' +
  'radial-gradient(ellipse 40% 35% at 30% 90%, rgba(99,102,241,0.06)  0%, transparent 60%)';

function AuthLayout() {
  return (
    <div className="h-screen overflow-hidden relative" style={{ backgroundColor: '#060b16' }}>
      {/* Static ambient gradient */}
      <div
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, background: MESH_GRADIENT, zIndex: 0, pointerEvents: 'none' }}
      />
      {/* Animated particle waves */}
      <ParticlesWaves />
      {/* All app content — sits above particles */}
      <div className="flex h-full w-full" style={{ position: 'relative', zIndex: 2 }}>
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
              style: {
                background: 'rgba(255,255,255,0.07)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                color: 'hsl(210, 40%, 98%)',
              },
            }}
          />
        </ToastContext.Provider>
      </AppContextProvider>
    </AuthProvider>
  );
}

export default App;
