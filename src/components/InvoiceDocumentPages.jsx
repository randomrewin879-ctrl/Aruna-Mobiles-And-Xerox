import { calculateInvoiceTotals } from '../utils/financials';
import { numberToWords, formatCurrency } from '../utils/numberToWords';
export const InvoiceDocumentPages = ({ invoice }) => {
  if (!invoice) return null;
  const totals = calculateInvoiceTotals(invoice);
  const items = invoice.items || [];
  const ROWS_PER_PAGE = 13;
  const chunkItems = () => {
    if (items.length === 0) {
      return [[]];
    }
    const chunks = [];
    for (let i = 0; i < items.length; i += ROWS_PER_PAGE) {
      chunks.push(items.slice(i, i + ROWS_PER_PAGE));
    }
    return chunks;
  };
  const pages = chunkItems();
  const totalPages = pages.length;
  const renderDescription = (text) => {
    if (!text) return '-';
    const parts = text.split(/(\([^)]+\))/g);
    return parts.map((part, index) => {
      if (part.startsWith('(') && part.endsWith(')')) {
        return (
          <span key={index} className="item-subtext">
            {' '}{part}{' '}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };
  return (
    <div className="invoice-document-root">
      {pages.map((pageItems, pageIndex) => {
        const isLastPage = pageIndex === totalPages - 1;
        const pageNumber = pageIndex + 1;
        const startIndex = pageIndex * ROWS_PER_PAGE;
        const fillerCount = Math.max(0, ROWS_PER_PAGE - pageItems.length);
        return (
          <div key={pageIndex} className="invoice-page-sheet" data-page={pageNumber}>
            <div className="invoice-frame-box">
              <header className="sheet-header">
                <div className="header-logo-wrap">
                  {invoice.companyLogoBase64 && (
                    <img
                      src={invoice.companyLogoBase64}
                      alt="Aruna Xerox Logo"
                      className="header-aruna-logo"
                      draggable="false"
                      onContextMenu={(e) => e.preventDefault()}
                      onDragStart={(e) => e.preventDefault()}
                    />
                  )}
                </div>
                <div className="header-brand-center">
                  <h1 className="company-title">{invoice.fromName || 'ARUNA MOBILES & XEROX'}</h1>
                  {invoice.subtitle && (
                    <p className="company-services">{invoice.subtitle}</p>
                  )}
                  <p className="company-address">{invoice.fromAddress}</p>
                  <div className="company-contacts">
                    {invoice.fromPhone && <span><strong>PH:</strong> {invoice.fromPhone}</span>}
                    {invoice.fromEmail && <span><strong>Email:</strong> {invoice.fromEmail}</span>}
                    {invoice.fromGst && <span><strong>GSTIN:</strong> {invoice.fromGst}</span>}
                  </div>
                </div>
                <div className="header-meta-badge">
                  <div className="bill-type-tag">CASH / CREDIT BILL</div>
                  <div className="inv-meta-grid">
                    <div className="meta-row">
                      <span className="lbl">Bill No:</span>
                      <span className="val bold-val">{invoice.invoiceNumber}</span>
                    </div>
                    <div className="meta-row">
                      <span className="lbl">Date:</span>
                      <span className="val">{invoice.date}</span>
                    </div>
                    <div className="meta-row">
                      <span className="lbl">Payment:</span>
                      <span className="val mode-pill">{invoice.modeOfPayment || 'Cash'}</span>
                    </div>
                  </div>
                </div>
              </header>
              <section className="client-meta-box">
                <div className="client-col">
                  <div className="box-title-row">
                    <span className="box-title">TO / BUYER DETAILS (பெறுநர்):</span>
                  </div>
                  <div className="client-name">
                    {invoice.billReceiverTitle ? `${invoice.billReceiverTitle} ` : 'M/s. '}
                    {invoice.toName || 'Cash Customer'}
                  </div>
                  {invoice.toPhone && <div className="client-row"><strong>Ph:</strong> {invoice.toPhone}</div>}
                  {invoice.toAddress && <div className="client-row"><strong>Address:</strong> {invoice.toAddress}</div>}
                  {invoice.toEmail && <div className="client-row"><strong>Email:</strong> {invoice.toEmail}</div>}
                </div>
                <div className="stamp-col">
                  {invoice.showStatusStamp && invoice.status && invoice.status !== 'None' && (
                    <div className={`rubber-stamp stamp-${invoice.status.toLowerCase()}`}>
                      <div className="stamp-inner">{invoice.status.toUpperCase()}</div>
                    </div>
                  )}
                </div>
              </section>
              <section className="items-table-section">
                <table className="doc-items-table">
                  <thead>
                    <tr>
                      <th style={{ width: '42px', textAlign: 'center' }}>
                        <div>S.No</div>
                        <div className="th-tamil">எண்</div>
                      </th>
                      <th style={{ textAlign: 'center' }}>
                        <div>PARTICULARS OF GOODS / SERVICES</div>
                        <div className="th-tamil">பொருட்களின் விபரம்</div>
                      </th>
                      <th style={{ width: '80px', textAlign: 'center' }}>
                        <div>Qty</div>
                        <div className="th-tamil">எண்ணிக்கை</div>
                      </th>
                      <th style={{ width: '60px', textAlign: 'center' }}>
                        <div>Per</div>
                        <div className="th-tamil">அளவு</div>
                      </th>
                      <th style={{ width: '85px', textAlign: 'right' }}>
                        <div>Rate (₹)</div>
                        <div className="th-tamil">விலை</div>
                      </th>
                      <th style={{ width: '100px', textAlign: 'right' }}>
                        <div>Amount (₹)</div>
                        <div className="th-tamil">தொகை</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((item, idx) => {
                      const rowNumber = startIndex + idx + 1;
                      const qty = parseFloat(item.quantity) || 0;
                      const rate = parseFloat(item.unitPrice) || 0;
                      const amount = (qty * rate).toFixed(2);
                      return (
                        <tr key={item.id || idx}>
                          <td style={{ textAlign: 'center' }} className="sn-cell">{rowNumber}</td>
                          <td className="desc-cell">{renderDescription(item.description)}</td>
                          <td style={{ textAlign: 'center' }} className="num-cell">{qty}</td>
                          <td style={{ textAlign: 'center' }} className="per-cell">{item.per || 'Nos.'}</td>
                          <td style={{ textAlign: 'right' }} className="num-cell">{rate.toFixed(2)}</td>
                          <td style={{ textAlign: 'right' }} className="amount-cell">{amount}</td>
                        </tr>
                      );
                    })}
                    {Array.from({ length: fillerCount }).map((_, fIdx) => {
                      const rowNumber = startIndex + pageItems.length + fIdx + 1;
                      return (
                        <tr key={`filler-${fIdx}`} className="filler-row">
                          <td style={{ textAlign: 'center' }} className="sn-cell filler-sn">{rowNumber}</td>
                          <td className="desc-cell">&nbsp;</td>
                          <td className="num-cell">&nbsp;</td>
                          <td className="per-cell">&nbsp;</td>
                          <td className="num-cell">&nbsp;</td>
                          <td className="amount-cell">&nbsp;</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    {totals.discountAmount > 0 && isLastPage && (
                      <tr className="table-subtotal-row">
                        <td colSpan={5} className="table-calc-label">
                          Subtotal (கூட்டுத்தொகை):
                        </td>
                        <td className="table-calc-val">
                          {formatCurrency(totals.subtotal)}
                        </td>
                      </tr>
                    )}
                    {totals.discountAmount > 0 && isLastPage && (
                      <tr className="table-discount-row">
                        <td colSpan={5} className="table-calc-label">
                          Special Discount (தள்ளுபடி):
                        </td>
                        <td className="table-calc-val discount-val">
                          - {formatCurrency(totals.discountAmount)}
                        </td>
                      </tr>
                    )}
                    {totals.cgst > 0 && isLastPage && (
                      <tr className="table-tax-row">
                        <td colSpan={5} className="table-calc-label">
                          CGST:
                        </td>
                        <td className="table-calc-val">
                          {formatCurrency(totals.cgst)}
                        </td>
                      </tr>
                    )}
                    {totals.sgst > 0 && isLastPage && (
                      <tr className="table-tax-row">
                        <td colSpan={5} className="table-calc-label">
                          SGST:
                        </td>
                        <td className="table-calc-val">
                          {formatCurrency(totals.sgst)}
                        </td>
                      </tr>
                    )}
                    <tr className="table-total-row">
                      <td colSpan={5} className="table-total-label">
                        <div className="total-label-flex">
                          <span className="total-en">{isLastPage ? 'TOTAL' : `PAGE ${pageNumber} TOTAL`}</span>
                          <span className="total-divider">/</span>
                          <span className="total-ta">{isLastPage ? 'மொத்தம்:' : 'பக்க மொத்தம்:'}</span>
                        </div>
                      </td>
                      <td className="table-total-val">
                        {formatCurrency(totals.grandTotal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </section>
              <div className="bottom-meta-grid">
                <div className="footer-left-col">
                  <div className="amount-words-card">
                    <span className="words-lbl">TOTAL IN WORDS (தொகை வார்த்தைகளில்):</span>
                    <p className="words-text">{numberToWords(totals.grandTotal)}</p>
                  </div>
                  {invoice.showBankDetails !== false && (
                    <div className="bank-card">
                      <div className="bank-header">BANK & PAYMENT DETAILS (வங்கி விபரம்):</div>
                      <div className="bank-grid">
                        <div><strong>Bank:</strong> {invoice.bankDetails?.bankName}</div>
                        <div><strong>A/C No:</strong> {invoice.bankDetails?.accountNumber}</div>
                        <div><strong>IFSC:</strong> {invoice.bankDetails?.ifscCode}</div>
                        <div><strong>UPI ID:</strong> {invoice.bankDetails?.upiId || '9940947047@upi'}</div>
                      </div>
                    </div>
                  )}
                  <div className="terms-card">
                    <div className="terms-sold-notice">
                      <strong>E.&.O.E.</strong> | GOODS ONCE SOLD WILL NOT BE TAKEN BACK / விற்பனை செய்த பொருட்கள் திரும்ப பெறப்பட மாட்டாது.
                    </div>
                    <div className="terms-thankyou">Thank You ! Visit Again 🙏</div>
                  </div>
                </div>
                <div className="footer-right-col">
                  <div className="signatures-wrap">
                    <div className="auth-signatory-col">
                      <div className="seal-container">
                        {invoice.companySealBase64 && (
                          <img
                            src={invoice.companySealBase64}
                            alt="Official Blue Seal"
                            className="official-seal-img"
                            draggable="false"
                            onContextMenu={(e) => e.preventDefault()}
                            onDragStart={(e) => e.preventDefault()}
                          />
                        )}
                      </div>
                      <div className="sig-container">
                        {invoice.authorizedSignatoryBase64 && (
                          <img
                            src={invoice.authorizedSignatoryBase64}
                            alt="Authorized Signature"
                            className="official-sign-img"
                            draggable="false"
                            onContextMenu={(e) => e.preventDefault()}
                            onDragStart={(e) => e.preventDefault()}
                          />
                        )}
                      </div>
                      <div className="sign-divider-line" />
                      <div className="sign-company-lbl">For {invoice.fromName}</div>
                      <div className="sign-role-lbl">{invoice.signatoryTitle || 'Authorized Signatory'}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="sheet-page-indicator">
                <span>Page {pageNumber} of {totalPages}</span>
                <span>Computer Generated Cash Bill / Invoice</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};