import React, { useEffect, useRef, useState } from 'react';
import {
  Bell,
  CheckCheck,
  Flame,
  KeyRound,
  Lock,
  MessageCircle,
  Paperclip,
  Search,
  Send,
  Settings,
  Shield,
  Trash2,
  X,
} from 'lucide-react';
import { compressImageToDataUrl } from '../data/seedData';
import {
  ChatMessage,
  Lang,
  MediaAttachment,
  PrivateAccountConfig,
  PrivateNotification,
  PrivatePost,
  PrivateScreen,
  PrivateUser,
} from '../types/app';
import { Avatar } from './Avatar';
import { ConfirmModal } from './Modals';

interface PrivateGateScreenProps {
  lang: Lang;
  savedConfig: PrivateAccountConfig | null;
  onUnlock: (config: PrivateAccountConfig) => void;
  onResetVault: () => void;
  onNotify: (msg: string) => void;
}
export const PrivateGateScreen: React.FC<PrivateGateScreenProps> = ({
  lang,
  savedConfig,
  onUnlock,
  onResetVault,
  onNotify,
}) => {
  const [alias, setAlias] = useState(savedConfig?.alias || '');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'create' | 'reset'>(savedConfig ? 'login' : 'create');
  const [newPassword, setNewPassword] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedAlias = alias.trim();
    const cleanedPass = password.trim();

    if (!cleanedAlias || cleanedPass.length < 4) {
      onNotify(
        lang === 'am'
          ? 'የግል መጠሪያ ስም (Username) እና ቢያንስ 4 ቁምፊ የይለፍ ቃል (Password) ያስገቡ!'
          : 'Enter a private username and at least 4-character password!'
      );
      return;
    }

    if (savedConfig && mode === 'login') {
      if (savedConfig.alias.toLowerCase() !== cleanedAlias.toLowerCase() || savedConfig.pin !== cleanedPass) {
        onNotify(
          lang === 'am'
            ? 'የተሳሳተ Username ወይም Password ነው! እንደገና ይሞክሩ።'
            : 'Incorrect Username or Password! Try again.'
        );
        return;
      }
    }

    onUnlock({
      alias: cleanedAlias,
      pin: cleanedPass,
      disappearing: savedConfig?.disappearing ?? false,
    });
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!savedConfig) return;
    if (alias.trim().toLowerCase() !== savedConfig.alias.toLowerCase()) {
      onNotify(lang === 'am' ? 'የተመዘገበውን የግል Username በትክክል ያስገቡ!' : 'Enter your exact private username!');
      return;
    }
    if (newPassword.trim().length < 4) {
      onNotify(lang === 'am' ? 'አዲሱ የይለፍ ቃል ቢያንስ 4 ቁምፊ መሆን አለበት!' : 'New password must be at least 4 chars!');
      return;
    }
    onUnlock({
      alias: savedConfig.alias,
      pin: newPassword.trim(),
      disappearing: savedConfig.disappearing ?? false,
    });
    onNotify(lang === 'am' ? 'የግል መለያ የይለፍ ቃል ተቀይሯል!' : 'Private vault password updated!');
  };

  return (
    <div className="max-w-lg mx-auto w-full py-4">
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-purple-500/30 p-6 space-y-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/15 text-purple-500 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {lang === 'am' ? 'ዝግ የግል መለያ (18+ Private Account)' : 'Standalone Private Account (18+)'}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {savedConfig
                ? lang === 'am'
                  ? `የተቆለፈ የግል መለያ (${savedConfig.alias}) — በ Username እና Password ይግቡ`
                  : `Saved vault (${savedConfig.alias}) — enter Username & Password`
                : lang === 'am'
                  ? 'አዲስ የግል Username እና Password ይፍጠሩ'
                  : 'Create a private username and password'}
            </p>
          </div>
        </div>

        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
          {lang === 'am'
            ? 'ይህ ክፍል ከዋናው መለያዎ ሙሉ በሙሉ የተለየ ራሱን የቻለ ዓለም ነው። ፎቶ ማውረድ ዝግ ነው።'
            : 'Completely isolated from your main profile. Features its own feed, search, and private chat.'}
        </p>

        {mode !== 'reset' ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                {lang === 'am' ? 'የግል መጠሪያ ስም (Username)' : 'Private Username'}
              </label>
              <input
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder={lang === 'am' ? 'ምሳሌ፡ Mystery_Addis' : 'e.g. Mystery_Addis'}
                className="w-full min-h-[44px] rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                {lang === 'am' ? 'የይለፍ ቃል (Password)' : 'Private Password'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full min-h-[44px] rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            {savedConfig && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setMode('reset')}
                  className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                >
                  {lang === 'am' ? 'የግል Password ረሱ? (Reset Password)' : 'Forgot / Reset Private Password?'}
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full min-h-[48px] rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              {lang === 'am' ? 'ወደ Private Account ግባ' : 'Unlock Private Account'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                {lang === 'am' ? 'የግል Username ያረጋግጡ' : 'Confirm Private Username'}
              </label>
              <input
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder={savedConfig?.alias || 'Username'}
                className="w-full min-h-[44px] rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                {lang === 'am' ? 'አዲስ የይለፍ ቃል (New Password)' : 'New Password (min 4 chars)'}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••"
                className="w-full min-h-[44px] rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3.5 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="flex-1 min-h-[44px] rounded-xl bg-zinc-200 dark:bg-zinc-800 text-xs font-semibold cursor-pointer"
              >
                {lang === 'am' ? 'ተመለስ' : 'Back'}
              </button>
              <button
                type="submit"
                className="flex-1 min-h-[44px] rounded-xl bg-purple-600 text-white text-xs font-semibold cursor-pointer"
              >
                {lang === 'am' ? 'አዲሱን Password አስቀምጥ' : 'Save New Password'}
              </button>
            </div>
          </form>
        )}

        {savedConfig && (
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-center">
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="text-xs font-medium text-zinc-500 hover:text-red-500 transition-colors cursor-pointer"
            >
              {lang === 'am' ? 'የግል መለያውን ሙሉ በሙሉ አጥፋ (Reset Vault)' : 'Reset Entire Private Vault'}
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmReset}
        title={lang === 'am' ? 'የግል መለያው ዳግም ይጀመር?' : 'Reset Private Vault?'}
        description={
          lang === 'am'
            ? 'የቆየው የግል መለያና መልዕክቶች ይሰረዛሉ።'
            : 'This clears your saved vault and private history so you can create a new one.'
        }
        confirmLabel={lang === 'am' ? 'ዳግም አስጀምር' : 'Reset'}
        cancelLabel={lang === 'am' ? 'ተመለስ' : 'Cancel'}
        danger={false}
        onConfirm={() => {
          setConfirmReset(false);
          setAlias('');
          setPassword('');
          onResetVault();
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
};

interface PrivateWorkspaceProps {
  lang: Lang;
  config: PrivateAccountConfig;
  activeScreen: PrivateScreen;
  privateUsers: PrivateUser[];
  privatePosts: PrivatePost[];
  privateChats: Record<string, ChatMessage[]>;
  privateNotifications: PrivateNotification[];
  activePrivateUserId: string;
  onNavigate: (scr: PrivateScreen) => void;
  onSelectPrivateUser: (id: string) => void;
  onAddPrivatePost: (text: string, media: MediaAttachment | null) => void;
  onTogglePrivatePostLike: (postId: number) => void;
  onAddPrivateComment: (postId: number, text: string) => void;
  onSendPrivateMessage: (userId: string, text: string, replyTo?: string, file?: MediaAttachment) => void;
  onMarkPrivateNotifsRead: () => void;
  onUpdateConfig: (next: PrivateAccountConfig) => void;
  onClearPrivateData: () => void;
  onLockAndExit: () => void;
  onNotify: (msg: string) => void;
}

export const PrivateWorkspace: React.FC<PrivateWorkspaceProps> = ({
  lang,
  config,
  activeScreen,
  privateUsers,
  privatePosts,
  privateChats,
  privateNotifications,
  activePrivateUserId,
  onNavigate,
  onSelectPrivateUser,
  onAddPrivatePost,
  onTogglePrivatePostLike,
  onAddPrivateComment,
  onSendPrivateMessage,
  onMarkPrivateNotifsRead,
  onUpdateConfig,
  onClearPrivateData,
  onLockAndExit,
  onNotify,
}) => {
  const [postText, setPostText] = useState('');
  const [postMedia, setPostMedia] = useState<MediaAttachment | null>(null);
  const [openCommentsId, setOpenCommentsId] = useState<number | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [replyPreview, setReplyPreview] = useState('');
  const [newAlias, setNewAlias] = useState(config.alias);
  const [newPin, setNewPin] = useState(config.pin);
  const [confirmClear, setConfirmClear] = useState(false);

  const postMediaRef = useRef<HTMLInputElement | null>(null);
  const chatMediaRef = useRef<HTMLInputElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const activeUser =
    privateUsers.find((u) => u.id === activePrivateUserId) || privateUsers[0];
  const currentMessages = activeUser ? privateChats[activeUser.id] || [] : [];
  const unreadNotifCount = privateNotifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (activeScreen === 'p-chat' && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [activeScreen, currentMessages.length, activeUser?.id]);

  const handleAttachPostMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const url = file.type.startsWith('image/')
        ? await compressImageToDataUrl(file, 720)
        : await new Promise<string>((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve(r.result as string);
            r.onerror = () => reject(new Error('read error'));
            r.readAsDataURL(file);
          });
      setPostMedia({ name: file.name, url, type: file.type });
    } catch {
      onNotify(lang === 'am' ? 'ፋይል መጫን አልተቻለም' : 'Failed to load media');
    }
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() && !postMedia) return;
    onAddPrivatePost(postText.trim(), postMedia);
    setPostText('');
    setPostMedia(null);
  };

  const handleChatSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser || !chatInput.trim()) return;
    onSendPrivateMessage(activeUser.id, chatInput.trim(), replyPreview || undefined);
    setChatInput('');
    setReplyPreview('');
  };

  const handleAttachChatMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !activeUser) return;
    try {
      const url = file.type.startsWith('image/')
        ? await compressImageToDataUrl(file, 640)
        : await new Promise<string>((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve(r.result as string);
            r.onerror = () => reject(new Error('read error'));
            r.readAsDataURL(file);
          });
      onSendPrivateMessage(activeUser.id, '', replyPreview || undefined, {
        name: file.name,
        url,
        type: file.type,
      });
      setReplyPreview('');
    } catch {
      onNotify(lang === 'am' ? 'መላክ አልተቻለም' : 'Failed to send media');
    }
  };

  const filteredUsers = privateUsers.filter((u) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return u.alias.toLowerCase().includes(q) || u.city.toLowerCase().includes(q);
  });

  const navItems: { id: PrivateScreen; labelAm: string; labelEn: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'p-main', labelAm: 'ፖስቶች', labelEn: 'Feed', icon: <Flame className="w-5 h-5" /> },
    { id: 'p-search', labelAm: 'ፍለጋ', labelEn: 'Search', icon: <Search className="w-5 h-5" /> },
    { id: 'p-chat', labelAm: 'ቻት', labelEn: 'Chat', icon: <MessageCircle className="w-5 h-5" /> },
    {
      id: 'p-notifications',
      labelAm: 'ማሳወቂያ',
      labelEn: 'Alerts',
      icon: <Bell className="w-5 h-5" />,
      badge: unreadNotifCount,
    },
    { id: 'p-settings', labelAm: 'ቅንብር', labelEn: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Private Header */}
      <header className="sticky top-0 z-30 h-14 px-4 lg:px-6 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-purple-500/40 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <Shield className="w-5 h-5 text-purple-500 shrink-0" />
          <span className="font-display font-bold text-sm sm:text-base text-purple-600 dark:text-purple-400 truncate">
            18+ Private · {config.alias}
          </span>
        </div>

        <button
          type="button"
          onClick={onLockAndExit}
          className="min-h-[38px] px-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>{lang === 'am' ? 'ቆልፍ እና ውጣ' : 'Lock & Exit'}</span>
        </button>
      </header>

      <div className="flex-1 flex max-w-6xl w-full mx-auto">
        {/* Desktop Private Sidebar */}
        <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-purple-500/20 p-4 gap-1.5">
          {navItems.map((item) => {
            const active = activeScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigate(item.id);
                  if (item.id === 'p-notifications') onMarkPrivateNotifsRead();
                }}
                className={`min-h-[46px] px-3.5 rounded-xl flex items-center justify-between text-sm font-medium transition-colors cursor-pointer ${
                  active
                    ? 'bg-purple-600 text-white'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-purple-500/10'
                }`}
              >
                <span className="flex items-center gap-3">
                  {item.icon}
                  <span>{lang === 'am' ? item.labelAm : item.labelEn}</span>
                </span>
                {item.badge ? (
                  <span className="text-xs font-bold tabular-nums px-1.5 py-0.5 rounded-md bg-purple-500 text-white">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </aside>

        {/* Main Private Content */}
        <main className="flex-1 p-4 pb-24 lg:pb-8 overflow-y-auto">
          {activeScreen === 'p-main' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {lang === 'am' ? 'የግል ፖስቶች (ማውረድ የለም)' : 'Private Feed (No Download)'}
                </h2>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  {lang === 'am' ? 'የተጠበቀ' : 'Protected'}
                </span>
              </div>

              <form
                onSubmit={handlePostSubmit}
                className="rounded-2xl bg-white dark:bg-zinc-900 border border-purple-500/30 p-4 space-y-3"
              >
                <textarea
                  rows={2}
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder={
                    lang === 'am'
                      ? 'በግል መለያዎ ፖስት ያድርጉ...'
                      : 'Share a private post under your alias...'
                  }
                  className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-purple-500"
                />

                {postMedia && (
                  <div className="flex items-center justify-between rounded-xl bg-purple-500/10 px-3 py-2 text-xs text-purple-600 dark:text-purple-300">
                    <span className="truncate">{postMedia.name}</span>
                    <button
                      type="button"
                      onClick={() => setPostMedia(null)}
                      className="ml-2 p-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <input
                  ref={postMediaRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleAttachPostMedia}
                />

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => postMediaRef.current?.click()}
                    className="min-h-[42px] px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <Paperclip className="w-4 h-4" />
                    <span>{lang === 'am' ? 'ፎቶ / ቪዲዮ' : 'Media'}</span>
                  </button>
                  <button
                    type="submit"
                    className="min-h-[42px] px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold cursor-pointer"
                  >
                    {lang === 'am' ? 'ፖስት' : 'Post'}
                  </button>
                </div>
              </form>

              {privatePosts.map((post) => {
                const commentsOpen = openCommentsId === post.id;
                return (
                  <article
                    key={post.id}
                    onContextMenu={(e) => e.preventDefault()}
                    className="rounded-2xl bg-white dark:bg-zinc-900 border border-purple-500/25 p-4 space-y-3 protected-media"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                        {post.author}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                        {post.time}
                      </span>
                    </div>

                    {post.text && (
                      <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
                        {post.text}
                      </p>
                    )}

                    {post.media && (
                      <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                        {post.media.type.startsWith('image/') ? (
                          <img
                            src={post.media.url}
                            alt="Protected private post"
                            draggable={false}
                            className="w-full max-h-72 object-cover"
                          />
                        ) : (
                          <video
                            src={post.media.url}
                            controls
                            controlsList="nodownload"
                            className="w-full max-h-72"
                          />
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => onTogglePrivatePostLike(post.id)}
                        className={`min-h-[40px] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 tabular-nums cursor-pointer ${
                          post.likedByMe
                            ? 'bg-purple-600 text-white'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>{post.likes}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setOpenCommentsId(commentsOpen ? null : post.id)}
                        className="min-h-[40px] rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center justify-center gap-1.5 tabular-nums cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{post.comments.length}</span>
                      </button>
                    </div>

                    {commentsOpen && (
                      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                        {post.comments.map((cm) => (
                          <div
                            key={cm.id}
                            className="rounded-xl bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-xs"
                          >
                            <span className="font-semibold text-purple-500">{cm.author}</span>{' '}
                            <span className="text-zinc-700 dark:text-zinc-300">{cm.text}</span>
                          </div>
                        ))}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const val = (commentInputs[post.id] || '').trim();
                            if (!val) return;
                            onAddPrivateComment(post.id, val);
                            setCommentInputs((prev) => ({ ...prev, [post.id]: '' }));
                          }}
                          className="flex gap-2"
                        >
                          <input
                            value={commentInputs[post.id] || ''}
                            onChange={(e) =>
                              setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                            }
                            placeholder={lang === 'am' ? 'አስተያየት...' : 'Private reply...'}
                            className="flex-1 min-h-[38px] rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-purple-500"
                          />
                          <button
                            type="submit"
                            className="min-h-[38px] min-w-[38px] rounded-xl bg-purple-600 text-white flex items-center justify-center cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {activeScreen === 'p-search' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <h2 className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {lang === 'am' ? 'ሚስጥራዊ ፍለጋ (Private Search)' : 'Private Search'}
              </h2>
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    lang === 'am' ? 'ሚስጥራዊ ተጠቃሚ ወይም ከተማ ይፈልጉ...' : 'Search private alias or city...'
                  }
                  className="w-full min-h-[46px] rounded-xl bg-white dark:bg-zinc-900 border border-purple-500/30 pl-10 pr-4 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-2.5">
                {filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    className="rounded-2xl bg-white dark:bg-zinc-900 border border-purple-500/25 p-4 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={u.alias} color={u.color} size="md" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                          {u.alias}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                          {u.city} · {lang === 'am' ? u.bioAm : u.bioEn}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectPrivateUser(u.id);
                        onNavigate('p-chat');
                      }}
                      className="min-h-[42px] px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shrink-0 cursor-pointer"
                    >
                      {lang === 'am' ? 'ቻት' : 'Private Chat'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeScreen === 'p-chat' && activeUser && (
            <div className="max-w-3xl mx-auto flex flex-col gap-3 h-[calc(100vh-12rem)] lg:h-[calc(100vh-7rem)]">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
                {privateUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      onSelectPrivateUser(u.id);
                      setReplyPreview('');
                    }}
                    className={`min-h-[42px] px-3 rounded-xl border flex items-center gap-2 shrink-0 cursor-pointer ${
                      u.id === activeUser.id
                        ? 'border-purple-500 bg-purple-500/15 text-purple-500'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <Avatar name={u.alias} color={u.color} size="xs" />
                    <span className="text-xs font-semibold">{u.alias}</span>
                  </button>
                ))}
              </div>

              <div className="flex-1 min-h-0 rounded-2xl bg-white dark:bg-zinc-900 border border-purple-500/30 flex flex-col overflow-hidden">
                <div className="px-4 py-3 border-b border-purple-500/20 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <Avatar name={activeUser.alias} color={activeUser.color} size="sm" />
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                        {activeUser.alias}
                      </h3>
                      <p className="text-[11px] text-purple-500">
                        {config.disappearing
                          ? lang === 'am'
                            ? 'ጊዜያዊ መልእክቶች በርተዋል'
                            : 'Disappearing mode active'
                          : lang === 'am'
                            ? 'ዝግ ሚስጥራዊ ክፍል'
                            : 'Private room · No downloads'}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  ref={chatScrollRef}
                  onContextMenu={(e) => e.preventDefault()}
                  className="flex-1 overflow-y-auto p-4 space-y-3 protected-media"
                >
                  {currentMessages.map((m) => {
                    const isOut = m.from === 'out';
                    return (
                      <div
                        key={m.id}
                        onClick={() => setReplyPreview(m.text || 'Media')}
                        className={`flex items-end gap-2 max-w-[82%] cursor-pointer ${
                          isOut ? 'ml-auto flex-row-reverse' : ''
                        }`}
                      >
                        <div
                          className={`rounded-2xl px-3.5 py-2.5 text-sm space-y-1 ${
                            isOut
                              ? 'bg-purple-600 text-white rounded-br-sm'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-sm'
                          }`}
                        >
                          {m.replyTo && (
                            <div className="text-[11px] bg-black/20 px-2 py-0.5 rounded">
                              ↪ {m.replyTo}
                            </div>
                          )}
                          {m.text && <p className="whitespace-pre-wrap">{m.text}</p>}
                          {m.file && m.file.type.startsWith('image/') && (
                            <img
                              src={m.file.url}
                              alt="Private attachment"
                              draggable={false}
                              className="max-h-44 rounded-xl object-cover"
                            />
                          )}
                          <div className="flex items-center justify-end gap-1 text-[10px] opacity-75 tabular-nums">
                            <span>{m.time}</span>
                            {isOut && <CheckCheck className="w-3 h-3" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 border-t border-purple-500/20 space-y-2 shrink-0">
                  {replyPreview && (
                    <div className="flex items-center justify-between rounded-xl bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-xs">
                      <span className="truncate">↪ {replyPreview}</span>
                      <button type="button" onClick={() => setReplyPreview('')} className="cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <input
                    ref={chatMediaRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAttachChatMedia}
                  />
                  <form onSubmit={handleChatSend} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => chatMediaRef.current?.click()}
                      className="min-h-[44px] min-w-[44px] rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 flex items-center justify-center cursor-pointer"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={lang === 'am' ? 'ሚስጥራዊ መልእክት...' : 'Secret message...'}
                      className="flex-1 min-h-[44px] rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="submit"
                      className="min-h-[44px] px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold cursor-pointer"
                    >
                      {lang === 'am' ? 'ላክ' : 'Send'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeScreen === 'p-notifications' && (
            <div className="max-w-2xl mx-auto space-y-3">
              <h2 className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {lang === 'am' ? 'ሚስጥራዊ ማሳወቂያዎች' : 'Private Notifications'}
              </h2>
              {privateNotifications.map((n) => (
                <div
                  key={n.id}
                  className="rounded-2xl bg-white dark:bg-zinc-900 border border-purple-500/25 p-4 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                      {n.alias}
                    </p>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 mt-0.5">
                      {lang === 'am' ? n.textAm : n.textEn}
                    </p>
                  </div>
                  <span className="text-xs text-zinc-500 tabular-nums">{n.time}</span>
                </div>
              ))}
            </div>
          )}

          {activeScreen === 'p-settings' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <h2 className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {lang === 'am' ? 'የግል መለያ ቅንብሮች' : 'Private Account Settings'}
              </h2>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newAlias.trim() || newPin.length < 4) {
                    onNotify(
                      lang === 'am'
                        ? 'ስም እና ባለ 4 አሃዝ PIN ያስገቡ!'
                        : 'Enter a valid alias and 4-digit PIN!'
                    );
                    return;
                  }
                  onUpdateConfig({
                    ...config,
                    alias: newAlias.trim(),
                    pin: newPin,
                  });
                  onNotify(lang === 'am' ? 'የግል ቅንብር ተቀምጧል!' : 'Private settings updated!');
                }}
                className="rounded-2xl bg-white dark:bg-zinc-900 border border-purple-500/25 p-5 space-y-4"
              >
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    {lang === 'am' ? 'የሚስጥር መጠሪያ ስም' : 'Private Alias'}
                  </label>
                  <input
                    value={newAlias}
                    onChange={(e) => setNewAlias(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    {lang === 'am' ? 'ባለ 4 አሃዝ PIN ቀይር' : 'Change 4-Digit PIN'}
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="w-full min-h-[44px] rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 pl-10 pr-4 text-sm font-mono tracking-widest text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-y border-zinc-100 dark:border-zinc-800">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {lang === 'am' ? 'ጊዜያዊ መልእክቶች (Disappearing)' : 'Disappearing Messages'}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {lang === 'am'
                        ? 'መልእክቶች ከተነበቡ በኋላ በራሳቸው ይጠፋሉ'
                        : 'Auto-expire messages after session lock'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateConfig({ ...config, disappearing: !config.disappearing })
                    }
                    className={`min-h-[38px] px-4 rounded-xl text-xs font-semibold cursor-pointer ${
                      config.disappearing
                        ? 'bg-purple-600 text-white'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {config.disappearing ? (lang === 'am' ? 'በርቷል' : 'ON') : lang === 'am' ? 'ጠፍቷል' : 'OFF'}
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[46px] rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold cursor-pointer"
                >
                  {lang === 'am' ? 'ለውጦችን አስቀምጥ' : 'Save Private Settings'}
                </button>
              </form>

              <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 space-y-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="w-full min-h-[44px] rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-red-500/15 text-red-500 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{lang === 'am' ? 'የግል ቻት እና ፖስት አጽዳ' : 'Clear Private History'}</span>
                </button>
                <button
                  type="button"
                  onClick={onLockAndExit}
                  className="w-full min-h-[44px] rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>{lang === 'am' ? 'ቆልፍ እና ወደ ዋናው ገጽ ተመለስ' : 'Lock & Return to Main App'}</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Private Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-purple-500/30 grid grid-cols-5">
        {navItems.map((item) => {
          const active = activeScreen === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onNavigate(item.id);
                if (item.id === 'p-notifications') onMarkPrivateNotifsRead();
              }}
              className={`relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium cursor-pointer ${
                active ? 'text-purple-500 font-semibold' : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {item.icon}
              <span>{lang === 'am' ? item.labelAm : item.labelEn}</span>
              {item.badge ? (
                <span className="absolute top-1.5 right-4 min-w-[16px] h-4 px-1 rounded-full bg-purple-600 text-white text-[9px] font-bold flex items-center justify-center tabular-nums">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <ConfirmModal
        open={confirmClear}
        title={lang === 'am' ? 'የግል ታሪክ ማጽዳት?' : 'Clear Private History?'}
        description={
          lang === 'am'
            ? 'ሁሉም የግል ፖስቶች እና ውይይቶች ይጸዳሉ።'
            : 'All private posts and private messages in this vault will be cleared.'
        }
        confirmLabel={lang === 'am' ? 'አጽዳ' : 'Clear All'}
        cancelLabel={lang === 'am' ? 'ተወው' : 'Cancel'}
        onConfirm={() => {
          setConfirmClear(false);
          onClearPrivateData();
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
};
