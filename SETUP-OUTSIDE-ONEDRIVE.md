# Run the frontend without OneDrive errors

The project is in **OneDrive**, which breaks `npm install` and causes:
- `ENOTEMPTY` / "directory not empty"
- `Could not find '@angular-devkit/build-angular:dev-server'`
- `TAR_ENTRY_ERROR ENOENT` during install

**Fix: run the app from a folder that is NOT synced by OneDrive.**

## Steps

1. **Copy the whole HRMS folder** (not move) to a local folder, for example:
   - `C:\HRMS`
   - Or `C:\Projects\HRMS`

   In PowerShell (run as needed):
   ```powershell
   New-Item -ItemType Directory -Force -Path C:\HRMS
   Copy-Item -Path "C:\Users\Dell\OneDrive\Desktop\HRMS\*" -Destination "C:\HRMS" -Recurse -Force
   ```

2. **Open the copied project in VS Code**
   - File → Open Folder → `C:\HRMS`

3. **In the integrated terminal (VS Code):**
   ```powershell
   cd frontend
   npm install
   npm start
   ```

4. Open **http://localhost:4200** in your browser.

5. **(Optional)** To run the backend from the same place:
   ```powershell
   cd C:\HRMS\backend
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```

Keep editing code in `C:\HRMS`. When you want to backup or share, copy the updated folder back to OneDrive or push to GitHub.
