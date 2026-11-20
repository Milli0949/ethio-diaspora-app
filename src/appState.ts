import {
  DEFAULT_LIVE_CONTROLS,
  DEFAULT_PRIVACY_SETTINGS,
  LiveAppControls,
  PlanTier,
  UserPrivacySettings,
  isOwnerAccount,
} from './appRules';

const PRIVACY_STORAGE_KEY = 'ethio_diaspora_privacy_v1';
const CONTROLS_STORAGE_KEY = 'ethio_diaspora_live_controls_v1';

export function loadPrivacySettings(): UserPrivacySettings {
  try {
    const raw = localStorage.getItem(PRIVACY_STORAGE_KEY);
    if (!raw) return DEFAULT_PRIVACY_SETTINGS;
    return { ...DEFAULT_PRIVACY_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PRIVACY_SETTINGS;
  }
}

export function savePrivacySettings(settings: UserPrivacySettings): void {
  try {
    localStorage.setItem(PRIVACY_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore storage quota errors
  }
}

export function loadLiveControls(): LiveAppControls {
  try {
    const raw = localStorage.getItem(CONTROLS_STORAGE_KEY);
    if (!raw) return DEFAULT_LIVE_CONTROLS;
    return { ...DEFAULT_LIVE_CONTROLS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_LIVE_CONTROLS;
  }
}

export function saveLiveControls(controls: LiveAppControls): void {
  try {
    localStorage.setItem(CONTROLS_STORAGE_KEY, JSON.stringify(controls));
  } catch {
    // ignore storage quota errors
  }
}

export function resolveCurrentUserTier(params: {
  email?: string | null;
  role?: string | null;
  explicitTier?: PlanTier | null;
}): PlanTier {
  if (isOwnerAccount(params.email, params.role) || params.explicitTier === 'owner') {
    return 'owner';
  }
  return params.explicitTier || 'normal';
}
