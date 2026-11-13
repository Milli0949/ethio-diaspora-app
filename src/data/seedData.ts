import {
  AppNotification,
  ChatMessage,
  Lang,
  PersonProfile,
  PostItem,
  PrivateNotification,
  PrivatePost,
  PrivateUser,
} from '../types/app';

export const BAD_WORDS = ['ብልግና', 'ወሲብ', 'sex', 'porn', 'xxx', 'nude', 'nsfw'];

export const containsBadWords = (text: string): boolean => {
  const lower = text.toLowerCase();
  return BAD_WORDS.some((word) => lower.includes(word));
};

export const INITIAL_PEOPLE: PersonProfile[] = [
  {
    id: 1,
    name: 'ሰላም',
    age: 24,
    city: 'አዲስ አበባ',
    phone: '0911 22 33 44',
    job: 'ነርስ / Nurse',
    gender: 'female',
    religion: 'ኦርቶዶክስ / Orthodox',
    goal: 'marriage',
    hobbies: 'ሙዚቃ, ቡና, መጻሕፍት',
    bio: 'እውነተኛ ትዳር እና መከባበር ላይ የተመሰረተ ግንኙነት እፈልጋለሁ።',
    isFriend: true,
    likedByThem: true,
    likedByMe: true,
    online: true,
    color: '#e11d48',
    photoCaptions: ['Addis Morning Coffee', 'Hospital Volunteer', 'Entoto Sunset', 'Traditional Dress'],
  },
  {
    id: 2,
    name: 'ዳዊት',
    age: 28,
    city: 'ባህር ዳር',
    phone: '0922 33 44 55',
    job: 'ሲቪል ኢንጂነር / Civil Engineer',
    gender: 'male',
    religion: 'ኦርቶዶክስ / Orthodox',
    goal: 'serious',
    hobbies: 'ስፖርት, ጉዞ, ፎቶግራፍ',
    bio: 'አክባሪ፣ ታማኝ እና ለወደፊት አብራኝ የምትጓዝ አጋር እፈልጋለሁ።',
    isFriend: false,
    likedByThem: true,
    likedByMe: false,
    online: true,
    color: '#2563eb',
    photoCaptions: ['Lake Tana Walk', 'Site Visit', 'Weekend Cycling', 'Evening Portrait'],
  },
  {
    id: 3,
    name: 'ሜሮን',
    age: 23,
    city: 'ሀዋሳ',
    phone: '0933 44 55 66',
    job: 'የዩኒቨርሲቲ ተማሪ / Student',
    gender: 'female',
    religion: 'ፕሮቴስታንት / Protestant',
    goal: 'friendship',
    hobbies: 'ሙዚቃ, ፊልም, ዋና',
    bio: 'አዲስ ጓደኞችን ማፍራት እና በሀዋሳ ሀይቅ ዳር መዝናናት እወዳለሁ።',
    isFriend: false,
    likedByThem: false,
    likedByMe: false,
    online: false,
    color: '#059669',
    photoCaptions: ['Hawassa Lakefront', 'Campus Life', 'Weekend Cafe', 'Art Gallery'],
  },
  {
    id: 4,
    name: 'በረከት',
    age: 29,
    city: 'አዳማ',
    phone: '0944 55 66 77',
    job: 'ሶፍትዌር ዲዛይነር / Product Designer',
    gender: 'male',
    religion: 'ፕሮቴስታንት / Protestant',
    goal: 'marriage',
    hobbies: 'ቴክኖሎጂ, ቡና, ጉዞ',
    bio: 'ሰላማዊ ሕይወት እና ትርጉም ያለው ፍቅር የምፈልግ ነኝ።',
    isFriend: false,
    likedByThem: true,
    likedByMe: false,
    online: true,
    color: '#d97706',
    photoCaptions: ['Studio Desk', 'Sodere Weekend', 'Bole Coffee', 'Hiking Trail'],
  },
  {
    id: 5,
    name: 'ሃና',
    age: 26,
    city: 'ጎንደር',
    phone: '0955 66 77 88',
    job: 'ፋርማሲስት / Pharmacist',
    gender: 'female',
    religion: 'እስልምና / Muslim',
    goal: 'serious',
    hobbies: 'ምግብ ማብሰል, ንባብ, ቤተሰብ',
    bio: 'ቅንነት እና እውነተኛ ወዳጅነት ከሁሉ ይበልጣል።',
    isFriend: false,
    likedByThem: false,
    likedByMe: false,
    online: true,
    color: '#9333ea',
    photoCaptions: ['Gondar Heritage', 'Morning Tea', 'Bookstore Visit', 'Family Gathering'],
  },
];

export const INITIAL_POSTS: PostItem[] = [
  {
    id: 1,
    author: 'ሰላም, 24',
    authorId: 1,
    text: 'ሰላም ኢትዮጵያ! ዛሬ አዲስ አበባ አየሩ ደስ ይላል ☕❤️ መልካም ቀን ለሁላችሁም!',
    likes: 12,
    likedByMe: false,
    comments: [
      { id: 101, author: 'ዳዊት, 28', text: 'በጣም ደስ ይላል! መልካም ቀን።', createdAt: '10m' },
    ],
    visibility: 'all',
    media: null,
    createdAt: '25m ago',
  },
  {
    id: 2,
    author: 'ዳዊት, 28',
    authorId: 2,
    text: 'ከባህር ዳር ጣና ሀይቅ ዳር ጠዋት ላይ መራመድ የሌለ ውበት አለው።',
    likes: 8,
    likedByMe: false,
    comments: [],
    visibility: 'all',
    media: null,
    createdAt: '1h ago',
  },
];

