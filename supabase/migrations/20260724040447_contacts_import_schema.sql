-- 1. CONTACTS (Global to organization)
create table public.contacts (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  normalized_email text not null,
  original_email text not null,
  first_name text,
  last_name text,
  phone text,
  company text,
  city text,
  country text,
  global_status text default 'active' check (global_status in ('active', 'unsubscribed', 'hard_bounced', 'complained', 'deleted')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (organization_id, normalized_email)
);

-- 2. CONTACT PROJECT MEMBERSHIPS
create table public.contact_project_memberships (
  contact_id uuid references public.contacts(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  status text default 'active' check (status in ('active', 'unsubscribed', 'bounced')),
  consent_status text default 'unknown' check (consent_status in ('unknown', 'pending', 'opted_in', 'opted_out', 'transactional_only', 'suppressed')),
  source text,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (contact_id, project_id)
);

-- 3. CONSENT EVENTS
create table public.consent_events (
  id uuid default uuid_generate_v4() primary key,
  contact_id uuid references public.contacts(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  status text not null,
  source text,
  ip_address text,
  user_agent text,
  evidence text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. IMPORT JOBS
create table public.import_jobs (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  created_by uuid references public.profiles(id) on delete set null,
  file_path text not null,
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  total_rows integer default 0,
  processed_rows integer default 0,
  valid_rows integer default 0,
  invalid_rows integer default 0,
  duplicate_rows integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. IMPORT JOB ERRORS
create table public.import_job_errors (
  id uuid default uuid_generate_v4() primary key,
  import_job_id uuid references public.import_jobs(id) on delete cascade not null,
  row_number integer,
  raw_data jsonb,
  error_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.contacts enable row level security;
alter table public.contact_project_memberships enable row level security;
alter table public.consent_events enable row level security;
alter table public.import_jobs enable row level security;
alter table public.import_job_errors enable row level security;

-- Policies for Contacts
create policy "Org members can view contacts" on public.contacts
  for select using (public.is_organization_member(organization_id));

create policy "Org members can insert contacts" on public.contacts
  for insert with check (public.is_organization_member(organization_id));

create policy "Org members can update contacts" on public.contacts
  for update using (public.is_organization_member(organization_id));

-- Policies for Contact Project Memberships
create policy "Project members can view memberships" on public.contact_project_memberships
  for select using (public.is_project_member(project_id));

create policy "Project members can insert memberships" on public.contact_project_memberships
  for insert with check (public.is_project_member(project_id));

create policy "Project members can update memberships" on public.contact_project_memberships
  for update using (public.is_project_member(project_id));

-- Policies for Import Jobs
create policy "Project members can view import jobs" on public.import_jobs
  for select using (public.is_project_member(project_id));

create policy "Project members can insert import jobs" on public.import_jobs
  for insert with check (public.is_project_member(project_id));

create policy "Project members can update import jobs" on public.import_jobs
  for update using (public.is_project_member(project_id));

create policy "Project members can view import errors" on public.import_job_errors
  for select using (
    exists (
      select 1 from public.import_jobs
      where id = import_job_errors.import_job_id and public.is_project_member(project_id)
    )
  );

-- Indexes for performance
create index idx_contacts_org_id on public.contacts(organization_id);
create index idx_contacts_normalized_email on public.contacts(normalized_email);
create index idx_contact_proj_memberships_proj_id on public.contact_project_memberships(project_id);
create index idx_import_jobs_proj_id on public.import_jobs(project_id);

-- Triggers for updated_at
create trigger handle_updated_at
  before update on public.contacts
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at
  before update on public.contact_project_memberships
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at
  before update on public.import_jobs
  for each row execute procedure public.handle_updated_at();
