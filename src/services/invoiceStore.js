import { 
  defaultDeclarations,
  getBusinessProfile,
  getBankDetails,
  defaultSeal
} from '../config/businessConfig';
export const getNextInvoiceNumber = (existingInvoices = []) => {
  const currentYear = new Date().getFullYear();
  let maxSeq = 0;
  if (Array.isArray(existingInvoices)) {
    existingInvoices.forEach(inv => {
      if (inv && inv.invoiceNumber != null) {
        const invNumStr = String(inv.invoiceNumber);
        const match = invNumStr.match(/(?:AX-)?INV-\d{4}\/(\d+)/i) || invNumStr.match(/(\d+)$/);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });
  }
  const nextSeq = String(maxSeq + 1).padStart(3, '0');
  return `AX-INV-${currentYear}/${nextSeq}`;
};
export const createBlankInvoice = (existingInvoices = []) => {
  const today = new Date().toISOString().split('T')[0];
    const profile = getBusinessProfile();
    const bank = getBankDetails();
    return {
      id: 'inv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      invoiceNumber: getNextInvoiceNumber(existingInvoices),
      date: today,
      dueDate: today,
      status: 'Paid',
      showStatusStamp: true,
      showBankDetails: bank.showBankDetails !== false,
      fromName: profile.fromName,
      subtitle: profile.subtitle,
      fromEmail: profile.fromEmail,
      fromPhone: profile.fromPhone,
      fromAddress: profile.fromAddress,
      fromGst: profile.fromGst,
      companyLogoBase64: profile.companyLogoBase64,
      companySealBase64: profile.companySealBase64,
      authorizedSignatoryBase64: profile.authorizedSignatoryBase64,
      signatoryTitle: profile.signatoryTitle,
      billReceiverTitle: 'Mr.',
      toName: '',
      toPhone: '',
      toEmail: '',
      toAddress: '',
      modeOfPayment: 'Cash',
      bankDetails: { ...bank },
    items: [
      {
        id: 'item_1',
        description: '',
        quantity: 1,
        unitPrice: '',
        taxRate: 0,
        per: 'Nos.'
      }
    ],
    hasDiscount: false,
    discount: 0,
    notes: 'Thank you for visiting Aruna Mobiles & Xerox! Visit us again.',
    declarations: { ...defaultDeclarations },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};
let inMemoryInvoices = [];
export const invoiceStore = {
  getAll() {
    return [...inMemoryInvoices];
  },
  setAll(invoices) {
    if (Array.isArray(invoices)) {
      inMemoryInvoices = invoices
        .filter(inv => !inv.id || !inv.id.startsWith('inv_seed_'))
        .map(inv => {
          let updatedInv = { ...inv };
          if (inv.invoiceNumber && String(inv.invoiceNumber).startsWith('INV-')) {
            updatedInv.invoiceNumber = String(inv.invoiceNumber).replace(/^INV-/, 'AX-INV-');
          }
          if (!updatedInv.companySealBase64 || updatedInv.companySealBase64.includes('AAAC') || updatedInv.companySealBase64.length > 500000) {
            updatedInv.companySealBase64 = defaultSeal;
          }
          return updatedInv;
        });
    }
    return [...inMemoryInvoices];
  },
  getById(id) {
    return inMemoryInvoices.find(item => item.id === id || item.invoiceNumber === id) || null;
  },
  save(invoice) {
    const list = [...inMemoryInvoices];
    const index = list.findIndex(item => item.id === invoice.id || item.invoiceNumber === invoice.invoiceNumber);
    const updatedInvoice = {
      ...invoice,
      updatedAt: new Date().toISOString()
    };
    if (index >= 0) {
      list[index] = updatedInvoice;
    } else {
      list.unshift(updatedInvoice);
    }
    inMemoryInvoices = list;
    return updatedInvoice;
  },
  duplicate(id) {
    const target = inMemoryInvoices.find(item => item.id === id || item.invoiceNumber === id);
    if (!target) return null;
    const cloned = JSON.parse(JSON.stringify(target));
    cloned.id = 'inv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    cloned.invoiceNumber = getNextInvoiceNumber(inMemoryInvoices);
    cloned.date = new Date().toISOString().split('T')[0];
    cloned.dueDate = cloned.date;
    cloned.status = 'Paid';
    cloned.createdAt = new Date().toISOString();
    cloned.updatedAt = new Date().toISOString();
    inMemoryInvoices.unshift(cloned);
    return cloned;
  },
  delete(id) {
    inMemoryInvoices = inMemoryInvoices.filter(item => item.id !== id && item.invoiceNumber !== id);
    return [...inMemoryInvoices];
  },
  resetDefaults() {
    inMemoryInvoices = [];
    return [];
  }
};