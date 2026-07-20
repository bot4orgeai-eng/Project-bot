create table users (
  id uuid primary key default gen_random_uuid(),
  phone_number text unique not null,
  name text,
  tier text default 'free',
  created_at timestamp with time zone default now()
);

create table conversation_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  stage text default 'idle',
  data jsonb default '{}',
  updated_at timestamp with time zone default now()
);

create table cvs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  cv_text text,
  created_at timestamp with time zone default now()
);

create table applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  job_title text,
  company text,
  status text default 'applied',
  applied_at timestamp with time zone default now()
);

create table quizzes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  role text,
  questions jsonb,
  score integer,
  created_at timestamp with time zone default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  amount numeric,
  status text default 'pending',
  provider_reference text,
  created_at timestamp with time zone default now()
);