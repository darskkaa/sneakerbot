import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Task } from '../types/models';

interface Profile {
  id: string;
  name: string;
  shippingInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billingInfo: {
    cardholderName: string;
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    useShippingAsBilling: boolean;
  };
}

interface Proxy {
  id: string;
  name: string;
  host: string;
  port: number;
  username?: string;
  password?: string;
  type: 'http' | 'https' | 'socks4' | 'socks5';
  status: 'untested' | 'working' | 'failed' | 'Healthy' | 'Slow' | 'Banned' | 'Unknown';
  lastTested?: Date;
  responseTime?: number;
}

interface Settings {
  captchaProvider: 'manual' | '2captcha' | 'capmonster' | 'aycd';
  captchaApiKey?: string;
  discordWebhook?: string;
  slackWebhook?: string;
  defaultCheckoutDelay: number;
  riskMode: 'safe' | 'balanced' | 'fast';
  autoUpdateEnabled: boolean;
}

interface DashboardStats {
  totalCheckouts: number;
  successRate: number;
  activeTasks: number;
  failedAttempts: number;
}

export interface ActivityLog {
  id: string;
  type: 'checkout_success' | 'checkout_failure' | 'task_created' | 'task_started' | 'task_stopped' | 'proxy_failed' | 'proxy_success' | 'profile_updated' | 'settings_changed' | 'stock_detected' | 'info' | 'warning';
  content: string;
  details?: string;
  timestamp: string;
  relatedId?: string;
}

interface AppContextType {
  tasks: Task[];
  profiles: Profile[];
  proxies: Proxy[];
  settings: Settings;
  stats: DashboardStats | null;
  activities: ActivityLog[];
  loading: {
    tasks: boolean;
    profiles: boolean;
    proxies: boolean;
    settings: boolean;
    stats: boolean;
    activities: boolean;
  };
  addTask: (task: Omit<Task, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: number, updates: Partial<Task>) => Promise<Task | undefined>;
  deleteTask: (id: number) => Promise<void>;
  startTask: (id: number) => Promise<void>;
  stopTask: (id: number) => Promise<void>;
  addProfile: (profile: Omit<Profile, 'id'>) => Promise<void>;
  updateProfile: (id: string, updates: Partial<Profile>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  addProxy: (proxy: Omit<Proxy, 'id' | 'status' | 'lastTested'>) => Promise<void>;
  updateProxy: (id: string, updates: Partial<Proxy>) => Promise<void>;
  deleteProxy: (id: string) => Promise<void>;
  testProxy: (id: string) => Promise<void>;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  getTask: (id: number) => Promise<Task | undefined>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const getDefaultSettings = (): Settings => ({
  captchaProvider: 'manual',
  defaultCheckoutDelay: 3000,
  riskMode: 'balanced',
  autoUpdateEnabled: true,
});

// Map Supabase task row → Task
const mapTask = (row: any): Task => ({
  id: row.id,
  name: row.name,
  site: row.site,
  productUrl: row.product_url,
  sku: row.sku,
  size: row.size,
  status: row.status,
  message: row.message,
  profile: row.profile_id,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
  logs: row.logs ?? [],
});

// Map Supabase profile row → Profile
const mapProfile = (row: any): Profile => ({
  id: row.id,
  name: row.name,
  shippingInfo: {
    firstName: row.first_name ?? '',
    lastName: row.last_name ?? '',
    email: row.email,
    phone: row.phone ?? '',
    address1: row.address,
    address2: row.address2,
    city: row.city,
    state: row.state,
    zipCode: row.zip,
    country: row.country,
  },
  billingInfo: {
    cardholderName: row.card_holder,
    cardNumber: row.card_number_encrypted,
    expiryMonth: (row.card_expiry ?? '/').split('/')[0] ?? '',
    expiryYear: (row.card_expiry ?? '/').split('/')[1] ?? '',
    cvv: row.card_cvv_encrypted,
    useShippingAsBilling: false,
  },
});

// Map Supabase proxy row → Proxy
const mapProxy = (row: any): Proxy => ({
  id: row.id,
  name: row.name,
  host: row.host,
  port: row.port,
  username: row.username,
  password: row.password,
  type: row.type,
  status: row.status,
  lastTested: row.last_tested ? new Date(row.last_tested) : undefined,
  responseTime: row.response_time,
});

// Map Supabase activity row → ActivityLog
const mapActivity = (row: any): ActivityLog => ({
  id: row.id,
  type: row.type,
  content: row.content,
  details: row.details,
  timestamp: row.created_at,
  relatedId: row.related_id,
});

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};

export const AppContextProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [proxies, setProxies] = useState<Proxy[]>([]);
  const [settings, setSettings] = useState<Settings>(getDefaultSettings());
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState({
    tasks: true,
    profiles: true,
    proxies: true,
    settings: true,
    stats: true,
    activities: true,
  });

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Tasks
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setTasks((tasksData ?? []).map(mapTask));
      setLoading(prev => ({ ...prev, tasks: false }));

      // Profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setProfiles((profilesData ?? []).map(mapProfile));
      setLoading(prev => ({ ...prev, profiles: false }));

      // Proxies
      const { data: proxiesData } = await supabase
        .from('proxies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setProxies((proxiesData ?? []).map(mapProxy));
      setLoading(prev => ({ ...prev, proxies: false }));

      // Settings
      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (settingsData) {
        setSettings({
          captchaProvider: settingsData.captcha_provider ?? 'manual',
          captchaApiKey: settingsData.captcha_api_key,
          discordWebhook: settingsData.discord_webhook,
          slackWebhook: settingsData.slack_webhook,
          defaultCheckoutDelay: settingsData.checkout_delay ?? 3000,
          riskMode: settingsData.risk_mode ?? 'balanced',
          autoUpdateEnabled: settingsData.auto_update_enabled ?? true,
        });
      }
      setLoading(prev => ({ ...prev, settings: false }));

      // Stats (computed from tasks + activity_logs)
      const { data: allTasks } = await supabase
        .from('tasks')
        .select('status')
        .eq('user_id', user.id);
      const taskList = allTasks ?? [];
      const totalCheckouts = taskList.filter(t => t.status === 'success').length;
      const failedAttempts = taskList.filter(t => t.status === 'error').length;
      const activeTasks = taskList.filter(t => t.status === 'running' || t.status === 'monitoring').length;
      const total = totalCheckouts + failedAttempts;
      setStats({
        totalCheckouts,
        successRate: total > 0 ? Math.round((totalCheckouts / total) * 100) : 0,
        activeTasks,
        failedAttempts,
      });
      setLoading(prev => ({ ...prev, stats: false }));

      // Activity logs
      const { data: logsData } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      setActivities((logsData ?? []).map(mapActivity));
      setLoading(prev => ({ ...prev, activities: false }));

      // Electron real-time task updates (optional)
      if (typeof window !== 'undefined' && window.api?.on) {
        window.api.on('task-update', (updatedTask: Task) => {
          setTasks(prev => {
            const idx = prev.findIndex(t => t.id === updatedTask.id);
            if (idx !== -1) {
              const next = [...prev];
              next[idx] = updatedTask;
              return next;
            }
            return [...prev, updatedTask];
          });
        });
      }
    };

