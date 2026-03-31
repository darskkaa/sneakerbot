import { useState } from 'react';
import { 
  ArrowPathIcon, 
  CheckCircleIcon, 
  InformationCircleIcon 
} from '@heroicons/react/24/outline';
import { Switch } from '@headlessui/react';
import { useAppContext } from '../context/AppContext';
import { LoadingSpinner } from '../components/common';

export default function Settings() {
  const { settings, loading, updateSettings } = useAppContext();
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Handle toggling boolean settings
  const handleToggle = async (setting: string, value: boolean) => {
    setIsSaving(true);
    try {
      await updateSettings({ [setting]: value });
      showSuccess();
    } catch (error) {
      console.error(`Error updating ${setting}:`, error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle text/select input changes
  const handleChange = async (setting: string, value: any) => {
    setIsSaving(true);
    try {
      await updateSettings({ [setting]: value });
      showSuccess();
    } catch (error) {
      console.error(`Error updating ${setting}:`, error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Show success message temporarily
  const showSuccess = () => {
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };
  
  // Check for updates
  const checkForUpdates = () => {
    window.api.checkForUpdates();
  };
  
  if (loading.settings) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-wsb-text">Settings</h1>
        {showSuccessMessage && (
          <div className="flex items-center text-wsb-success">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            <span>Settings saved</span>
          </div>
        )}
      </div>
      
      {/* General Settings */}
      <div className="card">
        <h2 className="text-lg font-medium text-wsb-text mb-4">General</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-wsb-text font-medium">Auto-update</h3>
              <p className="text-wsb-text-secondary text-sm">
                Automatically download and install updates
              </p>
            </div>
            <Switch
              checked={settings.autoUpdateEnabled}
              onChange={(value) => handleToggle('autoUpdateEnabled', value)}
              disabled={isSaving}
              className={`${
                settings.autoUpdateEnabled ? 'bg-wsb-primary' : 'bg-gray-700'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-wsb-primary focus:ring-offset-2`}
            >
              <span
                className={`${
                  settings.autoUpdateEnabled ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>
          
          <div className="flex items-center justify-between border-t border-gray-700 pt-4">
            <div>
              <h3 className="text-wsb-text font-medium">Version</h3>
              <p className="text-wsb-text-secondary text-sm">
                SneakerBot v0.9.0
              </p>
            </div>
            <button
              className="btn-secondary"
              onClick={checkForUpdates}
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Check for Updates
            </button>
          </div>
        </div>
      </div>
      
      {/* Bot Settings */}
      <div className="card">
        <h2 className="text-lg font-medium text-wsb-text mb-4">Bot Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="riskMode" className="form-label">Default Risk Mode</label>
            <select
              id="riskMode"
              value={settings.riskMode}
              onChange={(e) => handleChange('riskMode', e.target.value)}
              disabled={isSaving}
              className="form-input"
            >
              <option value="safe">Safe - Slower but more reliable checkouts</option>
              <option value="balanced">Balanced - Default setting, good success rate</option>
              <option value="fast">Fast - Fastest checkout, higher chance of detection</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="defaultCheckoutDelay" className="form-label">Default Checkout Delay (ms)</label>
            <input
              type="number"
              id="defaultCheckoutDelay"
              value={settings.defaultCheckoutDelay}
              onChange={(e) => handleChange('defaultCheckoutDelay', parseInt(e.target.value, 10))}
              min="0"
              max="3000"
              step="50"
              disabled={isSaving}
              className="form-input"
            />
            <p className="mt-1 text-sm text-wsb-text-secondary">
              Additional delay before submitting checkout (0-3000ms)
            </p>
          </div>
        </div>
      </div>
      
      {/* CAPTCHA Settings */}
      <div className="card">
        <h2 className="text-lg font-medium text-wsb-text mb-4">CAPTCHA Solver</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="captchaProvider" className="form-label">CAPTCHA Provider</label>
            <select
              id="captchaProvider"
              value={settings.captchaProvider}
              onChange={(e) => handleChange('captchaProvider', e.target.value)}
              disabled={isSaving}
              className="form-input"
            >
              <option value="manual">Manual Solving</option>
              <option value="2captcha">2Captcha</option>
              <option value="capmonster">CapMonster</option>
              <option value="aycd">AYCD AutoSolve</option>
            </select>
          </div>
          
          {settings.captchaProvider !== 'manual' && (
            <div>
              <label htmlFor="captchaApiKey" className="form-label">API Key</label>
              <input
                type="password"
                id="captchaApiKey"
                value={settings.captchaApiKey || ''}
                onChange={(e) => handleChange('captchaApiKey', e.target.value)}
                disabled={isSaving}
                className="form-input"
                placeholder="Enter your API key"
              />
            </div>
          )}
          
          <div className="p-4 bg-gray-800 rounded-lg flex items-start">
            <InformationCircleIcon className="h-5 w-5 text-wsb-primary mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-wsb-text-secondary">
              CAPTCHA solving services charge per solve. Manual solving is free but requires you to be present.
              For high-volume tasks, we recommend using an automated service.
            </p>
          </div>
        </div>
      </div>
      
      {/* Webhooks */}
      <div className="card">
        <h2 className="text-lg font-medium text-wsb-text mb-4">Notifications</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="discordWebhook" className="form-label">Discord Webhook URL</label>
            <input
              type="text"
              id="discordWebhook"
              value={settings.discordWebhook || ''}
              onChange={(e) => handleChange('discordWebhook', e.target.value)}
              disabled={isSaving}
              className="form-input"
              placeholder="https://discord.com/api/webhooks/..."
            />
            <p className="mt-1 text-sm text-wsb-text-secondary">
              Receive checkout success and failure notifications in your Discord server
            </p>
          </div>
          
          <div>
            <label htmlFor="slackWebhook" className="form-label">Slack Webhook URL</label>
            <input
              type="text"
              id="slackWebhook"
              value={settings.slackWebhook || ''}
              onChange={(e) => handleChange('slackWebhook', e.target.value)}
              disabled={isSaving}
              className="form-input"
              placeholder="https://hooks.slack.com/services/..."
            />
          </div>
          
          <div className="flex items-center justify-between border-t border-gray-700 pt-4">
            <div>
              <h3 className="text-wsb-text font-medium">Test Notifications</h3>
              <p className="text-wsb-text-secondary text-sm">
                Send a test notification to verify your webhook configuration
              </p>
            </div>
            <button className="btn-secondary">
              Send Test
            </button>
          </div>
        </div>
      </div>
      
      {/* Storage and Data */}
      <div className="card">
        <h2 className="text-lg font-medium text-wsb-text mb-4">Storage & Data</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-wsb-text font-medium">Clear Browser Cache</h3>
              <p className="text-wsb-text-secondary text-sm">
                Remove cookies, session data, and browsing history
              </p>
            </div>
            <button className="btn-secondary">
              Clear Cache
            </button>
          </div>
          
          <div className="flex items-center justify-between border-t border-gray-700 pt-4">
            <div>
              <h3 className="text-wsb-text font-medium">Export Settings</h3>
              <p className="text-wsb-text-secondary text-sm">
                Save your settings as a JSON file
              </p>
            </div>
            <div className="flex space-x-2">
              <button className="btn-secondary">
                Export
              </button>
              <button className="btn-secondary">
                Import
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t border-gray-700 pt-4">
            <div>
              <h3 className="text-wsb-text font-medium">Factory Reset</h3>
              <p className="text-wsb-text-secondary text-sm">
                Reset all settings to default and clear all data
              </p>
            </div>
            <button className="btn-error">
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
