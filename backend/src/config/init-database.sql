-- Database initialization script for LUVIX CRM
-- Run this script in your Supabase SQL editor to set up the required tables

-- Create customers table
create table if not exists public.customers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  name text not null,
  email text,
  phone text,
  address jsonb,
  notes text,
  total_orders integer default 0,
  total_spent numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create orders table
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  customer_id uuid not null,  -- UUID of the customer
  contact_no text,            -- Customer Phone (WhatsApp)
  customer_name text,
  order_number text unique,
  status text default 'pending',
  payment_status text default 'pending',
  payment_method text,
  shipping_address jsonb,
  billing_address jsonb,
  notes text,
  total_amount numeric default 0,
  tax_amount numeric default 0,
  discount_amount numeric default 0,
  shipping_amount numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create order_items table
create table if not exists public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  quantity integer not null default 1,
  unit_price numeric not null default 0,
  total_price numeric not null default 0,
  created_at timestamptz default now()
);

-- Create indexes for better performance
create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_customer_id_idx on public.orders (customer_id);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_at_idx on public.orders (created_at);
create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists order_items_product_id_idx on public.order_items (product_id);

-- Create indexes for customers table
create index if not exists customers_user_id_idx on public.customers (user_id);
create index if not exists customers_phone_idx on public.customers (phone);
create index if not exists customers_created_at_idx on public.customers (created_at);

-- Enable Row Level Security
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.customers enable row level security;

-- RLS policies for orders (allow authenticated users to access their own orders)
create policy "Users can view their own orders"
on public.orders
for select
using (auth.uid() = user_id);

create policy "Users can insert their own orders"
on public.orders
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own orders"
on public.orders
for update
using (auth.uid() = user_id);

create policy "Users can delete their own orders"
on public.orders
for delete
using (auth.uid() = user_id);

-- Order items policies
create policy "Users can view order items for their orders"
on public.order_items
for select
using (exists (
  select 1 from public.orders
  where orders.id = order_items.order_id
  and orders.user_id = auth.uid()
));

create policy "Users can insert order items for their orders"
on public.order_items
for insert
with check (exists (
  select 1 from public.orders
  where orders.id = order_items.order_id
  and orders.user_id = auth.uid()
));

create policy "Users can update order items for their orders"
on public.order_items
for update
using (exists (
  select 1 from public.orders
  where orders.id = order_items.order_id
  and orders.user_id = auth.uid()
));

create policy "Users can delete order items for their orders"
on public.order_items
for delete
using (exists (
  select 1 from public.orders
  where orders.id = order_items.order_id
  and orders.user_id = auth.uid()
));

-- Customers policies
create policy "Users can view their own customers"
on public.customers
for select
using (auth.uid() = user_id);

create policy "Users can insert their own customers"
on public.customers
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own customers"
on public.customers
for update
using (auth.uid() = user_id);

create policy "Users can delete their own customers"
on public.customers
for delete
using (auth.uid() = user_id);