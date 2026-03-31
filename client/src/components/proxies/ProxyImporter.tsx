import { useState, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, ArrowUpTrayIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../App';
import { LoadingSpinner } from '../common';

interface ProxyImporterProps {
  isOpen: boolean;
  onClose: () => void;
}

// Proxy formats:
// 1. ip:port
// 2. ip:port:username:password
// 3. username:password@ip:port

export default function ProxyImporter({ isOpen, onClose }: ProxyImporterProps) {
  const { addProxy } = useAppContext();
  const { addToast } = useToast();
  const [proxyText, setProxyText] = useState('');
  const [groupName, setGroupName] = useState('');
  const [proxyType, setProxyType] = useState('http');
  const [isImporting, setIsImporting] = useState(false);
  const [importStats, setImportStats] = useState({ total: 0, successful: 0, failed: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setProxyText(content);
    };
    reader.readAsText(file);
  };
  
  // Handle paste from clipboard
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setProxyText(text);
      addToast({
        type: 'success',
        title: 'Clipboard Content Pasted',
        message: `Pasted ${text.split('\n').filter(line => line.trim()).length} lines from clipboard`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to read clipboard:', error);
      addToast({
        type: 'error',
        title: 'Clipboard Error',
        message: 'Could not read from clipboard. Please paste manually.',
        duration: 5000,
      });
    }
  };
  
  // Parse a single proxy line
  const parseProxyLine = (line: string): { host: string; port: number; username?: string; password?: string } | null => {
    line = line.trim();
    if (!line) return null;
    
    // Format: username:password@ip:port
    if (line.includes('@')) {
      const [auth, server] = line.split('@');
      const [username, password] = auth.split(':');
      const [host, portStr] = server.split(':');
      const port = parseInt(portStr, 10);
      
      if (host && !isNaN(port)) {
        return { host, port, username, password };
      }
    } 
    // Format: ip:port:username:password
    else if (line.split(':').length === 4) {
      const [host, portStr, username, password] = line.split(':');
      const port = parseInt(portStr, 10);
      
      if (host && !isNaN(port)) {
        return { host, port, username, password };
      }
    } 
    // Format: ip:port
    else if (line.split(':').length === 2) {
      const [host, portStr] = line.split(':');
      const port = parseInt(portStr, 10);
      
      if (host && !isNaN(port)) {
        return { host, port };
      }
    }
    
    return null;
  };
  
  // Import proxies
  const handleImport = async () => {
    if (!groupName.trim()) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Group name is required',
        duration: 5000,
      });
      return;
    }
    
    if (!proxyText.trim()) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'No proxies to import',
        duration: 5000,
      });
      return;
    }
    
    setIsImporting(true);
    const lines = proxyText.split('\n').filter(line => line.trim());
    let successful = 0;
    let failed = 0;
    
    for (const line of lines) {
      const proxyData = parseProxyLine(line);
      
      if (proxyData) {
        try {
          await addProxy({
            name: groupName,
            ...proxyData,
            type: proxyType as 'http' | 'https' | 'socks4' | 'socks5',
          });
          successful++;
        } catch (error) {
          console.error('Failed to add proxy:', error);
          failed++;
        }
      } else {
        failed++;
      }
    }
    
    setImportStats({
      total: lines.length,
      successful,
      failed,
    });
    
    setIsImporting(false);
    
    // Show success notification
    if (successful > 0) {
      addToast({
        type: 'success',
        title: 'Proxies Imported',
        message: `Successfully imported ${successful} proxies to group "${groupName}"`,
        duration: 5000,
      });
      
      // Close modal and reset form after a short delay
      setTimeout(() => {
        onClose();
        setProxyText('');
        setGroupName('');
        setImportStats({ total: 0, successful: 0, failed: 0 });
      }, 1500);
    } else {
      addToast({
        type: 'error',
        title: 'Import Failed',
        message: 'Could not import any proxies. Please check the format.',
        duration: 5000,
      });
    }
  };
  
  // Handle clearing the text area
  const handleClear = () => {
    setProxyText('');
  };
  
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform rounded-lg bg-wsb-dark-panel p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-lg font-medium text-wsb-text">
                    Import Proxies
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full p-1 text-wsb-text-secondary hover:bg-gray-800 hover:text-wsb-text"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="groupName" className="block text-sm font-medium text-wsb-text mb-1">
                      Group Name
                    </label>
                    <input
                      type="text"
                      id="groupName"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="e.g., Residential Proxies"
                      className="form-input"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="proxyType" className="block text-sm font-medium text-wsb-text mb-1">
                      Proxy Type
                    </label>
                    <select
                      id="proxyType"
                      value={proxyType}
                      onChange={(e) => setProxyType(e.target.value)}
                      className="form-input"
                    >
                      <option value="http">HTTP</option>
                      <option value="https">HTTPS</option>
                      <option value="socks4">SOCKS4</option>
                      <option value="socks5">SOCKS5</option>
                    </select>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="proxyList" className="block text-sm font-medium text-wsb-text">
                        Proxy List
                      </label>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center px-2 py-1 text-xs rounded-md bg-gray-800 text-wsb-text-secondary hover:text-wsb-text"
                        >
                          <ArrowUpTrayIcon className="h-3 w-3 mr-1" />
                          Upload
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept=".txt,.csv"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={handlePasteFromClipboard}
                          className="inline-flex items-center px-2 py-1 text-xs rounded-md bg-gray-800 text-wsb-text-secondary hover:text-wsb-text"
                        >
                          <ClipboardIcon className="h-3 w-3 mr-1" />
                          Paste
                        </button>
                        <button
                          type="button"
                          onClick={handleClear}
                          className="inline-flex items-center px-2 py-1 text-xs rounded-md bg-gray-800 text-wsb-text-secondary hover:text-wsb-text"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    <textarea
                      id="proxyList"
                      value={proxyText}
                      onChange={(e) => setProxyText(e.target.value)}
                      rows={8}
                      placeholder="Enter proxies one per line in formats:&#10;ip:port&#10;ip:port:username:password&#10;username:password@ip:port"
                      className="form-input font-mono text-sm"
                    />
                    <p className="text-xs text-wsb-text-secondary mt-1">
                      {proxyText.split('\n').filter(line => line.trim()).length} proxies entered
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-700 flex justify-between">
                    <div>
                      {importStats.total > 0 && (
                        <div className="text-sm">
                          <span className="text-wsb-text-secondary">Imported: </span>
                          <span className="text-wsb-success">{importStats.successful}</span>
                          <span className="text-wsb-text-secondary"> / Failed: </span>
                          <span className="text-wsb-error">{importStats.failed}</span>
                          <span className="text-wsb-text-secondary"> / Total: </span>
                          <span>{importStats.total}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={onClose}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleImport}
                        disabled={isImporting}
                        className="btn-primary"
                      >
                        {isImporting ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Importing...
                          </>
                        ) : (
                          'Import Proxies'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
