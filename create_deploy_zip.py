import os
import zipfile

# files to exclude
EXCLUDE_EXTENSIONS = ['.mp4', '.zip', '.7z', '.git', '.pyc']
EXCLUDE_DIRS = ['__pycache__', 'venv', '.git', 'node_modules', '.gemini']
EXCLUDE_FILES = ['ffmpeg.zip', 'ffmpeg-git-full.7z', '.gitignore', 'create_deploy_zip.py', 'cleanup_data.py', 'verify_audit.py', 'verify_audit_urllib.py', 'verify_checkout.py', 'check_dims.py', 'check_dims_fixed.py', 'check_res.py', 'test_ui_flow.py']

OUTPUT_FILENAME = 'hon_deploy_package.zip'

def create_zip():
    print(f"📦 Creating {OUTPUT_FILENAME}...")
    with zipfile.ZipFile(OUTPUT_FILENAME, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('.'):
            # Filtering directories
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            
            for file in files:
                # Filtering files
                if any(file.endswith(ext) for ext in EXCLUDE_EXTENSIONS):
                    continue
                if file in EXCLUDE_FILES:
                    continue
                if file == OUTPUT_FILENAME:
                    continue

                file_path = os.path.join(root, file)
                # Archive name (relative path)
                arcname = os.path.relpath(file_path, '.')
                
                print(f"  + Adding {arcname}")
                zipf.write(file_path, arcname)
    
    print(f"\n✅ Successfully created {OUTPUT_FILENAME}")
    print("👉 Upload this file to your hosting provider.")

if __name__ == "__main__":
    create_zip()
