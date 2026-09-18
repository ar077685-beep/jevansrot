import ftplib
import os
import sys

# FTP Credentials
FTP_HOST = "ftpupload.net"
FTP_USER = "if0_42519742"
FTP_PASS = "jevansrot2026"
FTP_PORT = 21

# Directory to upload
LOCAL_DIR = "out"
# Remote directory (usually 'htdocs' on InfinityFree)
REMOTE_DIR = "htdocs"

def upload_dir(ftp, local_path, remote_path):
    print(f"Uploading {local_path} to {remote_path}...")
    
    # Try to change to the remote directory, create it if it doesn't exist
    try:
        ftp.cwd(remote_path)
    except ftplib.error_perm:
        try:
            ftp.mkd(remote_path)
            ftp.cwd(remote_path)
        except Exception as e:
            print(f"Error creating directory {remote_path}: {e}")
            return

    for item in os.listdir(local_path):
        local_item = os.path.join(local_path, item)
        if os.path.isfile(local_item):
            print(f"  Uploading file: {item}")
            with open(local_item, 'rb') as f:
                ftp.storbinary(f'STOR {item}', f)
        elif os.path.isdir(local_item):
            # Recursively upload subdirectory
            upload_dir(ftp, local_item, item)
            # Change back to parent remote directory
            ftp.cwd("..")

def main():
    if not os.path.exists(LOCAL_DIR):
        print(f"Error: Directory '{LOCAL_DIR}' does not exist.")
        print("Make sure you run 'npm run build' first to generate the static files.")
        sys.exit(1)

    print(f"Connecting to FTP server {FTP_HOST}...")
    try:
        ftp = ftplib.FTP()
        ftp.connect(FTP_HOST, FTP_PORT)
        ftp.login(FTP_USER, FTP_PASS)
        print("Successfully connected and logged in.")
        
        # Upload everything
        upload_dir(ftp, LOCAL_DIR, REMOTE_DIR)
        
        ftp.quit()
        print("\nDeployment completed successfully!")
    except Exception as e:
        print(f"\nAn error occurred during FTP upload: {e}")

if __name__ == "__main__":
    main()
