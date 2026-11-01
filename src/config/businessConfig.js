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
let inMemoryProfile = null;
let inMemoryBank = null;
let inMemoryServices = null;
export const getBusinessProfile = () => {
  if (inMemoryProfile) {
    if (!inMemoryProfile.companySealBase64 || inMemoryProfile.companySealBase64.includes('AAAC') || inMemoryProfile.companySealBase64.length > 500000) {
      inMemoryProfile.companySealBase64 = defaultSeal;
    }
    return { ...defaultBusinessProfile, ...inMemoryProfile };
  }
  return { ...defaultBusinessProfile };
};
export const saveBusinessProfile = (profile) => {
  if (profile) {
    inMemoryProfile = { ...defaultBusinessProfile, ...profile };
    if (!inMemoryProfile.companySealBase64 || inMemoryProfile.companySealBase64.includes('AAAC') || inMemoryProfile.companySealBase64.length > 500000) {
      inMemoryProfile.companySealBase64 = defaultSeal;
    }
  }
  return inMemoryProfile || { ...defaultBusinessProfile };
};
export const resetBusinessProfile = () => {
  inMemoryProfile = { ...defaultBusinessProfile };
  return { ...defaultBusinessProfile };
};
export const getBankDetails = () => {
  if (inMemoryBank) {
    return { ...defaultBankDetails, ...inMemoryBank };
  }
  return { ...defaultBankDetails };
};
export const saveBankDetails = (bank) => {
  if (bank) {
    inMemoryBank = { ...defaultBankDetails, ...bank };
  }
  return inMemoryBank || { ...defaultBankDetails };
};
export const resetBankDetails = () => {
  inMemoryBank = { ...defaultBankDetails };
  return { ...defaultBankDetails };
};

export const getPopularServices = () => {
  if (Array.isArray(inMemoryServices) && inMemoryServices.length > 0) {
    return inMemoryServices;
  }
  return quickServicePresets;
};
export const savePopularServices = (services) => {
  if (Array.isArray(services)) {
    inMemoryServices = [...services];
  }
  return inMemoryServices || quickServicePresets;
};
export const resetPopularServices = () => {
  inMemoryServices = [...quickServicePresets];
  return quickServicePresets;
};