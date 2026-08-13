import { createClient } from '@supabase/supabase-js';

// 获取环境变量
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// 增加一层逻辑判断：只有当 URL 存在时才初始化
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase 环境变量缺失！请检查：\n" +
    "1. Vercel Project Settings -> Environment Variables 是否添加了 VITE_SUPABASE_URL\n" +
    "2. 变量名是否以 VITE_ 开头"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