export const INITIAL_CONVERSATIONS: Record<number, ChatMessage[]> = {
  1: [
    {
      id: 1,
      from: 'in',
      text: 'ሰላም! እንዴት ነህ/ነሽ? መገለጫህን ወድጄዋለሁ 😊',
      status: 'seen',
      time: '09:42',
    },
  ],
  2: [
    {
      id: 2,
      from: 'in',
      text: 'ሰላም ከባህር ዳር! እንዴት ነህ/ነሽ?',
      status: 'seen',
      time: 'Yesterday',
    },
  ],
};

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 1,
    type: 'match',
    personId: 1,
    personName: 'ሰላም, 24',
    avatarColor: '#e11d48',
    messageAm: 'የእርስዎን መገለጫ ወዳዋለች (It’s a Match!).',
    messageEn: 'Liked your profile back — It’s a Match!',
    time: '5m',
    read: false,
  },
  {
    id: 2,
    type: 'friend_request',
    personId: 2,
    personName: 'ዳዊት, 28',
    avatarColor: '#2563eb',
    messageAm: 'የጓደኝነት ጥያቄ ልኮልዎታል።',
    messageEn: 'Sent you a friend request.',
    time: '20m',
    read: false,
  },
  {
    id: 3,
    type: 'like',
    personId: 4,
    personName: 'በረከት, 29',
    avatarColor: '#d97706',
    messageAm: 'መገለጫዎን ወዶታል።',
    messageEn: 'Liked your profile.',
    time: '1h',
    read: true,
  },
];

export const INITIAL_PRIVATE_USERS: PrivateUser[] = [
  {
    id: 'mystery_18',
    alias: 'Mystery_18',
    city: 'አዲስ አበባ',
    bioAm: 'ያለ ስጋት እና ያለ ገደብ የግል ውይይት።',
    bioEn: 'Unfiltered late-night thoughts & private chat.',
    online: true,
    color: '#9333ea',
  },
  {
    id: 'nightrose_22',
    alias: 'NightRose_22',
    city: 'አዳማ',
    bioAm: 'ግላዊነትን የሚያከብሩ ሰዎች ብቻ።',
    bioEn: 'Discreet conversations with respectful adults.',
    online: true,
    color: '#c026d3',
  },
  {
    id: 'addisshadow',
    alias: 'AddisShadow',
    city: 'ቦሌ / አዲስ አበባ',
    bioAm: 'ምሽት ላይ ቡናና ሚስጥራዊ ወግ።',
    bioEn: 'Midnight coffee and secret confessions.',
    online: false,
    color: '#7c3aed',
  },
];

export const INITIAL_PRIVATE_POSTS: PrivatePost[] = [
  {
    id: 1,
    author: 'Mystery_18',
    text: 'በዚህ ዝግ ክፍል ውስጥ ያለ ምንም ፍርሃት እና ያለ ማውረድ ነፃ ውይይት እናድርግ 🔥',
    likes: 5,
    likedByMe: false,
    media: null,
    comments: [{ id: 1, author: 'NightRose_22', text: 'ሙሉ በሙሉ እስማማለሁ ✨' }],
    time: '15m ago',
  },
];

export const INITIAL_PRIVATE_CHATS: Record<string, ChatMessage[]> = {
  mystery_18: [
    {
      id: 1,
      from: 'in',
      text: 'ዝግ የውይይት ክፍል ተከፍቷል። ማንነትዎ ሚስጥራዊ ነው። / Private room unlocked.',
      status: 'seen',
      time: 'Now',
    },
  ],
};

export const INITIAL_PRIVATE_NOTIFICATIONS: PrivateNotification[] = [
  {
    id: 1,
    alias: 'Mystery_18',
    textAm: 'በግል ፖስትዎ ላይ 🔥 ምልክት ሰጥቷል።',
    textEn: 'Reacted 🔥 to your private room activity.',
    time: '4m',
    read: false,
  },
  {
    id: 2,
    alias: 'NightRose_22',
    textAm: 'ሚስጥራዊ መልእክት ሊልክልዎ ፈልጓል።',
    textEn: 'Viewed your private alias.',
    time: '1h',
    read: false,
  },
];

export async function compressImageToDataUrl(file: File, maxDim = 640): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      if (!file.type.startsWith('image/')) {
        resolve(src);
        return;
      }
      const img = new Image();
      img.onerror = () => resolve(src);
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

export const goalLabel = (goal: PersonProfile['goal'], lang: Lang): string => {
  if (goal === 'marriage') return lang === 'am' ? 'ለትዳር' : 'Marriage';
  if (goal === 'serious') return lang === 'am' ? 'ለፍቅር ግንኙነት' : 'Serious Relationship';
  return lang === 'am' ? 'ለጓደኝነት' : 'Friendship';
};

export const genderLabel = (gender: 'male' | 'female', lang: Lang): string => {
  if (gender === 'male') return lang === 'am' ? 'ወንድ' : 'Male';
  return lang === 'am' ? 'ሴት' : 'Female';
};
