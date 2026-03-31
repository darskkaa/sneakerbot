import { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, Upload } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { EmptyState, LoadingSpinner } from '../components/common';
import ProxyForm from '../components/proxies/ProxyForm';
import ProxyImporter from '../components/proxies/ProxyImporter';
import ProxyList from '../components/proxies/ProxyList';
import { useToast } from '../App';
import { cn } from '../lib/utils';

export default function Proxies() {
  const { proxies, loading, testProxy } = useAppContext();
  const { addToast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [editingProxy, setEditingProxy] = useState<any>(null);
  const [isHealthCheckRunning, setIsHealthCheckRunning] = useState(false);
  const [lastHealthCheck, setLastHealthCheck] = useState<Date | null>(null);

  const runHealthCheck = useCallback(async () => {
    if (!proxies?.length || isHealthCheckRunning) return;
    setIsHealthCheckRunning(true);
    try {
      addToast({ type: 'info', title: 'Health Check Started', message: `Testing ${proxies.length} proxies.` });
      let ok = 0, fail = 0;
      const batchSize = 5;
      for (let i = 0; i < proxies.length; i += batchSize) {
        await Promise.all(
          proxies.slice(i, i + batchSize).map(async (proxy) => {
            try { await testProxy(proxy.id); ok++; } catch { fail++; }
          })
        );
      }
      setLastHealthCheck(new Date());
      addToast({ type: 'success', title: 'Health Check Done', message: `${ok} passed, ${fail} failed.` });
    } catch {
      addToast({ type: 'error', title: 'Health Check Failed', message: 'An error occurred.' });
    } finally {
      setIsHealthCheckRunning(false);
    }
  }, [proxies, isHealthCheckRunning, testProxy, addToast]);

  useEffect(() => {
    if (!proxies?.length || lastHealthCheck) return;
    runHealthCheck();
    const interval = setInterval(runHealthCheck, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [proxies, lastHealthCheck, runHealthCheck]);

  if (loading?.proxies) {
    return <div className="flex items-center justify-center py-24"><LoadingSpinner size="lg" /></div>;
  }

  const workingCount = proxies?.filter(p => p.status === 'working').length ?? 0;
  const failedCount = proxies?.filter(p => p.status === 'failed').length ?? 0;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Proxies</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {proxies?.length ? (
              <>
                <span className="text-success">{workingCount} healthy</span>
                {failedCount > 0 && <span className="text-destructive ml-2">{failedCount} failed</span>}
                {lastHealthCheck && (
                  <span className="ml-2">· Last check {lastHealthCheck.toLocaleTimeString()}</span>
                )}
              </>
            ) : 'No proxies added'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn-secondary btn-sm gap-1.5"
            onClick={runHealthCheck}
            disabled={isHealthCheckRunning}
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isHealthCheckRunning && 'animate-spin')} />
            {isHealthCheckRunning ? 'Checking...' : 'Health Check'}
          </button>
          <button className="btn-secondary btn-sm gap-1.5" onClick={() => setIsImporterOpen(true)}>
            <Upload className="w-3.5 h-3.5" />
            Import
          </button>
          <button className="btn-primary text-xs gap-1.5" onClick={() => { setEditingProxy(null); setIsFormOpen(true); }}>
            <Plus className="w-3.5 h-3.5" />
            Add Proxy
          </button>
        </div>
      </div>

      {proxies?.length ? (
        <ProxyList proxies={proxies} onEdit={(proxy) => { setEditingProxy(proxy); setIsFormOpen(true); }} />
      ) : (
        <EmptyState
          title="No proxies yet"
          description="Add proxies to improve your success rate and avoid IP bans."
          actionText="Add Proxy"
          onAction={() => { setEditingProxy(null); setIsFormOpen(true); }}
        />
      )}

      {isFormOpen && (
        <ProxyForm isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setEditingProxy(null); }} proxy={editingProxy} />
      )}
      {isImporterOpen && (
        <ProxyImporter isOpen={isImporterOpen} onClose={() => setIsImporterOpen(false)} />
      )}
    </div>
  );
}
