create table if not exists public.kibernetic_v281_snapshots (
 asset text not null, bucket timestamptz not null, captured_at timestamptz not null,
 pool_address text, price_usd numeric, liquidity_usd numeric, volume_24h_usd numeric,
 buys_24h numeric, sells_24h numeric, source text not null, primary key(asset,bucket)
);
create table if not exists public.kibernetic_v281_reports (
 asset text not null, model_version text not null, as_of timestamptz not null,
 captured_at timestamptz not null, report jsonb not null, primary key(asset,model_version,as_of)
);
create table if not exists public.kibernetic_v281_control (job_name text primary key,secret_hash text not null);
alter table public.kibernetic_v281_snapshots enable row level security;
alter table public.kibernetic_v281_reports enable row level security;
alter table public.kibernetic_v281_control enable row level security;
revoke all on public.kibernetic_v281_snapshots,public.kibernetic_v281_reports,public.kibernetic_v281_control from anon,authenticated;
grant select,insert,update on public.kibernetic_v281_snapshots,public.kibernetic_v281_reports,public.kibernetic_v281_control to service_role;
create index if not exists kibernetic_v281_capture_idx on public.kibernetic_v281_snapshots(captured_at desc);
create index if not exists kibernetic_v281_report_idx on public.kibernetic_v281_reports(captured_at desc);
-- Generate a collector-only secret inside the database. No secret leaves Vault.
do $$ declare token text; begin
 if not exists(select 1 from public.kibernetic_v281_control where job_name='collector') then
 token=encode(extensions.gen_random_bytes(32),'hex');
 perform vault.create_secret(token,'kibernetic_v281_collector');
 insert into public.kibernetic_v281_control values('collector',encode(extensions.digest(token,'sha256'),'hex'));
 end if;
end $$;
select cron.schedule('kibernetic-v281-evidence','7 * * * *', $$
 select net.http_post(url:='https://iytjxruxpvwjjhbndkzo.supabase.co/functions/v1/kibernetic-evidence',
 headers:=jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||(select decrypted_secret from vault.decrypted_secrets where name='kibernetic_v281_collector')),
 body:='{}'::jsonb,timeout_milliseconds:=180000);
$$);
