-- ========================================================
-- Seed Admin User cho Supabase
-- Hướng dẫn: Mở Supabase Dashboard -> SQL Editor -> Dán nội dung và Run
-- ========================================================

-- Đảm bảo extension pgcrypto đã sẵn sàng
create extension if not exists "pgcrypto";

-- Đảm bảo cột role tồn tại
alter table public.users add column if not exists role text not null default 'user';

-- Khởi tạo hoặc cập nhật tài khoản Admin
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

-- Kiểm tra lại tài khoản admin vừa tạo/cập nhật:
select id, email, name, role, created_at, updated_at from public.users where email = 'admin@example.com';
