import { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Download, 
  Plus, Eye, Edit3, Columns, ZoomIn, ZoomOut, Maximize2,
  UserCheck, LogOut, Building2} from 'lucide-react';
import { invoiceStore, createBlankInvoice } from '../services/invoiceStore';
import { defaultOfficialLogo } from '../config/businessConfig';
import { exportInvoiceToPdf } from '../services/pdfGenerator';
import { googleSheetsSync } from '../services/googleSheetsSync';
import { InvoiceList } from './InvoiceList';
import { InvoiceEditor } from './InvoiceEditor';
import { InvoiceDocumentPages } from './InvoiceDocumentPages';
import { ShopProfileBankSettingsModal } from './ShopProfileBankSettingsModal';
import '../styles/InvoiceGenerator.css';
export const InvoiceGenerator = ({ currentUser, onLogout }) => {
  const [invoices, setInvoices] = useState([]);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [layoutMode, setLayoutMode] = useState('split');
  const [, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [scale, setScale] = useState(1);
  const [manualZoomOffset, setManualZoomOffset] = useState(0); 
  const [previewContentHeight, setPreviewContentHeight] = useState(1123);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const viewportRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const hiddenExportRef = useRef(null);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  useEffect(() => {
    loadInvoices();
  }, []);
  const loadInvoices = () => {
    const list = invoiceStore.getAll();
    setInvoices(list);
  };
  useEffect(() => {
    if (viewMode !== 'editor') return;
    const computeScale = () => {
      if (!viewportRef.current) return;
      const containerWidth = viewportRef.current.clientWidth;
      const padding = window.innerWidth < 768 ? 16 : 32;
      const availableWidth = Math.max(200, containerWidth - padding);
      const standardA4Width = 794;
      const fitScale = availableWidth / standardA4Width;
      const finalScale = Math.min(1.5, Math.max(0.18, fitScale + manualZoomOffset));
      setScale(finalScale);
      if (previewCanvasRef.current) {
        setPreviewContentHeight(previewCanvasRef.current.scrollHeight || 1123);
      }
    };
    computeScale();
    const t1 = setTimeout(computeScale, 50);
    const t2 = setTimeout(computeScale, 200);
    const observer = new ResizeObserver(computeScale);
    if (viewportRef.current) observer.observe(viewportRef.current);
    if (previewCanvasRef.current) observer.observe(previewCanvasRef.current);
    window.addEventListener('resize', computeScale);
    window.addEventListener('orientationchange', computeScale);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      observer.disconnect();
      window.removeEventListener('resize', computeScale);
      window.removeEventListener('orientationchange', computeScale);
    };
  }, [viewMode, layoutMode, manualZoomOffset, currentInvoice]);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };
  const handleCreateNew = () => {
    const newInv = createBlankInvoice(invoices);
    setCurrentInvoice(newInv);
    setViewMode('editor');
    setManualZoomOffset(0);
  };
  const handleSelectInvoice = (inv) => {
    setCurrentInvoice(JSON.parse(JSON.stringify(inv)));
    setViewMode('editor');
    setManualZoomOffset(0);
  };
  const handleSaveInvoice = async () => {
    if (!currentInvoice) return;
    const saved = invoiceStore.save(currentInvoice);
    loadInvoices();
    setCurrentInvoice(saved);
    showToast('Invoice saved successfully! ✓');
    if (googleSheetsSync.isConfigured()) {
      googleSheetsSync.saveInvoice(saved);
    }
  };
  const handleDuplicate = (id) => {
    const cloned = invoiceStore.duplicate(id);
    if (cloned) {
      loadInvoices();
      showToast(`Cloned as ${cloned.invoiceNumber} ✓`);
      if (googleSheetsSync.isConfigured()) {
        googleSheetsSync.saveInvoice(cloned);
      }
    }
  };
  const handleUpdateStatus = (id, newStatus) => {
    const inv = invoices.find(i => i.id === id);
    if (!inv) return;
    const updated = {
      ...inv,
      status: newStatus,
      updatedAt: new Date().toISOString()
    };
    invoiceStore.save(updated);
    loadInvoices();
    if (currentInvoice && currentInvoice.id === id) {
      setCurrentInvoice(updated);
    }
    showToast(`Bill ${updated.invoiceNumber} status updated to ${newStatus.toUpperCase()}! ✓`);
    if (googleSheetsSync.isConfigured()) {
      googleSheetsSync.saveInvoice(updated);
    }
  };
  const handleDelete = (id) => {
    const invToDelete = invoices.find(i => i.id === id);
    const updated = invoiceStore.delete(id);
    setInvoices(updated);
    if (currentInvoice && currentInvoice.id === id) {
      setCurrentInvoice(null);
      setViewMode('list');
    }
    showToast('Invoice deleted.');
    if (googleSheetsSync.isConfigured() && invToDelete) {
      googleSheetsSync.deleteInvoice(invToDelete.invoiceNumber);
    }
  };
  const [hiddenExportInvoice, setHiddenExportInvoice] = useState(null);
  const handleDirectExport = async (inv) => {
    setHiddenExportInvoice(inv);
    setIsExporting(true);
    setTimeout(async () => {
      try {
        if (hiddenExportRef.current) {
          await exportInvoiceToPdf(hiddenExportRef.current, inv.invoiceNumber);
          showToast(`Exported ${inv.invoiceNumber}.pdf! ✓`);
        }
      } catch (err) {
        console.error('PDF export error:', err);
        alert('Failed to generate PDF.');
      } finally {
        setIsExporting(false);
        setHiddenExportInvoice(null);
      }
    }, 200);
  };
  const handleExportCurrent = async () => {
    if (!previewCanvasRef.current || !currentInvoice) return;
    setIsExporting(true);
    try {
      await exportInvoiceToPdf(previewCanvasRef.current, currentInvoice.invoiceNumber);
      showToast(`Downloaded ${currentInvoice.invoiceNumber}.pdf! ✓`);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Failed to generate PDF.');
    } finally {
      setIsExporting(false);
    }
  };
  return (
    <div className="invoice-app-wrapper">
      {toastMessage && (
        <div className="toast-notification">
          {toastMessage}
        </div>
      )}
      <header className="app-navbar no-print">
        <div className="nav-left">
          <div className="shop-badge">
            <img 
              src={defaultOfficialLogo} 
              alt="Aruna Xerox Logo" 
              className="shop-logo-img" 
              draggable="false"
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
            />
            <div className="shop-brand-text">
              <span className="brand-name">ARUNA MOBILES & XEROX</span>
              <span className="brand-sub">Madurai Mattuthavani Bus Stand • Billing Suite</span>
            </div>
          </div>
        </div>
        <div className="nav-center desktop-only-switcher">
          {viewMode === 'editor' && currentInvoice && (
            <div className="editor-view-switcher">
              <button
                type="button"
                className={`switcher-pill ${layoutMode === 'split' ? 'active' : ''}`}
                onClick={() => setLayoutMode('split')}
                title="Side-by-Side Split View"
              >
                <Columns size={14} /> Split View
              </button>
              <button
                type="button"
                className={`switcher-pill ${layoutMode === 'form' ? 'active' : ''}`}
                onClick={() => setLayoutMode('form')}
                title="Full Width Editor Form"
              >
                <Edit3 size={14} /> Edit Form
              </button>
              <button
                type="button"
                className={`switcher-pill ${layoutMode === 'preview' ? 'active' : ''}`}
                onClick={() => setLayoutMode('preview')}
                title="Full Width A4 Document Preview"
              >
                <Eye size={14} /> Live Preview
              </button>
            </div>
          )}
        </div>
        <div className="nav-right">
          <button 
            type="button"
            className="btn-header-secondary btn-settings-nav" 
            onClick={() => setIsSettingsOpen(true)}
            title="Shop Profile & Bank Settings (கடை மற்றும் வங்கி விபரம்)"
          >
            <Building2 size={16} /> <span className="btn-text-responsive">Shop Profile & Bank</span>
          </button>
          {viewMode === 'editor' ? (
            <>
              <button 
                className="btn-header-secondary" 
                onClick={() => setViewMode('list')}
                title="Back to Invoices Ledger"
              >
                <ArrowLeft size={16} /> <span className="btn-text-responsive">Ledger</span>
              </button>
              <button 
                className="btn-header-primary" 
                onClick={handleExportCurrent}
                disabled={isExporting}
                title="Download Crisp A4 PDF"
              >
                <Download size={16} /> <span className="btn-text-responsive">{isExporting ? 'Exporting...' : 'PDF'}</span>
              </button>
            </>
          ) : (
            <>
              <button 
                className="btn-header-primary" 
                onClick={handleCreateNew}
              >
                <Plus size={16} /> <span className="btn-text-responsive">New Invoice</span>
              </button>
            </>
          )}
          {currentUser && (
            <div className="user-nav-badge" title={`Authorized Administrator: ${currentUser.email}`}>
              <UserCheck size={14} className="user-badge-icon" />
              <span className="user-email-text">{currentUser.email}</span>
            </div>
          )}
          {onLogout && (
            <button
              type="button"
              className="btn-header-subtle btn-logout"
              onClick={onLogout}
              title="Sign Out of Billing Suite"
            >
              <LogOut size={15} /> <span className="btn-text-responsive">Logout</span>
            </button>
          )}
        </div>
      </header>
      {viewMode === 'editor' && currentInvoice && (
        <div className="mobile-view-mode-bar no-print">
          <button
            type="button"
            className={`mobile-mode-tab ${layoutMode === 'split' ? 'active' : ''}`}
            onClick={() => setLayoutMode('split')}
            title="Split: Editor + Live A4 Preview"
          >
            <Columns size={15} /> <span>Split View</span>
          </button>
          <button
            type="button"
            className={`mobile-mode-tab ${layoutMode === 'form' ? 'active' : ''}`}
            onClick={() => setLayoutMode('form')}
            title="Edit Form"
          >
            <Edit3 size={15} /> <span>Edit Form</span>
          </button>
          <button
            type="button"
            className={`mobile-mode-tab ${layoutMode === 'preview' ? 'active' : ''}`}
            onClick={() => setLayoutMode('preview')}
            title="Live A4 Preview"
          >
            <Eye size={15} /> <span>Live Preview</span>
          </button>
        </div>
      )}
      <main className="app-main-content">
        {viewMode === 'list' ? (
          <InvoiceList
            invoices={invoices}
            onSelectInvoice={handleSelectInvoice}
            onNewInvoice={handleCreateNew}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onDirectExport={handleDirectExport}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onUpdateStatus={handleUpdateStatus}
          />
        ) : (
          <div className={`split-workspace-view mode-${layoutMode}`}>
            {(layoutMode === 'split' || layoutMode === 'form') && (
              <div className={`workspace-editor-side no-print ${layoutMode === 'form' ? 'full-width' : ''}`}>
                <InvoiceEditor
                  invoice={currentInvoice}
                  onChange={setCurrentInvoice}
                  onSave={handleSaveInvoice}
                  onCancel={() => setViewMode('list')}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                />
              </div>
            )}
            {(layoutMode === 'split' || layoutMode === 'preview') && (
              <div className={`workspace-preview-side ${layoutMode === 'preview' ? 'full-width' : ''}`}>
                <div className="preview-toolbar no-print">
                  <div className="preview-title">
                    <Eye size={16} /> <span>Live A4 Preview</span>
                  </div>
                  <div className="preview-zoom-controls">
                    <button
                      type="button"
                      className="zoom-btn"
                      onClick={() => setManualZoomOffset(prev => Math.max(-0.4, prev - 0.1))}
                      title="Zoom Out"
                    >
                      <ZoomOut size={14} />
                    </button>
                    <span className="zoom-percentage-pill" title="Current Render Scale">
                      {Math.round(scale * 100)}%
                    </span>
                    <button
                      type="button"
                      className="zoom-btn"
                      onClick={() => setManualZoomOffset(prev => Math.min(0.4, prev + 0.1))}
                      title="Zoom In"
                    >
                      <ZoomIn size={14} />
                    </button>
                    <button
                      type="button"
                      className="zoom-btn text-btn"
                      onClick={() => setManualZoomOffset(0)}
                      title="Auto-Fit to Screen"
                    >
                      <Maximize2 size={13} /> Fit
                    </button>
                  </div>
                </div>
                <div ref={viewportRef} className="preview-scroll-viewport">
                  <div
                    className="preview-scaled-box"
                    style={{
                      width: `${Math.round(794 * scale)}px`,
                      minHeight: `${Math.round(previewContentHeight * scale)}px`,
                      margin: '0 auto',
                      position: 'relative'
                    }}
                  >
                    <div
                      className="preview-scaled-inner"
                      style={{
                        width: '794px',
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                        position: 'absolute',
                        top: 0,
                        left: 0
                      }}
                    >
                      <div ref={previewCanvasRef} className="preview-canvas-container">
                        <InvoiceDocumentPages invoice={currentInvoice} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      {hiddenExportInvoice && (
        <div 
          ref={hiddenExportRef} 
          style={{ 
            position: 'absolute', 
            top: '-9999px', 
            left: '-9999px', 
            width: '794px',
            backgroundColor: '#ffffff'
          }}
        >
          <InvoiceDocumentPages invoice={hiddenExportInvoice} />
        </div>
      )}
      <ShopProfileBankSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentInvoice={currentInvoice}
        onUpdateCurrentInvoice={setCurrentInvoice}
        onShowToast={showToast}
      />
    </div>
  );
};