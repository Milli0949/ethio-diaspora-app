export type PlanTier = 'normal' | 'paid' | 'vip' | 'owner';
export type ThemeMode = 'dark' | 'light';
export type ChatBackgroundPreset = 'classic' | 'midnight' | 'warm-sand' | 'emerald-mist';
export type PrivacyLevel = 'everyone' | 'matches_only' | 'private';

export interface UserPrivacySettings {
  messagePrivacy: PrivacyLevel;
  postPrivacy: PrivacyLevel;
  hideOnlineStatus: boolean;
  themeMode: ThemeMode;
  chatBackground: ChatBackgroundPreset;
}

export interface LiveAppControls {
  messageLimitBeforePaywall: number;
  blockMessagesToVip: boolean;
  maintenanceMode: boolean;
}

export const DEFAULT_MESSAGE_LIMIT = 5;

export const DEFAULT_LIVE_CONTROLS: LiveAppControls = {
  messageLimitBeforePaywall: DEFAULT_MESSAGE_LIMIT,
  blockMessagesToVip: true,
  maintenanceMode: false,
};

export const DEFAULT_PRIVACY_SETTINGS: UserPrivacySettings = {
  messagePrivacy: 'matches_only',
  postPrivacy: 'everyone',
  hideOnlineStatus: false,
  themeMode: 'dark',
  chatBackground: 'classic',
};

export function isOwnerAccount(email?: string | null, role?: string | null): boolean {
  if (role === 'owner') return true;
  const ownerEmail = (import.meta.env.VITE_OWNER_EMAIL || '').trim().toLowerCase();
  if (!ownerEmail || !email) return false;
  return email.trim().toLowerCase() === ownerEmail;
}

export function canSendChatMessage(params: {
  senderTier: PlanTier;
  recipientTier: PlanTier;
  messagesSentCount: number;
  isSenderOwner?: boolean;
  liveControls?: Partial<LiveAppControls>;
}): { allowed: boolean; reasonEn?: string; reasonAm?: string; requiresPayment?: boolean } {
  const controls: LiveAppControls = {
    ...DEFAULT_LIVE_CONTROLS,
    ...params.liveControls,
  };

  if (params.isSenderOwner || params.senderTier === 'owner') {
    return { allowed: true };
  }

  if (controls.maintenanceMode) {
    return {
      allowed: false,
      reasonEn: 'Messaging is temporarily paused by the app owner for maintenance.',
      reasonAm: 'የመልዕክት መላላክ በአፕ ባለቤት ለጥገና ለጊዜው ቆሟል።',
    };
  }

  if (controls.blockMessagesToVip && params.recipientTier === 'vip') {
    return {
      allowed: false,
      reasonEn: 'VIP members cannot receive direct messages from other users.',
      reasonAm: 'ለ VIP አባላት ከሌሎች ተጠቃሚዎች መልዕክት መላክ አይቻልም።',
    };
  }

  if (params.messagesSentCount >= controls.messageLimitBeforePaywall) {
    return {
      allowed: false,
      requiresPayment: true,
      reasonEn: `You have reached the ${controls.messageLimitBeforePaywall}-message limit. Please complete payment to continue.`,
      reasonAm: `የ${controls.messageLimitBeforePaywall} መልዕክት ገደብ አልቋል። ለመቀጠል እባክዎ ክፍያ ይፈጽሙ።`,
    };
  }

  return { allowed: true };
}
