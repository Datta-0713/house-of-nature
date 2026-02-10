import struct

def get_image_size(file_path):
    with open(file_path, 'rb') as f:
        data = f.read()
        
    size = len(data)
    if size >= 2 and data.startswith(b'\xff\xd8'):
        # JPEG
        idx = 2
        while idx < size:
            marker, = struct.unpack('>H', data[idx:idx+2])
            idx += 2
            length, = struct.unpack('>H', data[idx:idx+2])
            
            if marker == 0xFFC0: # SOF0
                h, w = struct.unpack('>HH', data[idx+1:idx+5])
                return w, h
            
            idx += length
            
    return None

base = "d:/HON"
files = [
    "HON-1. Bamboo to Chairs/frame_000_delay-0.042s.jpg",
    "HON-2. Chairs to Lamps/frame_000_delay-0.042s.jpg",
    "HON-3. Lamps to Brand Text/frame_000_delay-0.042s.jpg"
]

print("Checking dimensions...")
for fname in files:
    full_path = f"{base}/{fname}"
    dims = get_image_size(full_path)
    print(f"{fname}: {dims}")
