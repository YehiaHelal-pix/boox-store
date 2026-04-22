const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://sfronpinoavxnlxqjwoa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmcm9ucGlub2F2eG5seHFqd29hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTcyMTA0NSwiZXhwIjoyMDkxMjk3MDQ1fQ.tskJ6HACPCUD9kD0J0l-JAtilb9xjUDfHG63oQKLY14'
);

async function run() {
  const { data, error } = await supabase
    .from('site_settings')
    .upsert({
      id: 'announcement',
      is_visible: false,
      text: '🔥 مرحباً بكم في بوكس ستور | ملك التفاح 🍎 | أجهزة Apple الأصلية بضمان في مصر',
      bg_color: '#6366f1',
      text_color: '#ffffff'
    });
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success:', data);
  }
}

run();
