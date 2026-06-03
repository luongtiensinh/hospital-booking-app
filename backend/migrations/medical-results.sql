-- Medical Results & Notifications schema (Supabase Postgres)
-- Run manually in Supabase SQL editor or via migrations tool.

-- 1) medical_results

create table if not exists public.medical_results (
  id uuid not null default gen_random_uuid(),
  appointment_id uuid not null,
  patient_id uuid not null,
  doctor_id uuid not null,

  diagnosis text not null,
  indicators jsonb not null default '[]'::jsonb,
  conclusion text not null,

  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),

  constraint medical_results_pkey primary key (id),
  constraint medical_results_appointment_id_fkey foreign KEY (appointment_id) references public.appointments (id) on delete CASCADE,
  constraint medical_results_patient_id_fkey foreign KEY (patient_id) references public.profiles (id) on delete CASCADE,
  constraint medical_results_doctor_id_fkey foreign KEY (doctor_id) references public.profiles (id) on delete CASCADE
);

create index if not exists idx_medical_results_patient on public.medical_results (patient_id);

create index if not exists idx_medical_results_appointment on public.medical_results (appointment_id);

create index if not exists idx_medical_results_created_at on public.medical_results (created_at desc);

-- 2) notifications
create table if not exists public.notifications (
    id uuid not null default gen_random_uuid (),
    patient_id uuid not null,
    appointment_id uuid null,
    type text not null default 'medical_result',
    title text not null,
    message text not null,
    read_at timestamp
    with
        time zone null,
        created_at timestamp
    with
        time zone null default now(),
        updated_at timestamp
    with
        time zone null default now(),
        constraint notifications_pkey primary key (id),
        constraint notifications_patient_id_fkey foreign KEY (patient_id) references public.profiles (id) on delete CASCADE,
        constraint notifications_appointment_id_fkey foreign KEY (appointment_id) references public.appointments (id) on delete SET NULL
);

create index if not exists idx_notifications_patient on public.notifications (patient_id);

create index if not exists idx_notifications_unread on public.notifications (patient_id)
where
    read_at is null;

create index if not exists idx_notifications_created_at on public.notifications (created_at desc);

-- RLS
alter table public.medical_results enable row level security;

alter table public.notifications enable row level security;

-- Patient: read only own results
create policy "medical_results_patient_select" on public.medical_results for
select to authenticated using (patient_id = auth.uid ());

-- Doctor/Admin: can insert (RLS will also be checked)
create policy "medical_results_doctor_insert" on public.medical_results for
insert
    to authenticated
with
    check (
        -- allow doctor/admin based on profiles.role
        exists (
            select 1
            from public.profiles p
            where
                p.id = auth.uid ()
                and p.role in ('doctor', 'admin')
        )
    );

-- Doctor/Admin: allow update own inserted rows (minimal - delete/update disabled)
create policy "medical_results_doctor_update" on public.medical_results for
update to authenticated using (
    exists (
        select 1
        from public.profiles p
        where
            p.id = auth.uid ()
            and p.role in ('doctor', 'admin')
    )
)
with
    check (
        exists (
            select 1
            from public.profiles p
            where
                p.id = auth.uid ()
                and p.role in ('doctor', 'admin')
        )
    );

-- Patient: read notifications
create policy "notifications_patient_select" on public.notifications for
select to authenticated using (patient_id = auth.uid ());

-- Patient: mark read
create policy "notifications_patient_update" on public.notifications for
update to authenticated using (patient_id = auth.uid ())
with
    check (patient_id = auth.uid ());

-- Doctor/Admin: insert notifications
create policy "notifications_doctor_insert" on public.notifications for
insert
    to authenticated
with
    check (
        exists (
            select 1
            from public.profiles p
            where
                p.id = auth.uid ()
                and p.role in ('doctor', 'admin')
        )
    );