    loadData();
  }, []);

  const addTask = async (task: Omit<Task, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from('tasks').insert({
      user_id: user.id,
      name: task.name,
      site: task.site,
      product_url: task.productUrl,
      sku: task.sku,
      size: task.size,
      status: 'idle',
      profile_id: task.profile ?? null,
    }).select().single();
    if (error) throw error;
    setTasks(prev => [mapTask(data), ...prev]);
    await supabase.from('activity_logs').insert({ user_id: user.id, type: 'task_created', content: `Task created: ${task.name ?? task.site}` });
  };

  const updateTask = async (id: number, updates: Partial<Task>) => {
    const { data, error } = await supabase.from('tasks').update({
      ...(updates.status && { status: updates.status }),
      ...(updates.message !== undefined && { message: updates.message }),
      updated_at: new Date().toISOString(),
    }).eq('id', id).select().single();
    if (error) throw error;
    const updated = mapTask(data);
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
    return updated;
  };

  const deleteTask = async (id: number) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const startTask = async (id: number) => {
    await updateTask(id, { status: 'running' });
    if (window.api?.startTask) await window.api.startTask(id);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from('activity_logs').insert({ user_id: user.id, type: 'task_started', content: `Task started`, related_id: String(id) });
  };

  const stopTask = async (id: number) => {
    await updateTask(id, { status: 'idle' });
    if (window.api?.stopTask) await window.api.stopTask(id);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from('activity_logs').insert({ user_id: user.id, type: 'task_stopped', content: `Task stopped`, related_id: String(id) });
  };

  const addProfile = async (profile: Omit<Profile, 'id'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const s = profile.shippingInfo;
    const b = profile.billingInfo;
    const { data, error } = await supabase.from('profiles').insert({
      user_id: user.id,
      name: profile.name,
      first_name: s.firstName,
      last_name: s.lastName,
      email: s.email,
      phone: s.phone,
      address: s.address1,
      address2: s.address2,
      city: s.city,
      state: s.state,
      zip: s.zipCode,
      country: s.country,
      card_holder: b.cardholderName,
      card_number_encrypted: b.cardNumber,
      card_expiry: `${b.expiryMonth}/${b.expiryYear}`,
      card_cvv_encrypted: b.cvv,
    }).select().single();
    if (error) throw error;
    setProfiles(prev => [mapProfile(data), ...prev]);
  };

  const updateProfile = async (id: string, updates: Partial<Profile>) => {
    const patch: any = {};
    if (updates.name) patch.name = updates.name;
    if (updates.shippingInfo) {
      const s = updates.shippingInfo;
      if (s.firstName) patch.first_name = s.firstName;
      if (s.lastName) patch.last_name = s.lastName;
      if (s.email) patch.email = s.email;
      if (s.phone) patch.phone = s.phone;
      if (s.address1) patch.address = s.address1;
      if (s.address2 !== undefined) patch.address2 = s.address2;
      if (s.city) patch.city = s.city;
      if (s.state) patch.state = s.state;
      if (s.zipCode) patch.zip = s.zipCode;
      if (s.country) patch.country = s.country;
    }
    if (updates.billingInfo) {
      const b = updates.billingInfo;
      if (b.cardholderName) patch.card_holder = b.cardholderName;
      if (b.cardNumber) patch.card_number_encrypted = b.cardNumber;
      if (b.expiryMonth || b.expiryYear) {
        const existing = profiles.find(p => p.id === id);
        patch.card_expiry = `${b.expiryMonth ?? existing?.billingInfo.expiryMonth ?? ''}/${b.expiryYear ?? existing?.billingInfo.expiryYear ?? ''}`;
      }
      if (b.cvv) patch.card_cvv_encrypted = b.cvv;
    }
    const { data, error } = await supabase.from('profiles').update(patch).eq('id', id).select().single();
    if (error) throw error;
    setProfiles(prev => prev.map(p => p.id === id ? mapProfile(data) : p));
  };

  const deleteProfile = async (id: string) => {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) throw error;
    setProfiles(prev => prev.filter(p => p.id !== id));
  };

  const addProxy = async (proxy: Omit<Proxy, 'id' | 'status' | 'lastTested'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from('proxies').insert({
      user_id: user.id,
      name: proxy.name,
      host: proxy.host,
      port: proxy.port,
      username: proxy.username,
      password: proxy.password,
      type: proxy.type,
      status: 'untested',
    }).select().single();
    if (error) throw error;
    setProxies(prev => [mapProxy(data), ...prev]);
  };

  const updateProxy = async (id: string, updates: Partial<Proxy>) => {
    const patch: any = {};
    if (updates.status) patch.status = updates.status.toLowerCase();
    if (updates.responseTime !== undefined) patch.response_time = updates.responseTime;
    if (updates.lastTested) patch.last_tested = updates.lastTested.toISOString();
    const { data, error } = await supabase.from('proxies').update(patch).eq('id', id).select().single();
    if (error) throw error;
    setProxies(prev => prev.map(p => p.id === id ? mapProxy(data) : p));
  };

  const deleteProxy = async (id: string) => {
    const { error } = await supabase.from('proxies').delete().eq('id', id);
    if (error) throw error;
    setProxies(prev => prev.filter(p => p.id !== id));
  };

  const testProxy = async (id: string) => {
    await updateProxy(id, { status: 'untested' });
    if (window.api?.testProxy) {
      const result = await window.api.testProxy(id);
      await updateProxy(id, {
        status: result.success ? 'working' : 'failed',
        lastTested: new Date(),
        responseTime: result.responseTime,
      });
    } else {
      // Web mode: mark as untested (real testing requires Electron)
      await updateProxy(id, { status: 'untested', lastTested: new Date() });
    }
  };

  const updateSettings = async (updates: Partial<Settings>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const next = { ...settings, ...updates };
    await supabase.from('settings').upsert({
      user_id: user.id,
      captcha_provider: next.captchaProvider,
      captcha_api_key: next.captchaApiKey,
      discord_webhook: next.discordWebhook,
      slack_webhook: next.slackWebhook,
      checkout_delay: next.defaultCheckoutDelay,
      risk_mode: next.riskMode,
      auto_update_enabled: next.autoUpdateEnabled,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    setSettings(next);
  };

  const getTask = async (id: number): Promise<Task | undefined> => {
    const { data, error } = await supabase.from('tasks').select('*').eq('id', id).single();
    if (error) return undefined;
    const task = mapTask(data);
    setTasks(prev => {
      const idx = prev.findIndex(t => t.id === id);
      if (idx !== -1) { const n = [...prev]; n[idx] = task; return n; }
      return [...prev, task];
    });
    return task;
  };

  return (
    <AppContext.Provider value={{
      tasks, profiles, proxies, settings, stats, activities, loading,
      addTask, updateTask, deleteTask, startTask, stopTask,
      addProfile, updateProfile, deleteProfile,
      addProxy, updateProxy, deleteProxy, testProxy,
      updateSettings, getTask,
    }}>
      {children}
    </AppContext.Provider>
  );
};
