// ══════════════════════════════════════════
// APPLE DEVICE DATA
// Dynamic data for admin form fields
// ══════════════════════════════════════════

// ── iPhone Models ──
export interface IPhoneModel {
  name: string
  storageOptions: string[]
  colors: string[]
}

export const IPHONE_MODELS: IPhoneModel[] = [
  // iPhone 16 Series
  { name: 'iPhone 16 Pro Max', storageOptions: ['256GB', '512GB', '1TB'], colors: ['Desert Titanium', 'Natural Titanium', 'White Titanium', 'Black Titanium'] },
  { name: 'iPhone 16 Pro', storageOptions: ['128GB', '256GB', '512GB', '1TB'], colors: ['Desert Titanium', 'Natural Titanium', 'White Titanium', 'Black Titanium'] },
  { name: 'iPhone 16 Plus', storageOptions: ['128GB', '256GB', '512GB'], colors: ['Ultramarine', 'Teal', 'Pink', 'White', 'Black'] },
  { name: 'iPhone 16', storageOptions: ['128GB', '256GB', '512GB'], colors: ['Ultramarine', 'Teal', 'Pink', 'White', 'Black'] },
  
  // iPhone 15 Series
  { name: 'iPhone 15 Pro Max', storageOptions: ['256GB', '512GB', '1TB'], colors: ['Natural Titanium', 'Blue Titanium', 'White Titanium', 'Black Titanium'] },
  { name: 'iPhone 15 Pro', storageOptions: ['128GB', '256GB', '512GB', '1TB'], colors: ['Natural Titanium', 'Blue Titanium', 'White Titanium', 'Black Titanium'] },
  { name: 'iPhone 15 Plus', storageOptions: ['128GB', '256GB', '512GB'], colors: ['Blue', 'Pink', 'Yellow', 'Green', 'Black'] },
  { name: 'iPhone 15', storageOptions: ['128GB', '256GB', '512GB'], colors: ['Blue', 'Pink', 'Yellow', 'Green', 'Black'] },
  
  // iPhone 14 Series
  { name: 'iPhone 14 Pro Max', storageOptions: ['128GB', '256GB', '512GB', '1TB'], colors: ['Deep Purple', 'Gold', 'Silver', 'Space Black'] },
  { name: 'iPhone 14 Pro', storageOptions: ['128GB', '256GB', '512GB', '1TB'], colors: ['Deep Purple', 'Gold', 'Silver', 'Space Black'] },
  { name: 'iPhone 14 Plus', storageOptions: ['128GB', '256GB', '512GB'], colors: ['Blue', 'Purple', 'Yellow', 'Midnight', 'Starlight', '(PRODUCT)RED'] },
  { name: 'iPhone 14', storageOptions: ['128GB', '256GB', '512GB'], colors: ['Blue', 'Purple', 'Yellow', 'Midnight', 'Starlight', '(PRODUCT)RED'] },
  
  // iPhone 13 Series
  { name: 'iPhone 13 Pro Max', storageOptions: ['128GB', '256GB', '512GB', '1TB'], colors: ['Graphite', 'Gold', 'Silver', 'Sierra Blue', 'Alpine Green'] },
  { name: 'iPhone 13 Pro', storageOptions: ['128GB', '256GB', '512GB', '1TB'], colors: ['Graphite', 'Gold', 'Silver', 'Sierra Blue', 'Alpine Green'] },
  { name: 'iPhone 13', storageOptions: ['128GB', '256GB', '512GB'], colors: ['Midnight', 'Starlight', 'Blue', 'Pink', '(PRODUCT)RED', 'Green'] },
  { name: 'iPhone 13 Mini', storageOptions: ['128GB', '256GB', '512GB'], colors: ['Midnight', 'Starlight', 'Blue', 'Pink', '(PRODUCT)RED', 'Green'] },
  
  // iPhone 12 Series
  { name: 'iPhone 12 Pro Max', storageOptions: ['128GB', '256GB', '512GB'], colors: ['Graphite', 'Gold', 'Silver', 'Pacific Blue'] },
  { name: 'iPhone 12 Pro', storageOptions: ['128GB', '256GB', '512GB'], colors: ['Graphite', 'Gold', 'Silver', 'Pacific Blue'] },
  { name: 'iPhone 12', storageOptions: ['64GB', '128GB', '256GB'], colors: ['Black', 'White', 'Blue', 'Green', '(PRODUCT)RED', 'Purple'] },
  { name: 'iPhone 12 Mini', storageOptions: ['64GB', '128GB', '256GB'], colors: ['Black', 'White', 'Blue', 'Green', '(PRODUCT)RED', 'Purple'] },
  
  // iPhone 11 Series
  { name: 'iPhone 11 Pro Max', storageOptions: ['64GB', '256GB', '512GB'], colors: ['Midnight Green', 'Space Gray', 'Gold', 'Silver'] },
  { name: 'iPhone 11 Pro', storageOptions: ['64GB', '256GB', '512GB'], colors: ['Midnight Green', 'Space Gray', 'Gold', 'Silver'] },
  { name: 'iPhone 11', storageOptions: ['64GB', '128GB', '256GB'], colors: ['Black', 'White', 'Green', 'Yellow', 'Purple', '(PRODUCT)RED'] },
  
  // iPhone SE
  { name: 'iPhone SE (3rd Gen)', storageOptions: ['64GB', '128GB', '256GB'], colors: ['Midnight', 'Starlight', '(PRODUCT)RED'] },
  { name: 'iPhone SE (2nd Gen)', storageOptions: ['64GB', '128GB', '256GB'], colors: ['Black', 'White', '(PRODUCT)RED'] },
  
  // Older
  { name: 'iPhone XS Max', storageOptions: ['64GB', '256GB', '512GB'], colors: ['Gold', 'Space Gray', 'Silver'] },
  { name: 'iPhone XS', storageOptions: ['64GB', '256GB', '512GB'], colors: ['Gold', 'Space Gray', 'Silver'] },
  { name: 'iPhone XR', storageOptions: ['64GB', '128GB', '256GB'], colors: ['Black', 'White', 'Blue', 'Yellow', 'Coral', '(PRODUCT)RED'] },
  { name: 'iPhone X', storageOptions: ['64GB', '256GB'], colors: ['Space Gray', 'Silver'] },
]

