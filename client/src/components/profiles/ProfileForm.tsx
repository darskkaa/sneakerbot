import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAppContext } from '../../context/AppContext';
import { LoadingSpinner } from '../common';

interface ProfileFormProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: any;
}

// Validation schema for the profile form
const ProfileSchema = Yup.object().shape({
  name: Yup.string().required('Profile name is required'),
  shippingInfo: Yup.object().shape({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string().required('Phone number is required'),
    address1: Yup.string().required('Address is required'),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
    zipCode: Yup.string().required('ZIP code is required'),
    country: Yup.string().required('Country is required'),
  }),
  billingInfo: Yup.object().shape({
    cardholderName: Yup.string().required('Cardholder name is required'),
    cardNumber: Yup.string()
      .matches(/^\d{13,19}$/, 'Card number must be between 13 and 19 digits')
      .required('Card number is required'),
    expiryMonth: Yup.string()
      .matches(/^(0[1-9]|1[0-2])$/, 'Month must be between 01 and 12')
      .required('Expiry month is required'),
    expiryYear: Yup.string()
      .matches(/^\d{2}$/, 'Year must be 2 digits')
      .required('Expiry year is required'),
    cvv: Yup.string()
      .matches(/^\d{3,4}$/, 'CVV must be 3 or 4 digits')
      .required('CVV is required'),
    useShippingAsBilling: Yup.boolean(),
  }),
});

