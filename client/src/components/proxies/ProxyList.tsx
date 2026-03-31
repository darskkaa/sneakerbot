import { useState } from 'react';
import { 
  ArrowPathIcon, 
  TrashIcon, 
  PencilIcon, 
  ChevronDownIcon,
  FolderIcon,
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../App';
import { LoadingSpinner } from '../common';

interface Proxy {
  id: string;
  name: string; // Made non-optional
  host: string; // Added
  port: number; // Added
  username?: string; // Added
  password?: string; // Added
  type: 'http' | 'https' | 'socks4' | 'socks5'; // Added
  status: "untested" | "working" | "failed" | "Healthy" | "Slow" | "Banned" | "Unknown"; // Made non-optional
  lastTested?: Date; // Added
  // [key: string]: any; // Consider removing if all properties are known
}

interface ProxyListProps {
  proxies: Proxy[];
  onEdit: (proxy: Proxy) => void;
}

export default function ProxyList({ proxies, onEdit }: ProxyListProps) {
  const { deleteProxy, testProxy } = useAppContext();
  const { addToast } = useToast();
  const [selectedProxies, setSelectedProxies] = useState<string[]>([]);
  const [testingProxies, setTestingProxies] = useState<string[]>([]);
  const [deletingProxies, setDeletingProxies] = useState<string[]>([]);
  
  // Group proxies by name
  const proxyGroups = proxies.reduce((groups, proxy) => {
    const name = proxy.name || 'Unnamed Group';
    if (!groups[name]) {
      groups[name] = [];
    }
    groups[name].push(proxy);
    return groups;
  }, {} as Record<string, Proxy[]>);
  
  // Toggle proxy selection
  const toggleProxySelection = (proxyId: string) => {
    setSelectedProxies(prev => 
      prev.includes(proxyId) 
        ? prev.filter(id => id !== proxyId)
        : [...prev, proxyId]
    );
  };
  
  // Select all proxies in a group
  const selectAllInGroup = (groupName: string) => {
    const groupProxyIds = proxyGroups[groupName].map(proxy => proxy.id);
    setSelectedProxies(prev => {
      const newSelection = [...prev];
      groupProxyIds.forEach(id => {
        if (!newSelection.includes(id)) {
          newSelection.push(id);
        }
      });
      return newSelection;
    });
  };
  
  // Deselect all proxies in a group
  const deselectAllInGroup = (groupName: string) => {
    const groupProxyIds = proxyGroups[groupName].map(proxy => proxy.id);
    setSelectedProxies(prev => prev.filter(id => !groupProxyIds.includes(id)));
  };
  
  // Test a single proxy
  const handleTestProxy = async (proxyId: string) => {
    setTestingProxies(prev => [...prev, proxyId]);
    try {
      await testProxy(proxyId);
      addToast({
        type: 'success',
        title: 'Proxy Tested',
        message: 'Proxy test completed successfully',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error testing proxy:', error);
      addToast({
        type: 'error',
        title: 'Test Failed',
        message: 'Failed to test proxy',
        duration: 5000,
      });
    } finally {
      setTestingProxies(prev => prev.filter(id => id !== proxyId));
    }
  };
  
  // Test all selected proxies
  const handleTestSelectedProxies = async () => {
    if (selectedProxies.length === 0) {
      addToast({
        type: 'info',
        title: 'No Proxies Selected',
        message: 'Please select proxies to test',
        duration: 3000,
      });
      return;
    }
    
    setTestingProxies(prev => [...prev, ...selectedProxies]);
    let successCount = 0;
    let failCount = 0;
    
    for (const proxyId of selectedProxies) {
      try {
        await testProxy(proxyId);
        successCount++;
      } catch (error) {
        console.error('Error testing proxy:', error);
        failCount++;
      }
    }
    
    setTestingProxies([]);
    
    addToast({
      type: successCount > 0 ? 'success' : 'error',
      title: 'Proxy Testing Completed',
      message: `Successfully tested ${successCount} proxies. ${failCount} tests failed.`,
      duration: 5000,
    });
  };
  
  // Delete a single proxy
  const handleDeleteProxy = async (proxyId: string) => {
    setDeletingProxies(prev => [...prev, proxyId]);
    try {
      await deleteProxy(proxyId);
      addToast({
        type: 'success',
        title: 'Proxy Deleted',
        message: 'Proxy deleted successfully',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error deleting proxy:', error);
      addToast({
        type: 'error',
        title: 'Deletion Failed',
        message: 'Failed to delete proxy',
        duration: 5000,
      });
    } finally {
      setDeletingProxies(prev => prev.filter(id => id !== proxyId));
    }
  };
  
  // Delete all selected proxies
  const handleDeleteSelectedProxies = async () => {
    if (selectedProxies.length === 0) {
      addToast({
        type: 'info',
        title: 'No Proxies Selected',
        message: 'Please select proxies to delete',
        duration: 3000,
      });
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete ${selectedProxies.length} proxies? This action cannot be undone.`)) {
      return;
    }
    
    setDeletingProxies(prev => [...prev, ...selectedProxies]);
    let successCount = 0;
    let failCount = 0;
    
    for (const proxyId of selectedProxies) {
      try {
        await deleteProxy(proxyId);
        successCount++;
      } catch (error) {
        console.error('Error deleting proxy:', error);
        failCount++;
      }
    }
    
    setDeletingProxies([]);
    setSelectedProxies([]);
    
    addToast({
      type: successCount > 0 ? 'success' : 'error',
      title: 'Proxies Deleted',
      message: `Successfully deleted ${successCount} proxies. ${failCount} operations failed.`,
      duration: 5000,
    });
  };
  
  // Delete all banned proxies
  const handleDeleteBannedProxies = async () => {
    const bannedProxies = proxies.filter(proxy => proxy.status === 'Banned').map(proxy => proxy.id).filter((id): id is string => typeof id === 'string');
    
    if (bannedProxies.length === 0) {
      addToast({
        type: 'info',
        title: 'No Banned Proxies',
        message: 'There are no banned proxies to delete',
        duration: 3000,
      });
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete ${bannedProxies.length} banned proxies? This action cannot be undone.`)) {
      return;
    }
    
    setDeletingProxies(prev => [...prev, ...bannedProxies]);
    let successCount = 0;
    let failCount = 0;
    
    for (const proxyId of bannedProxies) {
      try {
        await deleteProxy(proxyId);
        successCount++;
      } catch (error) {
        console.error('Error deleting proxy:', error);
        failCount++;
      }
    }
    
    setDeletingProxies([]);
    setSelectedProxies(prev => prev.filter(id => !bannedProxies.includes(id)));
    
    addToast({
      type: successCount > 0 ? 'success' : 'error',
      title: 'Banned Proxies Deleted',
      message: `Successfully deleted ${successCount} banned proxies. ${failCount} operations failed.`,
      duration: 5000,
    });
  };
  
  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'working':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-wsb-success bg-opacity-10 text-wsb-success">
            <CheckCircleIcon className="h-3 w-3 mr-1" />
            Healthy
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-wsb-error bg-opacity-10 text-wsb-error">
            <XCircleIcon className="h-3 w-3 mr-1" />
            Banned
          </span>
        );
      case 'slow':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-wsb-warning bg-opacity-10 text-wsb-warning">
            <ClockIcon className="h-3 w-3 mr-1" />
            Slow
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-wsb-text-secondary">
            <QuestionMarkCircleIcon className="h-3 w-3 mr-1" />
            Unknown
          </span>
        );
    }
  };
  
  return (
    <div>
      {/* Bulk Actions */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-wsb-text-secondary">
            {selectedProxies.length} selected
          </span>
          {selectedProxies.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleTestSelectedProxies}
                disabled={testingProxies.length > 0}
                className="btn-secondary btn-sm"
              >
                <ArrowPathIcon className="h-3 w-3 mr-1" />
                Test Selected
              </button>
              <button
                type="button"
                onClick={handleDeleteSelectedProxies}
                disabled={deletingProxies.length > 0}
                className="btn-danger btn-sm"
              >
                <TrashIcon className="h-3 w-3 mr-1" />
                Delete Selected
              </button>
            </>
          )}
        </div>
        
        <Menu as="div" className="relative">
          <Menu.Button className="btn-secondary btn-sm">
            Actions
            <ChevronDownIcon className="h-3 w-3 ml-1" />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-wsb-dark-panel shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleTestSelectedProxies}
                      disabled={testingProxies.length > 0}
                      className={`${
                        active ? 'bg-gray-800' : ''
                      } flex w-full items-center px-4 py-2 text-sm text-wsb-text`}
                    >
                      <ArrowPathIcon className="h-4 w-4 mr-2" />
                      Test All Proxies
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleDeleteBannedProxies}
                      disabled={deletingProxies.length > 0}
                      className={`${
                        active ? 'bg-gray-800' : ''
                      } flex w-full items-center px-4 py-2 text-sm text-wsb-text`}
                    >
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Delete Banned Proxies
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
      
      {/* Proxy Groups */}
      <div className="space-y-4">
        {Object.entries(proxyGroups).map(([groupName, groupProxies]) => (
          <div key={groupName} className="card">
            {/* Group Header */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-700 mb-3">
              <div className="flex items-center">
                <FolderIcon className="h-5 w-5 text-wsb-primary mr-2" />
                <h3 className="text-wsb-text font-medium">{groupName}</h3>
                <span className="ml-2 text-xs text-wsb-text-secondary">
                  {groupProxies.length} {groupProxies.length === 1 ? 'proxy' : 'proxies'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => selectAllInGroup(groupName)}
                  className="text-xs text-wsb-text-secondary hover:text-wsb-text"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => deselectAllInGroup(groupName)}
                  className="text-xs text-wsb-text-secondary hover:text-wsb-text"
                >
                  Deselect All
                </button>
              </div>
            </div>
            
            {/* Proxy List */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-wsb-text-secondary uppercase tracking-wider w-8">
                      <span className="sr-only">Select</span>
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-wsb-text-secondary uppercase tracking-wider">
                      Proxy
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-wsb-text-secondary uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-wsb-text-secondary uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-wsb-text-secondary uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {groupProxies.map((proxy) => (
                    <tr key={proxy.id} className="hover:bg-gray-800">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedProxies.includes(proxy.id)}
                          onChange={() => proxy.id && toggleProxySelection(String(proxy.id))}
                          className="form-checkbox"
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        <div className="text-wsb-text font-medium">{proxy.host}:{proxy.port}</div>
                        {proxy.username && (
                          <div className="text-xs text-wsb-text-secondary">
                            {proxy.username}:{proxy.password ? '********' : ''}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-wsb-text">
                        {proxy.type?.toUpperCase() || 'HTTP'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {renderStatusBadge(proxy.status)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-right text-sm">
                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (typeof proxy.id === 'string') {
                                handleTestProxy(proxy.id);
                              }
                            }}
                            disabled={typeof proxy.id === 'string' ? testingProxies.includes(proxy.id) : true}
                            className="text-wsb-text-secondary hover:text-wsb-text"
                          >
                            {testingProxies.includes(proxy.id) ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <ArrowPathIcon className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => onEdit(proxy)}
                            className="text-wsb-text-secondary hover:text-wsb-text"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProxy(proxy.id)}
                            disabled={deletingProxies.includes(proxy.id)}
                            className="text-wsb-text-secondary hover:text-wsb-error"
                          >
                            {deletingProxies.includes(proxy.id) ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <TrashIcon className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
