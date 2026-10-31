from PIL import Image, ImageDraw
import numpy as np

img = Image.open('src/assets/logo.jpg').convert('RGBA')
w, h = img.size

# Find the circle center and radius
# The image is 1024 x 1000. Let's make a square 1000x1000 or circle mask
center_x = w / 2
center_y = h / 2
radius = min(w, h) / 2 - 25 # inner margin to trim outer black box

# Create high-res circular mask
mask = Image.new('L', (w, h), 0)
draw = ImageDraw.Draw(mask)
draw.ellipse((center_x - radius, center_y - radius, center_x + radius, center_y + radius), fill=255)

# Apply mask
img.putalpha(mask)

# Crop to bounding box of the circle
bbox = (int(center_x - radius), int(center_y - radius), int(center_x + radius), int(center_y + radius))
cropped_img = img.crop(bbox)

# Resize to high-quality 512x512
cropped_img = cropped_img.resize((512, 512), Image.Resampling.LANCZOS)
cropped_img.save('src/assets/logo_clean.png')
print('Cropped circular logo saved: src/assets/logo_clean.png')

