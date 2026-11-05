-- ========================================================
-- Schema bảng users cho Supabase (Hỗ trợ phân quyền Admin)
-- Hướng dẫn: Copy nội dung này và chạy trong Supabase SQL Editor
-- (Dashboard -> SQL Editor -> New query -> Run)
-- ========================================================

-- Tạo extension pgcrypto (cần thiết cho gen_random_uuid và mã hóa bcrypt mật khẩu)
create extension if not exists "pgcrypto";

-- Tạo bảng users
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  password text not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Thêm cột role nếu bảng users đã tồn tại trước đó từ phiên bản cũ
alter table public.users add column if not exists role text not null default 'user';

-- Đảm bảo ràng buộc kiểm tra role hợp lệ ('admin' hoặc 'user')
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'users_role_check'
  ) then
    alter table public.users add constraint users_role_check check (role in ('admin', 'user'));
  end if;
end $$;

-- Tạo index cho email (chuyển về lower case để tìm kiếm không phân biệt hoa thường)
create index if not exists idx_users_email on public.users (lower(email));

-- Hàm tự động cập nhật trường updated_at khi có cập nhật bản ghi
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_users_updated on public.users;
create trigger on_users_updated
  before update on public.users
  for each row
  execute function public.handle_updated_at();

-- Kích hoạt Row Level Security (RLS) để bảo vệ dữ liệu
alter table public.users enable row level security;

-- ========================================================
-- SEED TÀI KHOẢN ADMIN BAN ĐẦU
-- Tài khoản mặc định:
-- - Email    : admin@example.com
-- - Mật khẩu : Admin@123456
-- - Role     : admin
-- ========================================================
insert into public.users (email, name, password, role)
values (
  'admin@example.com',
  'System Administrator',
  crypt('Admin@123456', gen_salt('bf', 10)),
  'admin'
)
on conflict (email) do update
set role = 'admin',
    updated_at = timezone('utc'::text, now());
