import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function CreateProfile() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    card_token: '',
    billing: {
      address: '',
      city: '',
      zip: '',
      country: ''
    },
    shipping: {
      address: '',
      city: '',
      zip: '',
      country: ''
    }
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, section?: 'billing' | 'shipping') => {
    const { name, value } = e.target
    if (section) {
      setForm(prev => ({
        ...prev,
        [section]: { ...prev[section], [name]: value }
      }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const payload = {
      name: form.name,
      email: form.email,
      card_token: form.card_token,
      billing_info: form.billing,
      shipping_info: form.shipping
    };
    console.log('Inserting profile (no-auth mode):', payload);

    const { error } = await supabase.from('profiles').insert([payload]);

    if (error) {
      console.error('Supabase insert error:', error);
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage('✅ Profile created!');
      setForm({
        name: '',
        email: '',
        card_token: '',
        billing: { address: '', city: '', zip: '', country: '' },
        shipping: { address: '', city: '', zip: '', country: '' }
      });
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-4 bg-[#1e1e1e] text-white rounded-xl space-y-4 shadow-lg">
      <h2 className="text-xl font-bold">Create Profile</h2>

      <div className="grid grid-cols-2 gap-4">
        <input type="text" name="name" placeholder="Full Name" required
          className="input" value={form.name} onChange={handleChange} />
        <input type="email" name="email" placeholder="Email" required
          className="input" value={form.email} onChange={handleChange} />
      </div>

      <input type="text" name="card_token" placeholder="Card Token"
        className="input w-full" value={form.card_token} onChange={handleChange} />

      <div className="mt-4">
        <h3 className="font-semibold">Billing Info</h3>
        <div className="grid grid-cols-2 gap-4">
          <input name="address" placeholder="Address" className="input"
            value={form.billing.address} onChange={(e) => handleChange(e, 'billing')} />
          <input name="city" placeholder="City" className="input"
            value={form.billing.city} onChange={(e) => handleChange(e, 'billing')} />
          <input name="zip" placeholder="ZIP Code" className="input"
            value={form.billing.zip} onChange={(e) => handleChange(e, 'billing')} />
          <input name="country" placeholder="Country" className="input"
            value={form.billing.country} onChange={(e) => handleChange(e, 'billing')} />
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-semibold">Shipping Info</h3>
        <div className="grid grid-cols-2 gap-4">
          <input name="address" placeholder="Address" className="input"
            value={form.shipping.address} onChange={(e) => handleChange(e, 'shipping')} />
          <input name="city" placeholder="City" className="input"
            value={form.shipping.city} onChange={(e) => handleChange(e, 'shipping')} />
          <input name="zip" placeholder="ZIP Code" className="input"
            value={form.shipping.zip} onChange={(e) => handleChange(e, 'shipping')} />
          <input name="country" placeholder="Country" className="input"
            value={form.shipping.country} onChange={(e) => handleChange(e, 'shipping')} />
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="bg-white text-black py-2 px-4 rounded-md hover:bg-gray-200">
        {loading ? 'Creating...' : 'Create Profile'}
      </button>

      {message && <p className="text-sm mt-2">{message}</p>}
    </form>
  )
}