// ── iPad Models ──
export interface IPadModel {
  name: string
  storageOptions: string[]
  colors: string[]
}

export const IPAD_MODELS: IPadModel[] = [
  { name: 'iPad Pro 13" M4', storageOptions: ['256GB', '512GB', '1TB', '2TB'], colors: ['Space Black', 'Silver'] },
  { name: 'iPad Pro 11" M4', storageOptions: ['256GB', '512GB', '1TB', '2TB'], colors: ['Space Black', 'Silver'] },
  { name: 'iPad Air 13" M2', storageOptions: ['128GB', '256GB', '512GB', '1TB'], colors: ['Space Gray', 'Starlight', 'Purple', 'Blue'] },
  { name: 'iPad Air 11" M2', storageOptions: ['128GB', '256GB', '512GB', '1TB'], colors: ['Space Gray', 'Starlight', 'Purple', 'Blue'] },
  { name: 'iPad 10th Gen', storageOptions: ['64GB', '256GB'], colors: ['Silver', 'Blue', 'Pink', 'Yellow'] },
  { name: 'iPad 9th Gen', storageOptions: ['64GB', '256GB'], colors: ['Space Gray', 'Silver'] },
  { name: 'iPad Mini 6th Gen', storageOptions: ['64GB', '256GB'], colors: ['Space Gray', 'Pink', 'Purple', 'Starlight'] },
]

// ── MacBook Models ──
export interface MacBookModel {
  name: string
  storageOptions: string[]
  colors: string[]
}

export const MACBOOK_MODELS: MacBookModel[] = [
  { name: 'MacBook Pro 16" M3 Max', storageOptions: ['512GB', '1TB', '2TB', '4TB', '8TB'], colors: ['Space Black', 'Silver'] },
  { name: 'MacBook Pro 16" M3 Pro', storageOptions: ['512GB', '1TB', '2TB'], colors: ['Space Black', 'Silver'] },
  { name: 'MacBook Pro 14" M3 Pro', storageOptions: ['512GB', '1TB', '2TB'], colors: ['Space Black', 'Silver'] },
  { name: 'MacBook Pro 14" M3', storageOptions: ['512GB', '1TB'], colors: ['Space Gray', 'Silver'] },
  { name: 'MacBook Air 15" M3', storageOptions: ['256GB', '512GB', '1TB', '2TB'], colors: ['Midnight', 'Starlight', 'Space Gray', 'Silver'] },
  { name: 'MacBook Air 13" M3', storageOptions: ['256GB', '512GB', '1TB', '2TB'], colors: ['Midnight', 'Starlight', 'Space Gray', 'Silver'] },
  { name: 'MacBook Air 13" M2', storageOptions: ['256GB', '512GB', '1TB'], colors: ['Midnight', 'Starlight', 'Space Gray', 'Silver'] },
  { name: 'MacBook Air 13" M1', storageOptions: ['256GB', '512GB'], colors: ['Space Gray', 'Gold', 'Silver'] },
]

