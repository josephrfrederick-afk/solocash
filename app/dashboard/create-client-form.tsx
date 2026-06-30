'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateClientForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return

    setLoading(true)

    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, company }),
    })

    if (res.ok) {
      setName('')
      setEmail('')
      setCompany('')
      router.refresh()
    } else {
      alert('Error creating client')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Client Name *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border p-3.5 rounded-2xl text-sm"
        required
      />
      <input
        type="email"
        placeholder="Email (optional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border p-3.5 rounded-2xl text-sm"
      />
      <input
        type="text"
        placeholder="Company (optional)"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        className="w-full border p-3.5 rounded-2xl text-sm"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white py-3.5 rounded-2xl disabled:opacity-70"
      >
        {loading ? 'Adding...' : 'Add Client'}
      </button>
    </form>
  )
}