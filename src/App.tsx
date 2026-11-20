import { canSendChatMessage, DEFAULT_LIVE_CONTROLS, DEFAULT_PRIVACY_SETTINGS, isOwnerAccount, loadLiveControls, loadPrivacySettings, saveLiveControls, savePrivacySettings, type ChatBackgroundPreset, type LiveAppControls, type PlanTier, type ThemeMode, type UserPrivacySettings } from "./appIntegration";
import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Heart, LogOut, MessageCircle, Send, ShieldCheck } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

type Section = 'discover' | 'community' | 'messages' | 'profile' | 'preferences' | 'verification' | 'membership';
type Profile = {
  id: string;
  display_name: string;
  age: number | null;
  gender: string | null;
  city: string | null;
  country: string | null;
  bio: string;
  faith: string | null;
  languages: string[];
  intent: string | null;
  avatar_url: string | null;
  is_visible: boolean;
};
type Preferences = {
  user_id: string;
  min_age: number;
  max_age: number;
  location: string | null;
  faith: string | null;
  languages: string[];
  intents: string[];
};
type Comment = { id: string; post_id: string; author_id: string; body: string; created_at: string };
type Post = {
  id: string;
  author_id: string;
  body: string;
  topic: string;
  visibility: 'public' | 'matches';
  created_at: string;
  comments: Comment[];
  author_name: string;
};
type Match = {
  id: string;
  user_low: string;
  user_high: string;
  created_at: string;
  partner: Profile | null;
  messages: Message[];
};
type Message = { id: string; match_id: string; sender_id: string; body: string; created_at: string };
type Verification = { id: string; status: 'pending' | 'verified' | 'rejected'; submitted_at: string };
type Subscription = { id: string; plan_key: string; status: string; created_at: string };

