import { useState, useEffect, useCallback } from 'react';
// Slider import removed. Use native input[type=range] instead.
import { 
  ClockIcon, 
  BoltIcon, 
  ShoppingBagIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../App';
import { LoadingSpinner } from '../common';

interface ProductMonitorProps {
  taskId: number;
  productUrl: string;
  sku: string;
  site: string;
  onStockDetected?: () => void;
  autoCheckout?: boolean;
}

export default function ProductMonitor({ 
  taskId, 
  productUrl, 
  sku, 
  site, 
  onStockDetected,
  autoCheckout = true
}: ProductMonitorProps) {
  const { updateTask } = useAppContext();
  const { addToast } = useToast();
  
  // Monitoring states
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [stockStatus, setStockStatus] = useState<'unknown' | 'in-stock' | 'out-of-stock'>('unknown');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [checkCount, setCheckCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Polling interval configuration
  const [baseInterval, setBaseInterval] = useState(500); // Default: 500ms
  const [currentInterval, setCurrentInterval] = useState(500);
  const minInterval = 300; // Minimum polling interval: 300ms
  const maxInterval = 1000; // Maximum polling interval: 1000ms
  
  // Exponential backoff configuration
  const [backoffEnabled, setBackoffEnabled] = useState(true);
  const [backoffFactor, setBackoffFactor] = useState(1.5);
  const [maxBackoffInterval, setMaxBackoffInterval] = useState(10000); // 10 seconds
  
  // Check stock function - this would normally call the API
  const checkStock = useCallback(async () => {
    if (!isMonitoring) return;
    
    try {
      setError(null);
      setCheckCount(prev => prev + 1);
      setLastChecked(new Date());
      
      // Mock API call - in a real implementation, this would call the backend
      const response = await fetch(`/api/check-stock?url=${encodeURIComponent(productUrl)}&sku=${sku}&site=${site}`).catch(() => {
        // Mock the API for development - randomize to simulate real world conditions
        const isInStock = Math.random() > 0.8; // 20% chance of in-stock
        return {
          ok: true,
          json: () => Promise.resolve({
            inStock: isInStock,
            price: isInStock ? '$' + (100 + Math.floor(Math.random() * 100)) : null,
            sizes: isInStock ? ['US 8', 'US 9', 'US 10'] : [],
            timestamp: new Date().toISOString()
          })
        };
      });
      
      if (response.ok) {
        const data = await response.json();
        const newStatus = data.inStock ? 'in-stock' : 'out-of-stock';
        
        // Only notify if status changed from out-of-stock to in-stock
        if (newStatus === 'in-stock' && stockStatus !== 'in-stock') {
          // Notify user
          addToast({
            type: 'success',
            title: 'Stock Detected!',
            message: `${site}: ${sku} is now in stock.`,
            duration: 10000, // Keep this notification longer
          });
          
          // Update task status to reflect stock availability
          updateTask(taskId, { 
            status: 'success', // changed from 'ready' to match allowed TaskStatus
            message: 'Stock detected, ready for checkout'
          });
          
          // Call callback if provided
          if (onStockDetected) {
            onStockDetected();
          }
          
          // Auto checkout if enabled
          if (autoCheckout) {
            initiateCheckout();
          }
        }
        
        setStockStatus(newStatus);
        
        // Apply exponential backoff if enabled and out of stock
        if (backoffEnabled && newStatus === 'out-of-stock') {
          const newInterval = Math.min(
            currentInterval * backoffFactor,
            maxBackoffInterval
          );
          setCurrentInterval(newInterval);
        } else if (newStatus === 'in-stock') {
          // Reset to base interval when in stock
          setCurrentInterval(baseInterval);
        }
        
      } else {
        throw new Error('Failed to check stock');
      }
    } catch (err) {
      console.error('Error checking stock:', err);
      setError('Failed to check stock. Will retry.');
      
      // Apply exponential backoff on error
      if (backoffEnabled) {
        const newInterval = Math.min(
          currentInterval * backoffFactor,
          maxBackoffInterval
        );
        setCurrentInterval(newInterval);
      }
    }
  }, [
    isMonitoring, 
    productUrl, 
    sku, 
    site, 
    stockStatus, 
    baseInterval, 
    currentInterval, 
    backoffEnabled, 
    backoffFactor, 
    maxBackoffInterval, 
    addToast, 
    taskId, 
    updateTask, 
    onStockDetected, 
    autoCheckout
  ]);
  
  // Initiate checkout process
  const initiateCheckout = async () => {
    try {
      // Update task status
      await updateTask(taskId, { 
        status: 'running',
        message: 'Initiating checkout process'
      });
      
      // In a real implementation, this would trigger the checkout process
      addToast({
        type: 'info',
        title: 'Checkout Started',
        message: `Starting checkout process for ${sku}`,
        duration: 5000,
      });
      
      // Mock a successful checkout after a delay
      setTimeout(async () => {
        await updateTask(taskId, { 
          status: 'success',
          message: 'Checkout completed successfully'
        });
        
        addToast({
          type: 'success',
          title: 'Checkout Successful',
          message: `Successfully checked out ${sku}`,
          duration: 5000,
        });
      }, 3000);
    } catch (err) {
      console.error('Error initiating checkout:', err);
      
      // Update task status to reflect error
      await updateTask(taskId, { 
        status: 'error',
        message: 'Failed to initiate checkout'
      });
      
      addToast({
        type: 'error',
        title: 'Checkout Failed',
        message: `Failed to checkout ${sku}`,
        duration: 5000,
      });
    }
  };
  
  // Start/stop monitoring
  const toggleMonitoring = () => {
    setIsMonitoring(prev => !prev);
    
    if (!isMonitoring) {
      // Reset interval and check immediately when starting
      setCurrentInterval(baseInterval);
      setCheckCount(0);
      
      // Update task status
      updateTask(taskId, { 
        status: 'running', // changed from 'monitoring' to match allowed TaskStatus
        message: 'Monitoring for stock'
      });
      
      addToast({
        type: 'info',
        title: 'Monitoring Started',
        message: `Now monitoring ${site}: ${sku} for stock`,
        duration: 3000,
      });
    } else {
      // Update task status when stopping
      updateTask(taskId, { 
        status: 'idle',
        message: 'Monitoring paused'
      });
      
      addToast({
        type: 'info',
        title: 'Monitoring Paused',
        message: `Paused monitoring for ${sku}`,
        duration: 3000,
      });
    }
  };
  
  // Set up polling interval
  useEffect(() => {
    if (!isMonitoring) return;
    
    // Check stock immediately when monitoring starts
    checkStock();
    
    // Set up polling interval
    const interval = setInterval(() => {
      checkStock();
    }, currentInterval);
    
    // Clean up interval on unmount or when monitoring stops
    return () => clearInterval(interval);
  }, [isMonitoring, currentInterval, checkStock]);
  
  // Get human-readable interval text
  const getIntervalText = (ms: number) => {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    return `${(ms / 1000).toFixed(1)}s`;
  };
  
  // Get status badge
  const getStatusBadge = () => {
    switch (stockStatus) {
      case 'in-stock':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-wsb-success bg-opacity-10 text-wsb-success">
            <ShoppingBagIcon className="h-3 w-3 mr-1" />
            In Stock
          </span>
        );
      case 'out-of-stock':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-wsb-error bg-opacity-10 text-wsb-error">
            <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
            Out of Stock
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-wsb-text-secondary">
            <ClockIcon className="h-3 w-3 mr-1" />
            Unknown
          </span>
        );
    }
  };
  
  return (
    <div className="card">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-wsb-text">Product Monitor</h3>
          <p className="text-sm text-wsb-text-secondary">
            {site}: {sku}
          </p>
        </div>
        <button
          className={`${isMonitoring ? 'btn-danger' : 'btn-primary'}`}
          onClick={toggleMonitoring}
        >
          {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-wsb-text">Status:</span>
            {getStatusBadge()}
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-wsb-text">Last Checked:</span>
            <span className="text-sm text-wsb-text-secondary">
              {lastChecked ? lastChecked.toLocaleTimeString() : 'Never'}
            </span>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-wsb-text">Check Count:</span>
            <span className="text-sm text-wsb-text-secondary">{checkCount}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-wsb-text">Current Interval:</span>
            <span className="text-sm text-wsb-text-secondary">
              {getIntervalText(currentInterval)}
            </span>
          </div>
          
          {error && (
            <div className="mt-2 p-2 rounded bg-wsb-error bg-opacity-10 text-wsb-error text-sm">
              {error}
            </div>
          )}
        </div>
        
        <div>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="polling-interval" className="text-sm font-medium text-wsb-text">
                Polling Interval: {getIntervalText(baseInterval)}
              </label>
            </div>
            <div className="h-6 relative">
              <input
                id="polling-interval"
                type="range"
                value={baseInterval}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = Number(e.target.value);
                  setBaseInterval(value);
                  if (!backoffEnabled || stockStatus === 'in-stock') {
                    setCurrentInterval(value);
                  }
                }}
                min={minInterval}
                max={maxInterval}
                step={50}
                className="w-full h-1 bg-gray-700 rounded-full appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-wsb-text-secondary mt-1">
                <span>Fast ({getIntervalText(minInterval)})</span>
                <span>Slow ({getIntervalText(maxInterval)})</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="backoff-toggle" className="text-sm font-medium text-wsb-text">
              Exponential Backoff
            </label>
            <div className="relative inline-block h-6 w-11">
              <input
                type="checkbox"
                id="backoff-toggle"
                checked={backoffEnabled}
                onChange={() => setBackoffEnabled(!backoffEnabled)}
                className="opacity-0 w-0 h-0"
              />
              <span 
                className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors ${backoffEnabled ? 'bg-wsb-primary' : 'bg-gray-700'}`}
              >
                <span 
                  className={`absolute h-4 w-4 top-1 bg-white rounded-full transition-transform ${backoffEnabled ? 'left-6' : 'left-1'}`}
                />
              </span>
            </div>
          </div>
          
          <p className="text-xs text-wsb-text-secondary">
            When enabled, the monitor will automatically slow down when the product is out of stock, and speed up when it's in stock.
          </p>
        </div>
      </div>
      
      <div className="p-3 bg-gray-800 rounded-lg mt-4">
        <div className="flex items-start">
          <BoltIcon className="h-5 w-5 text-wsb-primary mr-2 flex-shrink-0" />
          <p className="text-sm text-wsb-text-secondary">
            {autoCheckout
              ? "Auto-checkout is enabled. When stock is detected, checkout will start automatically."
              : "Auto-checkout is disabled. You'll be notified when stock is detected."
            }
          </p>
        </div>
      </div>
    </div>
  );
}
