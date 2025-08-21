-- ============================================
-- CLERK + SUPABASE INTEGRATION MIGRATION
-- ============================================
-- Copy and paste this SQL into your Supabase SQL Editor
-- Go to: https://supabase.com/dashboard/project/fodtmyudrfcdykrojzbi/sql

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Drop existing tables if they exist (clean slate)
drop table if exists quotes cascade;
drop table if exists profiles cascade;

-- Create profiles table for Clerk users
create table profiles (
  id text primary key,                    -- Clerk user ID (26-char string)
  email text unique not null,
  full_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create quotes table for storing insurance quotes
create table quotes (
  id uuid primary key default uuid_generate_v4(),
  profile_id text references profiles(id) on delete cascade,
  
  -- User input data
  zip_code text not null,
  state text not null default 'AL',      -- Default to Alabama for now
  annual_income numeric not null,
  household_size integer not null,
  date_of_birth date,                     -- Store primary applicant DOB
  gender text,                            -- Store primary applicant gender
  
  -- Quote results (store best plan from quote)
  premium numeric not null,
  subsidy_amount numeric default 0,
  net_premium numeric not null,
  
  -- Plan details
  plan_id text,
  plan_name text,
  issuer_name text,
  metal_level text,
  plan_type text,
  deductible numeric,
  out_of_pocket_max numeric,
  
  -- Geographic data
  county_name text,
  county_fips text,
  
  -- Quote metadata
  total_plans_found integer default 0,
  quote_data jsonb,                       -- Store full quote results as JSON
  
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes for better performance
create index idx_quotes_profile_id on quotes(profile_id);
create index idx_quotes_zip_code on quotes(zip_code);
create index idx_quotes_created_at on quotes(created_at desc);
create index idx_quotes_state on quotes(state);
create index idx_profiles_email on profiles(email);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table quotes enable row level security;

-- Create policies for profiles (users can only access their own data)
create policy "Users can view own profile" on profiles
  for select using (auth.uid()::text = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid()::text = id);

create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid()::text = id);

-- Create policies for quotes (users can only access their own quotes)
create policy "Users can view own quotes" on quotes
  for select using (auth.uid()::text = profile_id);

create policy "Users can insert own quotes" on quotes
  for insert with check (auth.uid()::text = profile_id);

create policy "Users can update own quotes" on quotes
  for update using (auth.uid()::text = profile_id);

-- Allow anonymous quote creation for demo/testing purposes
-- (quotes without a profile_id can be created and viewed by anyone)
create policy "Allow anonymous quote creation" on quotes
  for insert with check (profile_id is null);

create policy "Allow anonymous quote viewing" on quotes
  for select using (profile_id is null);

-- Create function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers to automatically update updated_at
create trigger update_profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at_column();

create trigger update_quotes_updated_at
  before update on quotes
  for each row execute function update_updated_at_column();

-- Insert a test profile and quote for development
-- (This will be removed in production)
insert into profiles (id, email, full_name) values 
  ('test_user_123', 'test@example.com', 'Test User')
  on conflict (id) do nothing;

insert into quotes (
  profile_id, zip_code, state, annual_income, household_size,
  premium, subsidy_amount, net_premium, plan_name, issuer_name,
  metal_level, county_name, county_fips, total_plans_found
) values (
  'test_user_123', '35801', 'AL', 50000, 1,
  450.00, 100.00, 350.00, 'Test Plan', 'Test Insurer',
  'Silver', 'Madison', '01089', 25
) on conflict do nothing;
