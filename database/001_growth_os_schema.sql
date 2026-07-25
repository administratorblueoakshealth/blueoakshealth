create extension if not exists postgis;

create table if not exists public.markets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  state text not null default 'TX',
  primary_city text,
  county text,
  status text not null default 'active',
  created_at timestamptz default now()
);

create table if not exists public.facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  facility_type text,
  address text,
  city text,
  state text default 'TX',
  zip text,
  county text,
  phone text,
  website text,
  source_name text,
  source_id text,
  license_number text,
  bed_count integer,
  latitude double precision,
  longitude double precision,
  location geography(point, 4326),
  market_id uuid references public.markets(id),
  relationship_stage text default 'new',
  referral_potential integer default 50,
  priority_score integer default 0,
  ai_summary text,
  ai_next_action text,
  last_visit_at timestamptz,
  next_follow_up_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists facilities_source_unique
on public.facilities(source_name, source_id);

create table if not exists public.facility_contacts (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid references public.facilities(id) on delete cascade,
  first_name text,
  last_name text,
  title text,
  email text,
  phone text,
  is_primary boolean default false,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid references public.facilities(id) on delete cascade,
  visit_date timestamptz not null default now(),
  visit_type text default 'in_person',
  outcome text,
  notes text,
  next_action text,
  created_at timestamptz default now()
);

create table if not exists public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid references public.facilities(id) on delete cascade,
  due_at timestamptz not null,
  status text not null default 'open',
  priority text default 'normal',
  task text not null,
  notes text,
  completed_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid references public.facilities(id),
  referral_date timestamptz default now(),
  status text default 'new',
  referral_type text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.import_jobs (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  market text,
  status text not null default 'pending',
  records_found integer default 0,
  records_imported integer default 0,
  error_message text,
  started_at timestamptz default now(),
  finished_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.daily_routes (
  id uuid primary key default gen_random_uuid(),
  route_date date not null default current_date,
  market_id uuid references public.markets(id),
  starting_address text,
  max_distance_miles integer,
  max_facilities integer,
  status text default 'draft',
  created_at timestamptz default now()
);

create table if not exists public.daily_route_stops (
  id uuid primary key default gen_random_uuid(),
  route_id uuid references public.daily_routes(id) on delete cascade,
  facility_id uuid references public.facilities(id),
  stop_order integer not null,
  reason text,
  created_at timestamptz default now()
);