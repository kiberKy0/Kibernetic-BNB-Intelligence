create table if not exists public.kibernetic_v281_forward (
 asset text not null, model_version text not null, as_of timestamptz not null,
 captured_at timestamptz not null, target_at timestamptz not null,
 source text not null, step_seconds integer not null, entry_price numeric not null,
 scenario text, range_band numeric not null, evaluated_at timestamptz,
 actual_return numeric, actual_class text,
 primary key(asset,model_version,as_of), check(captured_at<target_at)
);
alter table public.kibernetic_v281_forward enable row level security;
revoke all on public.kibernetic_v281_forward from anon,authenticated;
grant select,insert,update on public.kibernetic_v281_forward to service_role;
create index if not exists kibernetic_v281_pending_idx on public.kibernetic_v281_forward(target_at) where evaluated_at is null;
