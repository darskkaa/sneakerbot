import { useState, useEffect, useCallback } from 'react';
import { PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useAppContext } from '../context/AppContext';
import { EmptyState, LoadingSpinner } from '../components/common';
import ProxyForm from '../components/proxies/ProxyForm';
import ProxyImporter from '../components/proxies/ProxyImporter';
import ProxyList from '../components/proxies/ProxyList';
import { useToast } from '../App';

export default function Proxies() {
  const { proxies, loading, testProxy } = useAppContext();
  const { addToast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [editingProxy, setEditingProxy] = useState<any>(null);
  const [isHealthCheckRunning, setIsHealthCheckRunning] = useState(false);
  const [lastHealthCheck, setLastHealthCheck] = useState<Date | null>(null);
  
  // Open proxy form for adding a new proxy
  const openProxyForm = () => {
    setEditingProxy(null);
    setIsFormOpen(true);
  };
  
  // Open proxy form for editing an existing proxy
  const openProxyFormForEdit = (proxy: any) => {
    setEditingProxy(proxy);
    setIsFormOpen(true);
  };
  
  // Close proxy form
  const closeProxyForm = () => {
    setIsFormOpen(false);
    setEditingProxy(null);
  };
  
  // Open proxy importer
  const openProxyImporter = () => {
    setIsImporterOpen(true);
  };
  
  // Close proxy importer
  const closeProxyImporter = () => {
    setIsImporterOpen(false);
  };
  
  // Run a health check on all proxies
  const runHealthCheck = useCallback(async () => {
    if (!proxies || proxies.length === 0 || isHealthCheckRunning) {
      return;
    }
    
    setIsHealthCheckRunning(true);
    
    try {
      addToast({
        type: 'info',
        title: 'Health Check Started',
        message: `Testing ${proxies.length} proxies. This may take a few minutes.`,
        duration: 5000,
      });
      
      let successCount = 0;
      let failCount = 0;
      
      // Test proxies in batches of 5 to avoid overwhelming the system
      const batchSize = 5;
      for (let i = 0; i < proxies.length; i += batchSize) {
        const batch = proxies.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(async (proxy) => {
            try {
              await testProxy(proxy.id);
              successCount++;
            } catch (error) {
              console.error(`Error testing proxy ${proxy.id}:`, error);
              failCount++;
            }
          })
        );
      }
      
      setLastHealthCheck(new Date());
      
      addToast({
        type: 'success',
        title: 'Health Check Completed',
        message: `Successfully tested ${successCount} proxies. ${failCount} tests failed.`,
        duration: 5000,
      });
    } catch (error) {
      console.error('Error running health check:', error);
      addToast({
        type: 'error',
        title: 'Health Check Failed',
        message: 'An error occurred while running the health check.',
        duration: 5000,
      });
    } finally {
      setIsHealthCheckRunning(false);
    }
  }, [proxies, isHealthCheckRunning, testProxy, addToast]);
  
  // Automatic health check every 5 minutes if there are proxies
  useEffect(() => {
    if (!proxies || proxies.length === 0) {
      return;
    }
    
    // Run a health check when the component mounts
    if (!lastHealthCheck) {
      runHealthCheck();
    }
    
    // Set up a 5-minute interval for health checks
    const interval = setInterval(() => {
      runHealthCheck();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [proxies, lastHealthCheck, runHealthCheck]);
  
  if (loading?.proxies) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-wsb-text">Proxies</h1>
          {lastHealthCheck && (
            <p className="text-sm text-wsb-text-secondary">
              Last health check: {lastHealthCheck.toLocaleTimeString()}
            </p>
          )}
        </div>
        
        <div className="flex space-x-3">
          <button
            className="btn-secondary"
            onClick={runHealthCheck}
            disabled={isHealthCheckRunning}
          >
            {isHealthCheckRunning ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <ArrowPathIcon className="h-5 w-5 mr-2" />
            )}
            {isHealthCheckRunning ? 'Running Check...' : 'Run Health Check'}
          </button>
          
          <button
            className="btn-secondary"
            onClick={openProxyImporter}
          >
            Import Proxies
          </button>
          
          <button
            className="btn-primary"
            onClick={openProxyForm}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Proxy
          </button>
        </div>
      </div>
      
      {proxies && proxies.length > 0 ? (
        <ProxyList 
          proxies={proxies}
          onEdit={openProxyFormForEdit}
        />
      ) : (
        <EmptyState
          title="No proxies yet"
          description="Add proxies to improve your success rate and avoid IP bans."
          actionText="Add Proxy"
          onAction={openProxyForm}
        />
      )}
      
      {isFormOpen && (
        <ProxyForm
          isOpen={isFormOpen}
          onClose={closeProxyForm}
          proxy={editingProxy}
        />
      )}
      
      {isImporterOpen && (
        <ProxyImporter
          isOpen={isImporterOpen}
          onClose={closeProxyImporter}
        />
      )}
    </div>
  );
}
