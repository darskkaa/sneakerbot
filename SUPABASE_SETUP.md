# Supabase Setup Guide

## 1. Database Schema Setup

### Run the following SQL in your Supabase SQL Editor:

```sql
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
```

## 2. Environment Variables Setup

### Create a `.env` file in the `client` directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_KEY=your-anon-key-here

# API Configuration
VITE_API_URL=http://localhost:3000
```

### Get your Supabase credentials:

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **Project URL** and paste it as `VITE_SUPABASE_URL`
4. Copy the **anon public** key and paste it as `VITE_SUPABASE_KEY`

## 3. Netlify Environment Variables

### Add these environment variables in your Netlify dashboard:

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add the following variables:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_KEY=your-anon-key-here
```

## 4. Testing the Setup

### Test Account Generation:

1. Deploy your application to Netlify
2. Navigate to the Dashboard
3. Click "Generate Account" button
4. Use verification code: `123456` (mock code for testing)
5. Check your Supabase `accounts` table for the generated account

### Test Profile Creation:

1. Go to the Profiles page
2. Create a new profile
3. Check your Supabase `profiles` table

### Test Task Creation:

1. Go to the Tasks page
2. Create a new task
3. Check your Supabase `tasks` table

## 5. Database Tables Overview

### accounts
- Stores generated accounts from AccountGenerator
- Fields: id, email, password, status, created_at, verified_at

### profiles
- Stores user profiles for checkout
- Fields: id, user_id, name, email, billing_info, shipping_info, card_token, created_at

### tasks
- Stores sneaker bot tasks
- Fields: id, site, product_url, size, quantity, profile_id, status, created_at

## 6. Security Considerations

### Row Level Security (RLS):
- All tables have RLS enabled
- Current policies allow all operations (for development)
- Consider restricting access based on user authentication for production

### Environment Variables:
- Never commit `.env` files to version control
- Use Netlify environment variables for production
- Keep your Supabase keys secure

## 7. Troubleshooting

### Common Issues:

1. **"supabaseUrl is required" error**
   - Check that environment variables are set correctly
   - Verify the variable names match exactly

2. **"Cannot find name 'supabase'" error**
   - Ensure Supabase client is properly imported
   - Check that @supabase/supabase-js is installed

3. **Database connection errors**
   - Verify your Supabase URL and key are correct
   - Check that your IP is not blocked by Supabase

4. **RLS policy errors**
   - Ensure RLS policies are set up correctly
   - Check that the policies allow the operations you need

### Getting Help:
- Check Supabase documentation: https://supabase.com/docs
- Check Netlify documentation: https://docs.netlify.com
- Review the application logs for detailed error messages
