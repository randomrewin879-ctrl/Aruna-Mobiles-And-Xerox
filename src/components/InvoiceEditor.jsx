import { useState } from 'react';
import { 
  Plus, Trash2, ArrowUp, ArrowDown, 
  Sparkles, Save, X, 
  Layers, RotateCcw, Building2,
  AlertCircle, CheckCircle2
} from 'lucide-react';
import { 
  getPopularServices, 
  savePopularServices, 
  resetPopularServices 
} from '../config/businessConfig';
import { calculateInvoiceTotals } from '../utils/financials';
import { formatCurrency } from '../utils/numberToWords';
import { googleSheetsSync } from '../services/googleSheetsSync';
import { 
  validateGmail, 
  validateSinglePhone, 
  validateCustomerPhone, 
  sanitizeSinglePhoneInput, 
  sanitizeCustomerPhoneInput 
} from '../utils/validators';

export const InvoiceEditor = ({ invoice, onChange, onSave, onCancel, onOpenSettings }) => {
  const [activeTab, setActiveTab] = useState('items'); 
  const [popularServices, setPopularServices] = useState(getPopularServices);
  const totals = calculateInvoiceTotals(invoice);
  const toPhoneValidation = validateCustomerPhone(invoice.toPhone);
  const toEmailValidation = validateGmail(invoice.toEmail);
  const fromPhoneValidation = validateSinglePhone(invoice.fromPhone);
  const fromEmailValidation = validateGmail(invoice.fromEmail);
  const handleFieldChange = (field, value) => {
    onChange({
      ...invoice,
      [field]: value
    });
  };
  const handleBankChange = (field, value) => {
    onChange({
      ...invoice,
      bankDetails: {
        ...invoice.bankDetails,
        [field]: value
      }
    });
  };
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...(invoice.items || [])];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    onChange({
      ...invoice,
      items: updatedItems
    });
  };
  const handleAddItem = () => {
    const newItem = {
      id: 'item_' + Date.now(),
      description: '',
      quantity: 1,
      unitPrice: '',
      taxRate: 0,
      per: 'Nos.'
    };
    onChange({
      ...invoice,
      items: [...(invoice.items || []), newItem]
    });
  };
  const handleAddPresetItem = (preset) => {
    const newItem = {
      id: 'item_' + Date.now() + Math.random().toString(36).substring(2, 5),
      description: preset.description,
      quantity: 1,
      unitPrice: preset.unitPrice,
      taxRate: preset.taxRate || 0,
      per: preset.per || 'Nos.'
    };
    onChange({
      ...invoice,
      items: [...(invoice.items || []), newItem]
    });
  };
  const handleRemoveItem = (index) => {
    if ((invoice.items || []).length <= 1) {
      alert('Invoice must contain at least one line item.');
      return;
    }
    const updatedItems = invoice.items.filter((_, i) => i !== index);
    onChange({
      ...invoice,
      items: updatedItems
    });
  };
  const handleMoveItem = (index, direction) => {
    const items = [...(invoice.items || [])];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;
    onChange({
      ...invoice,
      items
    });
  };
  const handleServiceChange = (index, field, value) => {
    const updated = [...popularServices];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setPopularServices(updated);
    savePopularServices(updated);
    if (googleSheetsSync.isConfigured()) {
      googleSheetsSync.syncPopularServices(updated);
    }
  };
  const handleAddService = () => {
    const newService = {
      description: 'New Shop Service',
      unitPrice: '',
      per: 'Nos.',
      taxRate: 0
    };
    const updated = [...popularServices, newService];
    setPopularServices(updated);
    savePopularServices(updated);
    if (googleSheetsSync.isConfigured()) {
      googleSheetsSync.syncPopularServices(updated);
    }
  };
  const handleRemoveService = (index) => {
    if (popularServices.length <= 1) {
      alert('You must keep at least one popular service preset.');
      return;
    }
    const updated = popularServices.filter((_, i) => i !== index);
    setPopularServices(updated);
    savePopularServices(updated);
    if (googleSheetsSync.isConfigured()) {
      googleSheetsSync.syncPopularServices(updated);
    }
  };
  const handleMoveService = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= popularServices.length) return;
    const updated = [...popularServices];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setPopularServices(updated);
    savePopularServices(updated);
    if (googleSheetsSync.isConfigured()) {
      googleSheetsSync.syncPopularServices(updated);
    }
  };
  const handleResetServices = () => {
    if (window.confirm('Reset all popular service presets back to shop defaults?')) {
      const reset = resetPopularServices();
      setPopularServices([...reset]);
      if (googleSheetsSync.isConfigured()) {
        googleSheetsSync.syncPopularServices(reset);
      }
    }
  };
  return (
    <div className="editor-panel-container">
      <div className="editor-top-nav">
        <div className="nav-tabs">
          <button 
            type="button"
            className={`tab-btn ${activeTab === 'items' ? 'active' : ''}`}
            onClick={() => setActiveTab('items')}
          >
            <Layers size={14} /> Line Items ({invoice.items?.length || 0})
          </button>
          <button 
            type="button"
            className={`tab-btn ${activeTab === 'customer' ? 'active' : ''}`}
            onClick={() => setActiveTab('customer')}
          >
            👤 Customer & Dates
          </button>
          <button 
            type="button"
            className={`tab-btn ${activeTab === 'payment' ? 'active' : ''}`}
            onClick={() => setActiveTab('payment')}
          >
            💳 Payment & Stamp
          </button>
          <button 
            type="button"
            className={`tab-btn ${activeTab === 'business' ? 'active' : ''}`}
            onClick={() => setActiveTab('business')}
          >
            🏢 Shop Profile & Bank
          </button>
        </div>
        <div className="top-actions">
          <button type="button" className="btn-secondary" onClick={onCancel} title="Return to Ledger">
            <X size={15} /> Close
          </button>
          <button 
            type="button" 
            className="btn-primary" 
            onClick={() => {
              if (!toPhoneValidation.valid) {
                setActiveTab('customer');
                alert(`Customer Mobile Number Error:\n${toPhoneValidation.message}`);
                return;
              }
              if (!toEmailValidation.valid) {
                setActiveTab('customer');
                alert(`Customer Gmail Address Error:\n${toEmailValidation.message}`);
                return;
              }
              if (!fromPhoneValidation.valid) {
                setActiveTab('business');
                alert(`Shop Mobile Number Error:\n${fromPhoneValidation.message}`);
                return;
              }
              if (!fromEmailValidation.valid) {
                setActiveTab('business');
                alert(`Shop Gmail Address Error:\n${fromEmailValidation.message}`);
                return;
              }
              onSave();
            }} 
            title="Save Changes"
          >
            <Save size={15} /> Save Invoice
          </button>
        </div>
      </div>
      <div className="editor-tab-body">
        {activeTab === 'items' && (
          <div className="tab-pane">
            <div className="quick-presets-strip">
              <div className="preset-header">
                <span className="preset-label">
                  <Sparkles size={14} color="#f59e0b" /> Quick Add Popular Shop Services:
                </span>
                <span className="preset-hint">Click any preset to add instantly</span>
              </div>
              <div className="preset-chips-scroll">
                {popularServices.map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    className="preset-chip"
                    onClick={() => handleAddPresetItem(preset)}
                    title={`Add ${preset.description}`}
                  >
                    + {preset.description.split('(')[0].trim()} <strong className="preset-price">₹{preset.unitPrice || 0}</strong>
                  </button>
                ))}
              </div>
            </div>
            <div className="items-editor-table-wrap">
              <table className="items-form-table">
                <thead>
                  <tr>
                    <th style={{ width: '36px', textAlign: 'center' }}>#</th>
                    <th>Description (Brackets = sub-text)</th>
                    <th style={{ width: '65px', textAlign: 'center' }}>Qty</th>
                    <th style={{ width: '75px', textAlign: 'center' }}>Unit</th>
                    <th style={{ width: '85px', textAlign: 'right' }}>Rate (₹)</th>
                    <th style={{ width: '90px', textAlign: 'right' }}>Total (₹)</th>
                    <th style={{ width: '70px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(invoice.items || []).map((item, index) => {
                    const rowTotal = ((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)).toFixed(2);
                    return (
                      <tr key={item.id || index}>
                        <td className="center-cell text-muted font-bold">{index + 1}</td>
                        <td>
                          <textarea
                            className="form-control desc-textarea"
                            rows={2}
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            placeholder="e.g. Colour Printout A4 (Glossy)"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0.1"
                            step="any"
                            className="form-control text-center"
                            value={item.quantity === 0 || item.quantity === '0' || item.quantity === '' ? '' : item.quantity}
                            placeholder="1"
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          />
                        </td>
                        <td>
                          <select
                            className="form-control text-center select-compact"
                            value={item.per || 'Nos.'}
                            onChange={(e) => handleItemChange(index, 'per', e.target.value)}
                          >
                            <option value="Copies">Copies</option>
                            <option value="Nos.">Nos.</option>
                            <option value="Set">Set</option>
                            <option value="Pcs">Pcs</option>
                            <option value="Pack">Pack</option>
                            <option value="Hours">Hours</option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            className="form-control text-right"
                            value={item.unitPrice === 0 || item.unitPrice === '0' || item.unitPrice === '' ? '' : item.unitPrice}
                            placeholder="0"
                            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          />
                        </td>
                        <td className="row-total-cell text-right">
                          ₹{rowTotal}
                        </td>
                        <td className="action-cell center-cell">
                          <div className="btn-group-sm">
                            <button
                              type="button"
                              className="btn-icon"
                              disabled={index === 0}
                              onClick={() => handleMoveItem(index, -1)}
                              title="Move Up"
                            >
                              <ArrowUp size={13} />
                            </button>
                            <button
                              type="button"
                              className="btn-icon"
                              disabled={index === (invoice.items || []).length - 1}
                              onClick={() => handleMoveItem(index, 1)}
                              title="Move Down"
                            >
                              <ArrowDown size={13} />
                            </button>
                            <button
                              type="button"
                              className="btn-icon text-danger"
                              onClick={() => handleRemoveItem(index)}
                              title="Delete Item"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="editor-items-bottom">
              <button type="button" className="btn-add-line" onClick={handleAddItem}>
                <Plus size={15} /> Add Custom Item
              </button>
              <div className="discount-controls-box">
                <label className="checkbox-label bank-toggle-checkbox" title="Toggle visibility of Bank & UPI details on bill/PDF">
                  <input
                    type="checkbox"
                    checked={invoice.showBankDetails !== false}
                    onChange={(e) => handleFieldChange('showBankDetails', e.target.checked)}
                  />
                  <span>
                    <strong>Bank & UPI Details</strong> (வங்கி விபரம்)
                  </span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={invoice.hasDiscount}
                    onChange={(e) => handleFieldChange('hasDiscount', e.target.checked)}
                  />
                  <span>Special Discount (₹)</span>
                </label>
                {invoice.hasDiscount && (
                  <input
                    type="number"
                    min="0"
                    step="any"
                    className="form-control discount-input"
                    value={invoice.discount === 0 || invoice.discount === '0' || invoice.discount === '' ? '' : invoice.discount}
                    onChange={(e) => handleFieldChange('discount', e.target.value)}
                    placeholder="0"
                  />
                )}
                <div className="quick-total-badge">
                  Net Total: <span className="highlight-amount">{formatCurrency(totals.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'customer' && (
          <div className="tab-pane">
            <div className="form-card">
              <h3 className="section-title">Invoice Identification</h3>
              <div className="form-grid-3">
                <div className="form-group">
                  <label>Bill / Invoice Number</label>
                  <input
                    type="text"
                    className="form-control font-bold"
                    value={invoice.invoiceNumber}
                    onChange={(e) => handleFieldChange('invoiceNumber', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Issue Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={invoice.date}
                    onChange={(e) => handleFieldChange('date', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={invoice.dueDate}
                    onChange={(e) => handleFieldChange('dueDate', e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="form-card">
              <h3 className="section-title">Customer / Client Information</h3>
              <div className="form-grid-3">
                <div className="form-group">
                  <label>Title</label>
                  <select
                    className="form-control"
                    value={invoice.billReceiverTitle || 'Mr.'}
                    onChange={(e) => handleFieldChange('billReceiverTitle', e.target.value)}
                  >
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Dr.">Dr.</option>
                    <option value="M/s">M/s</option>
                  </select>
                </div>
                <div className="form-group col-span-2">
                  <label>Customer Full Name</label>
                  <input
                    type="text"
                    className="form-control font-semibold"
                    value={invoice.toName}
                    onChange={(e) => handleFieldChange('toName', e.target.value)}
                    placeholder="e.g. M. Karthik Raja"
                  />
                </div>
                <div className="form-group col-span-2">
                  <label>Customer Mobile Number(s) — Multiple numbers allowed</label>
                  <input
                    type="text"
                    className={`form-control ${toPhoneValidation.message && !toPhoneValidation.valid ? 'input-error-border' : (invoice.toPhone ? 'input-success-border' : '')}`}
                    value={invoice.toPhone || ''}
                    onChange={(e) => handleFieldChange('toPhone', sanitizeCustomerPhoneInput(e.target.value))}
                    placeholder="e.g. 9842156789, +91 9940947047"
                  />
                  <span className="field-helper-hint">
                    10 digits or +91 followed by 10 digits. Separate multiple numbers with comma (,).
                  </span>
                  {invoice.toPhone && (
                    <div className={`input-validation-msg ${toPhoneValidation.valid ? 'success' : 'error'}`}>
                      {toPhoneValidation.valid ? (
                        <><CheckCircle2 size={13} /> Valid Customer Mobile Number(s)</>
                      ) : (
                        <><AlertCircle size={13} /> {toPhoneValidation.message}</>
                      )}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Customer Gmail (@gmail.com)</label>
                  <input
                    type="email"
                    className={`form-control ${toEmailValidation.message && !toEmailValidation.valid ? 'input-error-border' : (invoice.toEmail ? 'input-success-border' : '')}`}
                    value={invoice.toEmail || ''}
                    onChange={(e) => handleFieldChange('toEmail', e.target.value)}
                    placeholder="e.g. karthik@gmail.com"
                  />
                  <span className="field-helper-hint">Must end with @gmail.com</span>
                  {invoice.toEmail && (
                    <div className={`input-validation-msg ${toEmailValidation.valid ? 'success' : 'error'}`}>
                      {toEmailValidation.valid ? (
                        <><CheckCircle2 size={13} /> Valid Gmail Address</>
                      ) : (
                        <><AlertCircle size={13} /> {toEmailValidation.message}</>
                      )}
                    </div>
                  )}
                </div>
                <div className="form-group col-span-3">
                  <label>Customer Address / City</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoice.toAddress}
                    onChange={(e) => handleFieldChange('toAddress', e.target.value)}
                    placeholder="e.g. Mattuthavani, Madurai"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'payment' && (
          <div className="tab-pane">
            <div className="form-card">
              <h3 className="section-title">Payment Status & Visual Rubber Stamp</h3>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Payment Status</label>
                  <select
                    className="form-control font-semibold"
                    value={invoice.status}
                    onChange={(e) => handleFieldChange('status', e.target.value)}
                  >
                    <option value="Paid">🟢 PAID (Fully Settled)</option>
                    <option value="Pending">🟡 PENDING (Payment Due)</option>
                    <option value="Unpaid">🔴 UNPAID (Outstanding)</option>
                    <option value="None">⚪ No Stamp</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Payment Mode</label>
                  <select
                    className="form-control"
                    value={invoice.modeOfPayment}
                    onChange={(e) => handleFieldChange('modeOfPayment', e.target.value)}
                  >
                    <option value="Cash">Cash (In Hand)</option>
                    <option value="Online">Online (GPay / PhonePe / Paytm)</option>
                    <option value="Bank">Bank Transfer (NEFT/IMPS)</option>
                    <option value="UPI">UPI QR Scan</option>
                  </select>
                </div>
                <div className="form-group col-span-2">
                  <label className="checkbox-label stamp-toggle-card">
                    <input
                      type="checkbox"
                      checked={invoice.showStatusStamp}
                      onChange={(e) => handleFieldChange('showStatusStamp', e.target.checked)}
                    />
                    <span>
                      <strong>Show Official Rubber Stamp</strong> on the printed A4 invoice sheet
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'business' && (
          <div className="tab-pane">
            {onOpenSettings && (
              <div className="global-settings-banner">
                <div>
                  <strong>Need to update shop profile globally for all bills?</strong>
                  <p className="banner-subtext">Configure default shop name, bank account, UPI ID, logo & services in one place.</p>
                </div>
                <button
                  type="button"
                  className="btn-primary btn-sm"
                  onClick={onOpenSettings}
                >
                  <Building2 size={15} /> Open Global Settings
                </button>
              </div>
            )}
            <div className="form-card">
              <h3 className="section-title">Shop / Business Header Profile</h3>
              <div className="form-grid-2">
                <div className="form-group col-span-2">
                  <label>Business Name</label>
                  <input
                    type="text"
                    className="form-control font-bold"
                    value={invoice.fromName}
                    onChange={(e) => handleFieldChange('fromName', e.target.value)}
                  />
                </div>
                <div className="form-group col-span-2">
                  <label>Tagline / Services Provided</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoice.subtitle}
                    onChange={(e) => handleFieldChange('subtitle', e.target.value)}
                  />
                </div>
                <div className="form-group col-span-2">
                  <label>Shop Address</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoice.fromAddress}
                    onChange={(e) => handleFieldChange('fromAddress', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Shop Mobile Number (10 digits or +91)</label>
                  <input
                    type="text"
                    className={`form-control ${fromPhoneValidation.message && !fromPhoneValidation.valid ? 'input-error-border' : (invoice.fromPhone ? 'input-success-border' : '')}`}
                    value={invoice.fromPhone || ''}
                    onChange={(e) => handleFieldChange('fromPhone', sanitizeSinglePhoneInput(e.target.value))}
                    placeholder="e.g. 9940947047 or +91 9940947047"
                  />
                  <span className="field-helper-hint">10 digits or +91 followed by 10 digits</span>
                  {invoice.fromPhone && (
                    <div className={`input-validation-msg ${fromPhoneValidation.valid ? 'success' : 'error'}`}>
                      {fromPhoneValidation.valid ? (
                        <><CheckCircle2 size={13} /> Valid Shop Mobile Number</>
                      ) : (
                        <><AlertCircle size={13} /> {fromPhoneValidation.message}</>
                      )}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Shop Gmail Address (@gmail.com)</label>
                  <input
                    type="email"
                    className={`form-control ${fromEmailValidation.message && !fromEmailValidation.valid ? 'input-error-border' : (invoice.fromEmail ? 'input-success-border' : '')}`}
                    value={invoice.fromEmail || ''}
                    onChange={(e) => handleFieldChange('fromEmail', e.target.value)}
                    placeholder="e.g. arunaxerox113@gmail.com"
                  />
                  <span className="field-helper-hint">Must end with @gmail.com</span>
                  {invoice.fromEmail && (
                    <div className={`input-validation-msg ${fromEmailValidation.valid ? 'success' : 'error'}`}>
                      {fromEmailValidation.valid ? (
                        <><CheckCircle2 size={13} /> Valid Gmail Address</>
                      ) : (
                        <><AlertCircle size={13} /> {fromEmailValidation.message}</>
                      )}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>GSTIN (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoice.fromGst || ''}
                    onChange={(e) => handleFieldChange('fromGst', e.target.value)}
                    placeholder="Optional GST Number"
                  />
                </div>
                <div className="form-group">
                  <label>Signatory Designation</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoice.signatoryTitle || 'Authorized Signatory'}
                    onChange={(e) => handleFieldChange('signatoryTitle', e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="form-card">
              <h3 className="section-title">Shop Bank & UPI Details (வங்கி விவரங்கள்)</h3>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Bank Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoice.bankDetails?.bankName || ''}
                    onChange={(e) => handleBankChange('bankName', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Account Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoice.bankDetails?.accountNumber || ''}
                    onChange={(e) => handleBankChange('accountNumber', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>IFSC Code</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoice.bankDetails?.ifscCode || ''}
                    onChange={(e) => handleBankChange('ifscCode', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>UPI ID (QR Payment)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoice.bankDetails?.upiId || ''}
                    onChange={(e) => handleBankChange('upiId', e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="form-card services-manager-card">
              <div className="services-card-header">
                <div>
                  <h3 className="section-title">
                    <Sparkles size={16} color="#f59e0b" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                    Quick Add Popular Shop Services (விரைவுச் சேவைகள் & விலைகள்)
                  </h3>
                  <p className="services-card-subtitle">
                    Customize the 1-click popular service buttons shown at the top of the Line Items tab.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-reset-services"
                  onClick={handleResetServices}
                  title="Restore original shop presets"
                >
                  <RotateCcw size={13} /> Reset Defaults
                </button>
              </div>
              <div className="services-table-wrap">
                <table className="services-custom-table">
                  <thead>
                    <tr>
                      <th style={{ width: '38px', textAlign: 'center' }}>#</th>
                      <th>Service Name / Description</th>
                      <th style={{ width: '110px', textAlign: 'center' }}>Unit</th>
                      <th style={{ width: '100px', textAlign: 'right' }}>Rate (₹)</th>
                      <th style={{ width: '90px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {popularServices.map((srv, sIdx) => (
                      <tr key={sIdx}>
                        <td style={{ textAlign: 'center' }} className="text-muted font-bold">{sIdx + 1}</td>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            value={srv.description}
                            onChange={(e) => handleServiceChange(sIdx, 'description', e.target.value)}
                            placeholder="e.g. Document Lamination A4"
                          />
                        </td>
                        <td>
                          <select
                            className="form-control text-center select-compact"
                            value={srv.per || 'Nos.'}
                            onChange={(e) => handleServiceChange(sIdx, 'per', e.target.value)}
                          >
                            <option value="Copies">Copies</option>
                            <option value="Nos.">Nos.</option>
                            <option value="Set">Set</option>
                            <option value="Pcs">Pcs</option>
                            <option value="Pack">Pack</option>
                            <option value="Hours">Hours</option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            className="form-control text-right"
                            value={srv.unitPrice === 0 || srv.unitPrice === '0' || srv.unitPrice === '' ? '' : srv.unitPrice}
                            placeholder="0"
                            onChange={(e) => handleServiceChange(sIdx, 'unitPrice', e.target.value)}
                          />
                        </td>
                        <td className="action-cell center-cell">
                          <div className="btn-group-sm">
                            <button
                              type="button"
                              className="btn-icon"
                              disabled={sIdx === 0}
                              onClick={() => handleMoveService(sIdx, -1)}
                              title="Move Up"
                            >
                              <ArrowUp size={13} />
                            </button>
                            <button
                              type="button"
                              className="btn-icon"
                              disabled={sIdx === popularServices.length - 1}
                              onClick={() => handleMoveService(sIdx, 1)}
                              title="Move Down"
                            >
                              <ArrowDown size={13} />
                            </button>
                            <button
                              type="button"
                              className="btn-icon text-danger"
                              onClick={() => handleRemoveService(sIdx)}
                              title="Delete Service"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="services-card-footer">
                <button
                  type="button"
                  className="btn-add-service"
                  onClick={handleAddService}
                >
                  <Plus size={14} /> Add New Popular Service Preset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};