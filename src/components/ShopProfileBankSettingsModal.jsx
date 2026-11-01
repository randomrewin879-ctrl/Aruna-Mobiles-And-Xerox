import { useState } from 'react';
import { 
  Building2, Landmark, Sparkles, X, Save, 
  RotateCcw, Plus, Trash2, ArrowUp, ArrowDown, CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { 
  getBusinessProfile, 
  saveBusinessProfile, 
  resetBusinessProfile,
  getBankDetails, 
  saveBankDetails, 
  resetBankDetails,
  getPopularServices, 
  savePopularServices, 
  resetPopularServices,
  defaultOfficialLogo,
  defaultSeal
} from '../config/businessConfig';
import { googleSheetsSync } from '../services/googleSheetsSync';
import { 
  validateGmail, 
  validateSinglePhone, 
  sanitizeSinglePhoneInput 
} from '../utils/validators';
export const ShopProfileBankSettingsModal = ({ 
  isOpen, 
  onClose, 
  currentInvoice, 
  onUpdateCurrentInvoice, 
  onShowToast 
}) => {
  if (!isOpen) return null;
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(() => getBusinessProfile());
  const [bank, setBank] = useState(() => getBankDetails());
  const [services, setServices] = useState(() => getPopularServices());
  const [applyToCurrent, setApplyToCurrent] = useState(Boolean(currentInvoice));
  const [isSaving, setIsSaving] = useState(false);
  const fromPhoneValidation = validateSinglePhone(profile.fromPhone);
  const fromEmailValidation = validateGmail(profile.fromEmail);
  const handleProfileChange = (field, val) => {
    setProfile(prev => ({ ...prev, [field]: val }));
  };
  const handleBankChange = (field, val) => {
    setBank(prev => ({ ...prev, [field]: val }));
  };
  const handleServiceChange = (index, field, val) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: val };
    setServices(updated);
  };
  const handleAddService = () => {
    const newSvc = {
      description: 'New Shop Service',
      unitPrice: 10,
      per: 'Nos.',
      taxRate: 0
    };
    setServices([...services, newSvc]);
  };
  const handleRemoveService = (index) => {
    if (services.length <= 1) {
      alert('You must keep at least one popular service preset.');
      return;
    }
    setServices(services.filter((_, i) => i !== index));
  };
  const handleMoveService = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= services.length) return;
    const updated = [...services];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    setServices(updated);
  };
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      handleProfileChange('companyLogoBase64', event.target.result);
    };
    reader.readAsDataURL(file);
  };
  const handleSealUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      handleProfileChange('companySealBase64', event.target.result);
    };
    reader.readAsDataURL(file);
  };
  const handleResetProfile = () => {
    if (window.confirm('Reset Shop Profile back to Aruna Mobiles & Xerox defaults?')) {
      const reset = resetBusinessProfile();
      setProfile({ ...reset });
    }
  };
  const handleResetBank = () => {
    if (window.confirm('Reset Bank & UPI Details back to shop defaults?')) {
      const reset = resetBankDetails();
      setBank({ ...reset });
    }
  };
  const handleResetServices = () => {
    if (window.confirm('Reset Popular Services presets back to shop defaults?')) {
      const reset = resetPopularServices();
      setServices([...reset]);
    }
  };
  const handleSaveAll = async () => {
    if (!fromPhoneValidation.valid) {
      setActiveTab('profile');
      alert(`Shop Mobile Number Error:\n${fromPhoneValidation.message}`);
      return;
    }
    if (!fromEmailValidation.valid) {
      setActiveTab('profile');
      alert(`Shop Gmail Address Error:\n${fromEmailValidation.message}`);
      return;
    }
    setIsSaving(true);
    try {
      saveBusinessProfile(profile);
      saveBankDetails(bank);
      savePopularServices(services);
      if (applyToCurrent && currentInvoice && onUpdateCurrentInvoice) {
        onUpdateCurrentInvoice({
          ...currentInvoice,
          fromName: profile.fromName,
          subtitle: profile.subtitle,
          fromAddress: profile.fromAddress,
          fromPhone: profile.fromPhone,
          fromEmail: profile.fromEmail,
          fromGst: profile.fromGst,
          companyLogoBase64: profile.companyLogoBase64,
          signatoryTitle: profile.signatoryTitle,
          showBankDetails: bank.showBankDetails !== false,
          bankDetails: {
            bankName: bank.bankName,
            accountNumber: bank.accountNumber,
            ifscCode: bank.ifscCode,
            upiId: bank.upiId
          }
        });
      }
      if (googleSheetsSync.isConfigured()) {
        await googleSheetsSync.syncShopProfile(profile, bank);
        await googleSheetsSync.syncPopularServices(services);
      }
      if (onShowToast) {
        onShowToast('Shop Profile, Bank & Services saved successfully! ✓');
      }
      onClose();
    } catch (err) {
      console.error('Error saving shop profile settings:', err);
      alert('Failed to save settings: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className="settings-modal-backdrop" onClick={onClose}>
      <div className="settings-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="settings-modal-header">
          <div className="modal-title-wrap">
            <div className="modal-title-icon">
              <Building2 size={22} color="#1e3a8a" />
            </div>
            <div>
              <h2 className="modal-title-text">Shop Profile & Bank Settings</h2>
              <p className="modal-subtitle-text">கடை விவரங்கள் மற்றும் வங்கி & UPI கணக்கு அமைப்புகள்</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} title="Close Settings">
            <X size={20} />
          </button>
        </div>
        <div className="settings-modal-tabs">
          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <Building2 size={16} /> <span>Shop Profile</span>
          </button>
          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'bank' ? 'active' : ''}`}
            onClick={() => setActiveTab('bank')}
          >
            <Landmark size={16} /> <span>Bank & UPI Details</span>
          </button>
          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            <Sparkles size={16} /> <span>Popular Services ({services.length})</span>
          </button>
        </div>
        <div className="settings-modal-body">
          {activeTab === 'profile' && (
            <div className="settings-pane-content">
              <div className="settings-section-heading">
                <div>
                  <h3>Business Header & Identity</h3>
                  <p className="section-hint">கடை பெயர், முகவரி, முத்திரை & லோகோ அமைப்புகள்</p>
                </div>
                <div className="heading-actions">
                  <button type="button" className="btn-text-subtle" onClick={handleResetProfile}>
                    <RotateCcw size={14} /> Reset Defaults
                  </button>
                </div>
              </div>
              <div className="shop-logo-settings-card">
                <div className="logo-preview-box">
                  <img 
                    src={profile.companyLogoBase64 || defaultOfficialLogo} 
                    alt="Aruna Xerox Logo" 
                    className="settings-logo-img"
                    draggable="false"
                  />
                </div>
                <div className="logo-settings-info">
                  <h4 className="logo-card-title">Official Circular Logo</h4>
                  <p className="logo-card-desc">
                    Displayed on the login portal, app navigation bar, and printed on every A4 cash bill invoice.
                  </p>
                  <div className="logo-btn-row">
                    <label className="btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                      Change Logo
                      <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                    </label>
                    <button 
                      type="button" 
                      className="btn-text-subtle btn-sm" 
                      onClick={() => handleProfileChange('companyLogoBase64', defaultOfficialLogo)}
                    >
                      Use Official Yellow Logo
                    </button>
                  </div>
                </div>
              </div>
              <div className="shop-logo-settings-card shop-seal-settings-card">
                <div className="logo-preview-box seal-preview-box">
                  <img 
                    src={profile.companySealBase64 || defaultSeal} 
                    alt="Aruna Xerox Official Stamp" 
                    className="settings-seal-img"
                    draggable="false"
                  />
                </div>
                <div className="logo-settings-info">
                  <h4 className="logo-card-title">Official Rubber Stamp (அதிகாரப்பூர்வ முத்திரை)</h4>
                  <p className="logo-card-desc">
                    Printed in deep blue above the Authorized Signatory line with sharp, clearly readable PH: 9940947047.
                  </p>
                  <div className="logo-btn-row">
                    <label className="btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                      Change Stamp
                      <input type="file" accept="image/*" onChange={handleSealUpload} style={{ display: 'none' }} />
                    </label>
                    <button 
                      type="button" 
                      className="btn-text-subtle btn-sm" 
                      onClick={() => handleProfileChange('companySealBase64', defaultSeal)}
                    >
                      Use Crisp Official Stamp
                    </button>
                  </div>
                </div>
              </div>
              <div className="form-grid-2">
                <div className="form-group col-span-2">
                  <label className="field-label">Shop / Business Name (கடை பெயர்)</label>
                  <input
                    type="text"
                    className="form-control font-bold"
                    value={profile.fromName || ''}
                    onChange={(e) => handleProfileChange('fromName', e.target.value)}
                    placeholder="e.g. ARUNA MOBILES & XEROX"
                  />
                </div>
                <div className="form-group col-span-2">
                  <label className="field-label">Subtitle / Key Services (சேவைகள் சுருக்கம்)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profile.subtitle || ''}
                    onChange={(e) => handleProfileChange('subtitle', e.target.value)}
                    placeholder="e.g. Colour Printout, SIM Card, Lamination, Passport Size Photo"
                  />
                </div>
                <div className="form-group col-span-2">
                  <label className="field-label">Shop Address (கடை முகவரி)</label>
                  <textarea
                    rows={2}
                    className="form-control"
                    value={profile.fromAddress || ''}
                    onChange={(e) => handleProfileChange('fromAddress', e.target.value)}
                    placeholder="e.g. Shop No. 113, Mattuthavani Bus Stand, Madurai - 625007"
                  />
                </div>
                <div className="form-group">
                  <label className="field-label">Primary Mobile / WhatsApp No. (10 digits or +91)</label>
                  <input
                    type="text"
                    className={`form-control ${fromPhoneValidation.message && !fromPhoneValidation.valid ? 'input-error-border' : (profile.fromPhone ? 'input-success-border' : '')}`}
                    value={profile.fromPhone || ''}
                    onChange={(e) => handleProfileChange('fromPhone', sanitizeSinglePhoneInput(e.target.value))}
                    placeholder="e.g. 9940947047 or +91 9940947047"
                  />
                  <span className="field-helper-hint">10 digits or +91 followed by 10 digits</span>
                  {profile.fromPhone && (
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
                  <label className="field-label">Shop Gmail Address (மின்னஞ்சல்)</label>
                  <input
                    type="email"
                    className={`form-control ${fromEmailValidation.message && !fromEmailValidation.valid ? 'input-error-border' : (profile.fromEmail ? 'input-success-border' : '')}`}
                    value={profile.fromEmail || ''}
                    onChange={(e) => handleProfileChange('fromEmail', e.target.value)}
                    placeholder="e.g. arunaxerox113@gmail.com"
                  />
                  <span className="field-helper-hint">Must end with @gmail.com</span>
                  {profile.fromEmail && (
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
                  <label className="field-label">GSTIN (Optional / விருப்பப்பட்டால்)</label>
                  <input
                    type="text"
                    className="form-control uppercase"
                    value={profile.fromGst || ''}
                    onChange={(e) => handleProfileChange('fromGst', e.target.value)}
                    placeholder="e.g. 33AAAAA0000A1Z5"
                  />
                </div>
                <div className="form-group">
                  <label className="field-label">Authorized Signatory Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profile.signatoryTitle || ''}
                    onChange={(e) => handleProfileChange('signatoryTitle', e.target.value)}
                    placeholder="e.g. Authorized Signatory"
                  />
                </div>
              </div>
            </div>
          )}
          {activeTab === 'bank' && (
            <div className="settings-pane-content">
              <div className="settings-section-heading">
                <div>
                  <h3>Bank Account & UPI Details</h3>
                  <p className="section-hint">வங்கி கணக்கு மற்றும் UPI QR விவரங்கள்</p>
                </div>
                <div className="heading-actions">
                  <button type="button" className="btn-text-subtle" onClick={handleResetBank}>
                    <RotateCcw size={14} /> Reset Defaults
                  </button>
                </div>
              </div>
              <div className="bank-toggle-banner">
                <div className="bank-toggle-text">
                  <h4 className="toggle-heading">Enable Bank & UPI Details on Invoices</h4>
                  <p className="toggle-desc">
                    When enabled, Bank Name, A/C No, IFSC, and UPI ID appear on generated invoices & downloaded PDFs.
                  </p>
                </div>
                <label className="switch-toggle">
                  <input
                    type="checkbox"
                    checked={bank.showBankDetails !== false}
                    onChange={(e) => handleBankChange('showBankDetails', e.target.checked)}
                  />
                  <span className="slider-round"></span>
                </label>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="field-label">Bank Name (வங்கி பெயர்)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={bank.bankName || ''}
                    onChange={(e) => handleBankChange('bankName', e.target.value)}
                    placeholder="e.g. State Bank of India"
                  />
                </div>
                <div className="form-group">
                  <label className="field-label">Account Number (வங்கி கணக்கு எண்)</label>
                  <input
                    type="text"
                    className="form-control font-mono"
                    value={bank.accountNumber || ''}
                    onChange={(e) => handleBankChange('accountNumber', e.target.value)}
                    placeholder="e.g. 38920194820"
                  />
                </div>
                <div className="form-group">
                  <label className="field-label">IFSC Code (வங்கி IFSC குறியீடு)</label>
                  <input
                    type="text"
                    className="form-control font-mono uppercase"
                    value={bank.ifscCode || ''}
                    onChange={(e) => handleBankChange('ifscCode', e.target.value)}
                    placeholder="e.g. SBIN0004521"
                  />
                </div>
                <div className="form-group">
                  <label className="field-label">UPI ID / GPay / PhonePe (UPI முகவரி)</label>
                  <input
                    type="text"
                    className="form-control font-mono"
                    value={bank.upiId || ''}
                    onChange={(e) => handleBankChange('upiId', e.target.value)}
                    placeholder="e.g. 9940947047@upi"
                  />
                </div>
              </div>
              <div className="bank-preview-card">
                <div className="preview-card-header">
                  <Landmark size={15} color="#1e3a8a" />
                  <strong>BANK & PAYMENT DETAILS (வங்கி விபரம்):</strong>
                </div>
                <div className="preview-card-grid">
                  <div><span className="text-muted">Bank:</span> <strong>{bank.bankName || 'State Bank of India'}</strong></div>
                  <div><span className="text-muted">A/C No:</span> <strong className="font-mono">{bank.accountNumber || '38920194820'}</strong></div>
                  <div><span className="text-muted">IFSC:</span> <strong className="font-mono">{bank.ifscCode || 'SBIN0004521'}</strong></div>
                  <div><span className="text-muted">UPI ID:</span> <strong className="font-mono text-primary">{bank.upiId || '9940947047@upi'}</strong></div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'services' && (
            <div className="settings-pane-content">
              <div className="settings-section-heading">
                <div>
                  <h3>Quick Add Popular Shop Services (விரைவு சேவைகள்)</h3>
                  <p className="section-hint">Click "+ Add Service" to add or customize service presets with rates.</p>
                </div>
                <div className="heading-actions">
                  <button type="button" className="btn-text-subtle" onClick={handleResetServices}>
                    <RotateCcw size={14} /> Reset
                  </button>
                  <button type="button" className="btn-secondary btn-sm" onClick={handleAddService}>
                    <Plus size={14} /> Add Service
                  </button>
                </div>
              </div>
              <div className="services-editor-table-wrap">
                <table className="settings-services-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                      <th>Service Name / Description</th>
                      <th style={{ width: '100px', textAlign: 'center' }}>Unit</th>
                      <th style={{ width: '110px', textAlign: 'right' }}>Rate (₹)</th>
                      <th style={{ width: '90px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((svc, idx) => (
                      <tr key={idx}>
                        <td className="center-cell font-mono text-muted">{idx + 1}</td>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={svc.description || ''}
                            onChange={(e) => handleServiceChange(idx, 'description', e.target.value)}
                            placeholder="Service Name"
                          />
                        </td>
                        <td>
                          <select
                            className="form-control form-control-sm"
                            value={svc.per || 'Nos.'}
                            onChange={(e) => handleServiceChange(idx, 'per', e.target.value)}
                          >
                            <option value="Copies">Copies</option>
                            <option value="Nos.">Nos.</option>
                            <option value="Set">Set</option>
                            <option value="Hours">Hours</option>
                            <option value="Pages">Pages</option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            className="form-control form-control-sm text-right font-mono"
                            value={svc.unitPrice === 0 || svc.unitPrice === '0' || svc.unitPrice === '' ? '' : svc.unitPrice}
                            onChange={(e) => handleServiceChange(idx, 'unitPrice', e.target.value)}
                            placeholder="0"
                          />
                        </td>
                        <td className="center-cell">
                          <div className="svc-actions-row">
                            <button
                              type="button"
                              className="btn-icon-subtle"
                              onClick={() => handleMoveService(idx, -1)}
                              disabled={idx === 0}
                              title="Move Up"
                            >
                              <ArrowUp size={13} />
                            </button>
                            <button
                              type="button"
                              className="btn-icon-subtle"
                              onClick={() => handleMoveService(idx, 1)}
                              disabled={idx === services.length - 1}
                              title="Move Down"
                            >
                              <ArrowDown size={13} />
                            </button>
                            <button
                              type="button"
                              className="btn-icon-danger"
                              onClick={() => handleRemoveService(idx)}
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
            </div>
          )}
        </div>
        <div className="settings-modal-footer">
          <div className="footer-left">
            {currentInvoice && (
              <label className="checkbox-label" title="Also apply these settings to the invoice currently open in editor">
                <input
                  type="checkbox"
                  checked={applyToCurrent}
                  onChange={(e) => setApplyToCurrent(e.target.checked)}
                />
                <span>Also update currently open invoice ({currentInvoice.invoiceNumber})</span>
              </label>
            )}
          </div>
          <div className="footer-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            <button type="button" className="btn-primary" onClick={handleSaveAll} disabled={isSaving}>
              <Save size={16} /> <span>{isSaving ? 'Saving...' : 'Save Settings & Sync'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};