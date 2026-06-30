import { Client, Invoice, LineItem } from '@/lib/types'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 50, fontSize: 11 },
  header: { fontSize: 28, marginBottom: 30, fontWeight: 'bold' },
  section: { marginBottom: 20 },
  label: { color: '#666', fontSize: 10 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#111', paddingBottom: 6, marginBottom: 6 },
  tableRow: { flexDirection: 'row', marginBottom: 5 },
  colDesc: { width: '50%' },
  colQty: { width: '12%', textAlign: 'center' },
  colPrice: { width: '18%', textAlign: 'right' },
  colAmount: { width: '20%', textAlign: 'right' },
  total: { fontSize: 16, fontWeight: 'bold', marginTop: 25, textAlign: 'right' },
  notes: { marginTop: 30, fontSize: 10, color: '#444' },
})

interface Props {
  invoice: Invoice
  client: Client | null
  lineItems?: LineItem[]
}

export default function InvoicePDF({ invoice, client, lineItems = [] }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>INVOICE</Text>

        <View style={styles.section}>
          <Text><Text style={styles.label}>Invoice #:</Text> {invoice.invoice_number}</Text>
          <Text><Text style={styles.label}>Due Date:</Text> {invoice.due_date}</Text>
          <Text><Text style={styles.label}>Status:</Text> {invoice.status}</Text>
        </View>

        <View style={styles.section}>
          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Bill To</Text>
          <Text>{client?.name}</Text>
          {client?.email && <Text>{client.email}</Text>}
          {client?.company && <Text>{client.company}</Text>}
        </View>

        {lineItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.tableHeader}>
              <Text style={styles.colDesc}>Description</Text>
              <Text style={styles.colQty}>Qty</Text>
              <Text style={styles.colPrice}>Price</Text>
              <Text style={styles.colAmount}>Amount</Text>
            </View>
            {lineItems.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.colDesc}>{item.description}</Text>
                <Text style={styles.colQty}>{item.quantity}</Text>
                <Text style={styles.colPrice}>${item.unit_price}</Text>
                <Text style={styles.colAmount}>${(item.quantity * item.unit_price).toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.total}>Total: ${invoice.total}</Text>

        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Notes</Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  )
}