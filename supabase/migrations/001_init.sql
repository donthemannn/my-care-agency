-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table for user management
create table profiles (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  full_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create quotes table for storing insurance quotes
create table quotes (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade,
  
  -- User input data
  zip_code text not null,
  state text not null,
  annual_income numeric not null,
  household_size integer not null,
  ages integer[] not null,
  
  -- Quote results
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
  
  -- Metadata
  county_fips text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes for better performance
create index idx_quotes_profile_id on quotes(profile_id);
create index idx_quotes_zip_code on quotes(zip_code);
create index idx_quotes_created_at on quotes(created_at desc);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table quotes enable row level security;

-- Create policies for profiles
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

-- Create policies for quotes
create policy "Users can view own quotes" on quotes
  for select using (auth.uid() = profile_id);

create policy "Users can insert own quotes" on quotes
  for insert with check (auth.uid() = profile_id);

create policy "Users can update own quotes" on quotes
  for update using (auth.uid() = profile_id);

-- Allow anonymous quote creation (for demo purposes)
create policy "Allow anonymous quote creation" on quotes
  for insert with check (profile_id is null);

create policy "Allow anonymous quote viewing" on quotes
  for select using (profile_id is null);
