import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SignOutButton from './sign-out-button'
import CreateClientForm from './create-client-form'
import ClientsList from './clients-list'
import CreateInvoiceForm from './create-invoice-form'
import InvoicesList from './invoices-list'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  // Safely fetch clients
  const { data: clientsData } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const clients = clientsData || []

  // Safely fetch invoices with line items
  const { data: invoicesData } = await supabase
    .from('invoices')
    .select('*, clients(name), invoice_items(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const invoices = invoicesData || []

  // Stats
  const totalClients = clients.length
  const openInvoices = invoices.filter(i => i.status !== 'paid').length
  const totalOutstanding = invoices
    .filter(i => i.status !== 'paid')
    .reduce((sum, i) => sum + (i.total || 0), 0)

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">SoloCash</h1>
          <p className="text-gray-600">Welcome back, {user.email}</p>
        </div>
        <SignOutButton />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border rounded-3xl p-6">
          <div className="text-sm text-gray-500">Total Clients</div>
          <div className="text-4xl font-semibold mt-2">{totalClients}</div>
        </div>
        <div className="bg-white border rounded-3xl p-6">
          <div className="text-sm text-gray-500">Open Invoices</div>
          <div className="text-4xl font-semibold mt-2">{openInvoices}</div>
        </div>
        <div className="bg-white border rounded-3xl p-6">
          <div className="text-sm text-gray-500">Total Outstanding</div>
          <div className="text-4xl font-semibold mt-2">${totalOutstanding}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Clients Section */}
        <div className="space-y-6">
          <div className="bg-white border rounded-3xl p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Client</h2>
            <CreateClientForm />
          </div>
          <div className="bg-white border rounded-3xl p-6">
            <h2 className="text-xl font-semibold mb-4">Your Clients ({clients.length})</h2>
            <ClientsList clients={clients} />
          </div>
        </div>

        {/* Invoices Section */}
        <div className="space-y-6">
          <div className="bg-white border rounded-3xl p-6">
            <h2 className="text-xl font-semibold mb-4">Create Invoice</h2>
            <CreateInvoiceForm clients={clients} />
          </div>
          <div className="bg-white border rounded-3xl p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Invoices ({invoices.length})</h2>
            <InvoicesList invoices={invoices} />
          </div>
        </div>
      </div>
    </div>
  )
}