import React, { useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Lock,
  LogOut,
  Moon,
  ShieldCheck,
  Smartphone,
  Sun,
  Trash2,
  UserPlus,
  UserX,
  X,
} from 'lucide-react';
import { compressImageToDataUrl } from '../data/seedData';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Lang,
  MessagePrivacy,
  PersonProfile,
  Theme,
  UserProfile,
} from '../types/app';
import { Avatar } from './Avatar';
import { ConfirmModal } from './Modals';

interface SettingsScreenProps {
  lang: Lang;
  theme: Theme;
  user: UserProfile;
  messagePrivacy: MessagePrivacy;
  blockedPeople: PersonProfile[];
  onChangeMessagePrivacy: (val: MessagePrivacy) => void;
  onUnblockPerson: (id: number) => void;
  onToggleTheme: () => void;
  onToggleLang: () => void;
  onEditProfile: () => void;
  onCreateNewProfile: () => void;
  onUpdatePhoto: (slotIndex: number, dataUrl: string) => void;
  onChangePassword: (newPassword: string) => void;
  onLogout: () => void;
  onRequestDeleteAccount: () => void;
  onNotify: (msg: string) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  lang,
  theme,
  user,
  messagePrivacy,
  blockedPeople,
  onChangeMessagePrivacy,
  onUnblockPerson,
  onToggleTheme,
  onToggleLang,
  onEditProfile,
  onCreateNewProfile,
  onUpdatePhoto,
  onChangePassword,
  onLogout,
  onRequestDeleteAccount,
  onNotify,
}) => {
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [confirmNewProfile, setConfirmNewProfile] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [activeSlot, setActiveSlot] = useState<number>(0);

  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
    const appUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/`
      : 'https://netlify.app';

  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const handleCopyAppLink = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      onNotify(lang === 'am' ? 'የመተግበሪያው ሊንክ ተቀድቷል!' : 'App download link copied!');
    } catch {
      onNotify(appUrl);
    }
  };

  const handleNativeInstall = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) {
        onNotify(lang === 'am' ? 'መተግበሪያው በመጫን ላይ ነው...' : 'Installing Fikir BeNetsa...');
        return;
      }
    }
    setShowInstallGuide(true);
  };

  const handlePhotoSlotClick = (idx: number) => {
    setActiveSlot(idx);
    photoInputRef.current?.click();
  };

  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const url = await compressImageToDataUrl(file, 640);
      onUpdatePhoto(activeSlot, url);
    } catch {
      onNotify(lang === 'am' ? 'ፎቶ መጫን አልተቻለም' : 'Failed to upload photo');
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.password && currentPwd !== user.password) {
      onNotify(lang === 'am' ? 'የቀድሞው የይለፍ ቃል ትክክል አይደለም!' : 'Current password is incorrect!');
      return;
    }
    if (newPwd.trim().length < 4) {
      onNotify(
        lang === 'am'
          ? 'አዲሱ የይለፍ ቃል ቢያንስ 4 ቁምፊ መሆን አለበት!'
          : 'New password must be at least 4 characters!'
      );
      return;
    }
    if (newPwd !== confirmPwd) {
      onNotify(
        lang === 'am'
          ? 'አዲሱ የይለፍ ቃል እና ማረጋገጫው አይመሳሰሉም!'
          : 'New password and confirmation do not match!'
      );
      return;
    }
    onChangePassword(newPwd.trim());
    setCurrentPwd('');
    setNewPwd('');
    setConfirmPwd('');
  };

  return (
    <div className="max-w-2xl mx-auto w-full space-y-5">
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          {lang === 'am' ? 'የግል ቅንብሮች (Personal Settings)' : 'Personal Settings & Profile'}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          {lang === 'am'
            ? 'መገለጫዎን ይቀይሩ፣ አዲስ መገለጫ ይጫኑ፣ የይለፍ ቃልዎን እና ግላዊነትዎን ያስተካክሉ።'
            : 'Update your profile, create or upload a new profile, change password, and manage privacy.'}
        </p>
      </div>

      {/* My Profile Card */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 space-y-5">
        <div className="flex flex-col items-center text-center space-y-2.5">
          <Avatar
            name={user.name}
            src={user.photos.find(Boolean)}
            size="xl"
            verified={user.selfieVerified}
          />
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white tabular-nums flex items-center justify-center gap-1.5">
              <span>
                {user.name}, {user.age}
              </span>
              {user.selfieVerified && <ShieldCheck className="w-5 h-5 text-emerald-500" />}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              {user.city} · {user.job} · {user.phone}
            </p>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-1">
              {user.religion} · {user.goal} · {user.hobbies}
            </p>
          </div>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 max-w-md leading-relaxed">
            “{user.bio}”
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {lang === 'am' ? 'ፎቶ ለመቀየር ከታች ያሉትን ፎቶዎች ይጫኑ' : 'Tap any photo slot below to replace it'}
            </span>
          </div>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoFileChange}
          />
          <div className="grid grid-cols-4 gap-2">
            {user.photos.map((photo, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePhotoSlotClick(idx)}
                className="relative aspect-square rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 overflow-hidden flex items-center justify-center text-xs text-zinc-400 group cursor-pointer hover:border-rose-500 transition-colors"
              >
                {photo ? (
                  <img
                    src={photo}
                    alt={`Profile ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>#{idx + 1}</span>
                )}
                <span className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera className="w-4 h-4" />
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={onEditProfile}
            className="min-h-[46px] rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>{lang === 'am' ? 'መገለጫ ቀይር' : 'Edit Profile'}</span>
          </button>

          <button
            type="button"
            onClick={() => setConfirmNewProfile(true)}
            className="min-h-[46px] rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{lang === 'am' ? 'አዲስ መገለጫ ጫን' : 'New Profile'}</span>
          </button>

          <button
            type="button"
            onClick={onRequestDeleteAccount}
            className="min-h-[46px] rounded-xl bg-red-600/15 hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>{lang === 'am' ? 'መለያ አጥፋ' : 'Delete'}</span>
          </button>
        </div>
      </div>

      {/* Password Management */}
      <form
        onSubmit={handlePasswordSubmit}
        className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-rose-500" />
            <span>
              {user.password
                ? lang === 'am'
                  ? 'የይለፍ ቃል ቀይር (Change Password)'
                  : 'Change Account Password'
                : lang === 'am'
                  ? 'የይለፍ ቃል አዘጋጅ (Set Password)'
                  : 'Set Account Password'}
            </span>
          </h3>
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
          >
            {showPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showPwd ? (lang === 'am' ? 'ደብቅ' : 'Hide') : lang === 'am' ? 'አሳይ' : 'Show'}</span>
          </button>
        </div>

        <div className="space-y-3">
          {user.password && (
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                {lang === 'am' ? 'የቀድሞው የይለፍ ቃል' : 'Current Password'}
              </label>
              <input
                type={showPwd ? 'text' : 'password'}
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                placeholder="••••••"
                className="w-full min-h-[44px] rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                {lang === 'am' ? 'አዲስ የይለፍ ቃል' : 'New Password'}
              </label>
              <input
                type={showPwd ? 'text' : 'password'}
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder={lang === 'am' ? 'ቢያንስ 4 ቁምፊ' : 'Min 4 characters'}
                className="w-full min-h-[44px] rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                {lang === 'am' ? 'አዲሱን የይለፍ ቃል አረጋግጥ' : 'Confirm New Password'}
              </label>
              <input
                type={showPwd ? 'text' : 'password'}
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder="••••••"
                className="w-full min-h-[44px] rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full min-h-[44px] rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 text-sm font-semibold transition-opacity cursor-pointer"
        >
          {user.password
            ? lang === 'am'
              ? 'የይለፍ ቃል ቀይር'
              : 'Update Password'
            : lang === 'am'
              ? 'የይለፍ ቃል አስቀምጥ'
              : 'Save Password'}
        </button>
      </form>

      {/* Privacy & App Settings */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-rose-500" />
          <span>{lang === 'am' ? 'ግላዊነት እና ምርጫዎች' : 'Privacy & Preferences'}</span>
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {lang === 'am' ? 'መልእክት ማን መላክ ይችላል?' : 'Who can message me?'}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {lang === 'am'
                ? 'ያልተፈቀዱ መልእክቶችን ይቆጣጠሩ'
                : 'Control incoming chat access'}
            </p>
          </div>
          <select
            value={messagePrivacy}
            onChange={(e) => onChangeMessagePrivacy(e.target.value as MessagePrivacy)}
            className="min-h-[42px] rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
          >
            <option value="all">{lang === 'am' ? 'ሁሉም ሰው (Everyone)' : 'Everyone'}</option>
            <option value="friends">{lang === 'am' ? 'ጓደኞች ብቻ (Friends Only)' : 'Friends Only'}</option>
            <option value="none">{lang === 'am' ? 'ማንም (Nobody / Locked)' : 'Nobody (Locked)'}</option>
          </select>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {lang === 'am' ? 'የመተግበሪያ ገጽታ (Theme)' : 'Appearance Theme'}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {theme === 'dark'
                ? lang === 'am'
                  ? 'ጨለማ ገጽታ (Dark)'
                  : 'Dark Mode'
                : lang === 'am'
                  ? 'ብርሃን ገጽታ (Light)'
                  : 'Light Mode'}
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleTheme}
            className="min-h-[42px] px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-2 cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>{theme === 'dark' ? (lang === 'am' ? 'ብርሃን' : 'Light') : lang === 'am' ? 'ጨለማ' : 'Dark'}</span>
          </button>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {lang === 'am' ? 'ቋንቋ (Language)' : 'App Language'}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {lang === 'am' ? 'አማርኛ' : 'English'}
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleLang}
            className="min-h-[42px] px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Globe className="w-4 h-4" />
            <span>{lang === 'am' ? 'Switch to English' : 'ወደ አማርኛ ቀይር'}</span>
          </button>
        </div>

        <div className="pt-1">
          <button
            type="button"
            onClick={onLogout}
            className="w-full min-h-[44px] rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{lang === 'am' ? 'ውጣ (Lock Session)' : 'Sign Out'}</span>
          </button>
        </div>
      </div>

      {/* Download / Install App */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-rose-500" />
              <span>
                {lang === 'am'
                  ? 'መተግበሪያውን በስልክዎ ላይ አውርደው ይጫኑ'
                  : 'Download & Install as App'}
              </span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
              {isInstalled
                ? lang === 'am'
                  ? 'መተግበሪያው በመሳሪያዎ ላይ ተጭኗል (Standalone Mode)።'
                  : 'App is already installed on your device.'
                : lang === 'am'
                  ? 'ያለ ብራውዘር እንደ መደበኛ የስልክ ወይም የኮምፒውተር App ለመጠቀም ከታች ባለው ሊንክ ያውርዱ።'
                  : 'Install on Android, iPhone, or Desktop home screen for fast standalone access.'}
            </p>
          </div>
          {isInstalled && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
              <span>{lang === 'am' ? 'ተጭኗል' : 'Installed'}</span>
            </span>
          )}
        </div>

        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 flex items-center justify-between gap-2">
          <a
            href={appUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline truncate"
          >
            {appUrl}
          </a>
          <button
            type="button"
            onClick={handleCopyAppLink}
            className="min-h-[34px] px-2.5 rounded-lg bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{lang === 'am' ? 'ቅዳ' : 'Copy'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {!isInstalled && isInstallable ? (
            <button
              type="button"
              onClick={handleNativeInstall}
              className="min-h-[46px] rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{lang === 'am' ? 'መተግበሪያውን አውርድ (Install)' : 'Install App Now'}</span>
            </button>
          ) : (
            <a
              href={appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[46px] rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{lang === 'am' ? 'የApp ማውረጃ ሊንክ ክፈት' : 'Open App Download Link'}</span>
            </a>
          )}

          <button
            type="button"
            onClick={() => setShowInstallGuide(true)}
            className="min-h-[46px] rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>
              {isIOS
                ? lang === 'am'
                  ? 'በ iPhone / iPad መጫኛ'
                  : 'Install on iPhone / iPad'
                : lang === 'am'
                  ? 'እንዴት እንደሚጫን መመሪያ'
                  : 'How to Install Guide'}
            </span>
          </button>
        </div>

        <a
          href="/netlify-index.html"
          download="index.html"
          className="w-full min-h-[44px] rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <Download className="w-4 h-4 text-rose-500" />
          <span>
            {lang === 'am'
              ? 'ነጠላ የHTML ፋይል አውርድ (Netlify Drop index.html)'
              : 'Download Standalone index.html (Netlify Drop)'}
          </span>
        </a>
      </div>

      {/* Blocked Users */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <UserX className="w-4 h-4 text-zinc-500" />
          <span>{lang === 'am' ? 'የታገዱ ሰዎች (Blocked Users)' : 'Blocked Users'}</span>
        </h3>
        {blockedPeople.length === 0 ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {lang === 'am' ? 'የታገደ ሰው የለም።' : 'No blocked users.'}
          </p>
        ) : (
          <div className="space-y-2">
            {blockedPeople.map((person) => (
              <div
                key={person.id}
                className="flex items-center justify-between rounded-xl bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2.5 border border-zinc-200 dark:border-zinc-800"
              >
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {person.name}, {person.age}
                </span>
                <button
                  type="button"
                  onClick={() => onUnblockPerson(person.id)}
                  className="min-h-[36px] px-3 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer"
                >
                  {lang === 'am' ? 'ፍቀድ (Unblock)' : 'Unblock'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmNewProfile}
        title={lang === 'am' ? 'አዲስ መገለጫ መጫን ይፈልጋሉ?' : 'Create & Upload New Profile?'}
        description={
          lang === 'am'
            ? 'አዲስ ስም፣ መረጃ እና 4 አዲስ ፎቶዎችን በመጫን ነባሩን መገለጫ ይተካሉ።'
            : 'You will enter fresh details and upload 4 new photos to replace your current profile.'
        }
        confirmLabel={lang === 'am' ? 'አዎ፣ ቀጥል' : 'Continue'}
        cancelLabel={lang === 'am' ? 'ተወው' : 'Cancel'}
        danger={false}
        onConfirm={() => {
          setConfirmNewProfile(false);
          onCreateNewProfile();
        }}
        onCancel={() => setConfirmNewProfile(false)}
      />

      {showInstallGuide && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-rose-500" />
                <span>
                  {lang === 'am' ? 'በApp መልክ መጫኛ መመሪያ' : 'Install App on Your Device'}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setShowInstallGuide(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              <div>
                <p className="font-semibold text-zinc-900 dark:text-white">
                  {lang === 'am' ? '1. Android (Chrome):' : '1. Android (Chrome):'}
                </p>
                <p>
                  {lang === 'am'
                    ? 'ከላይ ያለውን ሊንክ በChrome ይክፈቱ → የላይኛው ቀኝ ምናሌ (⋮) → "Install app" ወይም "Add to Home screen" ይጫኑ።'
                    : 'Open the link in Chrome → tap menu (⋮) → tap "Install app" or "Add to Home screen".'}
                </p>
              </div>
              <div>
                <p className="font-semibold text-zinc-900 dark:text-white">
                  {lang === 'am' ? '2. iPhone / iPad (Safari):' : '2. iPhone / iPad (Safari):'}
                </p>
                <p>
                  {lang === 'am'
                    ? 'ሊንኩን በSafari ይክፈቱ → Share (↑) ይጫኑ → "Add to Home Screen" የሚለውን ይምረጡ።'
                    : 'Open the link in Safari → tap Share (↑) → tap "Add to Home Screen".'}
                </p>
              </div>
              <div>
                <p className="font-semibold text-zinc-900 dark:text-white">
                  {lang === 'am' ? '3. Computer (Chrome / Edge):' : '3. Desktop (Chrome / Edge):'}
                </p>
                <p>
                  {lang === 'am'
                    ? 'በአድራሻ ሳጥኑ ቀኝ በኩል ያለውን የInstall (⊕) ምልክት ይጫኑ።'
                    : 'Click the Install icon (⊕) on the right side of the browser address bar.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowInstallGuide(false)}
              className="w-full min-h-[44px] rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold cursor-pointer"
            >
              {lang === 'am' ? 'ተረድቻለሁ' : 'Got It'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

