'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Invoice } from '@/lib/types'
import InvoicePDF from './invoice-pdf'
import InvoiceModal from './invoice-modal'

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false }
)

export default function InvoicesList({ invoices }: { invoices: Invoice[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const router = useRouter()

  const updateStatus = async (id: string, newStatus: string) => {
    setLoadingId(id)
    await fetch('/api/invoices', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    })
    router.refresh()
    setLoadingId(null)
    setSelectedInvoice(null) // close modal after action
  }

  const deleteInvoice = async (id: string) => {
    if (!confirm('Delete this invoice?')) return
    setLoadingId(id)
    await fetch(`/api/invoices?id=${id}`, { method: 'DELETE' })
    router.refresh()
    setLoadingId(null)
    setSelectedInvoice(null)
  }

  if (invoices.length === 0) return <p className="text-gray-500">No invoices yet.</p>

  return (
    <>
      <div className="space-y-3">
        {invoices.map((inv) => (
          <div 
            key={inv.id} 
            onClick={() => setSelectedInvoice(inv)}
            className="border rounded-2xl p-4 hover:shadow-sm transition-all cursor-pointer active:scale-[0.995]"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold text-[15px]">{inv.clients?.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {inv.invoice_number} • Due {inv.due_date}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">${inv.total}</div>
                <div className={`text-[10px] px-2 py-px rounded-full inline-block mt-1 capitalize tracking-wide
                  ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : 
                    inv.status === 'sent' ? 'bg-blue-100 text-blue-700' : 
                    'bg-gray-100 text-gray-600'}`}>
                  {inv.status}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-3 text-xs" onClick={e => e.stopPropagation()}>
              {inv.status === 'draft' && (
                <button 
                  onClick={() => updateStatus(inv.id, 'sent')} 
                  disabled={loadingId === inv.id}
                  className="px-3 py-1 border rounded-lg active:bg-gray-100"
                >
                  Mark Sent
                </button>
              )}
              {inv.status !== 'paid' && (
                <button 
                  onClick={() => updateStatus(inv.id, 'paid')} 
                  disabled={loadingId === inv.id}
                  className="px-3 py-1 bg-green-600 text-white rounded-lg active:bg-green-700"
                >
                  Mark Paid
                </button>
              )}

              <PDFDownloadLink
                document={<InvoicePDF invoice={inv} client={inv.clients ?? null} lineItems={inv.invoice_items ?? []} />}
                fileName={`${inv.invoice_number}.pdf`}
                className="px-3 py-1 border rounded-lg active:bg-gray-100 ml-auto"
              >
                {({ loading }) => loading ? '...' : 'PDF'}
              </PDFDownloadLink>

              <button 
                onClick={() => deleteInvoice(inv.id)} 
                disabled={loadingId === inv.id}
                className="px-3 py-1 text-red-600 active:bg-red-50 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onStatusChange={updateStatus}
          onDelete={deleteInvoice}
        />
      )}
    </>
  )
}