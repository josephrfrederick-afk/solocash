'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface LineItem {
  description: string
  quantity: number
  unit_price: number
}

interface Client {
  id: string
  name: string
}

export default function CreateInvoiceForm({ clients = [] }: { clients?: Client[] }) {
  const [clientId, setClientId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unit_price: 0 }
  ])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unit_price: 0 }])
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...lineItems]
    newItems[index] = { ...newItems[index], [field]: value }
    setLineItems(newItems)
  }

  const total = lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId || !dueDate || lineItems.length === 0) return

    setLoading(true)

    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        due_date: dueDate,
        total,
        notes,
        line_items: lineItems.filter(item => item.description.trim() !== '')
      }),
    })

    if (res.ok) {
      setClientId('')
      setDueDate('')
      setNotes('')
      setLineItems([{ description: '', quantity: 1, unit_price: 0 }])
      router.refresh()
    } else {
      alert('Error creating invoice')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <select
        value={clientId}
        onChange={(e) => setClientId(e.target.value)}
        className="w-full border p-3.5 rounded-2xl text-sm"
        required
      >
        <option value="">Select Client</option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>{client.name}</option>
        ))}
      </select>

      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="w-full border p-3.5 rounded-2xl text-sm"
        required
      />

      {/* Line Items Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Line Items</span>
          <button
            type="button"
            onClick={addLineItem}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            + Add Item
          </button>
        </div>

        <div className="space-y-2">
          {lineItems.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2">
              <input
                type="text"
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                className="col-span-5 border p-2.5 rounded-xl text-sm"
                required
              />
              <input
                type="number"
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 1)}
                className="col-span-2 border p-2.5 rounded-xl text-sm"
                min="1"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Price"
                value={item.unit_price}
                onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                className="col-span-3 border p-2.5 rounded-xl text-sm"
              />
              <button
                type="button"
                onClick={() => removeLineItem(index)}
                className="col-span-2 text-red-500 hover:bg-red-50 rounded-xl text-sm"
                disabled={lineItems.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="text-right text-lg font-semibold">
        Total: ${total.toFixed(2)}
      </div>

      <textarea
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full border p-3.5 rounded-2xl text-sm"
        rows={2}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black hover:bg-zinc-900 text-white py-3.5 rounded-2xl font-medium disabled:opacity-70 transition-colors"
      >
        {loading ? 'Creating Invoice...' : 'Create Invoice'}
      </button>
    </form>
  )
}