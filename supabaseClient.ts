import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zsuxzdzgcrjyrtrysvvs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzdXh6ZHpnY3JqeXJ0cnlzdnZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNzI1NTEsImV4cCI6MjA3Nzg0ODU1MX0.2kbEyVf0U7YrHFybN0mmeDRIbnIQ7C8i7jbG-m4Osnk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);