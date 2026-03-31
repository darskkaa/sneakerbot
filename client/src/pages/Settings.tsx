import { useState } from 'react';
import { Check, Bot, KeyRound, Bell, Database, RefreshCw, Info } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { LoadingSpinner } from '../components/common';
import { cn } from '../lib/utils';

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-4 gap-6">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border bg-secondary/20">
        <span className="text-muted-foreground">{icon}</span>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <div className="px-5 divide-y divide-border/60">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50',
        checked ? 'bg-primary' : 'bg-secondary border border-border'
      )}
    >
      <span
        className={cn(
          'inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200',
          checked ? 'translate-x-4.5' : 'translate-x-0.5'
        )}
        style={{ transform: checked ? 'translateX(18px)' : 'translateX(2px)' }}
      />
    </button>
  );
}

export default function Settings() {
  const { settings, loading, updateSettings } = useAppContext();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async (patch: Record<string, any>) => {
    setIsSaving(true);
    try {
      await updateSettings(patch);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading.settings) {
    return <div className="flex items-center justify-center py-24"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Configure your bot preferences</p>
        </div>
        {saved && (
          <div className="flex items-center gap-1.5 text-success text-sm font-medium">
            <Check className="w-4 h-4" />
            Saved
          </div>
        )}
      </div>

      {/* General */}
      <Section icon={<RefreshCw className="w-4 h-4" />} title="General">
        <SettingRow label="Auto-update" description="Automatically download and install updates">
          <Toggle
            checked={settings.autoUpdateEnabled}
            onChange={(v) => save({ autoUpdateEnabled: v })}
            disabled={isSaving}
          />
        </SettingRow>
        <SettingRow label="Version" description="SneakerBot v1.0.0">
          <button className="btn-secondary btn-sm gap-1.5" onClick={() => (window as any).api?.checkForUpdates?.()}>
            <RefreshCw className="w-3.5 h-3.5" />
            Check Updates
          </button>
        </SettingRow>
      </Section>

      {/* Bot Settings */}
      <Section icon={<Bot className="w-4 h-4" />} title="Bot Settings">
        <SettingRow label="Risk Mode" description="Speed vs. detection trade-off">
          <select
            value={settings.riskMode}
            onChange={(e) => save({ riskMode: e.target.value })}
            disabled={isSaving}
            className="form-input w-52"
          >
            <option value="safe">Safe — Slower, more reliable</option>
            <option value="balanced">Balanced — Good success rate</option>
            <option value="fast">Fast — Highest speed, more risk</option>
          </select>
        </SettingRow>
        <SettingRow label="Checkout Delay" description="Extra delay before submit (0–3000ms)">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={settings.defaultCheckoutDelay}
              onChange={(e) => save({ defaultCheckoutDelay: parseInt(e.target.value, 10) })}
              min="0" max="3000" step="50"
              disabled={isSaving}
              className="form-input w-28 text-right tabular-nums"
            />
            <span className="text-sm text-muted-foreground">ms</span>
          </div>
        </SettingRow>
      </Section>

      {/* CAPTCHA */}
      <Section icon={<KeyRound className="w-4 h-4" />} title="CAPTCHA Solver">
        <SettingRow label="Provider">
          <select
            value={settings.captchaProvider}
            onChange={(e) => save({ captchaProvider: e.target.value })}
            disabled={isSaving}
            className="form-input w-52"
          >
            <option value="manual">Manual Solving</option>
            <option value="2captcha">2Captcha</option>
            <option value="capmonster">CapMonster</option>
            <option value="aycd">AYCD AutoSolve</option>
          </select>
        </SettingRow>
        {settings.captchaProvider !== 'manual' && (
          <SettingRow label="API Key">
            <input
              type="password"
              value={settings.captchaApiKey ?? ''}
              onChange={(e) => save({ captchaApiKey: e.target.value })}
              disabled={isSaving}
              placeholder="Enter API key"
              className="form-input w-64"
            />
          </SettingRow>
        )}
        <div className="py-3">
          <div className="flex items-start gap-2.5 p-3 rounded-md bg-primary/5 border border-primary/10">
            <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Automated solvers charge per solve. Manual solving is free but requires you to be present.
            </p>
          </div>
        </div>
      </Section>

      {/* Notifications */}
      <Section icon={<Bell className="w-4 h-4" />} title="Notifications">
        <SettingRow label="Discord Webhook" description="Checkout success and failure notifications">
          <input
            type="text"
            value={settings.discordWebhook ?? ''}
            onChange={(e) => save({ discordWebhook: e.target.value })}
            disabled={isSaving}
            placeholder="https://discord.com/api/webhooks/..."
            className="form-input w-80"
          />
        </SettingRow>
        <SettingRow label="Slack Webhook">
          <input
            type="text"
            value={settings.slackWebhook ?? ''}
            onChange={(e) => save({ slackWebhook: e.target.value })}
            disabled={isSaving}
            placeholder="https://hooks.slack.com/services/..."
            className="form-input w-80"
          />
        </SettingRow>
        <SettingRow label="Test Notifications" description="Verify webhook configuration">
          <button className="btn-secondary btn-sm">Send Test</button>
        </SettingRow>
      </Section>

      {/* Data */}
      <Section icon={<Database className="w-4 h-4" />} title="Storage & Data">
        <SettingRow label="Browser Cache" description="Remove cookies, session data, and history">
          <button className="btn-secondary btn-sm">Clear Cache</button>
        </SettingRow>
        <SettingRow label="Settings Backup" description="Export or import your configuration">
          <div className="flex gap-2">
            <button className="btn-secondary btn-sm">Export</button>
            <button className="btn-secondary btn-sm">Import</button>
          </div>
        </SettingRow>
        <SettingRow label="Factory Reset" description="Reset all settings and clear all data">
          <button className="btn-destructive btn-sm">Reset</button>
        </SettingRow>
      </Section>
    </div>
  );
}
