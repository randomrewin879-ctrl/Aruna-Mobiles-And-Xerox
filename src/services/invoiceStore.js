import { 
  defaultDeclarations,
  getBusinessProfile,
  getBankDetails,
  defaultSeal
} from '../config/businessConfig';
const STORAGE_KEY = 'aruna_invoices_data_v3';
export const getNextInvoiceNumber = (existingInvoices = []) => {
  const currentYear = new Date().getFullYear();
  let maxSeq = 0;
  existingInvoices.forEach(inv => {
    if (inv.invoiceNumber) {
      const match = inv.invoiceNumber.match(/(?:AX-)?INV-\d{4}\/(\d+)/i) || inv.invoiceNumber.match(/(\d+)$/);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (num > maxSeq) maxSeq = num;
      }
    }
  });
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
export const invoiceStore = {
  getAll() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return [];
      }
      const parsed = JSON.parse(data);
      let changed = false;
      const cleaned = parsed
        .filter(inv => {
          if (inv.id && inv.id.startsWith('inv_seed_')) {
            changed = true;
            return false;
          }
          return true;
        })
        .map(inv => {
          let updatedInv = { ...inv };
          if (inv.invoiceNumber && inv.invoiceNumber.startsWith('INV-')) {
            changed = true;
            updatedInv.invoiceNumber = inv.invoiceNumber.replace(/^INV-/, 'AX-INV-');
          }
          if (!updatedInv.companySealBase64 || updatedInv.companySealBase64.includes('AAAC') || updatedInv.companySealBase64.length > 500000) {
            changed = true;
            updatedInv.companySealBase64 = defaultSeal;
          }
          return updatedInv;
        });
      if (changed) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      }
      return cleaned;
    } catch (e) {
      console.error('Failed to load invoices from localStorage:', e);
      return [];
    }
  },
  getById(id) {
    const list = this.getAll();
    return list.find(item => item.id === id) || null;
  },
  save(invoice) {
    const list = this.getAll();
    const index = list.findIndex(item => item.id === invoice.id);
    const updatedInvoice = {
      ...invoice,
      updatedAt: new Date().toISOString()
    };
    if (index >= 0) {
      list[index] = updatedInvoice;
    } else {
      list.unshift(updatedInvoice);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return updatedInvoice;
  },
  duplicate(id) {
    const list = this.getAll();
    const target = list.find(item => item.id === id);
    if (!target) return null;
    const cloned = JSON.parse(JSON.stringify(target));
    cloned.id = 'inv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    cloned.invoiceNumber = getNextInvoiceNumber(list);
    cloned.date = new Date().toISOString().split('T')[0];
    cloned.dueDate = cloned.date;
    cloned.status = 'Paid';
    cloned.createdAt = new Date().toISOString();
    cloned.updatedAt = new Date().toISOString();
    list.unshift(cloned);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return cloned;
  },
  delete(id) {
    let list = this.getAll();
    list = list.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return list;
  },
  resetDefaults() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    return [];
  }
};