import { defaultSignature, defaultSeal, defaultLogo } from '../assets/invoiceAssets';
export { defaultSeal, defaultSignature };
export const defaultOfficialLogo = defaultLogo;
export const defaultBusinessProfile = {
  fromName: "ARUNA MOBILES & XEROX",
  subtitle: "Colour Printout, SIM Card, Lamination, Passport Size Photo, Mobile Accessories",
  fromAddress: "Shop No. 113, Mattuthavani Bus Stand, Madurai - 625007",
  fromPhone: "9940947047",
  fromEmail: "arunaxerox113@gmail.com",
  fromGst: "",
  companyLogoBase64: defaultOfficialLogo,
  companySealBase64: defaultSeal,
  authorizedSignatoryBase64: defaultSignature,
  signatoryTitle: "Authorized Signatory"
};
export const defaultBankDetails = {
  bankName: "State Bank of India",
  bankBranchName: "Mattuthavani Branch, Madurai",
  accountHolderName: "ARUNA MOBILES & XEROX",
  accountNumber: "38920194820",
  ifscCode: "SBIN0004521",
  upiId: "9940947047@upi",
  showBankDetails: true
};
export const defaultDeclarations = {
  en: [
    "Goods / Services once sold or delivered cannot be returned or refunded.",
    "Warranty for mobile accessories as per respective manufacturer policy.",
    "This is a computer generated invoice and serves as official receipt."
  ],
  regional: [
    "விற்பனை செய்யப்பட்ட பொருட்கள் மற்றும் சேவைகளுக்கு பணம் திரும்ப தரப்படமாட்டாது."
  ]
};
export const quickServicePresets = [
  { description: "Colour Printout (A4 Glossy / High Quality)", unitPrice: 15, per: "Copies", taxRate: 0 },
  { description: "B&W Xerox / Photocopy (Single Side)", unitPrice: 2, per: "Copies", taxRate: 0 },
  { description: "B&W Xerox / Photocopy (Back to Back)", unitPrice: 3, per: "Copies", taxRate: 0 },
  { description: "Document Lamination (A4 Size)", unitPrice: 30, per: "Nos.", taxRate: 0 },
  { description: "Passport Size Photo (8 Copies Urgent)", unitPrice: 60, per: "Set", taxRate: 0 },
  { description: "Passport Size Photo (16 Copies)", unitPrice: 100, per: "Set", taxRate: 0 },
  { description: "Smart SIM Card Activation / MNP", unitPrice: 50, per: "Nos.", taxRate: 0 },
  { description: "Premium 11D Tempered Glass with Installation", unitPrice: 150, per: "Nos.", taxRate: 0 },
  { description: "Mobile Back Case / Protective Cover", unitPrice: 180, per: "Nos.", taxRate: 0 },
  { description: "Fast Charging Cable (Type-C / Lightning)", unitPrice: 199, per: "Nos.", taxRate: 0 },
  { description: "Fast Wall Charger Adapter (20W / 33W)", unitPrice: 350, per: "Nos.", taxRate: 0 },
  { description: "Wired Earphones / Audio Jack Handsfree", unitPrice: 150, per: "Nos.", taxRate: 0 }
];
const SERVICES_STORAGE_KEY = 'aruna_popular_services_v1';
const PROFILE_STORAGE_KEY = 'aruna_shop_profile_v1';
const BANK_STORAGE_KEY = 'aruna_bank_details_v1';
export const getBusinessProfile = () => {
  try {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.companySealBase64 || parsed.companySealBase64.includes('AAAC') || parsed.companySealBase64.length > 500000) {
        parsed.companySealBase64 = defaultSeal;
      }
      return { ...defaultBusinessProfile, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load shop profile from localStorage:', e);
  }
  return { ...defaultBusinessProfile };
};
export const saveBusinessProfile = (profile) => {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save shop profile to localStorage:', e);
  }
  return profile;
};
export const resetBusinessProfile = () => {
  try {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
  } catch (e) { }
  return { ...defaultBusinessProfile };
};
export const getBankDetails = () => {
  try {
    const saved = localStorage.getItem(BANK_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultBankDetails, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load bank details from localStorage:', e);
  }
  return { ...defaultBankDetails };
};
export const saveBankDetails = (bank) => {
  try {
    localStorage.setItem(BANK_STORAGE_KEY, JSON.stringify(bank));
  } catch (e) {
    console.error('Failed to save bank details to localStorage:', e);
  }
  return bank;
};
export const resetBankDetails = () => {
  try {
    localStorage.removeItem(BANK_STORAGE_KEY);
  } catch (e) { }
  return { ...defaultBankDetails };
};
export const getPopularServices = () => {
  try {
    const saved = localStorage.getItem(SERVICES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load popular services from localStorage:', e);
  }
  return quickServicePresets;
};
export const savePopularServices = (services) => {
  try {
    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
  } catch (e) {
    console.error('Failed to save popular services to localStorage:', e);
  }
  return services;
};
export const resetPopularServices = () => {
  try {
    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(quickServicePresets));
  } catch (e) {
    console.error('Failed to reset popular services:', e);
  }
  return quickServicePresets;
};