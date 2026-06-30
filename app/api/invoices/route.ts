import { createClient } from '@/lib/supabase/server'
import { LineItem } from '@/lib/types'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { client_id, due_date, total, notes, line_items } = await request.json()

  const year = new Date().getFullYear()
  const invoiceNumber = `INV-${year}-${Date.now().toString().slice(-6)}`

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      user_id: user.id,
      client_id,
      invoice_number: invoiceNumber,
      due_date,
      total,
      notes: notes || null,
      status: 'draft',
    })
    .select()
    .single()

  if (invoiceError || !invoice) {
    return NextResponse.json({ error: invoiceError?.message || 'Failed to create invoice' }, { status: 400 })
  }

  if (line_items && line_items.length > 0) {
    const items = line_items.map((item: LineItem) => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }))
    await supabase.from('invoice_items').insert(items)
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, status } = await request.json()

  const { data: invoice } = await supabase
    .from('invoices')
    .update({ status })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*, clients(name, email)')
    .single()

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }

  // Send email to the client's real email when marked as sent
  if (status === 'sent' && invoice.clients?.email) {
    await resend.emails.send({
      from: 'SoloCash <onboarding@resend.dev>',
      to: invoice.clients.email,
      subject: `Invoice ${invoice.invoice_number} from SoloCash`,
      html: `
        <p>Hi ${invoice.clients.name},</p>
        <p>Your invoice <strong>${invoice.invoice_number}</strong> for <strong>$${invoice.total}</strong> is ready.</p>
        <p>Due date: ${invoice.due_date}</p>
        ${invoice.notes ? `<p>Notes: ${invoice.notes}</p>` : ''}
        <p>Thank you for your business.</p>
      `,
    })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = new URL(request.url).searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Invoice id required' }, { status: 400 })
  }

  const { data: invoice } = await supabase
    .from('invoices')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }

  const { error: itemsError } = await supabase
    .from('invoice_items')
    .delete()
    .eq('invoice_id', id)

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 400 })
  }

  const { error: invoiceError } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (invoiceError) {
    return NextResponse.json({ error: invoiceError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}