import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  XMarkIcon, 
  ArrowLeftIcon, 
  ArrowRightIcon,
  CheckIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAppContext } from '../../context/AppContext';

interface TaskWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (count: number) => void;
}

// Validation schemas for each step
const productSchema = Yup.object().shape({
  site: Yup.string().required('Site is required'),
  productUrl: Yup.string().url('Must be a valid URL').required('Product URL is required'),
  size: Yup.string().required('Size is required'),
  quantity: Yup.number().min(1, 'Quantity must be at least 1').max(10, 'Quantity cannot exceed 10').required('Quantity is required'),
});

const accountSchema = Yup.object().shape({
  profileId: Yup.string().required('Profile is required'),
  proxyId: Yup.string(),
});

const advancedSchema = Yup.object().shape({
  retryDelay: Yup.number().min(0, 'Delay must be at least 0ms').max(5000, 'Delay cannot exceed 5000ms'),
  retryLimit: Yup.number().min(1, 'Retry limit must be at least 1').max(50, 'Retry limit cannot exceed 50'),
  monitorDelay: Yup.number().min(500, 'Monitor delay must be at least 500ms'),
  captchaTimeout: Yup.number().min(10, 'Captcha timeout must be at least 10 seconds'),
});

interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  [key: string]: any;
}

