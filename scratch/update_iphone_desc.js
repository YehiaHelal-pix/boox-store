const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Parse .env.local manually
try {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = (match[2] || '').trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    });
  }
} catch (e) {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const targetSlug = 'iphone-11-pro-gold-82';

  const newDescription = `آيفون 11 برو مستعمل بحالة جيدة، لون ذهبي (Gold).

مواصفات الجهاز:
• صحة البطارية: 82%
• الشاشة والظهر: مغيرين خلع
• اللون: ذهبي (Gold)
• الحالة العامة: مستعمل بحالة جيدة
• ضمان: سنة كاملة من بوكس ستور

ملاحظة: الشاشة والظهر مغيرين خلع من Apple.`;

  console.log('New Description:\n', newDescription);

  const { data, error } = await supabase
    .from('products')
    .update({ description: newDescription, updated_at: new Date().toISOString() })
    .eq('slug', targetSlug)
    .select();

  if (error) {
    console.error('Error updating description:', error);
  } else {
    console.log('Successfully updated product description in DB to (Screen & Back Glass changed)!');
  }
}

run();
