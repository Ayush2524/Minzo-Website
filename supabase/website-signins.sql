-- Optional: one row per verified website user, without duplicating contact details.
-- Run in the SQL Editor of the same Supabase project used by the mobile app.
-- Supabase Authentication > Users already contains Google/email/phone accounts.
begin;
create table if not exists public.minzo_website_signins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  first_signed_in_at timestamptz not null default now(),
  last_signed_in_at timestamptz not null default now(),
  sign_in_count bigint not null default 1,
  source text not null default 'minzo_website'
);
alter table public.minzo_website_signins enable row level security;
revoke all on public.minzo_website_signins from anon, authenticated;
-- No client-side read, insert, update or delete policies. Review in the dashboard.
create or replace function public.minzo_record_web_signin()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or coalesce((auth.jwt()->>'is_anonymous')::boolean, false) then
    raise exception 'A verified account is required';
  end if;
  if not exists (
    select 1 from auth.users where id = auth.uid()
    and (email_confirmed_at is not null or phone_confirmed_at is not null)
  ) then raise exception 'A verified account is required'; end if;
  insert into public.minzo_website_signins (user_id) values (auth.uid())
  on conflict (user_id) do update set
    last_signed_in_at = now(),
    sign_in_count = public.minzo_website_signins.sign_in_count + 1;
end;
$$;
revoke all on function public.minzo_record_web_signin() from public, anon;
grant execute on function public.minzo_record_web_signin() to authenticated;
commit;
