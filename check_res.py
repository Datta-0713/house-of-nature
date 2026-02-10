import os
from PIL import Image

def check_image(path):
    try:
        if os.path.exists(path):
            with Image.open(path) as img:
                print(f"Image: {path}")
                print(f"Format: {img.format}")
                print(f"Size: {img.size}")
                print(f"Mode: {img.mode}")
        else:
            print(f"File not found: {path}")
    except Exception as e:
        print(f"Error: {e}")

# Check one from each folder
base = "d:/HON"
files = [
    "HON-1. Bamboo to Chairs/frame_000_delay-0.042s.jpg",
    "HON-2. Chairs to Lamps/frame_000_delay-0.042s.jpg",
    "HON-3. Lamps to Brand Text/frame_000_delay-0.042s.jpg"
]

for f in files:
    check_image(os.path.join(base, f))