// ── Apple Watch Models ──
export interface WatchModel {
  name: string
  sizes: string[]
  colors: string[]
}

export const WATCH_MODELS: WatchModel[] = [
  { name: 'Apple Watch Ultra 2', sizes: ['49mm'], colors: ['Natural Titanium'] },
  { name: 'Apple Watch Series 9', sizes: ['41mm', '45mm'], colors: ['Midnight', 'Starlight', 'Silver', '(PRODUCT)RED', 'Pink'] },
  { name: 'Apple Watch SE (2nd Gen)', sizes: ['40mm', '44mm'], colors: ['Midnight', 'Starlight', 'Silver'] },
  { name: 'Apple Watch Series 8', sizes: ['41mm', '45mm'], colors: ['Midnight', 'Starlight', 'Silver', '(PRODUCT)RED'] },
  { name: 'Apple Watch Series 7', sizes: ['41mm', '45mm'], colors: ['Midnight', 'Starlight', 'Green', 'Blue', '(PRODUCT)RED'] },
]

// ── Accessories Types ──
export const ACCESSORY_TYPES = [
  { value: 'case', label: 'جراب (Case)' },
  { value: 'back_protector', label: 'اسكرينة ظهر' },
  { value: 'screen_protector', label: 'اسكرينة شاشة' },
  { value: 'lens_protector', label: 'عدسات حماية' },
  { value: 'other_accessory', label: 'إكسسوار آخر' },
] as const

// ── Peripherals Types ──
export const PERIPHERAL_TYPES = [
  { value: 'charger', label: 'شاحن' },
  { value: 'cable', label: 'وصلة شاحن (كابل)' },
  { value: 'wired_earphones', label: 'سماعات سلك' },
  { value: 'airpods', label: 'AirPods' },
  { value: 'airpods_pro', label: 'AirPods Pro' },
  { value: 'airpods_max', label: 'AirPods Max' },
  { value: 'apple_pencil', label: 'Apple Pencil' },
  { value: 'keyboard', label: 'Magic Keyboard' },
  { value: 'mouse', label: 'Magic Mouse' },
  { value: 'other_peripheral', label: 'ملحق آخر' },
] as const

// ── AirPods Models ──
export const AIRPODS_MODELS = [
  { name: 'AirPods Pro 2 (USB-C)', colors: ['White'] },
  { name: 'AirPods Pro 2 (Lightning)', colors: ['White'] },
  { name: 'AirPods 3rd Gen', colors: ['White'] },
  { name: 'AirPods 2nd Gen', colors: ['White'] },
  { name: 'AirPods Max', colors: ['Silver', 'Space Gray', 'Sky Blue', 'Green', 'Pink', 'Midnight', 'Starlight', 'Orange', 'Purple', 'Blue'] },
] as const

// ── Device Condition Options (Updated) ──
export const DEVICE_CONDITIONS = [
  { value: 'new', label: 'جديد (مغلف)' },
  { value: 'like_new', label: 'كسر الزيرو' },
  { value: 'good', label: 'مستعمل' },
] as const

// ── Tax Status ──
export const TAX_STATUS_OPTIONS = [
  { value: 'exempt', label: 'معفى من الضريبة' },
  { value: 'taxable', label: 'غير معفى (يخضع للضريبة)' },
] as const

// ── Helper: Get models by category ──
export function getModelsByCategory(category: string) {
  switch (category) {
    case 'iphone': return IPHONE_MODELS
    case 'ipad': return IPAD_MODELS
    case 'macbook': return MACBOOK_MODELS
    default: return []
  }
}

// ── Helper: Get storage options for a specific model ──
export function getStorageForModel(category: string, modelName: string): string[] {
  const models = getModelsByCategory(category)
  const found = models.find(m => m.name === modelName)
  return found?.storageOptions ?? ['128GB', '256GB', '512GB']
}

// ── Helper: Get colors for a specific model ──
export function getColorsForModel(category: string, modelName: string): string[] {
  const models = getModelsByCategory(category)
  const found = models.find(m => m.name === modelName)
  return found?.colors ?? []
}
