import { useState, useEffect } from 'react'
import { categoriesAPI } from '../../api/services'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await categoriesAPI.getAll()
      setCategories(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await categoriesAPI.create({ name })
      setName('')
      fetchCategories()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Categorías</h1>

      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nueva categoría" required className="px-4 py-2 border rounded w-full" />
        <button className="bg-primary text-white px-4 py-2 rounded">Agregar</button>
      </form>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <ul className="space-y-2">
          {categories.map((c) => (
            <li key={c.id_key} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-center">
                <span className="font-bold">{c.name}</span>
                <span className="text-sm text-gray-500">id: {c.id_key}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
