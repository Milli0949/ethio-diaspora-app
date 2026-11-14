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
  Phone,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sun,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase';
import { compressImageToDataUrl } from '../data/seedData';
import { Lang, Theme, UserProfile } from '../types/app';
import { SelfieModal } from './Modals';

interface LoginScreenProps {
  lang: Lang;
  theme: Theme;
  existingUser: UserProfile | null;
  onToggleLang: () => void;
  onToggleTheme: () => void;
  onLoginSuccess: (matchedUser?: UserProfile) => void;
  onNotify: (msg: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  lang,
  theme,
  onToggleLang,
  onToggleTheme,
  onLoginSuccess,
  onNotify,
}) => {
  const [authTab, setAuthTab] = useState<'login' | 'register' | 'reset'>('login');
  const [phoneInput, setPhoneInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Create Account OTP states
  const [contact, setContact] = useState('');
  const [sentOtp, setSentOtp] = useState('');
  const [codeInput, setCodeInput] = useState('');

  // Reset Password states
  const [resetPhone, setResetPhone] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetCodeInput, setResetCodeInput] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedPhone = phoneInput.trim();
    if (!cleanedPhone || !passwordInput) {
      onNotify(lang === 'am' ? 'ስልክ ቁጥር እና የይለፍ ቃል ያስገቡ!' : 'Enter phone number and password!');
      return;
    }
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('phone', '==', cleanedPhone));
      const snap = await getDocs(q);
      if (snap.empty) {
        onNotify(
          lang === 'am'
            ? 'ይህ ስልክ ቁጥር አልተመዘገበም! Create Account የሚለውን ይጫኑ።'
            : 'Phone not registered! Click Create Account.'
        );
        setLoading(false);
        return;
      }
      const userData = snap.docs[0].data() as UserProfile;
      if (userData.password !== passwordInput) {
        onNotify(lang === 'am' ? 'የተሳሳተ የይለፍ ቃል ነው!' : 'Incorrect password!');
        setLoading(false);
        return;
      }
      onLoginSuccess(userData);
    } catch {
      onNotify(lang === 'am' ? 'መግባት አልተቻለም፣ ኢንተርኔትዎን ያረጋግጡ' : 'Login failed, check connection');
    }
    setLoading(false);
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = contact.trim();
    if (!cleaned) {
      onNotify(lang === 'am' ? 'ስልክ ቁጥር ያስገቡ!' : 'Enter your phone number!');
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

  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = resetPhone.trim();
    if (!cleaned) {
      onNotify(lang === 'am' ? 'የተመዘገበ ስልክ ቁጥር ያስገቡ!' : 'Enter your registered phone number!');
      return;
    }
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('phone', '==', cleaned));
      const snap = await getDocs(q);
      if (snap.empty) {
        onNotify(lang === 'am' ? 'ይህ ስልክ ቁጥር አልተመዘገበም!' : 'Phone number not found!');
        setLoading(false);
        return;
      }
      const generated = Math.floor(100000 + Math.random() * 900000).toString();
      setResetOtp(generated);
      setResetCodeInput(generated);
      onNotify(lang === 'am' ? 'የመቀየሪያ ኮድ ተልኳል!' : 'Reset OTP code sent!');
    } catch {
      onNotify(lang === 'am' ? 'ስህተት ተፈጥሯል፣ እንደገና ይሞክሩ' : 'Error occurred, try again');
    }
    setLoading(false);
  };

  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetOtp || resetCodeInput.trim() !== resetOtp) {
      onNotify(lang === 'am' ? 'የተሳሳተ ኮድ ነው!' : 'Invalid OTP code!');
      return;
    }
    if (newPassword.trim().length < 4) {
      onNotify(lang === 'am' ? 'አዲሱ የይለፍ ቃል ቢያንስ 4 ቁምፊ መሆን አለበት!' : 'New password must be at least 4 characters!');
      return;
    }
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('phone', '==', resetPhone.trim()));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const userDoc = snap.docs[0];
        await updateDoc(doc(db, 'users', userDoc.id), { password: newPassword.trim() });
        onNotify(lang === 'am' ? 'የይለፍ ቃልዎ በተሳካ ሁኔታ ተቀይሯል! አሁን ይግቡ።' : 'Password reset successful! Login now.');
        setPhoneInput(resetPhone.trim());
        setPasswordInput('');
        setResetOtp('');
        setNewPassword('');
        setAuthTab('login');
      }
    } catch {
      onNotify(lang === 'am' ? 'የይለፍ ቃል መቀየር አልተቻለም' : 'Failed to reset password');
    }
    setLoading(false);
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
                                  {authTab === 'login'
                    ? lang === 'am'
                      ? 'ወደ መለያዎ ይግቡ'
                      : 'Login to Account'
                    : authTab === 'register'
                      ? lang === 'am'
                        ? 'አዲስ መለያ ይፍጠሩ'
                        : 'Create Account'
                      : lang === 'am'
                        ? 'የይለፍ ቃል ይቀይሩ'
                        : 'Reset Password'}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {authTab === 'login'
                    ? lang === 'am'
                      ? 'በስልክ ቁጥር እና በይለፍ ቃል ብቻ ይግቡ'
                      : 'Sign in with phone & password'
                    : authTab === 'register'
                      ? lang === 'am'
                        ? 'ነፃ መለያ ለመፍጠር ስልክዎን ያረጋግጡ'
                        : 'Verify phone to create a free profile'
                      : lang === 'am'
                        ? 'የረሱትን የይለፍ ቃል በአዲስ ይተኩ'
                        : 'Set a new account password'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 mb-5">
              <button
                type="button"
                onClick={() => setAuthTab('login')}
                className={`min-h-[42px] rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  authTab === 'login'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {lang === 'am' ? 'ግባ (Login)' : 'Login'}
              </button>
              <button
                type="button"
                onClick={() => setAuthTab('register')}
                className={`min-h-[42px] rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  authTab === 'register'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {lang === 'am' ? 'ተመዝገብ (Create Account)' : 'Create Account'}
              </button>
            </div>

            {authTab === 'login' && (
              <form onSubmit={handlePasswordLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    {lang === 'am' ? 'የተመዘገበ ስልክ ቁጥር' : 'Registered Phone Number'}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="09..."
                      className="w-full min-h-[44px] rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 pl-10 pr-3.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    {lang === 'am' ? 'የይለፍ ቃል (Password)' : 'Account Password'}
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
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setAuthTab('reset')}
                    className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                  >
                    {lang === 'am' ? 'የይለፍ ቃል ረሱ? (Reset Password)' : 'Forgot / Reset Password?'}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[46px] rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition-colors cursor-pointer"
                >
                  {loading
                    ? lang === 'am'
                      ? 'በመግባት ላይ...'
                      : 'Logging in...'
                    : lang === 'am'
                      ? 'በይለፍ ቃል ግባ'
                      : 'Login with Password'}
                </button>
              </form>
            )}

            {authTab === 'register' && (
              <>
                <form onSubmit={handleSendOtp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      {lang === 'am' ? 'አዲስ ስልክ ቁጥር' : 'New Phone Number'}
                    </label>
                    <input
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="09..."
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
                      {lang === 'am' ? 'አረጋግጥ እና መዝገብ ቀጥል' : 'Verify & Continue to Register'}
                    </button>
                  </form>
                )}
              </>
            )}

            {authTab === 'reset' && (
              <div className="space-y-3.5">
                <form onSubmit={handleSendResetOtp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      {lang === 'am' ? 'የተመዘገበ ስልክ ቁጥርዎ' : 'Your Registered Phone'}
                    </label>
                    <input
                      type="text"
                      value={resetPhone}
                      onChange={(e) => setResetPhone(e.target.value)}
                      placeholder="09..."
                      className="w-full min-h-[44px] rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    interface RegisterScreenProps {
  lang: Lang;
  initialProfile: UserProfile | null;
  isEditing: boolean;
  onSave: (profile: UserProfile) => void;
  onCancel?: () => void;
  onNotify: (msg: string) => void;
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
  const [selfieSnapshot, setSelfieSnapshot] = useState<string | null>(
    initialProfile?.selfieVerified ? initialProfile.photos?.[0] || 'verified' : null
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
      if (activeSlot === 0 && selfieVerified) {
        setSelfieVerified(false);
        setSelfieSnapshot(null);
        onNotify(
          lang === 'am'
            ? 'የፕሮፋይል ፎቶ ስለተቀየረ የፊት ካሜራ (Selfie) በድጋሚ ያረጋግጡ!'
            : 'Profile photo changed! Please re-verify your live Selfie.'
        );
      } else {
        onNotify(
          lang === 'am'
            ? `ፎቶ ${activeSlot + 1} ተጭኗል!`
            : `Photo ${activeSlot + 1} uploaded!`
        );
      }
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
    if (index === 0) {
      setSelfieVerified(false);
      setSelfieSnapshot(null);
    }
  };

  const handleOpenSelfieCamera = () => {
    if (!photos[0]) {
      onNotify(
        lang === 'am'
          ? 'መጀመሪያ የፕሮፋይል ፎቶዎን (ፎቶ 1) ይጫኑ፤ ከዚያ ከፊት ካሜራዎ ጋር ይመሳሰላል!'
          : 'Upload your Profile Photo (Slot 1) first so it matches your live selfie!'
      );
      return;
    }
    setCameraOpen(true);
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
    if (!name.trim() || !parsedAge || parsedAge < 18 || !gender || !city.trim() || !phone.trim()) {
      onNotify(
        lang === 'am'
          ? 'ስም፣ ስልክ ቁጥር፣ ዕድሜ (18+)፣ ጾታ እና ከተማ መሙላት ግዴታ ነው!'
          : 'Please fill name, phone, age (18+), gender, and city!'
      );
      return;
    }
    if (password.trim().length < 4) {
      onNotify(
        lang === 'am'
          ? 'ቢያንስ 4 ቁምፊ የይለፍ ቃል (Password) ማውጣት ግዴታ ነው!'
          : 'Please set a password of at least 4 characters!'
      );
      return;
    }
    if (photos.filter(Boolean).length < 4 || !photos[0]) {
      onNotify(
        lang === 'am'
          ? '4 እውነተኛ ፎቶዎችን (1 ፕሮፋይል + 3 ተጨማሪ) መጫን ግዴታ ነው!'
          : 'All 4 real photos (1 profile + 3 extra) are required!'
      );
      return;
    }
    if (!selfieVerified || !selfieSnapshot || !locationVerified) {
      onNotify(
        lang === 'am'
          ? 'የፕሮፋይል ፎቶዎ ከፊት ካሜራ (Live Selfie) ጋር ካልተመሳሰለ እና GPS ካልተረጋገጠ ማለፍ አይቻልም!'
          : 'Profile photo must match Live Selfie and GPS Location must be verified!'
      );
      return;
    }

    onSave({
      name: name.trim(),
      age: parsedAge,
      phone: phone.trim(),
      gender,
      city: city.trim(),
      job: job.trim() || (lang === 'am' ? 'ባለሙያ' : 'Professional'),
      religion: religion || (lang === 'am' ? 'ሌላ / Other' : 'Other'),
      goal: goal || (lang === 'am' ? 'ለፍቅር ግንኙነት / Serious Relationship' : 'Serious Relationship'),
      hobbies: hobbies.trim() || (lang === 'am' ? 'ቡና, ሙዚቃ' : 'Coffee, Music'),
      bio: bio.trim() || (lang === 'am' ? 'ሰላም! አዲስ ትውውቅ እፈልጋለሁ።' : 'Hello! Looking forward to meeting genuine people.'),
      photos,
      selfieVerified: true,
      locationVerified: true,
      verifiedCity: verifiedCity || city.trim(),
      password: password.trim(),
    });
  };

  const slotLabels = [
    lang === 'am' ? 'ፕሮፋይል ፎቶ *' : 'Profile Photo *',
    lang === 'am' ? 'ተጨማሪ ፎቶ 1 *' : 'Extra Photo 1 *',
    lang === 'am' ? 'ተጨማሪ ፎቶ 2 *' : 'Extra Photo 2 *',
    lang === 'am' ? 'ተጨማሪ ፎቶ 3 *' : 'Extra Photo 3 *',
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
              ? 'ትክክለኛ መረጃ፣ 4 እውነተኛ ፎቶዎች እና ከፕሮፋይልዎ ጋር የሚመሳሰል የፊት ካሜራ ማረጋገጫ ግዴታ ነው።'
              : 'Real details, 4 authentic photos, and matching live selfie verification are required.'}
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
                {lang === 'am' ? 'ስልክ ቁጥር (መግቢያ) *' : 'Phone Number (Login) *'}
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0911..."
                className="w-full min-h-[44px] rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3.5 text-sm text-zinc-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>

