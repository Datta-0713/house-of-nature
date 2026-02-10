import struct

def get_image_size(file_path):
    with open(file_path, 'rb') as f:
        data = f.read()
    
    size = len(data)
    idx = 0
    
    if data[:2] != b'\xff\xd8':
        return None # Not JPEG

    idx += 2
    
    while idx < size:
        # Read marker
        if idx + 2 > size: break
        marker, = struct.unpack('>H', data[idx:idx+2])
        idx += 2
        
        # JPEG markers are 0xFFXX
        # 0xFFD9 is EOI (End of Image)
        # 0xFFDA is SOS (Start of Scan) - we can stop here if we missed SOF
        if marker == 0xFFDA:
            break
            
        # Read length
        if idx + 2 > size: break
        length, = struct.unpack('>H', data[idx:idx+2])
        
        # SOF0 (Baseline), SOF1 (Extended), SOF2 (Progressive)
        # Markers: FF C0, FF C1, FF C2
        if marker in [0xFFC0, 0xFFC1, 0xFFC2]:
            # Structure: 
            # Precision (1 byte)
            # Height (2 bytes)
            # Width (2 bytes)
            # Offset relative to current idx (which is at length start + 2):
            # idx points to length start. Length includes itself (2 bytes).
            # Data starts at idx. 
            # Precision is at idx + 2 (since length is 2 bytes).
            # Height is at idx + 3.
            # Width is at idx + 5.
            
            h, w = struct.unpack('>HH', data[idx+3:idx+7])
            return w, h
            
        idx += length

    return None

base = "d:/HON"
folders = [
    "HON-1. Bamboo to Chairs",
    "HON-2. Chairs to Lamps",
    "HON-3. Lamps to Brand Text"
]

print("Checking dimensions (Fixed Script)...")
for folder in folders:
    # Check first few frames
    for i in [0, 100]:
        fname = f"{folder}/frame_{i:03d}_delay-0.042s.jpg"
        # Try finding file (ignoring suffix mismatch for specific check)
        import os
        if not os.path.exists(f"{base}/{fname}"):
             fname = f"{folder}/frame_{i:03d}_delay-0.041s.jpg"
        
        full_path = f"{base}/{fname}"
        if os.path.exists(full_path):
            dims = get_image_size(full_path)
            size_kb = os.path.getsize(full_path) / 1024
            print(f"{fname}: {dims} ({size_kb:.1f} KB)")
        else:
            print(f"Skipped {fname}")
