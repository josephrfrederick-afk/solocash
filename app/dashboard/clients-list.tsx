'use client'

interface Client {
  id: string
  name: string
  email: string | null
  company: string | null
}

export default function ClientsList({ clients }: { clients: Client[] }) {
  if (clients.length === 0) {
    return <p className="text-gray-500">No clients yet. Add your first one!</p>
  }

  return (
    <div className="space-y-3">
      {clients.map((client) => (
        <div key={client.id} className="border p-4 rounded-lg">
          <div className="font-medium">{client.name}</div>
          {client.company && <div className="text-sm text-gray-600">{client.company}</div>}
          {client.email && <div className="text-sm text-gray-500">{client.email}</div>}
        </div>
      ))}
    </div>
  )
}