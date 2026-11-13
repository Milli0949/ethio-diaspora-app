import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  CheckCheck,
  Download,
  Flag,
  Lock,
  MessageCircle,
  Paperclip,
  Send,
  ShieldBan,
  UserCheck,
  X,
} from 'lucide-react';
import { compressImageToDataUrl } from '../data/seedData';
import {
  AppNotification,
  ChatMessage,
  Lang,
  MediaAttachment,
  MessagePrivacy,
  PersonProfile,
  UserProfile,
} from '../types/app';
import { Avatar } from './Avatar';

interface ChatScreenProps {
  lang: Lang;
  currentUser: UserProfile;
  people: PersonProfile[];
  blockedIds: number[];
  activePersonId: number;
  conversations: Record<number, ChatMessage[]>;
  messagePrivacy: MessagePrivacy;
  onSelectPerson: (id: number) => void;
  onSendMessage: (personId: number, text: string, replyTo?: string, file?: MediaAttachment) => void;
  onBlockPerson: (id: number) => void;
  onReportPerson: (name: string) => void;
  onOpenSettings: () => void;
  onNotify: (msg: string) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  lang,
  currentUser,
  people,
  blockedIds,
  activePersonId,
  conversations,
  messagePrivacy,
  onSelectPerson,
  onSendMessage,
  onBlockPerson,
  onReportPerson,
  onOpenSettings,
  onNotify,
}) => {
  const [input, setInput] = useState('');
  const [replyPreview, setReplyPreview] = useState<string>('');
  const fileRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const availablePeople = people.filter((p) => !blockedIds.includes(p.id));
  const activePerson =
    availablePeople.find((p) => p.id === activePersonId) || availablePeople[0] || null;
  const messages = activePerson ? conversations[activePerson.id] || [] : [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, activePerson?.id]);

  const isChatLocked =
    messagePrivacy === 'none' ||
    (messagePrivacy === 'friends' && activePerson ? !activePerson.isFriend : false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePerson) return;
    if (isChatLocked) {
      onNotify(
        messagePrivacy === 'none'
          ? lang === 'am'
            ? 'መልእክቶች ተቆልፈዋል (Settings ውስጥ ይቀይሩ)!'
            : 'Messages are locked in Settings!'
          : lang === 'am'
            ? 'ለጓደኞች ብቻ የተፈቀደ ነው!'
            : 'Chat restricted to Friends Only!'
      );
      return;
    }
    const text = input.trim();
    if (!text) return;
    onSendMessage(activePerson.id, text, replyPreview || undefined);
    setInput('');
    setReplyPreview('');
  };

  const handleFileAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !activePerson) return;
    if (isChatLocked) {
      onNotify(lang === 'am' ? 'መልእክቶች ተቆልፈዋል!' : 'Messages locked!');
      return;
    }
    try {
      const url = file.type.startsWith('image/')
        ? await compressImageToDataUrl(file, 720)
        : await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('file read failed'));
            reader.readAsDataURL(file);
          });
      onSendMessage(activePerson.id, '', replyPreview || undefined, {
        name: file.name,
        url,
        type: file.type,
      });
      setReplyPreview('');
      onNotify(lang === 'am' ? 'ፋይል ተልኳል!' : 'Attachment sent!');
    } catch {
      onNotify(lang === 'am' ? 'ፋይል መላክ አልተቻለም' : 'Could not attach file');
    }
  };

  if (!activePerson) {
    return (
      <div className="max-w-2xl mx-auto w-full rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 text-center">
        <MessageCircle className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {lang === 'am' ? 'ለመወያየት ሰው የለም።' : 'No active conversations available.'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-3 h-[calc(100vh-12.5rem)] lg:h-[calc(100vh-5rem)]">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
        {availablePeople.map((person) => {
          const isActive = person.id === activePerson.id;
          return (
            <button
              key={person.id}
              type="button"
              onClick={() => {
                onSelectPerson(person.id);
                setReplyPreview('');
              }}
              className={`min-h-[44px] px-3 py-1.5 rounded-xl border flex items-center gap-2 shrink-0 transition-colors cursor-pointer ${
                isActive
                  ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <Avatar name={person.name} color={person.color} size="xs" />
              <span className="text-xs font-semibold whitespace-nowrap">{person.name}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 min-h-0 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar name={activePerson.name} color={activePerson.color} size="sm" verified />
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate tabular-nums">
                {activePerson.name}, {activePerson.age}
              </h3>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                {activePerson.online
                  ? lang === 'am'
                    ? 'መስመር ላይ (Online)'
                    : 'Online'
                  : lang === 'am'
                    ? 'በቅርቡ ታይቷል'
                    : 'Recently active'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onBlockPerson(activePerson.id)}
              className="min-h-[38px] px-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-red-500/15 text-red-500 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <ShieldBan className="w-3.5 h-3.5" />
              <span>{lang === 'am' ? 'አግድ' : 'Block'}</span>
            </button>
            <button
              type="button"
              onClick={() => onReportPerson(`${activePerson.name}, ${activePerson.age}`)}
              className="min-h-[38px] px-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>{lang === 'am' ? 'ሪፖርት' : 'Report'}</span>
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 dark:text-zinc-400 px-4">
              <p className="text-sm">
                {lang === 'am'
                  ? `ከ${activePerson.name} ጋር ውይይት ይጀምሩ!`
                  : `Say hello to ${activePerson.name} to start chatting!`}
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOut = msg.from === 'out';
              return (
                <div
                  key={msg.id}
                  onClick={() =>
                    setReplyPreview(msg.text || msg.file?.name || (lang === 'am' ? 'ፋይል' : 'File'))
                  }
                  className={`flex items-end gap-2 max-w-[85%] sm:max-w-[75%] cursor-pointer ${
                    isOut ? 'ml-auto flex-row-reverse' : ''
                  }`}
                >
                  <Avatar
                    name={isOut ? currentUser.name : activePerson.name}
                    src={isOut ? currentUser.photos.find(Boolean) : undefined}
                    color={activePerson.color}
                    size="xs"
                  />
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed space-y-1.5 ${
                      isOut
                        ? 'bg-rose-600 text-white rounded-br-sm'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-sm'
                    }`}
                  >
                    {msg.replyTo && (
                      <div
                        className={`text-[11px] px-2.5 py-1 rounded-lg ${
                          isOut
                            ? 'bg-black/20 text-white/90'
                            : 'bg-zinc-200/70 dark:bg-zinc-700/60 text-zinc-600 dark:text-zinc-300'
                        }`}
                      >
                        ↪ {msg.replyTo}
                      </div>
                    )}

                    {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}

                    {msg.file && (
                      <div className="space-y-1.5">
                        {msg.file.type.startsWith('image/') && (
                          <img
                            src={msg.file.url}
                            alt={msg.file.name}
                            className="max-h-48 rounded-xl object-cover"
                          />
                        )}
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="truncate font-medium">{msg.file.name}</span>
                          <a
                            href={msg.file.url}
                            download={msg.file.name}
                            onClick={(e) => e.stopPropagation()}
                            className={`px-2 py-1 rounded-lg flex items-center gap-1 shrink-0 font-semibold ${
                              isOut
                                ? 'bg-black/25 text-white'
                                : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100'
                            }`}
                          >
                            <Download className="w-3 h-3" />
                            <span>{lang === 'am' ? 'አውርድ' : 'Save'}</span>
                          </a>
                        </div>
                      </div>
                    )}

                    <div
                      className={`flex items-center justify-end gap-1 text-[10px] tabular-nums ${
                        isOut ? 'text-white/80' : 'text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      <span>{msg.time}</span>
                      {isOut && (
                        <CheckCheck
                          className={`w-3.5 h-3.5 ${
                            msg.status === 'seen' ? 'text-sky-300' : 'text-white/60'
                          }`}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {isChatLocked ? (
          <div className="p-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
              <Lock className="w-4 h-4 text-rose-500 shrink-0" />
              <span>
                {messagePrivacy === 'none'
                  ? lang === 'am'
                    ? 'መልእክት መላክ በግላዊነት ቅንብር ተቆልፏል።'
                    : 'Messaging is locked in Privacy Settings.'
                  : lang === 'am'
                    ? 'መልእክት መላክ የሚቻለው ለጓደኞች ብቻ ነው።'
                    : 'Messaging is restricted to Friends Only.'}
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenSettings}
              className="min-h-[38px] px-3 rounded-xl bg-rose-600 text-white text-xs font-semibold shrink-0 cursor-pointer"
            >
              {lang === 'am' ? 'ቅንብር' : 'Settings'}
            </button>
          </div>
        ) : (
          <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2 shrink-0">
            {replyPreview && (
              <div className="flex items-center justify-between rounded-xl bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                <span className="truncate">↪ {replyPreview}</span>
                <button
                  type="button"
                  onClick={() => setReplyPreview('')}
                  className="ml-2 p-1 hover:text-rose-500 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="*/*"
              className="hidden"
              onChange={handleFileAttach}
            />

            <form onSubmit={handleSend} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                aria-label="Attach file"
                className="min-h-[44px] min-w-[44px] rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center justify-center cursor-pointer"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={lang === 'am' ? 'መልእክት ይጻፉ...' : 'Write a message...'}
                className="flex-1 min-h-[44px] rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                className="min-h-[44px] px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">{lang === 'am' ? 'ላክ' : 'Send'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

interface NotificationsScreenProps {
  lang: Lang;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onRespondFriendRequest: (notifId: number, personId: number | undefined, accept: boolean) => void;
  onViewPerson: (personId: number) => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  lang,
  notifications,
  onMarkAllRead,
  onRespondFriendRequest,
  onViewPerson,
}) => {
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="max-w-2xl mx-auto w-full space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            {lang === 'am' ? 'ማሳወቂያዎች' : 'Notifications'}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {lang === 'am'
              ? 'ግጥምጥሞሽ፣ የጓደኝነት ጥያቄዎች እና መውደዶች'
              : 'Matches, friend requests, and profile activity'}
          </p>
        </div>
        {hasUnread && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="min-h-[40px] px-3.5 rounded-xl bg-zinc-200/80 dark:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 cursor-pointer whitespace-nowrap"
          >
            {lang === 'am' ? 'ሁሉንም አንብቤያለሁ' : 'Mark all read'}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {lang === 'am' ? 'ምንም አዲስ ማሳወቂያ የለም።' : 'You are all caught up.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                n.read
                  ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                  : 'bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/30'
              }`}
            >
              <div
                onClick={() => n.personId && onViewPerson(n.personId)}
                className="flex items-center gap-3 min-w-0 cursor-pointer"
              >
                <Avatar name={n.personName} color={n.avatarColor} size="sm" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                      {n.personName}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                      {n.time}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 mt-0.5">
                    {lang === 'am' ? n.messageAm : n.messageEn}
                  </p>
                </div>
              </div>

              {n.type === 'friend_request' && (
                <div className="flex items-center gap-2 shrink-0">
                  {n.handled ? (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      {n.handled === 'accepted'
                        ? lang === 'am'
                          ? 'ተቀብለዋል'
                          : 'Accepted'
                        : lang === 'am'
                          ? 'ውድቅ ተደርጓል'
                          : 'Declined'}
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => onRespondFriendRequest(n.id, n.personId, true)}
                        className="min-h-[38px] px-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{lang === 'am' ? 'ተቀበል' : 'Accept'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onRespondFriendRequest(n.id, n.personId, false)}
                        className="min-h-[38px] px-3 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium cursor-pointer"
                      >
                        {lang === 'am' ? 'ተው' : 'Decline'}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
