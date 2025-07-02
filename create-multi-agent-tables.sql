-- Multi-Agent Tables for NebulArc

drop table if exists multi_agent_runs;
drop table if exists multi_agent_steps;
drop table if exists multi_agents;
drop table if exists agent_memories;

create table multi_agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_by uuid references profiles(id),
  schedule text,
  created_at timestamptz default now()
);

create table multi_agent_steps (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references multi_agents(id) on delete cascade,
  step_order int not null,
  type text not null,
  config jsonb,
  condition text,
  memory_read boolean default false,
  memory_write boolean default false,
  created_at timestamptz default now()
);

create table multi_agent_runs (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references multi_agents(id) on delete cascade,
  input jsonb,
  step_results jsonb,
  status text default 'pending',
  started_at timestamptz default now(),
  finished_at timestamptz
);

create table agent_memories (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references multi_agents(id) on delete cascade,
  run_id uuid references multi_agent_runs(id) on delete set null,
  memory_key text not null,
  value jsonb,
  created_at timestamptz default now()
); 