import { getAdminProductCategories, findAdminProduct } from '@/lib/admin-products'
import ProductForm from '@/components/admin/ProductForm'
import { notFound } from 'next/navigation'

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params
  const [product, categories] = await Promise.all([
    findAdminProduct(id),
    getAdminProductCategories()
  ])

  if (!product) {
    notFound()
  }

  return (
    <div className="max-w-5xl mx-auto">
      <ProductForm 
        initialData={product} 
        categories={categories} 
        mode="edit" 
      />
    </div>
  )
}
