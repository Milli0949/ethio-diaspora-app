create extension if not exists pgcrypto with schema extensions;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 80),
  age smallint check (age is null or age between 18 and 120),
  gender text,
  city text,
  country text,
  bio text not null default '' check (char_length(bio) <= 1000),
  faith text,
  languages text[] not null default '{}',
  intent text,
  avatar_url text,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.match_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  min_age smallint not null default 18 check (min_age between 18 and 120),
  max_age smallint not null default 99 check (max_age between 18 and 120),
  location text,
  faith text,
  languages text[] not null default '{}',
  intents text[] not null default '{}',
  updated_at timestamptz not null default now(),
  check (min_age <= max_age)
);

create table public.swipes (
  id uuid primary key default gen_random_uuid(),
  swiper_id uuid not null references public.profiles (id) on delete cascade,
  target_id uuid not null references public.profiles (id) on delete cascade,
  action text not null check (action in ('like', 'pass')),
  created_at timestamptz not null default now(),
  unique (swiper_id, target_id),
  check (swiper_id <> target_id)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user_low uuid not null references public.profiles (id) on delete cascade,
  user_high uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_low, user_high),
  check (user_low < user_high)
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 5000),
  topic text not null default 'community',
  visibility text not null default 'public' check (visibility in ('public', 'matches')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now()
);

create table public.verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  age_confirmed boolean not null default false,
  provider text,
  provider_reference text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  check (age_confirmed)
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_key text not null,
  status text not null default 'pending' check (status in ('pending', 'active', 'canceled', 'expired')),
  billing_provider text,
  provider_reference text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create index swipes_target_id_idx on public.swipes (target_id);
create index matches_user_high_idx on public.matches (user_high);
create index posts_created_at_idx on public.posts (created_at desc);
create index post_comments_post_id_idx on public.post_comments (post_id, created_at);
create index messages_match_id_idx on public.messages (match_id, created_at);
create index verifications_user_id_idx on public.verifications (user_id, submitted_at desc);
create index subscriptions_user_id_idx on public.subscriptions (user_id, created_at desc);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger match_preferences_set_updated_at
before update on public.match_preferences
for each row execute function public.set_updated_at();

create trigger posts_set_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''));

  insert into public.match_preferences (user_id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;

create function public.record_swipe(target_user_id uuid, swipe_action text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  created_match_id uuid;
begin
  if current_user_id is null or target_user_id = current_user_id then
    raise exception 'A valid target profile is required';
  end if;

  if swipe_action not in ('like', 'pass') then
    raise exception 'Swipe action must be like or pass';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = target_user_id and is_visible
  ) then
    raise exception 'Target profile is unavailable';
  end if;

  insert into public.swipes (swiper_id, target_id, action)
  values (current_user_id, target_user_id, swipe_action)
  on conflict (swiper_id, target_id)
  do update set action = excluded.action, created_at = now();

  if swipe_action = 'like' and exists (
    select 1 from public.swipes
    where swiper_id = target_user_id
      and target_id = current_user_id
      and action = 'like'
  ) then
    insert into public.matches (user_low, user_high)
    values (least(current_user_id, target_user_id), greatest(current_user_id, target_user_id))
    on conflict (user_low, user_high) do nothing
    returning id into created_match_id;

    if created_match_id is null then
      select id into created_match_id from public.matches
      where user_low = least(current_user_id, target_user_id)
        and user_high = greatest(current_user_id, target_user_id);
    end if;
  end if;

  return created_match_id;
end;
$$;

revoke all on function public.record_swipe(uuid, text) from public, anon;
grant execute on function public.record_swipe(uuid, text) to authenticated;

alter table public.profiles enable row level security;
alter table public.match_preferences enable row level security;
alter table public.swipes enable row level security;
alter table public.matches enable row level security;
alter table public.posts enable row level security;
alter table public.post_comments enable row level security;
alter table public.messages enable row level security;
alter table public.verifications enable row level security;
alter table public.subscriptions enable row level security;

create policy "Authenticated users can view visible profiles"
on public.profiles for select to authenticated
using (is_visible or id = (select auth.uid()));

create policy "Users can create their own profile"
on public.profiles for insert to authenticated
with check (id = (select auth.uid()));

create policy "Users can update their own profile"
on public.profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "Users can manage their own match preferences"
on public.match_preferences for all to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "Users can view swipes they made"
on public.swipes for select to authenticated
using (swiper_id = (select auth.uid()));

create policy "Participants can view their matches"
on public.matches for select to authenticated
using ((select auth.uid()) in (user_low, user_high));

create policy "Users can view accessible posts"
on public.posts for select to authenticated
using (
  author_id = (select auth.uid())
  or (
    visibility = 'public'
    and exists (select 1 from public.profiles p where p.id = author_id and p.is_visible)
  )
  or exists (
    select 1 from public.matches m
    where (m.user_low = (select auth.uid()) and m.user_high = author_id)
       or (m.user_high = (select auth.uid()) and m.user_low = author_id)
  )
);

create policy "Users can create their own posts"
on public.posts for insert to authenticated
with check (author_id = (select auth.uid()));

create policy "Users can update their own posts"
on public.posts for update to authenticated
using (author_id = (select auth.uid()))
with check (author_id = (select auth.uid()));

create policy "Users can delete their own posts"
on public.posts for delete to authenticated
using (author_id = (select auth.uid()));

create policy "Users can view comments on accessible posts"
on public.post_comments for select to authenticated
using (exists (select 1 from public.posts p where p.id = post_id));

create policy "Users can comment on accessible posts"
on public.post_comments for insert to authenticated
with check (
  author_id = (select auth.uid())
  and exists (select 1 from public.posts p where p.id = post_id)
);

create policy "Match participants can view messages"
on public.messages for select to authenticated
using (
  exists (
    select 1 from public.matches m
    where m.id = match_id
      and (select auth.uid()) in (m.user_low, m.user_high)
  )
);

create policy "Match participants can send messages as themselves"
on public.messages for insert to authenticated
with check (
  sender_id = (select auth.uid())
  and exists (
    select 1 from public.matches m
    where m.id = match_id
      and (select auth.uid()) in (m.user_low, m.user_high)
  )
);

create policy "Users can view their own verification requests"
on public.verifications for select to authenticated
using (user_id = (select auth.uid()));

create policy "Users can submit pending verification requests"
on public.verifications for insert to authenticated
with check (user_id = (select auth.uid()) and status = 'pending');

create policy "Users can view their own subscriptions"
on public.subscriptions for select to authenticated
using (user_id = (select auth.uid()));

create policy "Users can request a pending subscription"
on public.subscriptions for insert to authenticated
with check (user_id = (select auth.uid()) and status = 'pending');

grant usage on schema public to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.match_preferences to authenticated;
grant select on public.swipes to authenticated;
grant select on public.matches to authenticated;
grant select, insert, update, delete on public.posts to authenticated;
grant select, insert on public.post_comments to authenticated;
grant select, insert on public.messages to authenticated;
grant select, insert on public.verifications to authenticated;
grant select, insert on public.subscriptions to authenticated;
