-- Enable pgmq extension if it doesn't exist
create extension if not exists pgmq;

-- Create the queues
select pgmq.create('email_send');
select pgmq.create('email_events');
select pgmq.create('contact_import');
select pgmq.create('maintenance_jobs');
