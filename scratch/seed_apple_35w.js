const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    });
  }
} catch (e) {
  console.warn('Error reading env:', e.message);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const destDir = path.resolve(__dirname, '../public/images');
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Source paths for the generated black background images
  const srcImages = [
    'C:\\Users\\HODHOD\\.gemini\\antigravity\\brain\\bc0c5e83-fc80-415e-8068-a37cccfefc8b\\apple_35w_charger_black_bg_1779961612146.png',
    'C:\\Users\\HODHOD\\.gemini\\antigravity\\brain\\bc0c5e83-fc80-415e-8068-a37cccfefc8b\\apple_35w_charger_unfolded_black_bg_1779961633678.png'
  ];

  const destImages = [];

  srcImages.forEach((src, index) => {
    const destName = `apple-35w-charger-${index + 1}.png`;
    const dest = path.join(destDir, destName);
    console.log(`Copying generated image ${index + 1} from ${src} to ${dest}`);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      destImages.push(`/images/${destName}`);
      console.log(`Image ${index + 1} copy successful!`);
    } else {
      console.error(`Source image ${index + 1} does not exist at path:`, src);
    }
  });

  if (destImages.length === 0) {
    console.error('No Apple 35W images were copied successfully.');
    process.exit(1);
  }

  console.log('Fetching category for Accessories...');
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, slug')
    .eq('slug', 'accessories');

  if (catError) {
    console.error('Error fetching category:', catError);
    process.exit(1);
  }

  const accCategory = categories && categories[0];
  if (!accCategory) {
    console.error('Accessories category not found in DB!');
    process.exit(1);
  }

  console.log(`Found Accessories category ID: ${accCategory.id}`);

  // Insert the Apple 35W charger
  const targetSlug = 'apple-35w-dual-port-charger-usb-c';
  const description = `محول طاقة آبل (Apple) الأصلي بقوة 35 واط ثنائي المنافذ USB-C. شاحن سريع ومثالي لشحن جهازين في الوقت نفسه في المنزل أو المكتب أو أثناء التنقل، مع ضمان سنة كاملة.

مواصفات ومميزات الشاحن الرئيسية:
• شحن ثنائي ذكي: يمكنك شحن جهازين في الوقت نفسه بكفاءة عالية (مثل آيفون وآيباد، أو آبل ووتش وإيربودز).
• توافق مثالي وتوصية Apple: توصي Apple باستخدامه مع أجهزة MacBook Air، كما يمكنك استخدامه مع iPhone وiPad وApple Watch وAirPods.
• تصميم مدمج وقابل للطي: قابس ثنائي المنافذ بتصميم مدمج فائق الأناقة مع دبابيس قابلة للطي لسهولة السفر والتنقل.
• توافق عالمي مع محولات السفر: استخدم محول الطاقة هذا مع مجموعة محولات السفر من Apple لشحن أجهزتك بسهولة في أي مكان في العالم.
• منفذ USB-C مزدوج: منافذ متطورة تدعم توصيل الطاقة السريع لجميع الأجهزة المتوافقة.

*ملاحظة: يباع كابل الشحن بشكل منفصل.`;

  const chargerProduct = {
    name: 'محول طاقة آبل 35 واط ثنائي المنافذ USB-C',
    slug: targetSlug,
    description: description,
    price: 0,
    original_price: null,
    model: 'Apple Dual USB-C Port Power Adapter (35W)',
    color: 'أبيض (White)',
    condition: 'new',
    battery_health: null,
    images: destImages,
    in_stock: true,
    stock_quantity: 15,
    is_featured: true,
    is_visible: true,
    is_available: true,
    warranty_days: 365,
    category: 'accessories',
    category_id: accCategory.id,
    price_on_inquiry: true,
    storage: null,
    storage_size: null,
    brand: 'Apple',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  console.log('Upserting Apple 35W charger product in Supabase...');
  const { data, error } = await supabase
    .from('products')
    .upsert(chargerProduct, { onConflict: 'slug' })
    .select();

  if (error) {
    console.error('Error updating database:', error.message);
  } else {
    console.log('Database updated successfully for Apple 35W Charger!');
    console.log('Product Data:', data[0]);
  }
}

run();
