-- Bật UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  email text not null,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. ORGANIZATIONS
create table public.organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. ORGANIZATION MEMBERS
create table public.organization_members (
  organization_id uuid references public.organizations(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null check (role in ('owner', 'admin', 'member')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (organization_id, user_id)
);

-- 4. PROJECTS
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  name text not null,
  slug text not null,
  status text default 'active' check (status in ('active', 'archived')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (organization_id, slug)
);

-- 5. PROJECT MEMBERS
create table public.project_members (
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null check (role in ('admin', 'editor', 'marketing_manager', 'viewer')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (project_id, user_id)
);

-- Bật RLS
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;

-- Helper Functions cho RLS
create or replace function public.is_organization_member(org_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.organization_members
    where organization_id = org_id and user_id = auth.uid()
  );
end;
$$ language plpgsql security definer set search_path = public;

create or replace function public.is_project_member(proj_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.project_members
    where project_id = proj_id and user_id = auth.uid()
  );
end;
$$ language plpgsql security definer set search_path = public;

-- RLS Policies

-- Profiles
create policy "Users can view their own profile." on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile." on public.profiles
  for update using (auth.uid() = id);

-- Organizations
create policy "Members can view organizations they belong to" on public.organizations
  for select using (public.is_organization_member(id));

create policy "Authenticated users can create organizations" on public.organizations
  for insert with check (auth.uid() is not null);

create policy "Owners can update their organizations" on public.organizations
  for update using (
    exists (
      select 1 from public.organization_members
      where organization_id = id and user_id = auth.uid() and role = 'owner'
    )
  );

-- Organization Members
create policy "Members can view other members in their orgs" on public.organization_members
  for select using (public.is_organization_member(organization_id));

-- Projects
create policy "Members can view projects they belong to" on public.projects
  for select using (public.is_project_member(id));

create policy "Org admins can view all projects in their org" on public.projects
  for select using (
    exists (
      select 1 from public.organization_members
      where organization_id = projects.organization_id 
        and user_id = auth.uid() 
        and role in ('owner', 'admin')
    )
  );

-- Project Members
create policy "Members can view project members" on public.project_members
  for select using (public.is_project_member(project_id));

-- Triggers for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at
  before update on public.organizations
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at
  before update on public.projects
  for each row execute procedure public.handle_updated_at();

-- Tự động thêm user vào profiles sau khi đăng ký
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
