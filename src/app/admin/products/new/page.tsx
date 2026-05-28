import { getAdminProductCategories } from '@/lib/admin-products'
import ProductForm from '@/components/admin/ProductForm'

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
