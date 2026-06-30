export interface Client {
  name: string
  email?: string
  company?: string
}

export interface LineItem {
  description: string
  quantity: number
  unit_price: number
}

export interface Invoice {
  id: string
  invoice_number?: string
  total: number
  status: string
  due_date: string
  notes?: string | null
  clients?: Client | null
  invoice_items?: LineItem[]
}