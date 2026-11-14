import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import {
  Bell,
  Compass,
  Heart,
  Lock,
  MessageCircle,
  Moon,
  Search,
  Settings,
  Sun,
  WifiOff,
} from 'lucide-react';
import { LoginScreen, RegisterScreen } from './components/AuthScreens';
import { useOnlineStatus } from './hooks/usePWAInstall';
import { Avatar } from './components/Avatar';
import { ChatScreen, NotificationsScreen } from './components/ChatAndNotifScreens';
import {
  DiscoveryAndPostsScreen,
  MatchesScreen,
  SearchScreen,
  UserDetailScreen,
} from './components/MainFeedScreens';
import { ConfirmModal, MatchModal, ReportModal } from './components/Modals';
import { PrivateGateScreen, PrivateWorkspace } from './components/PrivateModeScreens';
import { SettingsScreen } from './components/SettingsScreen';
import {
  INITIAL_CONVERSATIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PEOPLE,
  INITIAL_POSTS,
  INITIAL_PRIVATE_CHATS,
  INITIAL_PRIVATE_NOTIFICATIONS,
  INITIAL_PRIVATE_POSTS,
  INITIAL_PRIVATE_USERS,
} from './data/seedData';
import {
  AppNotification,
  ChatMessage,
  Lang,
  MainScreen,
  MediaAttachment,
  MessagePrivacy,
  PersonProfile,
  PostItem,
  PrivateAccountConfig,
  PrivateNotification,
  PrivatePost,
  PrivateScreen,
  PrivateUser,
  Theme,
  UserProfile,
} from './types/app';

