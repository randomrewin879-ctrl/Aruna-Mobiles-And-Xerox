import React, { useState } from 'react';
import { 
  Search, Plus, Download, Edit3, Copy, Trash2, 
  FileText, CheckCircle, Clock, PhoneCall, Building2 
} from 'lucide-react';
import { calculateInvoiceTotals } from '../utils/financials';
import { formatCurrency } from '../utils/numberToWords';
export const InvoiceList = ({ 
  invoices, 
  onSelectInvoice, 
  onNewInvoice, 
  onDuplicate, 
  onDelete, 
  onDirectExport,
  onOpenSettings,
  onUpdateStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      (inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inv.toName && inv.toName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inv.toPhone && inv.toPhone.includes(searchTerm));
    const matchesStatus = 
      statusFilter === 'ALL' || 
      (inv.status && inv.status.toUpperCase() === statusFilter.toUpperCase());
    return matchesSearch && matchesStatus;
  });
  const totalCount = invoices.length;
  let totalRevenue = 0;
  let paidCount = 0;
  let pendingCount = 0;
  invoices.forEach(inv => {
    const totals = calculateInvoiceTotals(inv);
    totalRevenue += totals.grandTotal;
    if (inv.status === 'Paid') paidCount++;
    if (inv.status === 'Pending') pendingCount++;
  });
  return (
    <div className="ledger-container">
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon-wrap bg-blue-subtle">
            <FileText size={20} color="#2563eb" />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Invoices</span>
            <span className="stat-value">{totalCount}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap bg-green-subtle">
            <CheckCircle size={20} color="#16a34a" />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Billed</span>
            <span className="stat-value">{formatCurrency(totalRevenue)}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap bg-emerald-subtle">
            <CheckCircle size={20} color="#059669" />
          </div>
          <div className="stat-content">
            <span className="stat-label">Paid Invoices</span>
            <span className="stat-value">{paidCount}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap bg-amber-subtle">
            <Clock size={20} color="#d97706" />
          </div>
          <div className="stat-content">
            <span className="stat-label">Pending Invoices</span>
            <span className="stat-value">{pendingCount}</span>
          </div>
        </div>
      </div>
      <div className="ledger-controls-bar">
        <div className="search-box-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by Bill No, Customer Name or Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="status-filter-pills">
          {['ALL', 'PAID', 'PENDING', 'UNPAID'].map(filter => (
            <button
              key={filter}
              className={`filter-pill ${statusFilter === filter ? 'active' : ''}`}
              onClick={() => setStatusFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="ledger-actions-group">
          {onOpenSettings && (
            <button 
              type="button" 
              className="btn-settings-secondary" 
              onClick={onOpenSettings}
              title="Shop Profile & Bank Settings"
            >
              <Building2 size={16} /> <span>Shop & Bank Settings</span>
            </button>
          )}
          <button className="btn-create-invoice" onClick={onNewInvoice}>
            <Plus size={18} /> <span>Create Invoice</span>
          </button>
        </div>
      </div>
      <div className="ledger-table-wrap">
        <div className="table-responsive-scroller">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Bill No</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Contact</th>
                <th>Payment Mode</th>
                <th style={{ textAlign: 'right' }}>Total Amount</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center', width: '150px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state-cell">
                    <FileText size={36} color="#94a3b8" />
                    <p>No invoices found. Click <strong>+ New Invoice</strong> to create your first bill!</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => {
                  const totals = calculateInvoiceTotals(inv);
                  return (
                    <tr key={inv.id}>
                      <td className="bold-cell">
                        <button 
                          className="inv-no-link" 
                          onClick={() => onSelectInvoice(inv)}
                          title="Click to view & edit"
                        >
                          {inv.invoiceNumber}
                        </button>
                      </td>
                      <td>{inv.date}</td>
                      <td className="customer-name-cell">
                        <strong>{inv.toName || 'Cash Customer'}</strong>
                      </td>
                      <td>
                        {inv.toPhone ? (
                          <span className="phone-tag">
                            <PhoneCall size={12} /> {inv.toPhone}
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <span className="payment-pill">{inv.modeOfPayment || 'Cash'}</span>
                      </td>
                      <td style={{ textAlign: 'right' }} className="amount-cell-bold">
                        {formatCurrency(totals.grandTotal)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="status-select-wrap" onClick={(e) => e.stopPropagation()}>
                          <select
                            className={`status-badge-select status-${(inv.status || 'paid').toLowerCase()}`}
                            value={inv.status || 'Paid'}
                            onChange={(e) => onUpdateStatus && onUpdateStatus(inv.id, e.target.value)}
                            title="Click to quickly change payment status"
                          >
                            <option value="Paid">🟢 PAID</option>
                            <option value="Pending">🟡 PENDING</option>
                            <option value="Unpaid">🔴 UNPAID</option>
                          </select>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="actions-cluster">
                          <button
                            className="action-btn-circle"
                            onClick={() => onDirectExport(inv)}
                            title="Direct PDF Download"
                          >
                            <Download size={15} />
                          </button>
                          <button
                            className="action-btn-circle"
                            onClick={() => onSelectInvoice(inv)}
                            title="Edit Invoice"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            className="action-btn-circle"
                            onClick={() => onDuplicate(inv.id)}
                            title="Duplicate Invoice"
                          >
                            <Copy size={15} />
                          </button>
                          <button
                            className="action-btn-circle danger"
                            onClick={() => {
                              if (window.confirm(`Delete invoice ${inv.invoiceNumber}?`)) {
                                onDelete(inv.id);
                              }
                            }}
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};