export const getGoogleScriptUrl = () => {
  return import.meta.env.VITE_GOOGLE_SCRIPT_URL || '';
};
export const googleSheetsSync = {
  isConfigured() {
    const url = getGoogleScriptUrl();
    return Boolean(url && url.startsWith('http'));
  },
  async fetchData(resource = 'all') {
    const url = getGoogleScriptUrl();
    if (!url) return { success: false, message: 'Google Script URL not set in .env' };
    try {
      const endpoint = resource === 'all' ? url : `${url}?resource=${resource}`;
      const res = await fetch(endpoint);
      const data = await res.json();
      return { success: true, data };
    } catch (err) {
      console.warn('Google Sheets GET error:', err);
      return { success: false, error: err.toString() };
    }
  },
  async saveInvoice(invoice) {
    const url = getGoogleScriptUrl();
    if (!url) return { success: false, message: 'Google Script URL not configured in .env' };
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          method: 'PUT',
          action: 'save_invoice',
          resource: 'invoices',
          invoice
        })
      });
      return { success: true };
    } catch (err) {
      console.warn('Google Sheets sync warning (offline or CORS):', err);
      return { success: false, error: err.toString() };
    }
  },
  async createInvoice(invoice) {
    const url = getGoogleScriptUrl();
    if (!url) return { success: false };
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          method: 'POST',
          action: 'create_invoice',
          resource: 'invoices',
          invoice
        })
      });
      return { success: true };
    } catch (err) {
      console.warn('Google Sheets create invoice warning:', err);
      return { success: false };
    }
  },
  async deleteInvoice(invoiceNumber) {
    const url = getGoogleScriptUrl();
    if (!url) return { success: false };
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          method: 'DELETE',
          action: 'delete_invoice',
          resource: 'invoices',
          invoiceNumber
        })
      });
      return { success: true };
    } catch (err) {
      console.warn('Google Sheets sync delete warning:', err);
      return { success: false };
    }
  },
  async syncShopProfile(profile, bankDetails) {
    const url = getGoogleScriptUrl();
    if (!url) return { success: false };
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          method: 'PUT',
          action: 'save_shop_profile',
          resource: 'shop_profile_and_bank',
          profile,
          bankDetails
        })
      });
      return { success: true };
    } catch (err) {
      console.warn('Google Sheets sync shop profile warning:', err);
      return { success: false };
    }
  },
  async syncPopularServices(services) {
    const url = getGoogleScriptUrl();
    if (!url) return { success: false };
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          method: 'PUT',
          action: 'save_popular_services',
          resource: 'popular_services',
          services
        })
      });
      return { success: true };
    } catch (err) {
      console.warn('Google Sheets sync popular services warning:', err);
      return { success: false };
    }
  },
  async syncAll(invoices, profile, bankDetails, services) {
    const url = getGoogleScriptUrl();
    if (!url) return { success: false, message: 'Google Script URL not set in .env' }
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          method: 'PUT',
          action: 'sync_all',
          invoices,
          profile,
          bankDetails,
          services
        })
      });
      const data = await res.json();
      return { success: true, data };
    } catch (err) {
      console.warn('Google Sheets bulk sync error:', err);
      return { success: false, error: err.toString() };
    }
  }
};