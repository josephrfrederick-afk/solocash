'use client'

import { Invoice, LineItem } from '@/lib/types'

interface Props {
  invoice: Invoice
  onClose: () => void
  onStatusChange: (id: string, status: string) => void
  onDelete: (id: string) => void
}

export default function InvoiceModal({ invoice, onClose, onStatusChange, onDelete }: Props) {
  if (!invoice) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <div className="text-sm text-gray-500">Invoice</div>
            <div className="text-2xl font-semibold">{invoice.invoice_number}</div>
          </div>
          <button onClick={onClose} className="text-3xl text-gray-400 hover:text-black">×</button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="text-sm text-gray-500">Client</div>
            <div className="font-medium">{invoice.clients?.name}</div>
            {invoice.clients?.email && <div>{invoice.clients.email}</div>}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">Due:</span> {invoice.due_date}</div>
            <div><span className="text-gray-500">Status:</span> {invoice.status}</div>
            <div className="col-span-2"><span className="text-gray-500">Total:</span> <span className="text-xl font-semibold">${invoice.total}</span></div>
          </div>

          {(invoice.invoice_items ?? []).length > 0 && (
            <div>
              <div className="font-medium mb-2">Line Items</div>
              {(invoice.invoice_items ?? []).map((item: LineItem, i: number) => (
                <div key={i} className="flex justify-between text-sm border-b py-1">
                  <span>{item.description}</span>
                  <span>{item.quantity} × ${item.unit_price}</span>
                </div>
              ))}
            </div>
          )}

          {invoice.notes && (
            <div>
              <div className="text-gray-500 text-sm">Notes</div>
              <div>{invoice.notes}</div>
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t">
          {invoice.status !== 'paid' && (
            <>
              {invoice.status === 'draft' && (
                <button onClick={() => onStatusChange(invoice.id, 'sent')} className="flex-1 py-3 border rounded-2xl">Mark as Sent</button>
              )}
              <button onClick={() => onStatusChange(invoice.id, 'paid')} className="flex-1 py-3 bg-green-600 text-white rounded-2xl">Mark as Paid</button>
            </>
          )}
          <button onClick={() => onDelete(invoice.id)} className="px-6 py-3 text-red-600 hover:bg-red-50 rounded-2xl">Delete</button>
        </div>
      </div>
    </div>
  )
}