const sections: { id: Section; label: string }[] = [
  { id: 'discover', label: 'Discover' },
  { id: 'community', label: 'Community' },
  { id: 'messages', label: 'Messages' },
  { id: 'profile', label: 'Profile' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'verification', label: 'Verification' },
  { id: 'membership', label: 'Membership' },
];

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function emptyProfile(id: string): Profile {
  return {
    id, display_name: '', age: null, gender: null, city: null, country: null,
    bio: '', faith: null, languages: [], intent: null, avatar_url: null, is_visible: true,
  };
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [section, setSection] = useState<Section>('discover');
  const [privacySettings, setPrivacySettings] = useState<UserPrivacySettings>(() => loadPrivacySettings());
  const [liveControls, setLiveControls] = useState<LiveAppControls>(() => loadLiveControls());
  const [ruleNotice, setRuleNotice] = useState<string>("");
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [candidates, setCandidates] = useState<Profile[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [swiping, setSwiping] = useState(false);
  const [postBody, setPostBody] = useState('');
  const [postTopic, setPostTopic] = useState('community');
  const [postVisibility, setPostVisibility] = useState<'public' | 'matches'>('public');
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [activeMatchId, setActiveMatchId] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [identityDocument, setIdentityDocument] = useState<File | null>(null);
  const [verificationSubmitting, setVerificationSubmitting] = useState(false);
  const [planKey, setPlanKey] = useState('plus_monthly');

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) setError(sessionError.message);
      setUser(data.session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user || !supabase) {
      setProfile(null);
      setPreferences(null);
      setCandidates([]);
      setPosts([]);
      setMatches([]);
      setVerifications([]);
      setSubscriptions([]);
      setActiveMatchId('');
      return;
    }

    let active = true;
    setDataLoading(true);
    setError('');
    setProfile(null);
    setPreferences(null);
    setCandidates([]);
    setPosts([]);
    setMatches([]);
    setVerifications([]);
    setSubscriptions([]);
    setActiveMatchId('');

    async function loadWorkspace() {
      const [
        profileResult,
        preferencesResult,
        candidateResult,
        swipeResult,
        postResult,
        matchResult,
        verificationResult,
        subscriptionResult,
      ] = await Promise.all([
        supabase!.from('profiles').select('*').eq('id', user!.id).maybeSingle(),
        supabase!.from('match_preferences').select('*').eq('user_id', user!.id).maybeSingle(),
        supabase!.from('profiles').select('*').eq('is_visible', true).neq('id', user!.id).order('created_at', { ascending: false }),
        supabase!.from('swipes').select('target_id').eq('swiper_id', user!.id),
        supabase!.from('posts').select('*').order('created_at', { ascending: false }).limit(50),
        supabase!.from('matches').select('*').or(`user_low.eq.${user!.id},user_high.eq.${user!.id}`).order('created_at', { ascending: false }),
        supabase!.from('verifications').select('id,status,submitted_at').eq('user_id', user!.id).order('submitted_at', { ascending: false }),
        supabase!.from('subscriptions').select('id,plan_key,status,created_at').eq('user_id', user!.id).order('created_at', { ascending: false }),
      ]);

      for (const result of [profileResult, preferencesResult, candidateResult, swipeResult, postResult, matchResult, verificationResult, subscriptionResult]) {
        if (result.error) throw result.error;
      }

      const savedProfile = (profileResult.data as Profile | null) ?? emptyProfile(user!.id);
      const savedPreferences = preferencesResult.data as Preferences | null;
      const candidateRows = (candidateResult.data ?? []) as Profile[];
      const swipedIds = new Set((swipeResult.data ?? []).map((swipe) => swipe.target_id));
      const postRows = (postResult.data ?? []) as Omit<Post, 'comments' | 'author_name'>[];
      const matchRows = (matchResult.data ?? []) as Omit<Match, 'partner' | 'messages'>[];
      const [commentsResult, messagesResult] = await Promise.all([
        postRows.length
          ? supabase!.from('post_comments').select('*').in('post_id', postRows.map((post) => post.id))
          : Promise.resolve({ data: [], error: null }),
        matchRows.length
          ? supabase!.from('messages').select('*').in('match_id', matchRows.map((match) => match.id)).order('created_at', { ascending: true })
          : Promise.resolve({ data: [], error: null }),
      ]);
      if (commentsResult.error) throw commentsResult.error;
      if (messagesResult.error) throw messagesResult.error;
      const commentRows = (commentsResult.data ?? []) as Comment[];
      const messageRows = (messagesResult.data ?? []) as Message[];

      const partnerIds = matchRows.map((match) => match.user_low === user!.id ? match.user_high : match.user_low);
      const referencedProfileIds = [...new Set([
        ...postRows.map((post) => post.author_id),
        ...commentRows.map((comment) => comment.author_id),
        ...partnerIds,
      ])].filter((id) => id !== user!.id);
      const referencedProfiles = referencedProfileIds.length
        ? await supabase!.from('profiles').select('*').in('id', referencedProfileIds)
        : { data: [], error: null };
      if (referencedProfiles.error) throw referencedProfiles.error;

      const profilesById = new Map<string, Profile>([
        [savedProfile.id, savedProfile],
        ...candidateRows.map((candidate) => [candidate.id, candidate] as [string, Profile]),
        ...((referencedProfiles.data ?? []) as Profile[]).map((person) => [person.id, person] as [string, Profile]),
      ]);
      const commentsByPost = new Map<string, Comment[]>();
      for (const comment of commentRows) commentsByPost.set(comment.post_id, [...(commentsByPost.get(comment.post_id) ?? []), comment]);

      const nextPosts: Post[] = postRows.map((post) => ({
        ...post,
        comments: commentsByPost.get(post.id) ?? [],
        author_name: profilesById.get(post.author_id)?.display_name || 'Member',
      }));
      const nextMatches: Match[] = matchRows.map((match) => {
        const partnerId = match.user_low === user!.id ? match.user_high : match.user_low;
        return {
          ...match,
          partner: profilesById.get(partnerId) ?? null,
          messages: messageRows.filter((message) => message.match_id === match.id),
        };
      });

      if (!active) return;
      setProfile(savedProfile);
      const currentPreferences = savedPreferences ?? {
        user_id: user!.id, min_age: 18, max_age: 99, location: null, faith: null, languages: [], intents: [],
      };
      setPreferences(currentPreferences);
      setCandidates(candidateRows.filter((candidate) => {
        if (swipedIds.has(candidate.id) || candidate.age === null
          || candidate.age < currentPreferences.min_age || candidate.age > currentPreferences.max_age) return false;
        if (currentPreferences.faith && candidate.faith !== currentPreferences.faith) return false;
        if (currentPreferences.location
          && ![candidate.city, candidate.country].some((value) => value?.toLowerCase() === currentPreferences.location?.toLowerCase())) return false;
        if (currentPreferences.languages.length
          && !currentPreferences.languages.some((language) => candidate.languages?.includes(language))) return false;
        if (currentPreferences.intents.length && !currentPreferences.intents.includes(candidate.intent ?? '')) return false;
        return true;
      }));
      setPosts(nextPosts);
      setMatches(nextMatches);
      setVerifications((verificationResult.data ?? []) as Verification[]);
      setSubscriptions((subscriptionResult.data ?? []) as Subscription[]);
      setActiveMatchId(nextMatches[0]?.id ?? '');
    }

    void loadWorkspace()
      .catch((loadError: unknown) => { if (active) setError(messageOf(loadError)); })
      .finally(() => { if (active) setDataLoading(false); });

    return () =>
      {ruleNotice && (
        <div className="notice-banner" role="alert">
          <p>{ruleNotice}</p>
        </div>
      )}
      <section className="data-card">
        <h3>Privacy, Theme & Chat Background</h3>
        <div className="form-grid">
          <label>
            Theme
            <select
              value={privacySettings.themeMode}
              onChange={(e) => {
                const next = { ...privacySettings, themeMode: e.target.value as ThemeMode };
                setPrivacySettings(next);
                savePrivacySettings(next);
              }}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </label>
          <label>
            Chat Background
            <select
              value={privacySettings.chatBackground}
              onChange={(e) => {
                const next = { ...privacySettings, chatBackground: e.target.value as ChatBackgroundPreset };
                setPrivacySettings(next);
                savePrivacySettings(next);
              }}
            >
              <option value="classic">Classic</option>
              <option value="midnight">Midnight</option>
              <option value="warm-sand">Warm Sand</option>
              <option value="emerald-mist">Emerald Mist</option>
            </select>
          </label>
          <label>
            Message Privacy
            <select
              value={privacySettings.messagePrivacy}
              onChange={(e) => {
                const next = { ...privacySettings, messagePrivacy: e.target.value as UserPrivacySettings["messagePrivacy"] };
                setPrivacySettings(next);
                savePrivacySettings(next);
              }}
            >
              <option value="everyone">Everyone</option>
              <option value="matches_only">Matches Only</option>
              <option value="private">Private</option>
            </select>
          </label>
          <label>
            Post Privacy
            <select
              value={privacySettings.postPrivacy}
              onChange={(e) => {
                const next = { ...privacySettings, postPrivacy: e.target.value as UserPrivacySettings["postPrivacy"] };
                setPrivacySettings(next);
                savePrivacySettings(next);
              }}
            >
              <option value="everyone">Everyone</option>
              <option value="matches_only">Matches Only</option>
              <option value="private">Private</option>
            </select>
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={privacySettings.hideOnlineStatus}
              onChange={(e) => {
                const next = { ...privacySettings, hideOnlineStatus: e.target.checked };
                setPrivacySettings(next);
                savePrivacySettings(next);
              }}
            />
            Hide Online Status
          </label>
        </div>
      </section>
      {isOwnerAccount((user as { email?: string | null } | null)?.email, (profile as { role?: string | null } | null)?.role) && (
        <section className="data-card">
          <h3>Owner Live Controls</h3>
          <div className="form-grid">
            <label>
              Message Limit Before Paywall
              <input
                type="number"
                min={1}
                max={100}
                value={liveControls.messageLimitBeforePaywall}
                onChange={(e) => {
                  const next = { ...liveControls, messageLimitBeforePaywall: Math.max(1, Number(e.target.value) || DEFAULT_LIVE_CONTROLS.messageLimitBeforePaywall) };
                  setLiveControls(next);
                  saveLiveControls(next);
                }}
              />
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={liveControls.blockMessagesToVip}
                onChange={(e) => {
                  const next = { ...liveControls, blockMessagesToVip: e.target.checked };
                  setLiveControls(next);
                  saveLiveControls(next);
                }}
              />
              Block Messages to VIP
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={liveControls.maintenanceMode}
                onChange={(e) => {
                  const next = { ...liveControls, maintenanceMode: e.target.checked };
                  setLiveControls(next);
                  saveLiveControls(next);
                }}
              />
              Maintenance Mode
            </label>
          </div>
        </section>
      )}
 { active = false; };
  }, [user?.id]);

  async function run(action: () => Promise<void>, success?: string) {
    setError('');
    setNotice('');
    try {
      await action();
      if (success) setNotice(success);
    } catch (actionError) {
      setError(messageOf(actionError));
    }
  }

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    await run(async () => {
      if (authMode === 'sign-up') {
        const { data, error: signUpError } = await supabase!.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { display_name: authName.trim() } },
        });
        if (signUpError) throw signUpError;
        if (!data.session) setNotice('Check your email to confirm your account, then sign in.');
      } else {
        const { error: signInError } = await supabase!.auth.signInWithPassword({ email: email.trim(), password });
        if (signInError) throw signInError;
      }
    });
  }

  async function refreshAfterWrite(success: string) {
    setNotice(success);
    if (user) {
      const { data, error: resultError } = await supabase!.from('profiles').select('*').eq('id', user.id).single();
      if (resultError) throw resultError;
      setProfile(data as Profile);
    }
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile || !supabase) return;
    await run(async () => {
      const { error: saveError } = await supabase!.from('profiles').upsert({
        ...profile,
        display_name: profile.display_name.trim(),
        city: profile.city?.trim() || null,
        country: profile.country?.trim() || null,
        bio: profile.bio.trim(),
        avatar_url: profile.avatar_url?.trim() || null,
        languages: profile.languages.filter(Boolean),
      });
      if (saveError) throw saveError;
      await refreshAfterWrite('Profile saved.');
    });
  }

  async function savePreferences(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!preferences || !supabase) return;
    await run(async () => {
      const { error: saveError } = await supabase!.from('match_preferences').upsert({
        ...preferences,
        location: preferences.location?.trim() || null,
        faith: preferences.faith?.trim() || null,
        languages: preferences.languages.filter(Boolean),
        intents: preferences.intents.filter(Boolean),
      });
      if (saveError) throw saveError;
      setNotice('Preferences saved.');
    });
  }

  async function recordSwipe(action: 'like' | 'pass') {
    if (!supabase || !user || !candidates[0]) return;
    setSwiping(true);
    await run(async () => {
      const target = candidates[0];
      const { data: matchId, error: swipeError } = await supabase!.rpc('record_swipe', {
        target_user_id: target.id,
        swipe_action: action,
      });
      if (swipeError) throw swipeError;
      setCandidates((current) => current.filter((candidate) => candidate.id !== target.id));
      if (matchId) {
        setActiveMatchId(matchId);
        setNotice(`You matched with ${target.display_name || 'a member'}.`);
        const { data, error: matchError } = await supabase!.from('matches').select('*').eq('id', matchId).single();
        if (matchError) throw matchError;
        setMatches((current) => [{ ...data, partner: target, messages: [] } as Match, ...current.filter((match) => match.id !== matchId)]);
      } else {
        setNotice('Your response was saved.');
      }
    });
    setSwiping(false);
  }

  async function publishPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !user || !postBody.trim()) return;
    await run(async () => {
      const { data, error: postError } = await supabase!.from('posts').insert({
        author_id: user.id,
        body: postBody.trim(),
        topic: postTopic.trim() || 'community',
        visibility: postVisibility,
      }).select('*').single();
      if (postError) throw postError;
      if (!data) throw new Error('The post was not returned after saving.');
      setPosts((current) => [{
        ...data,
        comments: [],
        author_name: profile?.display_name || 'Member',
      } as Post, ...current]);
      setPostBody('');
      setNotice('Post published.');
    });
  }

  async function addComment(event: FormEvent<HTMLFormElement>, postId: string) {
    event.preventDefault();
    if (!supabase || !user) return;
    const body = commentDrafts[postId]?.trim();
    if (!body) return;
    await run(async () => {
      const { data, error: commentError } = await supabase!.from('post_comments')
        .insert({ post_id: postId, author_id: user.id, body })
        .select('*')
        .single();
      if (commentError) throw commentError;
      setPosts((current) => current.map((post) => post.id === postId
        ? { ...post, comments: [...post.comments, data as Comment] }
        : post));
      setCommentDrafts((current) => ({ ...current, [postId]: '' }));
    }, 'Comment added.');
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    setRuleNotice("");
    const currentUserEmail = (user as { email?: string | null } | null)?.email || null;
    const currentUserRole = (profile as { role?: string | null; plan_tier?: PlanTier | null } | null)?.role || null;
    const senderTier: PlanTier = (profile as { plan_tier?: PlanTier | null } | null)?.plan_tier || "normal";
    const isOwner = isOwnerAccount(currentUserEmail, currentUserRole);
    const activeMatch = matches.find((item) => item.id === activeMatchId);
    const recipientTier: PlanTier = ((activeMatch as { partner?: { plan_tier?: PlanTier } } | undefined)?.partner?.plan_tier) || "normal";
    const sentCount = (activeMatch?.messages || []).filter((msg) => msg.sender_id === user?.id).length;
    const check = canSendChatMessage({
      senderTier,
      recipientTier,
      messagesSentCount: sentCount,
      isSenderOwner: isOwner,
      liveControls,
    });
    if (!check.allowed) {
      const msg = [check.reasonAm, check.reasonEn].filter(Boolean).join(" / ");
      setRuleNotice(msg);
      if (check.requiresPayment) setSection("subscriptions");
      return;
    }
    event.preventDefault();
    if (!supabase || !user || !activeMatchId || !messageBody.trim()) return;
    await run(async () => {
      const { data, error: sendError } = await supabase!.from('messages')
        .insert({ match_id: activeMatchId, sender_id: user.id, body: messageBody.trim() })
        .select('*')
        .single();
      if (sendError) throw sendError;
      setMatches((current) => current.map((match) => match.id === activeMatchId
        ? { ...match, messages: [...match.messages, data as Message] }
        : match));
      setMessageBody('');
    });
  }

  async function submitVerification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !user || !ageConfirmed || !identityDocument || verifications.length || verificationSubmitting) return;
    const form = event.currentTarget;
    setVerificationSubmitting(true);
    try {
      await run(async () => {
        const body = new FormData();
        body.append('document', identityDocument);
        body.append('age_confirmed', 'true');
        const { data, error: verificationError } = await supabase!.functions.invoke<Verification>('verify-identity', { body });
        if (verificationError) throw verificationError;
        if (!data || !['pending', 'verified', 'rejected'].includes(data.status)) {
          throw new Error('The verification service returned an invalid response.');
        }
        setVerifications((current) => [data, ...current]);
        setIdentityDocument(null);
        setAgeConfirmed(false);
        form.reset();
      }, 'Verification request submitted for review.');
    } finally {
      setVerificationSubmitting(false);
    }
  }

  async function requestSubscription(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !user) return;
    await run(async () => {
      const { data, error: subscriptionError } = await supabase!.from('subscriptions')
        .insert({ user_id: user.id, plan_key: planKey, status: 'pending' })
        .select('id,plan_key,status,created_at')
        .single();
      if (subscriptionError) throw subscriptionError;
      setSubscriptions((current) => [data as Subscription, ...current]);
    }, 'Pending plan request saved. No payment has been taken.');
  }

  if (!supabase) {
    return <main className="setup-page">
      <h1>Connect Supabase</h1>
      <p>Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in your environment, then restart the app.</p>
    </main>;
  }

  if (authLoading) return <main className="setup-page" aria-live="polite">Checking your session…</main>;

  if (!user) {
    return <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">Melkam</p>
        <h1>{authMode === 'sign-in' ? 'Welcome back' : 'Create your account'}</h1>
        <p>Sign in to continue or create an account to begin.</p>
        {error && <p className="app-alert error" role="alert">{error}</p>}
        {notice && <p className="app-alert" role="status">{notice}</p>}
        <form onSubmit={submitAuth} className="data-form">
          {authMode === 'sign-up' && <label>Display name<input value={authName} onChange={(event) => setAuthName(event.target.value)} required maxLength={80} /></label>}
          <label>Email<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label>Password<input type="password" autoComplete={authMode === 'sign-in' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} /></label>
          <button className="button-primary" type="submit">{authMode === 'sign-in' ? 'Sign in' : 'Create account'} <ArrowRight size={16} /></button>
        </form>
        <button className="text-button" onClick={() => { setError(''); setNotice(''); setAuthMode(authMode === 'sign-in' ? 'sign-up' : 'sign-in'); }}>
          {authMode === 'sign-in' ? 'Need an account? Sign up' : 'Already registered? Sign in'}
        </button>
      </section>
    </main>;
  }

  return <div className="backend-app">
    <header className="backend-header">
      <div><strong>Melkam</strong><span>{profile?.display_name || user.email}</span></div>
      <button className="button-outline" onClick={() => void run(async () => {
        const { error: signOutError } = await supabase!.auth.signOut();
        if (signOutError) throw signOutError;
      })}><LogOut size={15} /> Sign out</button>
    </header>
    <nav className="backend-nav" aria-label="Main navigation">
      {sections.map((item) => <button key={item.id} className={section === item.id ? 'active' : ''} onClick={() => setSection(item.id)}>{item.label}</button>)}
    </nav>
    <main className="backend-content">
      {error && <p className="app-alert error" role="alert">{error}</p>}
      {notice && <p className="app-alert" role="status">{notice}</p>}
      {dataLoading && <p className="empty-copy">Loading your saved data…</p>}

      {!dataLoading && section === 'discover' && <section>
        <h1>Discover</h1>
        {candidates[0] ? <article className="data-card">
          <p className="eyebrow">Member profile</p>
          <h2>{candidates[0].display_name || 'Member'}{candidates[0].age ? `, ${candidates[0].age}` : ''}</h2>
          <p>{[candidates[0].city, candidates[0].country].filter(Boolean).join(', ') || 'Location not provided'}</p>
          {candidates[0].bio && <p>{candidates[0].bio}</p>}
          <p>{[candidates[0].faith, candidates[0].intent, ...(candidates[0].languages ?? [])].filter(Boolean).join(' · ')}</p>
          <div className="inline-actions">
            <button className="button-outline" disabled={swiping} onClick={() => void recordSwipe('pass')}>Pass</button>
            <button className="button-primary" disabled={swiping} onClick={() => void recordSwipe('like')}><Heart size={15} /> Like</button>
          </div>
        </article> : <p className="empty-copy">There are no profiles to show right now.</p>}
        <h2>Your matches</h2>
        {matches.length ? <ul className="data-list">{matches.map((match) => <li key={match.id}>
          <button onClick={() => { setActiveMatchId(match.id); setSection('messages'); }}>{match.partner?.display_name || 'Member'} · matched {new Date(match.created_at).toLocaleDateString()}</button>
        </li>)}</ul> : <p className="empty-copy">Matches will appear here when both members like each other.</p>}
      </section>}

      {!dataLoading && section === 'community' && <section>
        <h1>Community</h1>
        <form className="data-form data-card" onSubmit={publishPost}>
          <label>Post<textarea value={postBody} onChange={(event) => setPostBody(event.target.value)} rows={4} maxLength={5000} required /></label>
          <div className="inline-fields">
            <label>Topic<input value={postTopic} onChange={(event) => setPostTopic(event.target.value)} maxLength={80} /></label>
            <label>Visibility<select value={postVisibility} onChange={(event) => setPostVisibility(event.target.value as 'public' | 'matches')}><option value="public">Everyone</option><option value="matches">Matches only</option></select></label>
          </div>
          <button className="button-primary" type="submit"><Send size={15} /> Publish</button>
        </form>
        {posts.length ? posts.map((post) => <article className="data-card" key={post.id}>
          <p className="eyebrow">{post.author_name} · {post.topic} · {new Date(post.created_at).toLocaleString()}</p>
          <p className="post-content">{post.body}</p>
          <div className="comment-list">{post.comments.map((comment) => <p key={comment.id}>{comment.body}</p>)}</div>
          <form className="inline-form" onSubmit={(event) => void addComment(event, post.id)}>
            <input aria-label="Write a comment" placeholder="Write a comment" value={commentDrafts[post.id] ?? ''} onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))} maxLength={2000} required />
            <button className="button-outline" type="submit">Comment</button>
          </form>
        </article>) : <p className="empty-copy">No posts yet. Share the first one.</p>}
      </section>}

      {!dataLoading && section === 'messages' && <section>
        <h1>Messages</h1>
        {matches.length ? <div className="message-layout">
          <div className="match-list">{matches.map((match) => <button key={match.id} className={activeMatchId === match.id ? 'active' : ''} onClick={() => setActiveMatchId(match.id)}>{match.partner?.display_name || 'Member'}</button>)}</div>
          <div className="data-card message-thread">
            <h2>{matches.find((match) => match.id === activeMatchId)?.partner?.display_name || 'Conversation'}</h2>
            {(matches.find((match) => match.id === activeMatchId)?.messages ?? []).map((message) => <p className={message.sender_id === user.id ? 'own-message' : ''} key={message.id}>{message.body}<small>{new Date(message.created_at).toLocaleString()}</small></p>)}
            <form className="inline-form" onSubmit={sendMessage}><input value={messageBody} onChange={(event) => setMessageBody(event.target.value)} maxLength={5000} placeholder="Write a message" required /><button className="button-primary" type="submit"><Send size={15} /></button></form>
          </div>
        </div> : <p className="empty-copy">You can message someone after you match.</p>}
      </section>}

      {!dataLoading && section === 'profile' && profile && <section>
        <h1>Your profile</h1>
        <form className="data-form data-card" onSubmit={saveProfile}>
          <label>Display name<input value={profile.display_name} onChange={(event) => setProfile({ ...profile, display_name: event.target.value })} maxLength={80} required /></label>
          <div className="inline-fields"><label>Age<input type="number" min={18} max={120} value={profile.age ?? ''} onChange={(event) => setProfile({ ...profile, age: event.target.value ? Number(event.target.value) : null })} /></label>
            <label>Gender<input value={profile.gender ?? ''} onChange={(event) => setProfile({ ...profile, gender: event.target.value || null })} /></label></div>
          <div className="inline-fields"><label>City<input value={profile.city ?? ''} onChange={(event) => setProfile({ ...profile, city: event.target.value || null })} /></label>
            <label>Country<input value={profile.country ?? ''} onChange={(event) => setProfile({ ...profile, country: event.target.value || null })} /></label></div>
          <label>About you<textarea value={profile.bio} onChange={(event) => setProfile({ ...profile, bio: event.target.value })} maxLength={1000} rows={4} /></label>
          <div className="inline-fields"><label>Faith<input value={profile.faith ?? ''} onChange={(event) => setProfile({ ...profile, faith: event.target.value || null })} /></label>
            <label>Looking for<input value={profile.intent ?? ''} onChange={(event) => setProfile({ ...profile, intent: event.target.value || null })} /></label></div>
          <label>Languages, comma separated<input value={profile.languages.join(', ')} onChange={(event) => setProfile({ ...profile, languages: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} /></label>
          <label>Avatar image URL<input type="url" value={profile.avatar_url ?? ''} onChange={(event) => setProfile({ ...profile, avatar_url: event.target.value || null })} /></label>
          <label className="checkbox-field"><input type="checkbox" checked={profile.is_visible} onChange={(event) => setProfile({ ...profile, is_visible: event.target.checked })} /> Show my profile to other members</label>
          <button className="button-primary" type="submit">Save profile <ArrowRight size={15} /></button>
        </form>
      </section>}

      {!dataLoading && section === 'preferences' && preferences && <section>
        <h1>Match preferences</h1>
        <form className="data-form data-card" onSubmit={savePreferences}>
          <div className="inline-fields"><label>Minimum age<input type="number" min={18} max={120} value={preferences.min_age} onChange={(event) => setPreferences({ ...preferences, min_age: Number(event.target.value) })} required /></label>
            <label>Maximum age<input type="number" min={18} max={120} value={preferences.max_age} onChange={(event) => setPreferences({ ...preferences, max_age: Number(event.target.value) })} required /></label></div>
          <label>Location<input value={preferences.location ?? ''} onChange={(event) => setPreferences({ ...preferences, location: event.target.value || null })} /></label>
          <label>Faith<input value={preferences.faith ?? ''} onChange={(event) => setPreferences({ ...preferences, faith: event.target.value || null })} /></label>
          <label>Languages, comma separated<input value={preferences.languages.join(', ')} onChange={(event) => setPreferences({ ...preferences, languages: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} /></label>
          <label>Intentions, comma separated<input value={preferences.intents.join(', ')} onChange={(event) => setPreferences({ ...preferences, intents: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} /></label>
          <button className="button-primary" type="submit">Save preferences <ArrowRight size={15} /></button>
        </form>
      </section>}

      {!dataLoading && section === 'verification' && <section>
        <h1>Verification</h1>
        <p>Verify your identity by submitting a clear photo of your government ID or passport. Your request will remain pending until it is reviewed.</p>
        <aside className="privacy-notice" aria-label="Bilingual privacy notice">
          <strong>Privacy notice / የግላዊነት ማስታወቂያ</strong>
          <p>Your ID or passport image is sent directly to our verification endpoint and processed transiently in memory. It is never saved to our storage or database; only your verification status is saved.</p>
          <p lang="am">የመታወቂያ ወይም የፓስፖርት ምስልዎ በቀጥታ ወደ የማረጋገጫ አገልጋያችን ይላካል እና በማህደረ ትውስታ ውስጥ ለጊዜው ብቻ ይሰራል። በማከማቻችንም ሆነ በዳታቤዛችን ፈጽNever አይቀመጥም፤ የማረጋገጫ ሁኔታዎ ብቻ ይቀመጣል።</p>
        </aside>
        <form className="data-form data-card" onSubmit={submitVerification}>
          <label className="upload-zone">
            {identityDocument ? identityDocument.name : 'Choose an ID or passport image'}
            <small>JPG, PNG, or WebP · up to 10 MB</small>
            <input type="file" accept="image/jpeg,image/png,image/webp" required disabled={verifications.length > 0 || verificationSubmitting} onChange={(event) => setIdentityDocument(event.target.files?.[0] ?? null)} />
          </label>
          <label className="checkbox-field"><input type="checkbox" checked={ageConfirmed} onChange={(event) => setAgeConfirmed(event.target.checked)} required disabled={verifications.length > 0 || verificationSubmitting} /> I confirm that I am at least 18 years old.</label>
          <button className="button-primary" type="submit" disabled={verifications.length > 0 || verificationSubmitting || !identityDocument || !ageConfirmed}>
            {verifications.length ? 'One-time submission used' : verificationSubmitting ? 'Submitting…' : 'Submit for review'} <ShieldCheck size={15} />
          </button>
        </form>
        <h2>Requests</h2>
        {verifications.length ? <ul className="data-list">{verifications.map((verification) => <li key={verification.id}>Status: {verification.status} · submitted {new Date(verification.submitted_at).toLocaleString()}</li>)}</ul> : <p className="empty-copy">You have no verification requests.</p>}
      </section>}

      {!dataLoading && section === 'membership' && <section>
        <h1>Membership</h1>
        <p>Plan requests support Chapa, Telebirr, and Stripe with a 5-message limit and VIP messaging rules.</p>
        <form className="data-form data-card" onSubmit={requestSubscription}>
          <label>Plan<select value={planKey} onChange={(event) => setPlanKey(event.target.value)}><option value="plus_monthly">Plus — monthly</option><option value="plus_annual">Plus — annual</option></select></label>
          <button className="button-primary" type="submit">Save pending plan request <ArrowRight size={15} /></button>
        </form>
        <h2>Subscription history</h2>
        {subscriptions.length ? <ul className="data-list">{subscriptions.map((subscription) => <li key={subscription.id}>{subscription.plan_key} · {subscription.status} · {new Date(subscription.created_at).toLocaleDateString()}</li>)}</ul> : <p className="empty-copy">No subscription records.</p>}
      </section>}
    </main>
    <footer className="backend-footer"><button onClick={() => setSection('discover')}><ArrowLeft size={14} /> Back to discover</button><span><MessageCircle size={14} /> Data is protected by Supabase row-level security.</span></footer>
  </div>;
}

export default App;
