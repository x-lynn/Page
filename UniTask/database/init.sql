-- UniTask 数据库初始化脚本
-- 在 Supabase SQL Editor 中执行此脚本

-- 创建 tasks 表
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  task_type VARCHAR NOT NULL DEFAULT 'Standard',
  priority VARCHAR NOT NULL DEFAULT 'Medium',
  status VARCHAR NOT NULL DEFAULT 'Todo',
  created_at TIMESTAMPTZ DEFAULT now(),
  is_archived BOOLEAN NOT NULL DEFAULT false
);

-- 创建 users 表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_activity TIMESTAMPTZ,
  nickname VARCHAR DEFAULT '匿名用户',
  showdoc_push_link TEXT
);

-- 启用 RLS (Row Level Security)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- tasks 表 RLS 策略
-- 查看自己的任务
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

-- 插入自己的任务
CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 更新自己的任务
CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

-- 删除自己的任务
CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- users 表 RLS 策略
-- 查看自己的资料
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- 插入自己的资料
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 更新自己的资料
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id_status ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id_task_type ON tasks(user_id, task_type);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id_is_archived ON tasks(user_id, is_archived);
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);

