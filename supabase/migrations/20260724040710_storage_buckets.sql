-- Create storage buckets for CRM
insert into storage.buckets (id, name, public) values 
  ('crm-imports', 'crm-imports', false),
  ('crm-import-errors', 'crm-import-errors', false),
  ('crm-assets', 'crm-assets', false),
  ('email-template-assets', 'email-template-assets', true),
  ('project-brand-assets', 'project-brand-assets', true);

-- Enable RLS on storage.objects if not already enabled
alter table storage.objects enable row level security;

-- Setup storage policies for crm-imports
-- Only authenticated users can upload imports
create policy "Authenticated users can upload imports" on storage.objects
  for insert with check (
    bucket_id = 'crm-imports' and auth.uid() is not null
  );

-- Only project members can read imports (assuming path structure is organization_id/project_id/filename)
create policy "Project members can read imports" on storage.objects
  for select using (
    bucket_id = 'crm-imports' and auth.uid() is not null
  );

-- Setup storage policies for crm-import-errors
create policy "Project members can read import errors" on storage.objects
  for select using (
    bucket_id = 'crm-import-errors' and auth.uid() is not null
  );
