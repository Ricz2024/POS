import type { Transaction } from '../types'

interface Props {
  open: boolean
  txn: Transaction | null
  onClose: () => void
}

export default function ReceiptModal({ open, txn, onClose }: Props) {
  if (!txn) return null

  return (
    <div className={`modal-overlay ${open ? 'open' : ''}`}>
      <div className="modal">
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 32 }}>🎉</div>
          <h2 style={{ marginTop: 8 }}>Payment Successful</h2>
        </div>
        <div className="receipt">
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <div style={{ fontWeight: 500, fontSize: 13 }}>RetailOS Store</div>
            <div style={{ color: 'var(--text3)', fontSize: 11 }}>Official Receipt</div>
          </div>
          <hr className="receipt-divider" />
          <div className="receipt-line"><span>Order:</span><span>{txn.id}</span></div>
          <div className="receipt-line"><span>Time:</span><span>{txn.time}</span></div>
          <div className="receipt-line"><span>Payment:</span><span>{txn.payment.toUpperCase()}</span></div>
          {!txn.paid && txn.dueDate && <div className="receipt-line" style={{ color: 'var(--amber)' }}><span>Due Date:</span><span>{txn.dueDate}</span></div>}
          <hr className="receipt-divider" />
          {txn.items.map((item, i) => (
            <div key={i} className="receipt-line">
              <span>{item.name} x{item.qty}</span>
              <span>₱{(item.price * item.qty).toFixed(2)}</span>
            </div>
          ))}
          <hr className="receipt-divider" />
          <div className="receipt-line"><span>Subtotal</span><span>₱{txn.subtotal.toFixed(2)}</span></div>
          <div className="receipt-line"><span>VAT (12%)</span><span>₱{txn.tax.toFixed(2)}</span></div>
          <hr className="receipt-divider" />
          <div className="receipt-line" style={{ fontSize: 14, fontWeight: 500 }}>
            <span>TOTAL</span><span>₱{txn.total.toFixed(2)}</span>
          </div>
          <div style={{ textAlign: 'center', marginTop: 10, color: 'var(--text3)', fontSize: 11 }}>Thank you for shopping!</div>
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={() => window.print()}><i className="ti ti-printer" /> Print</button>
          <button className="btn btn-accent" onClick={onClose}>New Order</button>
        </div>
      </div>
    </div>
  )
}
