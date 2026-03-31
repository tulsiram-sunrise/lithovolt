import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { inventoryAPI } from '../../services/api'
import ShimmerTableRows from '../../components/common/ShimmerTableRows'
import ProductImage from '../../components/common/ProductImage'

export default function ProductsPage() {
  const [search, setSearch] = useState('')
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['wholesaler-products'],
    queryFn: () => inventoryAPI.getCatalogItems({ ordering: 'name', is_active: true, per_page: 200 }),
    select: (response) => response.data,
  })

  const products = useMemo(() => {
    const list = Array.isArray(productsData) ? productsData : productsData?.results || productsData?.data || []
    const term = search.trim().toLowerCase()
    if (!term) {
      return list
    }
    return list.filter((item) =>
      item.name.toLowerCase().includes(term) || item.sku.toLowerCase().includes(term)
    )
  }, [productsData, search])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold neon-title">Products</h1>
        <p className="text-[color:var(--muted)]">Browse products available from Lithovolt.</p>
      </div>

      <div className="panel-card p-6">
        <input
          className="neon-input mb-4"
          placeholder="Search products"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Available</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? <ShimmerTableRows rows={6} columns={5} /> : null}
              {products.map((item) => (
                <tr key={item.id}>
                  <td>
                    <ProductImage src={item.image_url} alt={item.name} className="h-12 w-12" fallbackText="N/A" />
                  </td>
                  <td>{item.name}</td>
                  <td>{item.sku}</td>
                  <td>{item.category_name || '-'}</td>
                  <td>{item.available_quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isLoading && products.length === 0 ? (
          <p className="mt-3 text-sm text-[color:var(--muted)]">No products available.</p>
        ) : null}
      </div>
    </div>
  )
}