export default function TaskWizard({ isOpen, onClose, onTaskCreated }: TaskWizardProps) {
  const { profiles, proxies } = useAppContext();
  const [step, setStep] = useState(1);
  const [initialValues, setInitialValues] = useState({
    // Product details
    site: 'nike',
    productUrl: '',
    size: '',
    quantity: 1,
    
    // Account settings
    profileId: '',
    proxyId: '',
    
    // Advanced settings
    retryDelay: 1000,
    retryLimit: 5,
    monitorDelay: 3000,
    captchaTimeout: 60,
    useProductMonitor: true,
    useAutoSolver: true,
  });
  
  // Available sites
  const sites = [
    { id: 'nike', name: 'Nike' },
    { id: 'snkrs', name: 'SNKRS' },
    { id: 'footlocker', name: 'Footlocker' },
    { id: 'eastbay', name: 'Eastbay' },
    { id: 'finishline', name: 'Finish Line' },
    { id: 'shopify', name: 'Shopify' },
  ];
  
  // Common sizes
  const commonSizes = [
    'US 7', 'US 7.5', 'US 8', 'US 8.5', 'US 9', 'US 9.5', 
    'US 10', 'US 10.5', 'US 11', 'US 11.5', 'US 12', 'US 13'
  ];
  
  // Handle form submission
  const handleSubmit = async (values: any) => {
    try {
      // In a real implementation, we'd need to transform the form values 
      // into the expected task format and add additional properties
      const taskData = {
        site: values.site,
        product: values.productUrl,
        size: values.size,
        profile: values.profileId,
        proxy: values.proxyId || undefined,
        options: {
          quantity: values.quantity,
          retryDelay: values.retryDelay,
          retryLimit: values.retryLimit,
          monitorDelay: values.monitorDelay,
          captchaTimeout: values.captchaTimeout,
          useProductMonitor: values.useProductMonitor,
          useAutoSolver: values.useAutoSolver,
        }
      };
      
      // Call onTaskCreated with the number of tasks created (1 for now)
      onTaskCreated(1);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };
  
  // Move to the next step
  const nextStep = () => {
    setStep(step + 1);
  };
  
  // Move to the previous step
  const prevStep = () => {
    setStep(step - 1);
  };
  
  // Render the current step content
  const renderStepContent = (values: any, errors: any, touched: any) => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="site" className="form-label">Site</label>
              <Field as="select" id="site" name="site" className="form-input">
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))}
              </Field>
              <ErrorMessage name="site" component="div" className="form-error" />
            </div>
            
            <div>
              <label htmlFor="productUrl" className="form-label">Product URL or SKU</label>
              <Field 
                type="text" 
                id="productUrl" 
                name="productUrl" 
                placeholder="https://www.nike.com/t/dunk-low-retro-mens-shoes-87q0hf/DV0833-101"
                className="form-input"
              />
              <ErrorMessage name="productUrl" component="div" className="form-error" />
            </div>
            
            <div>
              <label htmlFor="size" className="form-label">Size</label>
              <Field as="select" id="size" name="size" className="form-input">
                <option value="">Select Size</option>
                {commonSizes.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
                <option value="random">Random Available Size</option>
              </Field>
              <ErrorMessage name="size" component="div" className="form-error" />
            </div>
            
            <div>
              <label htmlFor="quantity" className="form-label">Quantity</label>
              <Field 
                type="number" 
                id="quantity" 
                name="quantity" 
                min="1"
                max="10"
                className="form-input w-24"
              />
              <ErrorMessage name="quantity" component="div" className="form-error" />
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="profileId" className="form-label">Profile</label>
              <Field as="select" id="profileId" name="profileId" className="form-input">
                <option value="">Select Profile</option>
                {profiles && profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name} - {profile.shippingInfo?.firstName || ''} {profile.shippingInfo?.lastName || ''}
                  </option>
                ))}
              </Field>
              <ErrorMessage name="profileId" component="div" className="form-error" />
            </div>
            
            <div>
              <label htmlFor="proxyId" className="form-label">Proxy Group (Optional)</label>
              <Field as="select" id="proxyId" name="proxyId" className="form-input">
                <option value="">No Proxy</option>
                {proxies && proxies.map((proxy) => (
                  <option key={proxy.id} value={proxy.id}>{proxy.name}</option>
                ))}
              </Field>
              <ErrorMessage name="proxyId" component="div" className="form-error" />
            </div>
            
            <div className="p-4 bg-gray-800 rounded-lg flex items-start">
              <InformationCircleIcon className="h-5 w-5 text-wsb-primary mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-wsb-text-secondary">
                Using proxies is recommended to avoid IP bans and increase your chances of success.
                For high-demand releases, we recommend using residential proxies.
              </p>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-wsb-text font-medium">Product Monitor</h3>
                <p className="text-wsb-text-secondary text-sm">
                  Automatically monitor for restocks
                </p>
              </div>
              <Field 
                type="checkbox" 
                id="useProductMonitor" 
                name="useProductMonitor"
                className="form-checkbox"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-wsb-text font-medium">Auto CAPTCHA Solver</h3>
                <p className="text-wsb-text-secondary text-sm">
                  Use configured CAPTCHA solver service
                </p>
              </div>
              <Field 
                type="checkbox" 
                id="useAutoSolver" 
                name="useAutoSolver"
                className="form-checkbox"
              />
            </div>
            
            <div>
              <label htmlFor="monitorDelay" className="form-label">Monitor Delay (ms)</label>
              <Field 
                type="number" 
                id="monitorDelay" 
                name="monitorDelay" 
                min="500"
                className="form-input w-24"
              />
              <ErrorMessage name="monitorDelay" component="div" className="form-error" />
            </div>
            
            <div>
              <label htmlFor="retryDelay" className="form-label">Retry Delay (ms)</label>
              <Field 
                type="number" 
                id="retryDelay" 
                name="retryDelay" 
                min="0"
                max="5000"
                className="form-input w-24"
              />
              <ErrorMessage name="retryDelay" component="div" className="form-error" />
            </div>
            
            <div>
              <label htmlFor="retryLimit" className="form-label">Retry Limit</label>
              <Field 
                type="number" 
                id="retryLimit" 
                name="retryLimit" 
                min="1"
                max="50"
                className="form-input w-24"
              />
              <ErrorMessage name="retryLimit" component="div" className="form-error" />
            </div>
            
            <div>
              <label htmlFor="captchaTimeout" className="form-label">CAPTCHA Timeout (seconds)</label>
              <Field 
                type="number" 
                id="captchaTimeout" 
                name="captchaTimeout" 
                min="10"
                className="form-input w-24"
              />
              <ErrorMessage name="captchaTimeout" component="div" className="form-error" />
            </div>
          </div>
        );
        
      case 4:
        // Review screen
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-wsb-text font-medium mb-2">Product Details</h3>
              <div className="card space-y-2">
                <div className="flex justify-between">
                  <span className="text-wsb-text-secondary">Site:</span>
                  <span className="text-wsb-text font-medium">
                    {sites.find(s => s.id === values.site)?.name || values.site}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-wsb-text-secondary">Product:</span>
                  <span className="text-wsb-text font-medium truncate max-w-xs">
                    {values.productUrl}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-wsb-text-secondary">Size:</span>
                  <span className="text-wsb-text font-medium">{values.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-wsb-text-secondary">Quantity:</span>
                  <span className="text-wsb-text font-medium">{values.quantity}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-wsb-text font-medium mb-2">Account Settings</h3>
              <div className="card space-y-2">
                <div className="flex justify-between">
                  <span className="text-wsb-text-secondary">Profile:</span>
                  <span className="text-wsb-text font-medium">
                    {profiles.find(p => p.id === values.profileId)?.name || 'None'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-wsb-text-secondary">Proxy Group:</span>
                  <span className="text-wsb-text font-medium">
                    {proxies.find(p => p.id === values.proxyId)?.name || 'None'}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-wsb-text font-medium mb-2">Advanced Settings</h3>
              <div className="card space-y-2">
                <div className="flex justify-between">
                  <span className="text-wsb-text-secondary">Product Monitor:</span>
                  <span className="text-wsb-text font-medium">
                    {values.useProductMonitor ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-wsb-text-secondary">Auto CAPTCHA Solver:</span>
                  <span className="text-wsb-text font-medium">
                    {values.useAutoSolver ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-wsb-text-secondary">Monitor Delay:</span>
                  <span className="text-wsb-text font-medium">{values.monitorDelay} ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-wsb-text-secondary">Retry Delay:</span>
                  <span className="text-wsb-text font-medium">{values.retryDelay} ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-wsb-text-secondary">Retry Limit:</span>
                  <span className="text-wsb-text font-medium">{values.retryLimit}</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  // Get the validation schema for the current step
  const getValidationSchema = () => {
    switch (step) {
      case 1:
        return productSchema;
      case 2:
        return accountSchema;
      case 3:
        return advancedSchema;
      default:
        return null;
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
              <Dialog.Panel className="w-full max-w-md transform rounded-lg bg-gray-900 p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-lg font-medium text-wsb-text">
                    {step === 1 && 'Product Details'}
                    {step === 2 && 'Account Settings'}
                    {step === 3 && 'Advanced Settings'}
                    {step === 4 && 'Review Task'}
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full p-1 text-wsb-text-secondary hover:bg-gray-800 hover:text-wsb-text"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Step indicator */}
                <div className="flex mb-6">
                  {[1, 2, 3, 4].map((s) => (
                    <div key={s} className="flex-1 flex items-center">
                      <div
                        className={`h-2 flex-grow ${
                          s < step ? 'bg-wsb-primary' : s === step ? 'bg-wsb-primary opacity-50' : 'bg-gray-700'
                        } ${s === 1 ? 'rounded-l' : ''} ${s === 4 ? 'rounded-r' : ''}`}
                      ></div>
                    </div>
                  ))}
                </div>
                
                <Formik
                  initialValues={initialValues}
                  validationSchema={getValidationSchema()}
                  onSubmit={handleSubmit}
                  validateOnChange={false}
                  validateOnBlur={true}
                >
                  {({ values, errors, touched, isValid, submitForm }) => (
                    <Form className="space-y-6">
                      {renderStepContent(values, errors, touched)}
                      
                      <div className="flex justify-between pt-4 border-t border-gray-700">
                        {step > 1 ? (
                          <button
                            type="button"
                            onClick={prevStep}
                            className="btn-secondary"
                          >
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Back
                          </button>
                        ) : (
                          <div></div>
                        )}
                        
                        {step < 4 ? (
                          <button
                            type="button"
                            onClick={nextStep}
                            className="btn-primary"
                            disabled={!isValid}
                          >
                            Next
                            <ArrowRightIcon className="h-4 w-4 ml-2" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={submitForm}
                            className="btn-primary"
                          >
                            <CheckIcon className="h-4 w-4 mr-2" />
                            Create Task
                          </button>
                        )}
                      </div>
                    </Form>
                  )}
                </Formik>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
