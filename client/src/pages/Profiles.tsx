import { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import { useAppContext } from '../context/AppContext';
import ProfileForm from '../components/profiles/ProfileForm';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Profiles() {
  const { profiles, loading, deleteProfile } = useAppContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any>(null);
  
  const openNewProfileForm = () => {
    setEditingProfile(null);
    setIsFormOpen(true);
  };
  
  const openEditProfileForm = (profile: any) => {
    setEditingProfile(profile);
    setIsFormOpen(true);
  };
  
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingProfile(null);
  };

  const handleDeleteProfile = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this profile?')) {
      try {
        await deleteProfile(id);
      } catch (error) {
        console.error('Error deleting profile:', error);
      }
    }
  };

  // Mask sensitive data for display
  const maskCardNumber = (cardNumber: string) => {
    if (!cardNumber) return '';
    return '*'.repeat(cardNumber.length - 4) + cardNumber.slice(-4);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-wsb-text">Profiles</h1>
        <button 
          onClick={openNewProfileForm}
          className="btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Profile
        </button>
      </div>
      
      {loading.profiles ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : profiles.length === 0 ? (
        <EmptyState 
          title="No profiles yet"
          description="Create a profile with your shipping and payment information to use during checkout."
          actionText="Create Profile"
          onAction={openNewProfileForm}
          icon={IdentificationIcon}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <div key={profile.id} className="card hover:bg-gray-800 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-wsb-text">{profile.name}</h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => openEditProfileForm(profile)}
                    className="text-wsb-text-secondary hover:text-wsb-primary"
                    aria-label="Edit profile"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleDeleteProfile(profile.id)}
                    className="text-wsb-text-secondary hover:text-wsb-error"
                    aria-label="Delete profile"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {/* Shipping Information */}
                <div className="p-3 bg-gray-800 rounded-lg">
                  <h4 className="text-sm font-medium text-wsb-text-secondary mb-2">Shipping</h4>
                  <p className="text-wsb-text">
                    {profile.shippingInfo.firstName} {profile.shippingInfo.lastName}
                  </p>
                  <p className="text-wsb-text">{profile.shippingInfo.email}</p>
                  <p className="text-wsb-text">{profile.shippingInfo.address1}</p>
                  {profile.shippingInfo.address2 && (
                    <p className="text-wsb-text">{profile.shippingInfo.address2}</p>
                  )}
                  <p className="text-wsb-text">
                    {profile.shippingInfo.city}, {profile.shippingInfo.state} {profile.shippingInfo.zipCode}
                  </p>
                  <p className="text-wsb-text">{profile.shippingInfo.country}</p>
                </div>
                
                {/* Payment Information */}
                <div className="p-3 bg-gray-800 rounded-lg">
                  <h4 className="text-sm font-medium text-wsb-text-secondary mb-2">Payment</h4>
                  <p className="text-wsb-text">{profile.billingInfo.cardholderName}</p>
                  <p className="text-wsb-text">
                    {maskCardNumber(profile.billingInfo.cardNumber)}
                  </p>
                  <p className="text-wsb-text">
                    Expires: {profile.billingInfo.expiryMonth}/{profile.billingInfo.expiryYear}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {isFormOpen && (
        <ProfileForm 
          isOpen={isFormOpen} 
          onClose={closeForm} 
          profile={editingProfile}
        />
      )}
    </div>
  );
}
