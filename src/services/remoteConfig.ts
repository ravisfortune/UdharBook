import { supabase } from './supabase';

interface RemoteConfig {
  pro_enabled: boolean;
}

const DEFAULTS: RemoteConfig = {
  pro_enabled: false,
};

export async function fetchRemoteConfig(): Promise<RemoteConfig> {
  try {
    const { data, error } = await supabase
      .from('app_config')
      .select('key, value');

    if (error || !data) return DEFAULTS;

    const config = { ...DEFAULTS };
    for (const row of data) {
      if (row.key === 'pro_enabled') {
        config.pro_enabled = row.value === 'true';
      }
    }
    return config;
  } catch {
    return DEFAULTS;
  }
}
