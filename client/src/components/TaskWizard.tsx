import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function TaskWizard() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState(true)
  const [form, setForm] = useState({
    site: '',
    product_url: '',
    size: '',
    quantity: 1,
    profile_id: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function fetchProfiles() {
      setLoadingProfiles(true)
      const { data, error } = await supabase.from('profiles').select('*')
      if (!error && data) setProfiles(data)
      setLoadingProfiles(false)
    }
    fetchProfiles()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: name === 'quantity' ? Number(value) : value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.from('tasks').insert([
      {
        site: form.site,
        product_url: form.product_url,
        size: form.size,
        quantity: form.quantity,
        profile_id: form.profile_id,
      }
    ])

    if (error) {
      setMessage(`❌ ${error.message}`)
    } else {
      setMessage('✅ Task created successfully!')
      setForm({ site: '', product_url: '', size: '', quantity: 1, profile_id: '' })
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-4 bg-[#1e1e1e] text-white rounded-xl space-y-4 shadow-lg">
      <h2 className="text-xl font-bold">Create Sneaker Bot Task</h2>

      <div className="grid grid-cols-2 gap-4">
        <input type="text" name="site" placeholder="Site" required className="input" value={form.site} onChange={handleChange} />
        <input type="text" name="product_url" placeholder="Product URL" required className="input" value={form.product_url} onChange={handleChange} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <input type="text" name="size" placeholder="Size" className="input" value={form.size} onChange={handleChange} />
        <input type="number" name="quantity" min="1" placeholder="Quantity" className="input" value={form.quantity} onChange={handleChange} />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Profile</label>
        <select
          name="profile_id"
          required
          className="input"
          value={form.profile_id}
          onChange={handleChange}
          disabled={loadingProfiles}
        >
          <option value="">Select Profile...</option>
          {profiles.map((profile: any) => (
            <option key={profile.id} value={profile.id}>
              {profile.name} ({profile.email})
            </option>
          ))}
        </select>
      </div>

      <button type="submit" disabled={loading}
        className="bg-white text-black py-2 px-4 rounded-md hover:bg-gray-200">
        {loading ? 'Creating...' : 'Create Task'}
      </button>

      {message && <p className="text-sm mt-2">{message}</p>}
    </form>
  )
}
