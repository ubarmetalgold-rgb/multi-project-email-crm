-- 1. SEGMENTS
create table public.segments (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  name text not null,
  description text,
  rules jsonb not null, -- Stores the JSON structure of filtering rules
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. EMAIL TEMPLATES
create table public.templates (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  name text not null,
  subject text not null,
  html_content text, -- Output HTML
  design_json jsonb, -- Builder design state (e.g. Unlayer, GrapeJS, or custom block JSON)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. CAMPAIGNS
create table public.campaigns (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  name text not null,
  subject text not null,
  sender_name text not null,
  sender_email text not null,
  template_id uuid references public.templates(id) on delete set null,
  segment_id uuid references public.segments(id) on delete set null,
  status text default 'draft' check (status in ('draft', 'scheduled', 'processing', 'sending', 'completed', 'paused', 'failed')),
  scheduled_at timestamp with time zone,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  -- Snapshot of content in case template is changed after sending
  html_content text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. CAMPAIGN RECIPIENTS (The Queue table for sending emails)
create table public.campaign_recipients (
  id uuid default uuid_generate_v4() primary key,
  campaign_id uuid references public.campaigns(id) on delete cascade not null,
  contact_id uuid references public.contacts(id) on delete cascade not null,
  status text default 'pending' check (status in ('pending', 'processing', 'sent', 'failed', 'bounced', 'complained', 'unsubscribed')),
  error_message text,
  provider_message_id text,
  sent_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (campaign_id, contact_id)
);

-- 5. EMAIL EVENTS (Tracking opens, clicks)
create table public.email_events (
  id uuid default uuid_generate_v4() primary key,
  campaign_recipient_id uuid references public.campaign_recipients(id) on delete cascade not null,
  event_type text not null check (event_type in ('open', 'click', 'bounce', 'spam_complaint', 'unsubscribe')),
  url text, -- For click events
  ip_address text,
  user_agent text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.segments enable row level security;
alter table public.templates enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_recipients enable row level security;
alter table public.email_events enable row level security;

-- RLS Policies
create policy "Project members can view segments" on public.segments for select using (public.is_project_member(project_id));
create policy "Project members can insert segments" on public.segments for insert with check (public.is_project_member(project_id));
create policy "Project members can update segments" on public.segments for update using (public.is_project_member(project_id));
create policy "Project members can delete segments" on public.segments for delete using (public.is_project_member(project_id));

create policy "Project members can view templates" on public.templates for select using (public.is_project_member(project_id));
create policy "Project members can insert templates" on public.templates for insert with check (public.is_project_member(project_id));
create policy "Project members can update templates" on public.templates for update using (public.is_project_member(project_id));
create policy "Project members can delete templates" on public.templates for delete using (public.is_project_member(project_id));

create policy "Project members can view campaigns" on public.campaigns for select using (public.is_project_member(project_id));
create policy "Project members can insert campaigns" on public.campaigns for insert with check (public.is_project_member(project_id));
create policy "Project members can update campaigns" on public.campaigns for update using (public.is_project_member(project_id));
create policy "Project members can delete campaigns" on public.campaigns for delete using (public.is_project_member(project_id));

create policy "Project members can view recipients" on public.campaign_recipients for select using (
  exists (
    select 1 from public.campaigns
    where id = campaign_recipients.campaign_id and public.is_project_member(project_id)
  )
);
-- Workers running as service_role bypass RLS, so they can insert and update campaign_recipients freely.
-- No insert/update policies needed for end users on recipients.

create policy "Project members can view events" on public.email_events for select using (
  exists (
    select 1 from public.campaign_recipients
    join public.campaigns on campaigns.id = campaign_recipients.campaign_id
    where campaign_recipients.id = email_events.campaign_recipient_id and public.is_project_member(project_id)
  )
);

-- Indexes
create index idx_campaign_recipients_campaign_id on public.campaign_recipients(campaign_id);
create index idx_campaign_recipients_status on public.campaign_recipients(status);
create index idx_email_events_recipient_id on public.email_events(campaign_recipient_id);

-- Triggers for updated_at
create trigger handle_updated_at before update on public.segments for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at before update on public.templates for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at before update on public.campaigns for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at before update on public.campaign_recipients for each row execute procedure public.handle_updated_at();
