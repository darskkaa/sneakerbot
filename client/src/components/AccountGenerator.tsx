import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface AccountGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (accountData: any) => void;
}

export default function AccountGenerator({ isOpen, onClose, onSuccess }: AccountGeneratorProps) {
  const [step, setStep] = useState<'generating' | 'verification' | 'success'>('generating');
  const [verificationCode, setVerificationCode] = useState('');
  const [accountData, setAccountData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateAccount = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Simulate account generation process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock account data
      const mockAccount = {
        id: `acc_${Date.now()}`,
        email: `user${Math.floor(Math.random() * 10000)}@example.com`,
        password: `pass${Math.floor(Math.random() * 100000)}`,
        status: 'pending_verification',
        createdAt: new Date().toISOString()
      };
      
      setAccountData(mockAccount);
      setStep('verification');
      
      // In a real implementation, you would call your account generation API here
      // const response = await fetch('/api/generate-account', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ /* account generation params */ })
      // });
      // const data = await response.json();
      // setAccountData(data);
      
    } catch (err) {
      setError('Failed to generate account. Please try again.');
      console.error('Account generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit verification code');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Verify the code with your API
      // For now, we'll accept any 6-digit code as valid
      // In production, you would verify this with your account generation service
      if (verificationCode.length === 6) {
        const verifiedAccount = {
          ...accountData,
          status: 'verified',
          verifiedAt: new Date().toISOString()
        };
        
        // Save to database
        const { error } = await supabase.from('accounts').insert([verifiedAccount]);
        
        if (error) {
          throw new Error(error.message);
        }
        
        setAccountData(verifiedAccount);
        setStep('success');
        
        // Call success callback after a short delay
        setTimeout(() => {
          onSuccess(verifiedAccount);
          onClose();
        }, 2000);
        
      } else {
        setError('Invalid verification code. Please try again.');
      }
      
    } catch (err) {
      setError('Verification failed. Please try again.');
      console.error('Verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Simulate resending code
      await new Promise(resolve => setTimeout(resolve, 1000));
      setError(''); // Clear any previous errors
      // In real implementation, call your resend API
      
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('generating');
    setVerificationCode('');
    setAccountData(null);
    setError('');
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-wsb-dark-panel rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-wsb-text">
            {step === 'generating' && 'Generate Account'}
            {step === 'verification' && 'Verify Account'}
            {step === 'success' && 'Account Created!'}
          </h2>
          <button
            onClick={handleClose}
            className="text-wsb-text-secondary hover:text-wsb-text"
          >
            ✕
          </button>
        </div>

        {step === 'generating' && (
          <div className="space-y-4">
            <p className="text-wsb-text-secondary">
              Click the button below to generate a new account. This process may take a few moments.
            </p>
            
            <button
              onClick={handleGenerateAccount}
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Account...
                </div>
              ) : (
                'Generate Account'
              )}
            </button>
          </div>
        )}

        {step === 'verification' && (
          <div className="space-y-4">
            <div className="bg-wsb-dark-base p-4 rounded-lg">
              <p className="text-wsb-text-secondary text-sm mb-2">Account Generated:</p>
              <p className="text-wsb-text font-mono text-sm">{accountData?.email}</p>
            </div>
            
            <p className="text-wsb-text-secondary">
              A 6-digit verification code has been sent to the generated account. 
              Please enter any 6-digit code to complete the account setup.
            </p>
            
            <div className="space-y-2">
              <label className="form-label">Verification Code</label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                className="form-input text-center text-lg tracking-widest"
                maxLength={6}
                disabled={loading}
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleVerifyCode}
                disabled={loading || verificationCode.length !== 6}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
              
              <button
                onClick={handleResendCode}
                disabled={loading}
                className="btn-secondary disabled:opacity-50"
              >
                Resend
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-4 text-center">
            <div className="text-green-400 text-6xl mb-4">✓</div>
            <h3 className="text-lg font-semibold text-wsb-text">Account Generated Successfully!</h3>
            <div className="bg-wsb-dark-base p-4 rounded-lg">
              <p className="text-wsb-text-secondary text-sm mb-2">Account Details:</p>
              <p className="text-wsb-text font-mono text-sm">{accountData?.email}</p>
              <p className="text-wsb-text-secondary text-xs mt-1">
                Password: {accountData?.password}
              </p>
            </div>
            <p className="text-wsb-text-secondary text-sm">
              The account has been verified and is ready to use.
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-wsb-error bg-opacity-10 border border-wsb-error rounded-lg">
            <p className="text-wsb-error text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
