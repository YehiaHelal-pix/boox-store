import { getAdminProductCategories } from '@/lib/admin-products'
import ProductForm from '@/components/admin/ProductForm'

// Admin pages fetch live data per request; never prerender them at build time.
export const dynamic = 'force-dynamic'

export default async function NewProductPage() {
  const categories = await getAdminProductCategories()

  return (
    <div className="max-w-5xl mx-auto">
      <ProductForm 
        categories={categories} 
        mode="create" 
      />
    </div>
  )
}
