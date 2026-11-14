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
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                  {authTab === 'login'
                    ? lang === 'am' ? 'ወደ መለያዎ ይግቡ' : 'Login to Account'
                    : authTab === 'register'
