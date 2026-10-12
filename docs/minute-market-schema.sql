-- Schema applicato tramite migration Supabase minute_market_collector.
create table public.kibernetic_minute_state (id boolean primary key default true check(id), lease uuid, locked_until timestamptz not null default '-infinity', last_attempt timestamptz not null default '-infinity', last_success timestamptz, status text not null default 'idle', detail jsonb not null default '{}');
insert into public.kibernetic_minute_state(id) values(true);
alter table public.kibernetic_minute_state enable row level security;
revoke all on public.kibernetic_minute_state from anon, authenticated;
grant all on public.kibernetic_minute_state to service_role;
create table public.kibernetic_minute_snapshots (asset text not null,bucket timestamptz not null,captured_at timestamptz not null,pool_address text not null,price_usd numeric not null check(price_usd>0),liquidity_usd numeric,volume_24h_usd numeric,buys_24h numeric,sells_24h numeric,source text not null,primary key(asset,bucket));
create index kibernetic_minute_captured_idx on public.kibernetic_minute_snapshots(captured_at);
alter table public.kibernetic_minute_snapshots enable row level security;
revoke all on public.kibernetic_minute_snapshots from anon,authenticated;
grant all on public.kibernetic_minute_snapshots to service_role;