export default function ProfileForm({ isOpen, onClose, profile }: ProfileFormProps) {
  const { addProfile, updateProfile } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('shipping');
  
  const isEditing = !!profile;
  
  // Initial values for the form
  const initialValues = profile || {
    name: '',
    shippingInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
    },
    billingInfo: {
      cardholderName: '',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      useShippingAsBilling: true,
    },
  };
  
  // Countries list for dropdown
  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'JP', name: 'Japan' },
  ];
  
  // Handle form submission
  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateProfile(profile.id, values);
      } else {
        await addProfile(values);
      }
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
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
              <Dialog.Panel className="w-full max-w-2xl transform rounded-2xl bg-wsb-dark-panel p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-lg font-medium text-wsb-text">
                    {isEditing ? 'Edit Profile' : 'Create New Profile'}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-wsb-text-secondary hover:text-wsb-text"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <Formik
                  initialValues={initialValues}
                  validationSchema={ProfileSchema}
                  onSubmit={handleSubmit}
                >
                  {({ values, errors, touched, isValid, setFieldValue }) => (
                    <Form className="space-y-6">
                      {/* Profile Name */}
                      <div>
                        <label htmlFor="name" className="form-label">Profile Name</label>
                        <Field
                          type="text"
                          id="name"
                          name="name"
                          placeholder="e.g., Home Address"
                          className="form-input"
                        />
                        <ErrorMessage name="name" component="div" className="mt-1 text-sm text-wsb-error" />
                      </div>

                      {/* Tabs for Shipping and Billing */}
                      <div className="border-b border-gray-700">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                          <button
                            type="button"
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                              activeTab === 'shipping'
                                ? 'border-wsb-primary text-wsb-primary'
                                : 'border-transparent text-wsb-text-secondary hover:text-wsb-text hover:border-gray-700'
                            }`}
                            onClick={() => setActiveTab('shipping')}
                          >
                            Shipping Information
                          </button>
                          <button
                            type="button"
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                              activeTab === 'billing'
                                ? 'border-wsb-primary text-wsb-primary'
                                : 'border-transparent text-wsb-text-secondary hover:text-wsb-text hover:border-gray-700'
                            }`}
                            onClick={() => setActiveTab('billing')}
                          >
                            Payment Information
                          </button>
                        </nav>
                      </div>

                      {/* Shipping Information Form */}
                      {activeTab === 'shipping' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="shippingInfo.firstName" className="form-label">First Name</label>
                              <Field
                                type="text"
                                id="shippingInfo.firstName"
                                name="shippingInfo.firstName"
                                className="form-input"
                              />
                              <ErrorMessage name="shippingInfo.firstName" component="div" className="mt-1 text-sm text-wsb-error" />
                            </div>
                            <div>
                              <label htmlFor="shippingInfo.lastName" className="form-label">Last Name</label>
                              <Field
                                type="text"
                                id="shippingInfo.lastName"
                                name="shippingInfo.lastName"
                                className="form-input"
                              />
                              <ErrorMessage name="shippingInfo.lastName" component="div" className="mt-1 text-sm text-wsb-error" />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="shippingInfo.email" className="form-label">Email</label>
                              <Field
                                type="email"
                                id="shippingInfo.email"
                                name="shippingInfo.email"
                                className="form-input"
                              />
                              <ErrorMessage name="shippingInfo.email" component="div" className="mt-1 text-sm text-wsb-error" />
                            </div>
                            <div>
                              <label htmlFor="shippingInfo.phone" className="form-label">Phone</label>
                              <Field
                                type="text"
                                id="shippingInfo.phone"
                                name="shippingInfo.phone"
                                className="form-input"
                              />
                              <ErrorMessage name="shippingInfo.phone" component="div" className="mt-1 text-sm text-wsb-error" />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="shippingInfo.address1" className="form-label">Address Line 1</label>
                            <Field
                              type="text"
                              id="shippingInfo.address1"
                              name="shippingInfo.address1"
                              className="form-input"
                            />
                            <ErrorMessage name="shippingInfo.address1" component="div" className="mt-1 text-sm text-wsb-error" />
                          </div>

                          <div>
                            <label htmlFor="shippingInfo.address2" className="form-label">
                              Address Line 2 <span className="text-wsb-text-secondary">(Optional)</span>
                            </label>
                            <Field
                              type="text"
                              id="shippingInfo.address2"
                              name="shippingInfo.address2"
                              className="form-input"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="shippingInfo.city" className="form-label">City</label>
                              <Field
                                type="text"
                                id="shippingInfo.city"
                                name="shippingInfo.city"
                                className="form-input"
                              />
                              <ErrorMessage name="shippingInfo.city" component="div" className="mt-1 text-sm text-wsb-error" />
                            </div>
                            <div>
                              <label htmlFor="shippingInfo.state" className="form-label">State/Province</label>
                              <Field
                                type="text"
                                id="shippingInfo.state"
                                name="shippingInfo.state"
                                className="form-input"
                              />
                              <ErrorMessage name="shippingInfo.state" component="div" className="mt-1 text-sm text-wsb-error" />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="shippingInfo.zipCode" className="form-label">ZIP/Postal Code</label>
                              <Field
                                type="text"
                                id="shippingInfo.zipCode"
                                name="shippingInfo.zipCode"
                                className="form-input"
                              />
                              <ErrorMessage name="shippingInfo.zipCode" component="div" className="mt-1 text-sm text-wsb-error" />
                            </div>
                            <div>
                              <label htmlFor="shippingInfo.country" className="form-label">Country</label>
                              <Field
                                as="select"
                                id="shippingInfo.country"
                                name="shippingInfo.country"
                                className="form-input"
                              >
                                {countries.map((country) => (
                                  <option key={country.code} value={country.code}>
                                    {country.name}
                                  </option>
                                ))}
                              </Field>
                              <ErrorMessage name="shippingInfo.country" component="div" className="mt-1 text-sm text-wsb-error" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Billing Information Form */}
                      {activeTab === 'billing' && (
                        <div className="space-y-4">
                          <div className="flex items-center mb-4">
                            <Field
                              type="checkbox"
                              id="billingInfo.useShippingAsBilling"
                              name="billingInfo.useShippingAsBilling"
                              className="h-4 w-4 text-wsb-primary bg-gray-700 border-gray-600 rounded focus:ring-wsb-primary"
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setFieldValue('billingInfo.useShippingAsBilling', e.target.checked);
                                if (e.target.checked) {
                                  setFieldValue('billingInfo.cardholderName', 
                                    `${values.shippingInfo.firstName} ${values.shippingInfo.lastName}`);
                                }
                              }}
                            />
                            <label htmlFor="billingInfo.useShippingAsBilling" className="ml-2 text-wsb-text">
                              Use shipping address for billing
                            </label>
                          </div>

                          <div>
                            <label htmlFor="billingInfo.cardholderName" className="form-label">Cardholder Name</label>
                            <Field
                              type="text"
                              id="billingInfo.cardholderName"
                              name="billingInfo.cardholderName"
                              className="form-input"
                            />
                            <ErrorMessage name="billingInfo.cardholderName" component="div" className="mt-1 text-sm text-wsb-error" />
                          </div>

                          <div>
                            <label htmlFor="billingInfo.cardNumber" className="form-label">Card Number</label>
                            <Field
                              type="text"
                              id="billingInfo.cardNumber"
                              name="billingInfo.cardNumber"
                              placeholder="XXXX XXXX XXXX XXXX"
                              className="form-input"
                            />
                            <ErrorMessage name="billingInfo.cardNumber" component="div" className="mt-1 text-sm text-wsb-error" />
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label htmlFor="billingInfo.expiryMonth" className="form-label">Month</label>
                              <Field
                                type="text"
                                id="billingInfo.expiryMonth"
                                name="billingInfo.expiryMonth"
                                placeholder="MM"
                                className="form-input"
                              />
                              <ErrorMessage name="billingInfo.expiryMonth" component="div" className="mt-1 text-sm text-wsb-error" />
                            </div>
                            <div>
                              <label htmlFor="billingInfo.expiryYear" className="form-label">Year</label>
                              <Field
                                type="text"
                                id="billingInfo.expiryYear"
                                name="billingInfo.expiryYear"
                                placeholder="YY"
                                className="form-input"
                              />
                              <ErrorMessage name="billingInfo.expiryYear" component="div" className="mt-1 text-sm text-wsb-error" />
                            </div>
                            <div>
                              <label htmlFor="billingInfo.cvv" className="form-label">CVV</label>
                              <Field
                                type="text"
                                id="billingInfo.cvv"
                                name="billingInfo.cvv"
                                placeholder="XXX"
                                className="form-input"
                              />
                              <ErrorMessage name="billingInfo.cvv" component="div" className="mt-1 text-sm text-wsb-error" />
                            </div>
                          </div>

                          <div className="p-3 bg-gray-800 rounded-lg">
                            <p className="text-wsb-text-secondary text-sm">
                              All payment data is encrypted using AES-256-GCM and stored locally in a secure vault.
                              Your card details are never sent to our servers.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Form Actions */}
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
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <LoadingSpinner size="sm" color="white" />
                              <span className="ml-2">Saving...</span>
                            </>
                          ) : (
                            isEditing ? 'Update Profile' : 'Create Profile'
                          )}
                        </button>
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
