from PIL import Image
import numpy as np

# 1. Process Seal
img = Image.open('src/assets/seal.jpg').convert('RGBA')
data = np.array(img)
r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]
gray = 0.299 * r + 0.587 * g + 0.114 * b

# Sharp, clear stamp pad blue
ink_density = np.clip((242 - gray) / 150.0, 0.0, 1.0)
new_seal = np.zeros_like(data)
new_seal[:, :, 0] = 16   # Royal Blue R
new_seal[:, :, 1] = 52   # Royal Blue G
new_seal[:, :, 2] = 186  # Royal Blue B
new_seal[:, :, 3] = (ink_density * 255).astype(np.uint8)

blue_seal = Image.fromarray(new_seal, mode='RGBA')
blue_seal.save('src/assets/seal_blue.png')
print("Seal created: seal_blue.png")

# 2. Process Signature (Clean transparent blue signature)
sig = Image.open('src/assets/signature.jpg').convert('RGBA')
sig_data = np.array(sig)
sr, sg, sb = sig_data[:, :, 0], sig_data[:, :, 1], sig_data[:, :, 2]
sig_gray = 0.299 * sr + 0.587 * sg + 0.114 * sb
sig_ink = np.clip((245 - sig_gray) / 140.0, 0.0, 1.0)

new_sig = np.zeros_like(sig_data)
# Keep authentic ballpoint blue ink
new_sig[:, :, 0] = 14
new_sig[:, :, 1] = 48
new_sig[:, :, 2] = 196
new_sig[:, :, 3] = (sig_ink * 255).astype(np.uint8)

clean_sig = Image.fromarray(new_sig, mode='RGBA')
clean_sig.save('src/assets/signature_clean.png')
print("Signature created: signature_clean.png")
