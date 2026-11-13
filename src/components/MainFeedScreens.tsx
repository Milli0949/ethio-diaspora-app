import React, { useRef, useState } from 'react';
import {
  Check,
  Download,
  Flag,
  Heart,
  Lock,
  MessageCircle,
  Paperclip,
  Search,
  Send,
  ShieldBan,
  ShieldCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import {
  compressImageToDataUrl,
  containsBadWords,
  genderLabel,
  goalLabel,
} from '../data/seedData';
import {
  Lang,
  MediaAttachment,
  PersonProfile,
  PostItem,
  UserProfile,
} from '../types/app';
import { Avatar } from './Avatar';

interface DiscoveryAndPostsScreenProps {
  lang: Lang;
  currentUser: UserProfile;
  people: PersonProfile[];
  blockedIds: number[];
  posts: PostItem[];
  activeSubTab: 'people' | 'posts';
  onChangeSubTab: (tab: 'people' | 'posts') => void;
  onViewPerson: (id: number) => void;
  onToggleFriend: (id: number) => void;
  onLikePerson: (id: number) => void;
  onOpenChat: (id: number) => void;
  onAddPost: (text: string, visibility: 'all' | 'friends', media: MediaAttachment | null) => void;
  onTogglePostLike: (postId: number) => void;
  onAddComment: (postId: number, text: string) => void;
  onNotify: (msg: string) => void;
}

export const DiscoveryAndPostsScreen: React.FC<DiscoveryAndPostsScreenProps> = ({
  lang,
  currentUser,
  people,
  blockedIds,
  posts,
  activeSubTab,
  onChangeSubTab,
  onViewPerson,
  onToggleFriend,
  onLikePerson,
  onOpenChat,
  onAddPost,
  onTogglePostLike,
  onAddComment,
  onNotify,
}) => {
  const [peopleFilter, setPeopleFilter] = useState<'all' | 'marriage' | 'serious' | 'friendship' | 'online'>('all');
  const [postText, setPostText] = useState('');
  const [postVisibility, setPostVisibility] = useState<'all' | 'friends'>('all');
  const [postMedia, setPostMedia] = useState<MediaAttachment | null>(null);
  const [openCommentsId, setOpenCommentsId] = useState<number | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});

  const fileRef = useRef<HTMLInputElement | null>(null);

  const visiblePeople = people
    .filter((p) => !blockedIds.includes(p.id))
    .filter((p) => {
      if (peopleFilter === 'online') return p.online;
      if (peopleFilter === 'marriage' || peopleFilter === 'serious' || peopleFilter === 'friendship') {
        return p.goal === peopleFilter;
      }
      return true;
    });

  const visiblePosts = posts.filter((post) => {
    if (post.authorId && blockedIds.includes(post.authorId)) return false;
    if (post.visibility === 'friends' && post.authorId) {
      const author = people.find((p) => p.id === post.authorId);
      if (author && !author.isFriend) return false;
    }
    return true;
  });

  const handleMediaPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const url = file.type.startsWith('image/')
        ? await compressImageToDataUrl(file, 800)
        : await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('read error'));
            reader.readAsDataURL(file);
          });
      setPostMedia({ name: file.name, url, type: file.type });
    } catch {
      onNotify(lang === 'am' ? 'ፋይሉን መጫን አልተቻለም' : 'Could not attach file');
    }
  };

  const handlePublishPost = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = postText.trim();
    if (!cleaned && !postMedia) return;
    if (containsBadWords(cleaned)) {
      setPostText('');
      onNotify(
        lang === 'am'
          ? 'በዋናው ገጽ ላይ ተገቢ ያልሆኑ ቃላት አይፈቀዱም!'
          : 'Profanity is blocked on the main feed!'
      );
      return;
    }
    onAddPost(cleaned, postVisibility, postMedia);
    setPostText('');
    setPostMedia(null);
  };

  const handleDownloadPost = (post: PostItem) => {
    const link = document.createElement('a');
    if (post.media) {
      link.href = post.media.url;
      link.download = post.media.name;
    } else {
      const blob = new Blob([`${post.author}\n\n${post.text}`], {
        type: 'text/plain;charset=utf-8',
      });
      link.href = URL.createObjectURL(blob);
      link.download = `FikirBeNetsa_Post_${post.id}.txt`;
    }
    link.click();
    onNotify(lang === 'am' ? 'ወርዷል!' : 'Downloaded!');
  };

  const handleCommentSubmit = (postId: number, e: React.FormEvent) => {
    e.preventDefault();
    const text = (commentInputs[postId] || '').trim();
    if (!text) return;
    if (containsBadWords(text)) {
      onNotify(
        lang === 'am'
          ? 'በዋናው ገጽ ላይ ተገቢ ያልሆኑ ቃላት አይፈቀዱም!'
          : 'Profanity is blocked on the main feed!'
      );
      return;
    }
    onAddComment(postId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  const filterButtons: { id: typeof peopleFilter; am: string; en: string }[] = [
    { id: 'all', am: 'ሁሉም', en: 'All' },
    { id: 'online', am: 'መስመር ላይ', en: 'Online' },
    { id: 'marriage', am: 'ለትዳር', en: 'Marriage' },
    { id: 'serious', am: 'ለፍቅር', en: 'Serious' },
    { id: 'friendship', am: 'ለጓደኝነት', en: 'Friendship' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-zinc-200/80 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => onChangeSubTab('people')}
          className={`min-h-[44px] rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'people'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{lang === 'am' ? 'ሰዎች' : 'People'}</span>
        </button>
        <button
          type="button"
          onClick={() => onChangeSubTab('posts')}
          className={`min-h-[44px] rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'posts'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>{lang === 'am' ? 'ፖስቶች' : 'Posts'}</span>
        </button>
      </div>

      {activeSubTab === 'people' ? (
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {filterButtons.map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setPeopleFilter(btn.id)}
                className={`min-h-[38px] px-3.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  peopleFilter === btn.id
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                    : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                {lang === 'am' ? btn.am : btn.en}
              </button>
            ))}
          </div>

          {visiblePeople.length === 0 ? (
            <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {lang === 'am'
                  ? 'በዚህ ምድብ ውስጥ ሰው አልተገኘም።'
                  : 'No profiles match this filter right now.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {visiblePeople.map((person) => (
                <div
                  key={person.id}
                  className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 flex flex-col justify-between gap-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                >
                  <div
                    onClick={() => onViewPerson(person.id)}
                    className="cursor-pointer space-y-3"
                  >
                    <div className="flex items-start gap-3.5">
                      <Avatar
                        name={person.name}
                        color={person.color}
                        size="lg"
                        verified
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-base font-bold text-zinc-900 dark:text-white truncate tabular-nums">
                            {person.name}, {person.age}
                          </h3>
                          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 shrink-0">
                            {person.online
                              ? lang === 'am'
                                ? 'መስመር ላይ'
                                : 'Online'
                              : lang === 'am'
                                ? 'ከመስመር ውጭ'
                                : 'Offline'}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                          {person.city} · {person.job}
                        </p>
                        <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-1">
                          {genderLabel(person.gender, lang)} · {goalLabel(person.goal, lang)}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                      “{person.bio}”
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                    <button
                      type="button"
                      onClick={() => onToggleFriend(person.id)}
                      className={`min-h-[44px] px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                        person.isFriend
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {person.isFriend ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{lang === 'am' ? 'ጓደኛ' : 'Friends'}</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>{lang === 'am' ? 'አክል' : 'Add'}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onLikePerson(person.id)}
                      className={`min-h-[44px] px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                        person.likedByMe
                          ? 'bg-rose-600 text-white'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${person.likedByMe ? 'fill-white' : ''}`} />
                      <span>
                        {person.likedByMe
                          ? lang === 'am'
                            ? 'ተወዷል'
                            : 'Liked'
                          : lang === 'am'
                            ? 'ውደድ'
                            : 'Like'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenChat(person.id)}
                      className="min-h-[44px] px-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{lang === 'am' ? 'ቻት' : 'Chat'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 max-w-2xl mx-auto w-full">
          <form
            onSubmit={handlePublishPost}
            className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 space-y-3"
          >
            <div className="flex items-start gap-3">
              <Avatar
                name={currentUser.name}
                src={currentUser.photos.find(Boolean)}
                size="sm"
              />
              <textarea
                rows={2}
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder={
                  lang === 'am' ? 'ሃሳብዎን ያጋሩ...' : 'Share your thoughts with the community...'
                }
                className="flex-1 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            {postMedia && (
              <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
                <span className="truncate">{postMedia.name}</span>
                <button
                  type="button"
                  onClick={() => setPostMedia(null)}
                  className="ml-2 p-1 hover:text-red-500 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*,audio/*"
              className="hidden"
              onChange={handleMediaPick}
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                aria-label="Attach media"
                className="min-h-[44px] min-w-[44px] rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center justify-center cursor-pointer"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <select
                value={postVisibility}
                onChange={(e) => setPostVisibility(e.target.value as 'all' | 'friends')}
                className="min-h-[44px] flex-1 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-rose-500"
              >
                <option value="all">{lang === 'am' ? 'ለሁሉም (Public)' : 'Public'}</option>
                <option value="friends">{lang === 'am' ? 'ለጓደኞች ብቻ (Friends)' : 'Friends Only'}</option>
              </select>

              <button
                type="submit"
                className="min-h-[44px] px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                {lang === 'am' ? 'ፖስት' : 'Post'}
              </button>
            </div>
          </form>

          {visiblePosts.map((post) => {
            const commentsOpen = openCommentsId === post.id;
            return (
              <article
                key={post.id}
                className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
                      {post.author}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                      {post.visibility === 'all'
                        ? lang === 'am'
                          ? 'ለሁሉም'
                          : 'Public'
                        : lang === 'am'
                          ? 'ለጓደኞች'
                          : 'Friends'}
                      {' · '}
                      {post.createdAt}
                    </p>
                  </div>
                </div>

                {post.text && (
                  <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">
                    {post.text}
                  </p>
                )}

                {post.media && (
                  <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                    {post.media.type.startsWith('image/') ? (
                      <img
                        src={post.media.url}
                        alt={post.media.name}
                        className="w-full max-h-80 object-cover"
                      />
                    ) : post.media.type.startsWith('video/') ? (
                      <video src={post.media.url} controls className="w-full max-h-80" />
                    ) : post.media.type.startsWith('audio/') ? (
                      <div className="p-3">
                        <audio src={post.media.url} controls className="w-full" />
                      </div>
                    ) : (
                      <div className="p-3 text-xs text-zinc-500">{post.media.name}</div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => onTogglePostLike(post.id)}
                    className={`min-h-[42px] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 tabular-nums transition-colors cursor-pointer ${
                      post.likedByMe
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${post.likedByMe ? 'fill-rose-500' : ''}`} />
                    <span>{post.likes}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOpenCommentsId(commentsOpen ? null : post.id)}
                    className="min-h-[42px] rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center justify-center gap-1.5 tabular-nums transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{post.comments.length}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadPost(post)}
                    className="min-h-[42px] rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{lang === 'am' ? 'አውርድ' : 'Download'}</span>
                  </button>
                </div>

                {commentsOpen && (
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2.5">
                    {post.comments.length > 0 && (
                      <div className="space-y-2">
                        {post.comments.map((cm) => (
                          <div
                            key={cm.id}
                            className="rounded-xl bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-xs"
                          >
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                              {cm.author}
                            </span>{' '}
                            <span className="text-zinc-600 dark:text-zinc-300">{cm.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <form
                      onSubmit={(e) => handleCommentSubmit(post.id, e)}
                      className="flex gap-2"
                    >
                      <input
                        value={commentInputs[post.id] || ''}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        placeholder={lang === 'am' ? 'አስተያየት ይጻፉ...' : 'Write a comment...'}
                        className="flex-1 min-h-[40px] rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
                      />
                      <button
                        type="submit"
                        aria-label="Send comment"
                        className="min-h-[40px] min-w-[40px] rounded-xl bg-rose-600 text-white flex items-center justify-center cursor-pointer"
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
    </div>
  );
};

interface UserDetailScreenProps {
  lang: Lang;
  person: PersonProfile;
  onBack: () => void;
  onToggleFriend: (id: number) => void;
  onLike: (id: number) => void;
  onOpenChat: (id: number) => void;
  onBlock: (id: number) => void;
  onReport: (name: string) => void;
}

export const UserDetailScreen: React.FC<UserDetailScreenProps> = ({
  lang,
  person,
  onBack,
  onToggleFriend,
  onLike,
  onOpenChat,
  onBlock,
  onReport,
}) => {
  const photosUnlocked = person.isFriend || (person.likedByMe && person.likedByThem);

  return (
    <div className="max-w-2xl mx-auto w-full space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="min-h-[44px] px-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
      >
        ← {lang === 'am' ? 'ተመለስ' : 'Back'}
      </button>

      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <Avatar name={person.name} color={person.color} size="xl" verified />
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tabular-nums flex items-center justify-center gap-1.5">
              <span>
                {person.name}, {person.age}
              </span>
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {person.city} · {person.job}
            </p>
          </div>

          <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            {person.isFriend ? (
              <span className="text-emerald-600 dark:text-emerald-400 tabular-nums">
                {lang === 'am' ? 'ስልክ፡ ' : 'Phone: '}
                {person.phone}
              </span>
            ) : (
              <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                {lang === 'am' ? 'ስልክ ለማየት ጓደኛ ይሁኑ' : 'Add friend to view phone'}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-4 border-y border-zinc-100 dark:border-zinc-800 text-sm">
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {lang === 'am' ? 'ሃይማኖት' : 'Religion'}
            </p>
            <p className="font-medium text-zinc-900 dark:text-zinc-100 mt-0.5">{person.religion}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {lang === 'am' ? 'ዓላማ' : 'Goal'}
            </p>
            <p className="font-medium text-zinc-900 dark:text-zinc-100 mt-0.5">
              {goalLabel(person.goal, lang)}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {lang === 'am' ? 'ፍላጎቶች' : 'Hobbies'}
            </p>
            <p className="font-medium text-zinc-900 dark:text-zinc-100 mt-0.5">{person.hobbies}</p>
          </div>
        </div>

        <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed text-center">
          “{person.bio}”
        </p>

        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              {lang === 'am' ? 'የተጠበቁ ፎቶዎች (4)' : 'Protected Gallery (4)'}
            </h3>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              {lang === 'am' ? 'ማውረድ የተከለከለ' : 'No Download'}
            </span>
          </div>
          <div
            onContextMenu={(e) => e.preventDefault()}
            className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 protected-media"
          >
            {person.photoCaptions.map((caption, i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden relative flex flex-col items-center justify-center p-2 text-center"
                style={{
                  background: photosUnlocked
                    ? `linear-gradient(135deg, ${person.color}33, ${person.color}11)`
                    : undefined,
                }}
              >
                {photosUnlocked ? (
                  <>
                    <Avatar name={person.name} color={person.color} size="md" />
                    <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mt-2 line-clamp-1">
                      {caption}
                    </span>
                  </>
                ) : (
                  <div className="text-zinc-500 dark:text-zinc-400 flex flex-col items-center gap-1">
                    <Lock className="w-4 h-4" />
                    <span className="text-[11px]">
                      {lang === 'am' ? `ፎቶ ${i + 1}` : `Photo ${i + 1}`}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => onToggleFriend(person.id)}
            className={`min-h-[46px] rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer ${
              person.isFriend
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
            }`}
          >
            {person.isFriend ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>
              {person.isFriend
                ? lang === 'am'
                  ? 'ጓደኛ ነው'
                  : 'Friends'
                : lang === 'am'
                  ? 'ጓደኛ አክል'
                  : 'Add Friend'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onLike(person.id)}
            className={`min-h-[46px] rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer ${
              person.likedByMe
                ? 'bg-rose-600 text-white'
                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
            }`}
          >
            <Heart className={`w-4 h-4 ${person.likedByMe ? 'fill-white' : ''}`} />
            <span>{person.likedByMe ? (lang === 'am' ? 'ተወዷል' : 'Liked') : lang === 'am' ? 'ውደድ' : 'Like'}</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenChat(person.id)}
            className="min-h-[46px] rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{lang === 'am' ? 'ቻት ክፈት' : 'Private Chat'}</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => onBlock(person.id)}
            className="min-h-[40px] px-3 text-xs font-medium text-red-500 hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldBan className="w-3.5 h-3.5" />
            <span>{lang === 'am' ? 'አግድ (Block)' : 'Block User'}</span>
          </button>
          <button
            type="button"
            onClick={() => onReport(`${person.name}, ${person.age}`)}
            className="min-h-[40px] px-3 text-xs font-medium text-amber-500 hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>{lang === 'am' ? 'ሪፖርት (Report)' : 'Report User'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface MatchesScreenProps {
  lang: Lang;
  people: PersonProfile[];
  blockedIds: number[];
  onViewPerson: (id: number) => void;
  onOpenChat: (id: number) => void;
}

export const MatchesScreen: React.FC<MatchesScreenProps> = ({
  lang,
  people,
  blockedIds,
  onViewPerson,
  onOpenChat,
}) => {
  const matches = people.filter(
    (p) => !blockedIds.includes(p.id) && p.likedByThem && p.likedByMe
  );
  const admirers = people.filter(
    (p) => !blockedIds.includes(p.id) && p.likedByThem && !p.likedByMe
  );

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6">
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          {lang === 'am' ? 'ግጥምጥሞሽ (Matches)' : 'Your Matches'}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {lang === 'am'
            ? 'እርስ በርስ የተዋደዳችሁ ሰዎች እዚህ ይታያሉ።'
            : 'People who liked you back — start a conversation anytime.'}
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 text-center">
          <Heart className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {lang === 'am'
              ? 'እስካሁን ግጥምጥሞሽ የለም። በሰዎች ዝርዝር ላይ ❤ ይጫኑ!'
              : 'No mutual matches yet. Tap Like on profiles you want to connect with!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {matches.map((person) => (
            <div
              key={person.id}
              className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between gap-3"
            >
              <div
                onClick={() => onViewPerson(person.id)}
                className="flex items-center gap-3 min-w-0 cursor-pointer"
              >
                <Avatar name={person.name} color={person.color} size="md" verified />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-zinc-900 dark:text-white truncate tabular-nums">
                    {person.name}, {person.age}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {person.city} · {goalLabel(person.goal, lang)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenChat(person.id)}
                className="min-h-[42px] px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shrink-0 cursor-pointer"
              >
                {lang === 'am' ? 'ቻት' : 'Chat'}
              </button>
            </div>
          ))}
        </div>
      )}

      {admirers.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            {lang === 'am' ? 'መገለጫዎን የወደዱ ሰዎች' : 'People who liked your profile'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {admirers.map((person) => (
              <div
                key={person.id}
                onClick={() => onViewPerson(person.id)}
                className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between gap-3 cursor-pointer hover:border-rose-500/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={person.name} color={person.color} size="md" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-zinc-900 dark:text-white truncate tabular-nums">
                      {person.name}, {person.age}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                      {person.city}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 shrink-0">
                  {lang === 'am' ? 'መገለጫ እይ' : 'View'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface SearchScreenProps {
  lang: Lang;
  people: PersonProfile[];
  blockedIds: number[];
  onViewPerson: (id: number) => void;
  onOpenChat: (id: number) => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({
  lang,
  people,
  blockedIds,
  onViewPerson,
  onOpenChat,
}) => {
  const [query, setQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');

  const results = people
    .filter((p) => !blockedIds.includes(p.id))
    .filter((p) => (genderFilter === 'all' ? true : p.gender === genderFilter))
    .filter((p) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        p.city.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.job.toLowerCase().includes(q) ||
        p.hobbies.toLowerCase().includes(q)
      );
    });

  return (
    <div className="max-w-3xl mx-auto w-full space-y-4">
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          {lang === 'am' ? 'በከተማ እና በፍላጎት ይፈልጉ' : 'Search by City & Interests'}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {lang === 'am'
            ? 'ከተማ፣ ስም፣ ስራ ወይም ፍላጎት ይጻፉ።'
            : 'Filter members by city, name, profession, or hobbies.'}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              lang === 'am'
                ? 'ከተማ ይጻፉ (ምሳሌ፡ አዲስ አበባ, ባህር ዳር)...'
                : 'Type city, name, or job...'
            }
            className="w-full min-h-[46px] rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 pl-10 pr-4 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {(['all', 'female', 'male'] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGenderFilter(g)}
              className={`min-h-[46px] px-4 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                genderFilter === g
                  ? 'bg-rose-600 text-white'
                  : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              {g === 'all'
                ? lang === 'am'
                  ? 'ሁሉም'
                  : 'All'
                : genderLabel(g, lang)}
            </button>
          ))}
        </div>
      </div>

      {results.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {lang === 'am' ? 'ምንም ተጠቃሚ አልተገኘም።' : 'No users found for that search.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {results.map((person) => (
            <div
              key={person.id}
              className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between gap-3"
            >
              <div
                onClick={() => onViewPerson(person.id)}
                className="flex items-center gap-3 min-w-0 cursor-pointer"
              >
                <Avatar name={person.name} color={person.color} size="md" verified />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-zinc-900 dark:text-white truncate tabular-nums">
                    {person.name}, {person.age}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {person.city} · {person.job}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenChat(person.id)}
                className="min-h-[42px] px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shrink-0 cursor-pointer"
              >
                {lang === 'am' ? 'ቻት' : 'Chat'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
