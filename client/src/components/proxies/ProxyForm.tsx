import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAppContext } from '../../context/AppContext';
import { LoadingSpinner } from '../common';

interface ProxyFormProps {
  isOpen: boolean;
  onClose: () => void;
  proxy?: any;
}

// Validation schema for the proxy form
const ProxySchema = Yup.object().shape({
  name: Yup.string().required('Group name is required'),
  host: Yup.string().required('Host is required'),
  port: Yup.number()
    .required('Port is required')
    .min(1, 'Port must be at least 1')
    .max(65535, 'Port must be at most 65535'),
  type: Yup.string()
    .oneOf(['http', 'https', 'socks4', 'socks5'], 'Invalid proxy type')
    .required('Proxy type is required'),
  username: Yup.string(),
  password: Yup.string(),
});

// Validation for bulk proxy imports
const validateBulkProxies = (value: string) => {
  if (!value) return true;
  
  const lines = value.trim().split('\n');
  const invalidLines: number[] = [];
  
  lines.forEach((line, index) => {
    // Check for ip:port:username:password or ip:port format
    const parts = line.trim().split(':');
    if (parts.length !== 2 && parts.length !== 4) {
      invalidLines.push(index + 1);
      return;
    }
    
    // Check IP/host format
    const hostRegex = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$|^(\d{1,3}\.){3}\d{1,3}$/;
    if (!hostRegex.test(parts[0])) {
      invalidLines.push(index + 1);
      return;
    }
    
    // Check port format
    const port = parseInt(parts[1], 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      invalidLines.push(index + 1);
      return;
    }
  });
  
  if (invalidLines.length > 0) {
    return `Invalid proxies on lines: ${invalidLines.join(', ')}`;
  }
  
  return true;
};

