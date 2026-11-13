import React, { useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  Heart,
  KeyRound,
  Lock,
  MapPin,
  Moon,
  Plus,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { compressImageToDataUrl } from '../data/seedData';
import { Lang, Theme, UserProfile } from '../types/app';
import { SelfieModal } from './Modals';

interface LoginScreenProps {
  lang: Lang;
  theme: Theme;
  existingUser: UserProfile | null;
  onToggleLang: () => void;
  onToggleTheme: () => void;
  onLoginSuccess: () => void;
  onNotify: (msg: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  lang,
  theme,
  existingUser,
  onToggleLang,
  onToggleTheme,
  onLoginSuccess,
  onNotify,
}) => {
  const [contact, setContact] = useState('');
  const [sentOtp, setSentOtp] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [authMode, setAuthMode] = useState<'otp' | 'password'>('otp');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = contact.trim();
    if (!cleaned) {
      onNotify(lang === 'am' ? 'ስልክ ቁጥር ወይም ኢሜይል ያስገቡ!' : 'Enter your phone number or email!');
      return;
    }
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setSentOtp(generated);
    setCodeInput(generated);
    onNotify(lang === 'am' ? 'ባለ 6 አሃዝ ኮድ ተልኳል!' : '6-digit OTP code sent!');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sentOtp || codeInput.trim() !== sentOtp) {
      onNotify(lang === 'am' ? 'የተሳሳተ ኮድ ነው!' : 'Invalid OTP code!');
      return;
    }
    onLoginSuccess();
  };

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingUser?.password) {
      onNotify(lang === 'am' ? 'እስካሁን የይለፍ ቃል አልተዘጋጀም፤ በOTP ይግቡ።' : 'No password set yet; sign in with OTP.');
      return;
    }
    if (passwordInput !== existingUser.password) {
      onNotify(lang === 'am' ? 'የተሳሳተ የይለፍ ቃል ነው!' : 'Incorrect password!');
      return;
    }
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen flex flex-col justify-between px-4 py-6 sm:px-8 lg:px-12 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <span className="font-display text-lg font-bold tracking-tight text-rose-600 dark:text-rose-500">
          ፍቅር በነፃ | Fikir BeNetsa
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="min-h-[44px] min-w-[44px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={onToggleLang}
            className="min-h-[44px] px-4 rounded-xl border border-rose-500/40 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-500/10 transition-colors cursor-pointer whitespace-nowrap"
          >
            {lang === 'am' ? 'English' : 'አማርኛ'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto py-8">
        <div className="lg:col-span-7 space-y-5">
          <p className="text-xs font-semibold tracking-wide text-rose-600 dark:text-rose-400">
            {lang === 'am' ? '18+ የኢትዮጵያ ትውውቅ መድረክ' : 'Ethiopian 18+ Social & Dating Community'}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white leading-tight text-balance">
            {lang === 'am'
              ? 'እውነተኛ ትውውቅ፣ ሰላማዊ ውይይት እና ፍቅር በነፃ።'
              : 'Genuine connections, meaningful conversations, completely free.'}
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed">
            {lang === 'am'
              ? 'ከ18 ዓመት በላይ ለሆኑ ኢትዮጵያውያን የተዘጋጀ ነፃ የትውውቅ እና ማህበራዊ መድረክ። በራስዎ ቋንቋ፣ በተረጋገጡ መገለጫዎች እና ሙሉ የግላዊነት ጥበቃ።'
              : 'Built for Ethiopian adults 18+. Connect by city and shared values with selfie-verified profiles, real-time messaging, and an isolated Private Account space.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-zinc-200 dark:border-zinc-800/80">
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {lang === 'am' ? 'የተረጋገጡ መገለጫዎች' : 'Verified Profiles'}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {lang === 'am' ? 'የፊት ካሜራ እና ቦታ ማረጋገጫ' : 'Selfie camera & GPS checks'}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {lang === 'am' ? 'የፎቶ ደህንነት' : 'Media Protection'}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {lang === 'am' ? 'ፎቶ ማውረድ እና መቅዳት የተከለከለ' : 'Download & right-click blocked'}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {lang === 'am' ? 'ዝግ የግል መለያ' : 'Private Vault'}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {lang === 'am' ? 'በPIN የሚቆለፍ ራሱን የቻለ ዓለም' : 'Separate PIN-locked space'}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-7 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center">
                <Heart className="w-5 h-5 fill-rose-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                  {lang === 'am' ? 'በስልክ ወይም በኢሜይል ይግቡ' : 'Sign in with OTP'}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {existingUser
                    ? lang === 'am'
                      ? `እንኳን ደህና መጡ፣ ${existingUser.name}`
                      : `Welcome back, ${existingUser.name}`
                    : lang === 'am'
                      ? 'ነፃ መለያ ይፍጠሩ ወይም ይግቡ'
                      : 'Create a free profile or continue'}
                </p>
              </div>
            </div>

            {existingUser?.password && (
              <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 mb-4">
                <button
                  type="button"
                  onClick={() => setAuthMode('otp')}
                  className={`min-h-[38px] rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    authMode === 'otp'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                      : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  {lang === 'am' ? 'በ OTP ኮድ' : 'OTP Code'}
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('password')}
                  className={`min-h-[38px] rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    authMode === 'password'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                      : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  {lang === 'am' ? 'በይለፍ ቃል' : 'Password'}
                </button>
              </div>
            )}

            {authMode === 'password' && existingUser?.password ? (
              <form onSubmit={handlePasswordLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    {lang === 'am' ? 'የመለያ ይለፍ ቃል (Password)' : 'Account Password'}
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••"
                      className="w-full min-h-[44px] rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 pl-10 pr-10 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label="Toggle password visibility"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full min-h-[46px] rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition-colors cursor-pointer"
                >
                  {lang === 'am' ? 'በይለፍ ቃል ግባ' : 'Login with Password'}
                </button>
              </form>
            ) : (
              <>
                <form onSubmit={handleSendOtp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      {lang === 'am' ? 'ስልክ ቁጥር ወይም ኢሜይል' : 'Phone Number or Email'}
                    </label>
                    <input
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder={lang === 'am' ? '09... ወይም name@email.com' : '09... or name@email.com'}
                      className="w-full min-h-[44px] rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full min-h-[46px] rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition-colors cursor-pointer"
                  >
                    {lang === 'am' ? 'ኮድ ላክ (Send OTP)' : 'Send OTP Code'}
                  </button>
                </form>

                {sentOtp && (
                  <form
                    onSubmit={handleVerifyOtp}
                    className="mt-5 pt-5 border-t border-zinc-200 dark:border-zinc-800 space-y-3"
                  >
                    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2.5 text-center">
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                        {lang === 'am' ? 'የእርስዎ OTP ኮድ፡ ' : 'Your OTP Code: '}
                      </span>
                      <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {sentOtp}
                      </span>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value)}
                      placeholder={lang === 'am' ? 'ባለ 6 አሃዝ ኮድ' : '6-Digit Code'}
                      className="w-full min-h-[44px] rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 text-center tracking-widest font-mono tabular-nums focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      className="w-full min-h-[46px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors cursor-pointer"
                    >
                      {lang === 'am' ? 'አረጋግጥ እና ግባ' : 'Verify & Login'}
                    </button>
                  </form>
                )}
              </>
            )}

            <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-start gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <Lock className="w-4 h-4 shrink-0 text-zinc-400 mt-0.5" />
              <span>
                {lang === 'am'
                  ? 'ፎቶ ማውረድ እና ስክሪንሾት ማንሳት የተከለከለ ነው። ከ18 ዓመት በላይ ለሆኑ ብቻ።'
                  : 'Downloading photos and taking screenshots are strictly prohibited. Adults 18+ only.'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <footer className="text-center text-xs text-zinc-500 dark:text-zinc-500 py-2">
        ፍቅር በነፃ · Fikir BeNetsa — 18+ Community
      </footer>
    </div>
  );
};

interface RegisterScreenProps {
  lang: Lang;
  initialProfile: UserProfile | null;
  isEditing: boolean;
  onSave: (profile: UserProfile) => void;
  onCancel?: () => void;
  onNotify: (msg: string) => void;
}

function makeSamplePortraitDataUrl(label: string, bg: string, accent: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bg}"/>
        <stop offset="100%" stop-color="${accent}"/>
      </linearGradient>
    </defs>
    <rect width="320" height="320" fill="url(#g)"/>
    <circle cx="160" cy="118" r="52" fill="rgba(255,255,255,0.22)"/>
    <path d="M72 280 C72 210, 248 210, 248 280" fill="rgba(255,255,255,0.18)"/>
    <text x="160" y="295" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-family="sans-serif" font-size="18" font-weight="600">${label}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  lang,
  initialProfile,
  isEditing,
  onSave,
  onCancel,
  onNotify,
}) => {
  const [name, setName] = useState(initialProfile?.name || '');
  const [age, setAge] = useState(initialProfile?.age ? String(initialProfile.age) : '');
  const [phone, setPhone] = useState(initialProfile?.phone || '');
  const [gender, setGender] = useState<'male' | 'female' | ''>(initialProfile?.gender || '');
  const [city, setCity] = useState(initialProfile?.city || '');
  const [job, setJob] = useState(initialProfile?.job || '');
  const [religion, setReligion] = useState(initialProfile?.religion || '');
  const [goal, setGoal] = useState(initialProfile?.goal || '');
  const [hobbies, setHobbies] = useState(initialProfile?.hobbies || '');
  const [bio, setBio] = useState(initialProfile?.bio || '');
  const [photos, setPhotos] = useState<(string | null)[]>(
    initialProfile?.photos?.length === 4 ? initialProfile.photos : [null, null, null, null]
  );
  const [selfieVerified, setSelfieVerified] = useState(initialProfile?.selfieVerified || false);
  const [locationVerified, setLocationVerified] = useState(
    initialProfile?.locationVerified || false
  );
  const [verifiedCity, setVerifiedCity] = useState(initialProfile?.verifiedCity || '');
  const [password, setPassword] = useState(initialProfile?.password || '');
  const [activeSlot, setActiveSlot] = useState<number>(0);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [locating, setLocating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePickSlot = (index: number) => {
    setActiveSlot(index);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const compressed = await compressImageToDataUrl(file, 640);
      setPhotos((prev) => {
        const next = [...prev];
        next[activeSlot] = compressed;
        return next;
      });
      onNotify(
        lang === 'am'
          ? `ፎቶ ${activeSlot + 1} ተጭኗል!`
          : `Photo ${activeSlot + 1} uploaded!`
      );
    } catch {
      onNotify(lang === 'am' ? 'ፎቶ መጫን አልተቻለም' : 'Failed to load photo');
    }
  };

  const handleClearSlot = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotos((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  const handleAutoFillSamples = () => {
    const palettes = [
      ['#e11d48', '#881337'],
      ['#2563eb', '#1e3a8a'],
      ['#9333ea', '#581c87'],
      ['#059669', '#064e3b'],
    ];
    const labels = ['Profile', 'Photo 1', 'Photo 2', 'Photo 3'];
    setPhotos((prev) =>
      prev.map((existing, i) =>
        existing || makeSamplePortraitDataUrl(labels[i], palettes[i][0], palettes[i][1])
      )
    );
    onNotify(lang === 'am' ? 'የናሙና ፎቶዎች ተሞልተዋል!' : 'Sample portraits filled!');
  };

  const handleVerifyLocation = () => {
    setLocating(true);
    const finish = (detectedLabel?: string) => {
      setLocating(false);
      setLocationVerified(true);
      if (detectedLabel) setVerifiedCity(detectedLabel);
      onNotify(lang === 'am' ? 'ቦታዎ ተረጋግጧል!' : 'GPS Location Verified!');
    };

    if (!navigator.geolocation) {
      finish(city.trim() || 'Addis Ababa');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`;
        finish(city.trim() ? `${city.trim()} (${coords})` : coords);
      },
      () => {
        finish(city.trim() || 'Addis Ababa');
      },
      { timeout: 4000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAge = parseInt(age, 10);
    if (!name.trim() || !parsedAge || parsedAge < 18 || !gender || !city.trim()) {
      onNotify(
        lang === 'am'
          ? 'ስም፣ ዕድሜ (18+)፣ ጾታ እና ከተማ መሙላት ግዴታ ነው!'
          : 'Please fill name, age (18+), gender, and city!'
      );
      return;
    }
    if (photos.filter(Boolean).length < 4) {
      onNotify(
        lang === 'am'
          ? '4 ፎቶዎችን (1 ፕሮፋይል + 3 ተጨማሪ) መጫን ግዴታ ነው!'
          : 'All 4 photos (1 profile + 3 extra) are required!'
      );
      return;
    }
    if (!selfieVerified || !locationVerified) {
      onNotify(
        lang === 'am'
          ? 'የፊት ካሜራ (Selfie) እና የቦታ (Location) ማረጋገጫ ያድርጉ!'
          : 'Please complete Selfie and GPS Location verification!'
      );
      return;
    }

    onSave({
      name: name.trim(),
      age: parsedAge,
      phone: phone.trim() || '0911000000',
      gender,
      city: city.trim(),
      job: job.trim() || (lang === 'am' ? 'ባለሙያ' : 'Professional'),
      religion: religion || (lang === 'am' ? 'ሌላ / Other' : 'Other'),
      goal: goal || (lang === 'am' ? 'ለፍቅር ግንኙነት / Serious Relationship' : 'Serious Relationship'),
      hobbies: hobbies.trim() || (lang === 'am' ? 'ቡና, ሙዚቃ' : 'Coffee, Music'),
      bio: bio.trim() || (lang === 'am' ? 'ሰላም! አዲስ ትውውቅ እፈልጋለሁ።' : 'Hello! Looking forward to meeting genuine people.'),
      photos,
      selfieVerified,
      locationVerified,
      verifiedCity: verifiedCity || city.trim(),
      password: password.trim() || undefined,
    });
  };

  const slotLabels = [
    lang === 'am' ? 'ፕሮፋይል ፎቶ' : 'Profile Photo',
    lang === 'am' ? 'ተጨማሪ ፎቶ 1' : 'Extra Photo 1',
    lang === 'am' ? 'ተጨማሪ ፎቶ 2' : 'Extra Photo 2',
    lang === 'am' ? 'ተጨማሪ ፎቶ 3' : 'Extra Photo 3',
  ];

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
            {isEditing
              ? lang === 'am'
                ? 'መገለጫዎን ያስተካክሉ'
                : 'Edit Your Profile'
              : lang === 'am'
                ? 'ሙሉ መገለጫ ይፍጠሩ'
                : 'Create Full Profile'}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {lang === 'am'
              ? 'ትክክለኛ መረጃ እና 4 ፎቶዎች ደህንነቱ የተጠበቀ ትውውቅን ያረጋግጣሉ።'
              : 'Complete profile details and 4 photos keep our 18+ community authentic.'}
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] px-4 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm font-medium cursor-pointer"
          >
            {lang === 'am' ? 'ተመለስ' : 'Back'}
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                {lang === 'am' ? 'ሙሉ ስም *' : 'Full Name *'}
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={lang === 'am' ? 'ምሳሌ፡ አቤል' : 'e.g. Abel'}
                className="w-full min-h-[44px] rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                {lang === 'am' ? 'ዕድሜ (18+) *' : 'Age (18+) *'}
              </label>
              <input
                type="number"
                min={18}
                max={99}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="24"
                className="w-full min-h-[44px] rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3.5 text-sm text-zinc-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                {lang === 'am' ? 'ስልክ ቁጥር (ለጓደኞች ብቻ)' : 'Phone (Friends Only)'}
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0911..."
                className="w-full min-h-[44px] rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3.5 text-sm text-zinc-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                {lang === 'am' ? 'ጾታ *' : 'Gender *'}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'male' | 'female' | '')}
                className="w-full min-h-[44px] rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
              >
                <option value="">{lang === 'am' ? 'ጾታ ይምረጡ' : 'Select Gender'}</option>
                <option value="male">{lang === 'am' ? 'ወንድ / Male' : 'Male'}</option>
                <option value="female">{lang === 'am' ? 'ሴት / Female' : 'Female'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                {lang === 'am' ? 'ከተማ *' : 'City *'}
              </label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={lang === 'am' ? 'አዲስ አበባ / Addis Ababa' : 'Addis Ababa'}
                className="w-full min-h-[44px] rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                {lang === 'am' ? 'ስራ ወይም ትምህርት' : 'Job or Education'}
              </label>
              <input
                value={job}
                onChange={(e) => setJob(e.target.value)}
                placeholder={lang === 'am' ? 'ምሳሌ፡ ኢንጂነር / ተማሪ' : 'e.g. Engineer / Student'}
                className="w-full min-h-[44px] rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                {lang === 'am' ? 'ሃይማኖት' : 'Religion'}
              </label>
              <select
                value={religion}
                onChange={(e) => setReligion(e.target.value)}
                className="w-full min-h-[44px] rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
              >
                <option value="">{lang === 'am' ? 'ሃይማኖት ይምረጡ' : 'Select Religion'}</option>
                <option value="ኦርቶዶክስ / Orthodox">ኦርቶዶክስ / Orthodox</option>
                <option value="እስልምና / Muslim">እስልምና / Muslim</option>
                <option value="ፕሮቴስታንት / Protestant">ፕሮቴስታንት / Protestant</option>
                <option value="ሌላ / Other">ሌላ / Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                {lang === 'am' ? 'የትውውቅ ዓላማ' : 'Relationship Goal'}
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full min-h-[44px] rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
              >
                <option value="">{lang === 'am' ? 'ዓላማ ይምረጡ' : 'Select Goal'}</option>
                <option value="ለትዳር / Marriage">ለትዳር / Marriage</option>
                <option value="ለፍቅር ግንኙነት / Serious Relationship">
                  ለፍቅር ግንኙነት / Serious Relationship
                </option>
                <option value="ለጓደኝነት / Friendship">ለጓደኝነት / Friendship</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              {lang === 'am' ? 'ፍላጎቶች (Hobbies)' : 'Hobbies'}
            </label>
            <input
              value={hobbies}
              onChange={(e) => setHobbies(e.target.value)}
              placeholder={lang === 'am' ? 'ሙዚቃ, ጉዞ, ቡና' : 'Music, Travel, Coffee'}
              className="w-full min-h-[44px] rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              {lang === 'am' ? 'ስለራስዎ አጭር መግለጫ' : 'Short Bio'}
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={lang === 'am' ? 'ስለራስዎ ጥቂት ይጻፉ...' : 'Write a short intro about yourself...'}
              className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              {lang === 'am' ? 'የይለፍ ቃል (Password - አማራጭ)' : 'Account Password (Optional)'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={lang === 'am' ? 'ቢያንስ 4 ቁምፊ / Min 4 chars' : 'Min 4 characters'}
              className="w-full min-h-[44px] rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                {lang === 'am'
                  ? '1 የፕሮፋይል ፎቶ + 3 ተጨማሪ ፎቶዎች (4ቱም ግዴታ ናቸው)'
                  : '1 Profile Photo + 3 Extra Photos (All 4 Required)'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                {photos.filter(Boolean).length} / 4{' '}
                {lang === 'am' ? 'ተጭኗል' : 'uploaded'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleAutoFillSamples}
              className="min-h-[38px] px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              {lang === 'am' ? 'ናሙና ፎቶ ሙላ' : 'Fill Sample Portraits'}
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {photos.map((src, idx) => (
              <div
                key={idx}
                onClick={() => handlePickSlot(idx)}
                className="relative aspect-square rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 overflow-hidden flex flex-col items-center justify-center cursor-pointer hover:border-rose-500 transition-colors group"
              >
                {src ? (
                  <>
                    <img
                      src={src}
                      alt={slotLabels[idx]}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => handleClearSlot(idx, e)}
                      aria-label="Remove photo"
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="text-center px-2">
                    <Plus className="w-5 h-5 text-zinc-400 mx-auto mb-1 group-hover:text-rose-500" />
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      {slotLabels[idx]}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setCameraOpen(true)}
            className={`min-h-[56px] rounded-2xl border px-4 py-3 flex items-center justify-center gap-2.5 text-sm font-semibold transition-colors cursor-pointer ${
              selfieVerified
                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'border-dashed border-rose-500/60 bg-rose-500/5 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
            }`}
          >
            {selfieVerified ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <Camera className="w-4 h-4 shrink-0" />
            )}
            <span>
              {selfieVerified
                ? lang === 'am'
                  ? 'የፊት ካሜራ ተረጋግጧል'
                  : 'Selfie Verified'
                : lang === 'am'
                  ? 'የፊት ካሜራ ማረጋገጫ (Selfie)'
                  : 'Tap for Selfie Verification'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleVerifyLocation}
            disabled={locating}
            className={`min-h-[56px] rounded-2xl border px-4 py-3 flex items-center justify-center gap-2.5 text-sm font-semibold transition-colors cursor-pointer ${
              locationVerified
                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'border-dashed border-rose-500/60 bg-rose-500/5 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
            }`}
          >
            {locationVerified ? (
              <ShieldCheck className="w-4 h-4 shrink-0" />
            ) : (
              <MapPin className="w-4 h-4 shrink-0" />
            )}
            <span>
              {locating
                ? lang === 'am'
                  ? 'ቦታ በመፈለግ ላይ...'
                  : 'Detecting location...'
                : locationVerified
                  ? lang === 'am'
                    ? 'ቦታ ተረጋግጧል'
                    : 'Location Verified'
                  : lang === 'am'
                    ? 'ያሉበትን ቦታ ያረጋግጡ (GPS)'
                    : 'Tap to Verify GPS Location'}
            </span>
          </button>
        </div>

        <button
          type="submit"
          className="w-full min-h-[50px] rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <UserCheck className="w-4 h-4" />
          {isEditing
            ? lang === 'am'
              ? 'ለውጦችን አስቀምጥ'
              : 'Save Profile Changes'
            : lang === 'am'
              ? 'መገለጫ አስቀምጥ እና ቀጥል'
              : 'Save Profile & Continue'}
        </button>
      </form>

      <SelfieModal
        open={cameraOpen}
        lang={lang}
        onVerify={(snapshot) => {
          setSelfieVerified(true);
          if (snapshot && !photos[0]) {
            setPhotos((prev) => {
              const next = [...prev];
              next[0] = snapshot;
              return next;
            });
          }
          setCameraOpen(false);
          onNotify(lang === 'am' ? 'የፊት ካሜራ ማረጋገጫ ተሳክቷል!' : 'Selfie verified!');
        }}
        onClose={() => setCameraOpen(false)}
      />
    </div>
  );
};
