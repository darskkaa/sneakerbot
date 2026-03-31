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
  'radial-gradient(ellipse 60% 45% at 10% 15%, rgba(99,102,241,0.18) 0%, transparent 65%),' +
  'radial-gradient(ellipse 50% 50% at 90% 85%, rgba(16,185,129,0.12) 0%, transparent 65%),' +
  'radial-gradient(ellipse 40% 35% at 75% 10%, rgba(139,92,246,0.10) 0%, transparent 55%),' +
  'radial-gradient(ellipse 45% 40% at 25% 90%, rgba(99,102,241,0.08) 0%, transparent 55%),' +
  'radial-gradient(ellipse 30% 30% at 50% 50%, rgba(99,102,241,0.04) 0%, transparent 60%)';

/** Shared animated background layer — gradient + particles */
function AnimatedBackground() {
  return (
    <>
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ background: MESH_GRADIENT, zIndex: 0 }}
      />
      <ParticlesWaves />
    </>
  );
}

function AuthLayout() {
  return (
    <div className="h-screen overflow-hidden relative" style={{ backgroundColor: '#030712' }}>
      <AnimatedBackground />
      <div className="flex h-full w-full relative" style={{ zIndex: 2 }}>
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
                background: 'rgba(12,18,35,0.85)',
                backdropFilter: 'blur(40px) saturate(200%)',
                WebkitBackdropFilter: 'blur(40px) saturate(200%)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 80px -20px rgba(99,102,241,0.10)',
                color: '#f8fafc',
              },
            }}
          />
        </ToastContext.Provider>
      </AppContextProvider>
    </AuthProvider>
  );
}

export default App;
