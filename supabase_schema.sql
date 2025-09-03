-- Add accounts table for AccountGenerator functionality
create table accounts (
    id text primary key,
    email text not null,
    password text not null,
    status text not null default 'pending_verification',
    created_at timestamp with time zone default timezone('utc', now()) not null,
    verified_at timestamp with time zone
);

-- Add RLS policies for accounts table
alter table accounts enable row level security;

-- Allow all operations for now (you can restrict this later)
create policy "Allow all operations on accounts" on accounts
    for all using (true);

-- Add indexes for better performance
create index idx_accounts_email on accounts(email);
create index idx_accounts_status on accounts(status);
create index idx_accounts_created_at on accounts(created_at);
