import fs from 'fs';

const logoBase64 = fs.readFileSync('src/assets/logo_clean.png').toString('base64');
const blueSeal = fs.readFileSync('src/assets/seal_blue.png').toString('base64');
const cleanSig = fs.readFileSync('src/assets/signature_clean.png').toString('base64');

console.log('Logo base64 len:', logoBase64.length);
console.log('Blue Seal base64 len:', blueSeal.length);
console.log('Clean Sig base64 len:', cleanSig.length);

const content = `// Official Assets for Aruna Mobiles & Xerox
export const defaultLogo = "data:image/png;base64,${logoBase64}";
export const defaultSignature = "data:image/png;base64,${cleanSig}";
export const defaultSeal = "data:image/png;base64,${blueSeal}";
`;

fs.writeFileSync('src/assets/invoiceAssets.js', content);
console.log('Successfully updated src/assets/invoiceAssets.js with Logo, Seal, and Signature');