export default function ProxyForm({ isOpen, onClose, proxy }: ProxyFormProps) {
  const { addProxy, updateProxy } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);
  
  const isEditing = !!proxy;
  
  // Initial values for the form
  const initialValues = proxy || {
    name: '',
    host: '',
    port: '',
    type: 'http',
    username: '',
    password: '',
  };
  
  const initialBulkValues = {
    groupName: '',
    proxies: '',
    type: 'http',
  };
  
  // Handle form submission for single proxy
  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateProxy(proxy.id, values);
      } else {
        await addProxy(values);
      }
      onClose();
    } catch (error) {
      console.error('Error saving proxy:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle form submission for bulk proxies
  const handleBulkSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const lines = values.proxies.trim().split('\n');
      
      for (const line of lines) {
        const parts = line.trim().split(':');
        const proxyData = {
          name: values.groupName,
          host: parts[0],
          port: parseInt(parts[1], 10),
          type: values.type,
          username: parts.length === 4 ? parts[2] : '',
          password: parts.length === 4 ? parts[3] : '',
        };
        
        await addProxy(proxyData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error adding bulk proxies:', error);
    } finally {
      setIsSubmitting(false);
    }
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
              <Dialog.Panel className="w-full max-w-md transform rounded-2xl bg-wsb-dark-panel p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-lg font-medium text-wsb-text">
                    {isEditing 
                      ? 'Edit Proxy' 
                      : isBulkMode 
                        ? 'Add Bulk Proxies' 
                        : 'Add Proxy'}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-wsb-text-secondary hover:text-wsb-text"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {!isEditing && (
                  <div className="mb-6">
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        className={`px-4 py-2 text-sm font-medium rounded-md ${
                          !isBulkMode
                            ? 'bg-wsb-primary text-white'
                            : 'bg-gray-700 text-wsb-text-secondary hover:bg-gray-600'
                        }`}
                        onClick={() => setIsBulkMode(false)}
                      >
                        Single Proxy
                      </button>
                      <button
                        type="button"
                        className={`px-4 py-2 text-sm font-medium rounded-md ${
                          isBulkMode
                            ? 'bg-wsb-primary text-white'
                            : 'bg-gray-700 text-wsb-text-secondary hover:bg-gray-600'
                        }`}
                        onClick={() => setIsBulkMode(true)}
                      >
                        Bulk Import
                      </button>
                    </div>
                  </div>
                )}

                {/* Single Proxy Form */}
                {!isBulkMode && (
                  <Formik
                    initialValues={initialValues}
                    validationSchema={ProxySchema}
                    onSubmit={handleSubmit}
                  >
                    {({ isValid }) => (
                      <Form className="space-y-4">
                        <div>
                          <label htmlFor="name" className="form-label">Group Name</label>
                          <Field
                            type="text"
                            id="name"
                            name="name"
                            placeholder="e.g., Residential Proxies"
                            className="form-input"
                          />
                          <ErrorMessage name="name" component="div" className="mt-1 text-sm text-wsb-error" />
                        </div>

                        <div>
                          <label htmlFor="host" className="form-label">Host / IP</label>
                          <Field
                            type="text"
                            id="host"
                            name="host"
                            placeholder="e.g., 192.168.1.1 or proxy.example.com"
                            className="form-input"
                          />
                          <ErrorMessage name="host" component="div" className="mt-1 text-sm text-wsb-error" />
                        </div>

                        <div>
                          <label htmlFor="port" className="form-label">Port</label>
                          <Field
                            type="number"
                            id="port"
                            name="port"
                            placeholder="e.g., 8080"
                            min="1"
                            max="65535"
                            className="form-input"
                          />
                          <ErrorMessage name="port" component="div" className="mt-1 text-sm text-wsb-error" />
                        </div>

                        <div>
                          <label htmlFor="type" className="form-label">Type</label>
                          <Field
                            as="select"
                            id="type"
                            name="type"
                            className="form-input"
                          >
                            <option value="http">HTTP</option>
                            <option value="https">HTTPS</option>
                            <option value="socks4">SOCKS4</option>
                            <option value="socks5">SOCKS5</option>
                          </Field>
                          <ErrorMessage name="type" component="div" className="mt-1 text-sm text-wsb-error" />
                        </div>

                        <div>
                          <label htmlFor="username" className="form-label">
                            Username <span className="text-wsb-text-secondary">(Optional)</span>
                          </label>
                          <Field
                            type="text"
                            id="username"
                            name="username"
                            className="form-input"
                          />
                          <ErrorMessage name="username" component="div" className="mt-1 text-sm text-wsb-error" />
                        </div>

                        <div>
                          <label htmlFor="password" className="form-label">
                            Password <span className="text-wsb-text-secondary">(Optional)</span>
                          </label>
                          <Field
                            type="password"
                            id="password"
                            name="password"
                            className="form-input"
                          />
                          <ErrorMessage name="password" component="div" className="mt-1 text-sm text-wsb-error" />
                        </div>

                        <div className="flex justify-between pt-4 border-t border-gray-700">
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={onClose}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="btn-primary"
                            disabled={isSubmitting || !isValid}
                          >
                            {isSubmitting ? (
                              <>
                                <LoadingSpinner size="sm" color="white" />
                                <span className="ml-2">Saving...</span>
                              </>
                            ) : (
                              isEditing ? 'Update Proxy' : 'Add Proxy'
                            )}
                          </button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                )}

                {/* Bulk Import Form */}
                {isBulkMode && (
                  <Formik
                    initialValues={initialBulkValues}
                    onSubmit={handleBulkSubmit}
                    validate={(values) => {
                      const errors: any = {};
                      if (!values.groupName) {
                        errors.groupName = 'Group name is required';
                      }
                      
                      const proxiesValidation = validateBulkProxies(values.proxies);
                      if (proxiesValidation !== true) {
                        errors.proxies = proxiesValidation;
                      }
                      
                      if (!values.proxies) {
                        errors.proxies = 'Proxies are required';
                      }
                      
                      return errors;
                    }}
                  >
                    {({ isValid }) => (
                      <Form className="space-y-4">
                        <div>
                          <label htmlFor="groupName" className="form-label">Group Name</label>
                          <Field
                            type="text"
                            id="groupName"
                            name="groupName"
                            placeholder="e.g., Residential Proxies"
                            className="form-input"
                          />
                          <ErrorMessage name="groupName" component="div" className="mt-1 text-sm text-wsb-error" />
                        </div>

                        <div>
                          <label htmlFor="type" className="form-label">Type</label>
                          <Field
                            as="select"
                            id="type"
                            name="type"
                            className="form-input"
                          >
                            <option value="http">HTTP</option>
                            <option value="https">HTTPS</option>
                            <option value="socks4">SOCKS4</option>
                            <option value="socks5">SOCKS5</option>
                          </Field>
                          <ErrorMessage name="type" component="div" className="mt-1 text-sm text-wsb-error" />
                        </div>

                        <div>
                          <label htmlFor="proxies" className="form-label">Proxies</label>
                          <Field
                            as="textarea"
                            id="proxies"
                            name="proxies"
                            rows={8}
                            placeholder="ip:port or ip:port:username:password (one per line)"
                            className="form-input"
                          />
                          <ErrorMessage name="proxies" component="div" className="mt-1 text-sm text-wsb-error" />
                          <p className="mt-1 text-xs text-wsb-text-secondary">
                            Format: ip:port or ip:port:username:password (one per line)
                          </p>
                        </div>

                        <div className="flex justify-between pt-4 border-t border-gray-700">
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={onClose}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="btn-primary"
                            disabled={isSubmitting || !isValid}
                          >
                            {isSubmitting ? (
                              <>
                                <LoadingSpinner size="sm" color="white" />
                                <span className="ml-2">Importing...</span>
                              </>
                            ) : (
                              'Import Proxies'
                            )}
                          </button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