const STORAGE_KEYS = {
  user: 'fb_user_v2',
  lang: 'fb_lang_v2',
  theme: 'fb_theme_v2',
  msgPrivacy: 'fb_mp_v2',
  people: 'fb_people_v2',
  posts: 'fb_posts_v2',
  chats: 'fb_chats_v2',
  notifs: 'fb_notifs_v2',
  blocked: 'fb_blocked_v2',
  privateConfig: 'fb_prv_cfg_v2',
  privatePosts: 'fb_prv_posts_v2',
  privateChats: 'fb_prv_chats_v2',
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [lang, setLang] = useState<Lang>(() => readStorage<Lang>(STORAGE_KEYS.lang, 'am'));
  const [theme, setTheme] = useState<Theme>(() => readStorage<Theme>(STORAGE_KEYS.theme, 'dark'));

  const [user, setUser] = useState<UserProfile | null>(() => {
    const stored = readStorage<UserProfile | null>(STORAGE_KEYS.user, null);
    if (stored) return stored;
    // Migrate legacy fb_u if present
    try {
      const legacy = localStorage.getItem('fb_u');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (parsed?.n) {
          return {
            name: parsed.n,
            age: Number(parsed.a) || 22,
            phone: parsed.p || '',
            gender: parsed.g === 'ሴት' ? 'female' : 'male',
            city: parsed.c || 'Addis Ababa',
            job: parsed.j || '',
            religion: parsed.r || '',
            goal: parsed.gl || '',
            hobbies: parsed.h || '',
            bio: parsed.b || '',
            photos: Array.isArray(parsed.ph) ? parsed.ph : [null, null, null, null],
            selfieVerified: true,
            locationVerified: true,
          };
        }
      }
    } catch {
      // ignore legacy parse error
    }
    return null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => Boolean(user));
  const [screen, setScreen] = useState<MainScreen>(() => (user ? 'main' : 'login'));
  const [previousScreen, setPreviousScreen] = useState<MainScreen>('main');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isCreatingNewProfile, setIsCreatingNewProfile] = useState(false);

  const [subTab, setSubTab] = useState<'people' | 'posts'>('people');
  const [people, setPeople] = useState<PersonProfile[]>([]);
    useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsub = onSnapshot(q, (snap) => {
      const firebaseUsers = snap.docs.map((doc) => ({
        id: Number(doc.data().id) || Date.now(),
        ...doc.data(),
      })) as PersonProfile[];
      setPeople(firebaseUsers);
    });
    return () => unsub();
  }, []);
  const [posts, setPosts] = useState<PostItem[]>(() =>
    readStorage<PostItem[]>(STORAGE_KEYS.posts, INITIAL_POSTS)
  );
  const [conversations, setConversations] = useState<Record<number, ChatMessage[]>>(() =>
    readStorage<Record<number, ChatMessage[]>>(STORAGE_KEYS.chats, INITIAL_CONVERSATIONS)
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    readStorage<AppNotification[]>(STORAGE_KEYS.notifs, INITIAL_NOTIFICATIONS)
  );
  const [blockedIds, setBlockedIds] = useState<number[]>(() =>
    readStorage<number[]>(STORAGE_KEYS.blocked, [])
  );
  const [messagePrivacy, setMessagePrivacy] = useState<MessagePrivacy>(() =>
    readStorage<MessagePrivacy>(STORAGE_KEYS.msgPrivacy, 'all')
  );

  const [selectedPersonId, setSelectedPersonId] = useState<number>(1);
  const [activeChatPersonId, setActiveChatPersonId] = useState<number>(1);
  const [unreadChatCount, setUnreadChatCount] = useState<number>(1);

  const [matchModalPerson, setMatchModalPerson] = useState<PersonProfile | null>(null);
  const [reportTargetName, setReportTargetName] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Private mode state
  const [privateConfig, setPrivateConfig] = useState<PrivateAccountConfig | null>(() =>
    readStorage<PrivateAccountConfig | null>(STORAGE_KEYS.privateConfig, null)
  );
  const [privateUnlocked, setPrivateUnlocked] = useState(false);
  const [privateScreen, setPrivateScreen] = useState<PrivateScreen>('p-main');
  const [privateUsers] = useState<PrivateUser[]>(INITIAL_PRIVATE_USERS);
  const [privatePosts, setPrivatePosts] = useState<PrivatePost[]>(() =>
    readStorage<PrivatePost[]>(STORAGE_KEYS.privatePosts, INITIAL_PRIVATE_POSTS)
  );
  const [privateChats, setPrivateChats] = useState<Record<string, ChatMessage[]>>(() =>
    readStorage<Record<string, ChatMessage[]>>(STORAGE_KEYS.privateChats, INITIAL_PRIVATE_CHATS)
  );
  const [privateNotifs, setPrivateNotifs] = useState<PrivateNotification[]>(
    INITIAL_PRIVATE_NOTIFICATIONS
  );
  const [activePrivateUserId, setActivePrivateUserId] = useState<string>('mystery_18');

  const [toast, setToast] = useState<string | null>(null);
  const isOnline = useOnlineStatus();

  const showToast = (msg: string) => {
    setToast(msg);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const currentUrl = window.location.origin + window.location.pathname;
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', currentUrl);
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', currentUrl);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  // Sync theme on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEYS.theme, JSON.stringify(theme));
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEYS.lang, JSON.stringify(lang));
    } catch {}
  }, [lang]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.user);
      }
    } catch {}
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.people, JSON.stringify(people));
    } catch {}
  }, [people]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(posts));
    } catch {}
  }, [posts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.chats, JSON.stringify(conversations));
    } catch {}
  }, [conversations]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.notifs, JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.blocked, JSON.stringify(blockedIds));
    } catch {}
  }, [blockedIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.msgPrivacy, JSON.stringify(messagePrivacy));
    } catch {}
  }, [messagePrivacy]);

  useEffect(() => {
    try {
      if (privateConfig) {
        localStorage.setItem(STORAGE_KEYS.privateConfig, JSON.stringify(privateConfig));
      } else {
        localStorage.removeItem(STORAGE_KEYS.privateConfig);
      }
    } catch {}
  }, [privateConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.privatePosts, JSON.stringify(privatePosts));
    } catch {}
  }, [privatePosts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.privateChats, JSON.stringify(privateChats));
    } catch {}
  }, [privateChats]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  const toggleLang = () => {
    setLang((prev) => {
      const next = prev === 'am' ? 'en' : 'am';
      showToast(next === 'am' ? 'ቋንቋ ወደ አማርኛ ተቀይሯል' : 'Language switched to English');
      return next;
    });
  };

  const navigateTo = (target: MainScreen) => {
    if (target !== 'detail') {
      setPreviousScreen(screen === 'detail' ? previousScreen : screen);
    }
    setScreen(target);
    if (target === 'chat') {
      setUnreadChatCount(0);
    }
  };

  const handleToggleFriend = (personId: number) => {
    setPeople((prev) =>
      prev.map((p) => {
        if (p.id !== personId) return p;
        const nextFriend = !p.isFriend;
        showToast(
          nextFriend
            ? lang === 'am'
              ? `${p.name} ጓደኛዎ ሆኗል/ሆናለች`
              : `Added ${p.name} as friend`
            : lang === 'am'
              ? `ከ${p.name} ጓደኝነት ተቋርጧል`
              : `Removed ${p.name} from friends`
        );
        return { ...p, isFriend: nextFriend };
      })
    );
  };

  const handleLikePerson = (personId: number) => {
    const target = people.find((p) => p.id === personId);
    if (!target) return;

    const nextLiked = !target.likedByMe;
    setPeople((prev) =>
      prev.map((p) => (p.id === personId ? { ...p, likedByMe: nextLiked } : p))
    );

    if (nextLiked && target.likedByThem) {
      setMatchModalPerson({ ...target, likedByMe: true });
      setNotifications((prev) => [
        {
          id: Date.now(),
          type: 'match',
          personId: target.id,
          personName: `${target.name}, ${target.age}`,
          avatarColor: target.color,
          messageAm: 'አዲስ ግጥምጥሞሽ (It’s a Match!) — አሁን ማውራት ይችላሉ።',
          messageEn: 'New mutual match! You can message each other now.',
          time: lang === 'am' ? 'አሁን' : 'Now',
          read: false,
        },
        ...prev,
      ]);
    } else if (nextLiked) {
      showToast(lang === 'am' ? `${target.name}ን ወደዋል ❤` : `Liked ${target.name} ❤`);
    }
  };

  const handleOpenChat = (personId: number) => {
    const target = people.find((p) => p.id === personId);
    if (!target) return;
    if (messagePrivacy === 'none') {
      showToast(
        lang === 'am'
          ? 'መልእክቶች ተቆልፈዋል (Settings ውስጥ ይክፈቱ)!'
          : 'Messages are locked in Settings!'
      );
      return;
    }
    if (messagePrivacy === 'friends' && !target.isFriend) {
      showToast(
        lang === 'am'
          ? 'ለጓደኞች ብቻ የተፈቀደ ነው — መጀመሪያ ጓደኛ ያድርጉ!'
          : 'Friends only — add as friend first!'
      );
      return;
    }
    setActiveChatPersonId(personId);
    navigateTo('chat');
  };

  const handleSendMessage = (
    personId: number,
    text: string,
    replyTo?: string,
    file?: MediaAttachment
  ) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const outgoing: ChatMessage = {
      id: Date.now(),
      from: 'out',
      text,
      replyTo,
      file,
      status: 'seen',
      time: nowTime,
    };

    setConversations((prev) => ({
      ...prev,
      [personId]: [...(prev[personId] || []), outgoing],
    }));

    const recipient = people.find((p) => p.id === personId);
    setTimeout(() => {
      const replyText =
        lang === 'am'
          ? `መልእክትዎን አይቼዋለሁ ${user?.name || ''}! 😊 ደስ ይላል።`
          : `Got your message${user?.name ? `, ${user.name}` : ''}! 😊 Looking forward to chatting more.`;
      setConversations((prev) => ({
        ...prev,
        [personId]: [
          ...(prev[personId] || []),
          {
            id: Date.now() + 1,
            from: 'in',
            text: replyText,
            status: 'seen',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      }));
      if (screen !== 'chat') {
        setUnreadChatCount((c) => c + 1);
      }
      if (recipient) {
        setNotifications((prev) => [
          {
            id: Date.now() + 2,
            type: 'comment',
            personId: recipient.id,
            personName: `${recipient.name}, ${recipient.age}`,
            avatarColor: recipient.color,
            messageAm: 'አዲስ መልእክት ልኮልዎታል።',
            messageEn: 'Sent you a new message.',
            time: lang === 'am' ? 'አሁን' : 'Now',
            read: screen === 'chat',
          },
          ...prev,
        ]);
      }
    }, 900);
  };

  const handleBlockPerson = (personId: number) => {
    setBlockedIds((prev) => (prev.includes(personId) ? prev : [...prev, personId]));
    showToast(lang === 'am' ? 'ተጠቃሚው ታግዷል!' : 'User blocked!');
    if (screen === 'detail' || screen === 'chat') {
      navigateTo('main');
    }
  };

  const handleDeleteAccount = () => {
    setConfirmDeleteOpen(false);
    localStorage.clear();
    setUser(null);
    setIsLoggedIn(false);
    setIsEditingProfile(false);
    setPrivateUnlocked(false);
    setPrivateConfig(null);
    setPeople(INITIAL_PEOPLE);
    setPosts(INITIAL_POSTS);
    setConversations(INITIAL_CONVERSATIONS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setBlockedIds([]);
    setScreen('login');
    showToast(lang === 'am' ? 'መለያዎ ተሰርዟል።' : 'Account deleted permanently.');
  };

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  // 1. Standalone Private Mode
  if (privateUnlocked && privateConfig) {
    return (
      <>
        {toast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-full bg-purple-600 text-white text-xs font-semibold shadow-lg">
            {toast}
          </div>
        )}
        <PrivateWorkspace
          lang={lang}
          config={privateConfig}
          activeScreen={privateScreen}
          privateUsers={privateUsers}
          privatePosts={privatePosts}
          privateChats={privateChats}
          privateNotifications={privateNotifs}
          activePrivateUserId={activePrivateUserId}
          onNavigate={setPrivateScreen}
          onSelectPrivateUser={setActivePrivateUserId}
          onAddPrivatePost={(text, media) => {
            setPrivatePosts((prev) => [
              {
                id: Date.now(),
                author: privateConfig.alias,
                text,
                likes: 0,
                likedByMe: false,
                media,
                comments: [],
                time: lang === 'am' ? 'አሁን' : 'Just now',
              },
              ...prev,
            ]);
            showToast(lang === 'am' ? 'በግል ገጽ ተለጥፏል!' : 'Posted to Private Feed!');
          }}
          onTogglePrivatePostLike={(postId) => {
            setPrivatePosts((prev) =>
              prev.map((p) =>
                p.id === postId
                  ? { ...p, likedByMe: !p.likedByMe, likes: p.likedByMe ? p.likes - 1 : p.likes + 1 }
                  : p
              )
            );
          }}
          onAddPrivateComment={(postId, text) => {
            setPrivatePosts((prev) =>
              prev.map((p) =>
                p.id === postId
                  ? {
                      ...p,
                      comments: [
                        ...p.comments,
                        { id: Date.now(), author: privateConfig.alias, text },
                      ],
                    }
                  : p
              )
            );
          }}
          onSendPrivateMessage={(userId, text, replyTo, file) => {
            const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setPrivateChats((prev) => ({
              ...prev,
              [userId]: [
                ...(prev[userId] || []),
                { id: Date.now(), from: 'out', text, replyTo, file, status: 'seen', time: now },
              ],
            }));
            setTimeout(() => {
              setPrivateChats((prev) => ({
                ...prev,
                [userId]: [
                  ...(prev[userId] || []),
                  {
                    id: Date.now() + 1,
                    from: 'in',
                    text:
                      lang === 'am'
                        ? 'ሚስጥራዊ መልእክትዎ ደርሷል 🔮'
                        : 'Private message received 🔮',
                    status: 'seen',
                    time: new Date().toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    }),
                  },
                ],
              }));
            }, 800);
          }}
          onMarkPrivateNotifsRead={() => {
            setPrivateNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
          }}
          onUpdateConfig={(next) => setPrivateConfig(next)}
          onClearPrivateData={() => {
            setPrivatePosts(INITIAL_PRIVATE_POSTS);
            setPrivateChats(INITIAL_PRIVATE_CHATS);
            showToast(lang === 'am' ? 'የግል ታሪክ ጸድቷል።' : 'Private history cleared.');
          }}
          onLockAndExit={() => {
            if (privateConfig.disappearing) {
              setPrivateChats(INITIAL_PRIVATE_CHATS);
            }
            setPrivateUnlocked(false);
            setScreen('main');
            showToast(lang === 'am' ? 'የግል መለያ ተቆልፏል።' : 'Private Account Locked!');
          }}
          onNotify={showToast}
        />
      </>
    );
  }

  // 2. Login Screen
  if (!isLoggedIn || screen === 'login') {
    return (
      <>
        {toast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-full bg-rose-600 text-white text-xs font-semibold shadow-lg">
            {toast}
          </div>
        )}
        <LoginScreen
          lang={lang}
          theme={theme}
          existingUser={user}
          onToggleLang={toggleLang}
          onToggleTheme={toggleTheme}
          onLoginSuccess={() => {
            setIsLoggedIn(true);
            if (user) {
              setScreen('main');
              showToast(
                lang === 'am' ? `እንኳን ደህና መጡ፣ ${user.name}!` : `Welcome back, ${user.name}!`
              );
            } else {
              setIsEditingProfile(false);
              setScreen('register');
            }
          }}
          onNotify={showToast}
        />
      </>
    );
  }

  // 3. Registration / Edit Profile Screen
  if (!user || screen === 'register') {
    return (
      <>
        {toast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-full bg-rose-600 text-white text-xs font-semibold shadow-lg">
            {toast}
          </div>
        )}
        <RegisterScreen
          lang={lang}
          initialProfile={isEditingProfile && !isCreatingNewProfile ? user : null}
          isEditing={isEditingProfile && !isCreatingNewProfile && Boolean(user)}
          onSave={(profile) => {
                    addDoc(collection(db, 'users'), {
          ...profile,
          id: Date.now(),
          likedByMe: false,
          likedByThem: true,
          isFriend: false,
          online: true,
          distance: lang === 'am' ? 'አዲስ ተመዝጋቢ' : 'New Member',
          color: 'from-rose-500 to-pink-600'
        }).catch(() => {});
            setUser(profile);
            setIsEditingProfile(false);
            setIsCreatingNewProfile(false);
            setScreen('main');
            showToast(
              lang === 'am' ? 'መገለጫዎ በተሳካ ሁኔታ ተቀምጧል!' : 'Profile saved successfully!'
            );
          }}
          onCancel={
            user
              ? () => {
                  setIsEditingProfile(false);
                  setIsCreatingNewProfile(false);
                  setScreen('settings');
                }
              : undefined
          }
          onNotify={showToast}
        />
      </>
    );
  }

  // 4. Main App Shell
  const desktopNavItems: {
    id: MainScreen;
    labelAm: string;
    labelEn: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    { id: 'main', labelAm: 'መነሻ', labelEn: 'Discover', icon: <Compass className="w-5 h-5" /> },
    { id: 'matches', labelAm: 'ግጥምጥሞሽ', labelEn: 'Matches', icon: <Heart className="w-5 h-5" /> },
    { id: 'search', labelAm: 'ፍለጋ', labelEn: 'Search', icon: <Search className="w-5 h-5" /> },
    {
      id: 'chat',
      labelAm: 'ቻት',
      labelEn: 'Chat',
      icon: <MessageCircle className="w-5 h-5" />,
      badge: unreadChatCount,
    },
    {
      id: 'notifications',
      labelAm: 'ማሳወቂያ',
      labelEn: 'Alerts',
      icon: <Bell className="w-5 h-5" />,
      badge: unreadNotifCount,
    },
    {
      id: 'private-gate',
      labelAm: 'የግል መለያ',
      labelEn: 'Private',
      icon: <Lock className="w-5 h-5" />,
    },
    {
      id: 'settings',
      labelAm: 'መገለጫ እና ቅንብር',
      labelEn: 'Settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const mobileBottomTabs: {
    id: MainScreen;
    labelAm: string;
    labelEn: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    { id: 'main', labelAm: 'መነሻ', labelEn: 'Home', icon: <Compass className="w-5 h-5" /> },
    { id: 'matches', labelAm: 'ግጥም', labelEn: 'Match', icon: <Heart className="w-5 h-5" /> },
    { id: 'search', labelAm: 'ፍለጋ', labelEn: 'Search', icon: <Search className="w-5 h-5" /> },
    {
      id: 'chat',
      labelAm: 'ቻት',
      labelEn: 'Chat',
      icon: <MessageCircle className="w-5 h-5" />,
      badge: unreadChatCount,
    },
    { id: 'private-gate', labelAm: 'የግል', labelEn: 'Private', icon: <Lock className="w-5 h-5" /> },
    { id: 'settings', labelAm: 'ቅንብር', labelEn: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const selectedPerson =
    people.find((p) => p.id === selectedPersonId) || people[0];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-full bg-rose-600 text-white text-xs font-semibold shadow-lg">
          {toast}
        </div>
      )}
      {!isOnline && (
        <div className="fixed bottom-20 lg:bottom-4 left-4 z-[90] flex items-center gap-2 rounded-xl bg-amber-600 px-3 py-2 text-xs font-semibold text-white shadow-lg">
          <WifiOff className="w-3.5 h-3.5" />
          <span>
            {lang === 'am'
              ? 'ከመስመር ውጭ ነዎት — የተቀመጠ መረጃ ጥቅም ላይ ውሏል።'
              : 'Offline Mode — Cached data active.'}
          </span>
        </div>
      )}

      {/* Top App Bar */}
      <header className="sticky top-0 z-30 h-13 lg:h-14 px-4 lg:px-6 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigateTo('main')}
          className="font-display font-bold text-base sm:text-lg text-rose-600 dark:text-rose-500 tracking-tight whitespace-nowrap shrink-0 cursor-pointer"
        >
          ፍቅር በነፃ | Fikir BeNetsa
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => navigateTo('notifications')}
            aria-label="Notifications"
            className={`lg:hidden relative min-h-[40px] min-w-[40px] rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
              screen === 'notifications'
                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Bell className="w-5 h-5" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center tabular-nums">
                {unreadNotifCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="min-h-[40px] min-w-[40px] rounded-xl flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={toggleLang}
            className="min-h-[36px] px-3 rounded-xl border border-rose-500/40 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-500/10 transition-colors cursor-pointer whitespace-nowrap"
          >
            {lang === 'am' ? 'English' : 'አማርኛ'}
          </button>

          <button
            type="button"
            onClick={() => navigateTo('settings')}
            aria-label="My Profile & Settings"
            className="lg:hidden min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
          >
            <Avatar name={user.name} src={user.photos.find(Boolean)} size="xs" />
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Navigation Rail */}
        <aside className="hidden lg:flex flex-col justify-between w-64 shrink-0 border-r border-zinc-200 dark:border-zinc-800 p-4">
          <nav className="space-y-1.5">
            {desktopNavItems.map((item) => {
              const isActive =
                screen === item.id || (screen === 'detail' && item.id === previousScreen);
              const isPrivate = item.id === 'private-gate';
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateTo(item.id)}
                  className={`w-full min-h-[46px] px-3.5 rounded-xl flex items-center justify-between text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? isPrivate
                        ? 'bg-purple-600 text-white'
                        : 'bg-rose-600 text-white'
                      : isPrivate
                        ? 'text-purple-600 dark:text-purple-400 hover:bg-purple-500/10'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-900'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    {item.icon}
                    <span className="whitespace-nowrap">
                      {lang === 'am' ? item.labelAm : item.labelEn}
                    </span>
                  </span>
                  {item.badge ? (
                    <span className="px-1.5 py-0.5 rounded-md bg-rose-500 text-white text-[11px] font-bold tabular-nums">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => navigateTo('settings')}
            className="mt-6 p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-3 text-left hover:border-rose-500/40 transition-colors cursor-pointer"
          >
            <Avatar
              name={user.name}
              src={user.photos.find(Boolean)}
              size="sm"
              verified={user.selfieVerified}
            />
            <div className="min-w-0">
              <p className="text-sm font-bold text-zinc-900 dark:text-white truncate tabular-nums">
                {user.name}, {user.age}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user.city}</p>
            </div>
          </button>
        </aside>

        {/* Active Screen Viewport */}
        <main className="flex-1 p-4 sm:p-6 pb-20 lg:pb-8 overflow-y-auto">
          {screen === 'main' && (
            <DiscoveryAndPostsScreen
              lang={lang}
              currentUser={user}
              people={people}
              blockedIds={blockedIds}
              posts={posts}
              activeSubTab={subTab}
              onChangeSubTab={setSubTab}
              onViewPerson={(id) => {
                setSelectedPersonId(id);
                setPreviousScreen('main');
                setScreen('detail');
              }}
              onToggleFriend={handleToggleFriend}
              onLikePerson={handleLikePerson}
              onOpenChat={handleOpenChat}
              onAddPost={(text, visibility, media) => {
                setPosts((prev) => [
                  {
                    id: Date.now(),
                    author: `${user.name}, ${user.age}`,
                    text,
                    likes: 0,
                    likedByMe: false,
                    comments: [],
                    visibility,
                    media,
                    createdAt: lang === 'am' ? 'አሁን' : 'Just now',
                  },
                  ...prev,
                ]);
                showToast(lang === 'am' ? 'ፖስት ተለጥፏል!' : 'Post published!');
              }}
              onTogglePostLike={(postId) => {
                setPosts((prev) =>
                  prev.map((p) =>
                    p.id === postId
                      ? {
                          ...p,
                          likedByMe: !p.likedByMe,
                          likes: p.likedByMe ? p.likes - 1 : p.likes + 1,
                        }
                      : p
                  )
                );
              }}
              onAddComment={(postId, text) => {
                setPosts((prev) =>
                  prev.map((p) =>
                    p.id === postId
                      ? {
                          ...p,
                          comments: [
                            ...p.comments,
                            {
                              id: Date.now(),
                              author: `${user.name}, ${user.age}`,
                              text,
                              createdAt: lang === 'am' ? 'አሁን' : 'Now',
                            },
                          ],
                        }
                      : p
                  )
                );
              }}
              onNotify={showToast}
            />
          )}

          {screen === 'detail' && selectedPerson && (
            <UserDetailScreen
              lang={lang}
              person={selectedPerson}
              onBack={() => navigateTo(previousScreen)}
              onToggleFriend={handleToggleFriend}
              onLike={handleLikePerson}
              onOpenChat={handleOpenChat}
              onBlock={handleBlockPerson}
              onReport={(name) => setReportTargetName(name)}
            />
          )}

          {screen === 'matches' && (
            <MatchesScreen
              lang={lang}
              people={people}
              blockedIds={blockedIds}
              onViewPerson={(id) => {
                setSelectedPersonId(id);
                setPreviousScreen('matches');
                setScreen('detail');
              }}
              onOpenChat={handleOpenChat}
            />
          )}

          {screen === 'search' && (
            <SearchScreen
              lang={lang}
              people={people}
              blockedIds={blockedIds}
              onViewPerson={(id) => {
                setSelectedPersonId(id);
                setPreviousScreen('search');
                setScreen('detail');
              }}
              onOpenChat={handleOpenChat}
            />
          )}

          {screen === 'chat' && (
            <ChatScreen
              lang={lang}
              currentUser={user}
              people={people}
              blockedIds={blockedIds}
              activePersonId={activeChatPersonId}
              conversations={conversations}
              messagePrivacy={messagePrivacy}
              onSelectPerson={setActiveChatPersonId}
              onSendMessage={handleSendMessage}
              onBlockPerson={handleBlockPerson}
              onReportPerson={(name) => setReportTargetName(name)}
              onOpenSettings={() => navigateTo('settings')}
              onNotify={showToast}
            />
          )}

          {screen === 'notifications' && (
            <NotificationsScreen
              lang={lang}
              notifications={notifications}
              onMarkAllRead={() => {
                setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                showToast(lang === 'am' ? 'ሁሉም ተነብበዋል!' : 'All marked as read');
              }}
              onRespondFriendRequest={(notifId, personId, accept) => {
                setNotifications((prev) =>
                  prev.map((n) =>
                    n.id === notifId
                      ? { ...n, read: true, handled: accept ? 'accepted' : 'declined' }
                      : n
                  )
                );
                if (accept && personId) {
                  setPeople((prev) =>
                    prev.map((p) => (p.id === personId ? { ...p, isFriend: true } : p))
                  );
                }
                showToast(
                  accept
                    ? lang === 'am'
                      ? 'የጓደኝነት ጥያቄ ተቀብለዋል!'
                      : 'Friend request accepted!'
                    : lang === 'am'
                      ? 'ጥያቄው ውድቅ ተደርጓል'
                      : 'Request declined'
                );
              }}
              onViewPerson={(id) => {
                setSelectedPersonId(id);
                setPreviousScreen('notifications');
                setScreen('detail');
              }}
            />
          )}

          {screen === 'private-gate' && (
            <PrivateGateScreen
              lang={lang}
              savedConfig={privateConfig}
              onUnlock={(cfg) => {
                setPrivateConfig(cfg);
                setPrivateUnlocked(true);
                setPrivateScreen('p-main');
                showToast(
                  lang === 'am' ? 'የግል መለያ ተከፍቷል!' : 'Private Account Unlocked!'
                );
              }}
              onResetVault={() => {
                setPrivateConfig(null);
                setPrivatePosts(INITIAL_PRIVATE_POSTS);
                setPrivateChats(INITIAL_PRIVATE_CHATS);
                showToast(lang === 'am' ? 'የግል መለያ ዳግም ተጀምሯል' : 'Private vault reset');
              }}
              onNotify={showToast}
            />
          )}

          {screen === 'settings' && (
            <SettingsScreen
              lang={lang}
              theme={theme}
              user={user}
              messagePrivacy={messagePrivacy}
              blockedPeople={people.filter((p) => blockedIds.includes(p.id))}
              onChangeMessagePrivacy={(val) => {
                setMessagePrivacy(val);
                showToast(lang === 'am' ? 'የግላዊነት ቅንብር ተቀምጧል!' : 'Privacy updated!');
              }}
              onUnblockPerson={(id) => {
                setBlockedIds((prev) => prev.filter((x) => x !== id));
                showToast(lang === 'am' ? 'እገዳው ተነስቷል።' : 'User unblocked');
              }}
              onToggleTheme={toggleTheme}
              onToggleLang={toggleLang}
              onEditProfile={() => {
                setIsCreatingNewProfile(false);
                setIsEditingProfile(true);
                setScreen('register');
              }}
              onCreateNewProfile={() => {
                setIsEditingProfile(false);
                setIsCreatingNewProfile(true);
                setScreen('register');
              }}
              onUpdatePhoto={(slotIndex, dataUrl) => {
                setUser((prev) => {
                  if (!prev) return prev;
                  const nextPhotos = [...prev.photos];
                  nextPhotos[slotIndex] = dataUrl;
                  return { ...prev, photos: nextPhotos };
                });
                showToast(
                  lang === 'am' ? `ፎቶ ${slotIndex + 1} ተቀይሯል!` : `Photo ${slotIndex + 1} updated!`
                );
              }}
              onChangePassword={(newPassword) => {
                setUser((prev) => (prev ? { ...prev, password: newPassword } : prev));
                showToast(
                  lang === 'am' ? 'የይለፍ ቃልዎ በተሳካ ሁኔታ ተቀይሯል!' : 'Password updated successfully!'
                );
              }}
              onLogout={() => {
                setIsLoggedIn(false);
                setScreen('login');
                showToast(lang === 'am' ? 'ከመለያዎ ወጥተዋል።' : 'Signed out');
              }}
              onRequestDeleteAccount={() => setConfirmDeleteOpen(true)}
              onNotify={showToast}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Thumb Navigation (<= 15% aggregate sticky height with top header) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-15 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-6">
        {mobileBottomTabs.map((tab) => {
          const active =
            screen === tab.id || (screen === 'detail' && tab.id === previousScreen);
          const isPrivate = tab.id === 'private-gate';
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigateTo(tab.id)}
              className={`relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium cursor-pointer ${
                active
                  ? isPrivate
                    ? 'text-purple-500 font-semibold'
                    : 'text-rose-600 dark:text-rose-500 font-semibold'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {tab.icon}
              <span className="truncate max-w-full px-1">
                {lang === 'am' ? tab.labelAm : tab.labelEn}
              </span>
              {tab.badge ? (
                <span className="absolute top-1.5 right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center tabular-nums">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Global Modals */}
      <MatchModal
        person={matchModalPerson}
        lang={lang}
        onMessage={(id) => {
          setMatchModalPerson(null);
          handleOpenChat(id);
        }}
        onClose={() => setMatchModalPerson(null)}
      />

      <ReportModal
        targetName={reportTargetName}
        lang={lang}
        onSubmit={() => {
          setReportTargetName(null);
          showToast(
            lang === 'am'
              ? 'ሪፖርትዎ ለአስተዳዳሪዎች ተልኳል!'
              : 'Report submitted for safety review!'
          );
        }}
        onClose={() => setReportTargetName(null)}
      />

      <ConfirmModal
        open={confirmDeleteOpen}
        title={lang === 'am' ? 'መለያዎን እስከመጨረሻው ማጥፋት?' : 'Delete Account Permanently?'}
        description={
          lang === 'am'
            ? 'ሁሉም መረጃዎ፣ ፎቶዎችዎ እና መልእክቶችዎ እስከመጨረሻው ይጠፋሉ።'
            : 'All your profile data, photos, and messages will be permanently removed.'
        }
        confirmLabel={lang === 'am' ? 'አዎ፣ አጥፋ' : 'Delete Permanently'}
        cancelLabel={lang === 'am' ? 'ተወው' : 'Cancel'}
        onConfirm={handleDeleteAccount}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
}
