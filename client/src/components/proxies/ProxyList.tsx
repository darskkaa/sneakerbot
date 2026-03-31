import { useState } from 'react';
import { RefreshCw, Trash2, Pencil, ChevronDown, Folder, CheckCircle2, XCircle, Clock, HelpCircle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../App';
import { LoadingSpinner } from '../common';
import { ConfirmDialog } from '../ui/confirm-dialog';
import { cn } from '../../lib/utils';

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

interface ProxyListProps {
  proxies: Proxy[];
  onEdit: (proxy: Proxy) => void;
}

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'working':
    case 'Healthy':
      return (
        <span className="badge badge-success">
          <CheckCircle2 className="w-3 h-3" />
          Healthy
        </span>
      );
    case 'failed':
    case 'Banned':
      return (
        <span className="badge badge-error">
          <XCircle className="w-3 h-3" />
          Failed
        </span>
      );
    case 'Slow':
      return (
        <span className="badge badge-warning">
          <Clock className="w-3 h-3" />
          Slow
        </span>
      );
    default:
      return (
        <span className="badge badge-idle">
          <HelpCircle className="w-3 h-3" />
          Untested
        </span>
      );
  }
};

export default function ProxyList({ proxies, onEdit }: ProxyListProps) {
  const { deleteProxy, testProxy } = useAppContext();
  const { addToast } = useToast();
  const [selected, setSelected] = useState<string[]>([]);
  const [testing, setTesting] = useState<string[]>([]);
  const [deleting, setDeleting] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const groups = proxies.reduce((acc, p) => {
    const k = p.name || 'Default Group';
    if (!acc[k]) acc[k] = [];
    acc[k].push(p);
    return acc;
  }, {} as Record<string, Proxy[]>);

  const toggleGroup = (name: string) =>
    setCollapsed(prev => ({ ...prev, [name]: !prev[name] }));

  const toggleSelect = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleTest = async (id: string) => {
    setTesting(prev => [...prev, id]);
    try {
      await testProxy(id);
      addToast({ type: 'success', title: 'Proxy Tested', message: 'Test completed' });
    } catch {
      addToast({ type: 'error', title: 'Test Failed', message: 'Could not test proxy' });
    } finally {
      setTesting(prev => prev.filter(x => x !== id));
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(prev => [...prev, id]);
    try {
      await deleteProxy(id);
      addToast({ type: 'success', title: 'Proxy Deleted', message: 'Removed successfully' });
    } catch {
      addToast({ type: 'error', title: 'Delete Failed', message: 'Could not delete proxy' });
    } finally {
      setDeleting(prev => prev.filter(x => x !== id));
      setConfirmDelete(null);
    }
  };

  const handleTestSelected = async () => {
    if (!selected.length) return;
    setTesting(prev => [...prev, ...selected]);
    let ok = 0, fail = 0;
    for (const id of selected) {
      try { await testProxy(id); ok++; } catch { fail++; }
    }
    setTesting([]);
    addToast({ type: ok > 0 ? 'success' : 'error', title: 'Batch Test Done', message: `${ok} passed, ${fail} failed` });
  };

  const handleDeleteSelected = async () => {
    if (!selected.length) return;
    setDeleting(prev => [...prev, ...selected]);
    for (const id of selected) {
      await deleteProxy(id).catch(() => {});
    }
    setDeleting([]);
    setSelected([]);
    addToast({ type: 'success', title: 'Proxies Deleted', message: `${selected.length} removed` });
  };

  return (
    <>
    <div className="space-y-3">
      {/* Bulk bar */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-primary/5 border border-primary/20 animate-fade-in">
          <span className="text-xs font-medium text-primary">{selected.length} selected</span>
          <div className="flex items-center gap-2 ml-auto">
            <button className="btn-secondary btn-sm gap-1.5" onClick={handleTestSelected} disabled={testing.length > 0}>
              <RefreshCw className="w-3 h-3" /> Test Selected
            </button>
            <button className="btn-destructive btn-sm gap-1.5" onClick={() => setConfirmBulkDelete(true)} disabled={deleting.length > 0}>
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        </div>
      )}

      {/* Groups */}
      {Object.entries(groups).map(([groupName, groupProxies]) => {
        const isCollapsed = collapsed[groupName];
        const healthyCount = groupProxies.filter(p => p.status === 'working' || p.status === 'Healthy').length;
        return (
          <div key={groupName} className="card overflow-hidden">
            {/* Group header */}
            <button
              className="w-full flex items-center gap-3 px-4 py-3 bg-secondary/20 hover:bg-secondary/40 transition-colors border-b border-border"
              onClick={() => toggleGroup(groupName)}
            >
              <Folder className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm font-semibold text-foreground">{groupName}</span>
              <span className="text-xs text-muted-foreground">
                {groupProxies.length} proxies
                {healthyCount > 0 && (
                  <span className="ml-2 text-success">{healthyCount} healthy</span>
                )}
              </span>
              <ChevronDown className={cn('w-4 h-4 text-muted-foreground ml-auto transition-transform', isCollapsed && '-rotate-90')} />
            </button>

            {!isCollapsed && (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="w-10 px-4"></th>
                      <th>Proxy</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupProxies.map((proxy) => (
                      <tr key={proxy.id}>
                        <td className="px-4">
                          <input
                            type="checkbox"
                            checked={selected.includes(proxy.id)}
                            onChange={() => toggleSelect(proxy.id)}
                            className="rounded border-border bg-secondary accent-primary w-3.5 h-3.5"
                          />
                        </td>
                        <td>
                          <p className="text-sm font-mono text-foreground font-medium">{proxy.host}:{proxy.port}</p>
                          {proxy.username && (
                            <p className="text-xs text-muted-foreground">{proxy.username}:{proxy.password ? '••••••••' : ''}</p>
                          )}
                        </td>
                        <td>
                          <span className="badge badge-idle font-mono">{(proxy.type ?? 'HTTP').toUpperCase()}</span>
                        </td>
                        <td>
                          <StatusBadge status={proxy.status} />
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleTest(proxy.id)}
                              disabled={testing.includes(proxy.id)}
                              className="btn-icon text-muted-foreground hover:text-primary"
                              title="Test"
                            >
                              {testing.includes(proxy.id) ? <LoadingSpinner size="sm" /> : <RefreshCw className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => onEdit(proxy)}
                              className="btn-icon text-muted-foreground hover:text-foreground"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setConfirmDelete(proxy.id)}
                              disabled={deleting.includes(proxy.id)}
                              className="btn-icon text-muted-foreground hover:text-destructive"
                              title="Delete"
                            >
                              {deleting.includes(proxy.id) ? <LoadingSpinner size="sm" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete Proxy"
        description="This proxy will be permanently removed."
        confirmLabel="Delete"
        destructive
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
      <ConfirmDialog
        isOpen={confirmBulkDelete}
        title={`Delete ${selected.length} Proxies`}
        description="These proxies will be permanently removed."
        confirmLabel={`Delete ${selected.length}`}
        destructive
        onConfirm={() => { setConfirmBulkDelete(false); handleDeleteSelected(); }}
        onCancel={() => setConfirmBulkDelete(false)}
      />
    </>
  );
}
