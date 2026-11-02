# PowerShell PATH Fix Instructions
To permanently fix the `'powershell' is not recognized` error in Windows and Antigravity:

1. Press `Win + R`, type `sysdm.cpl` and press Enter.
2. Go to the **Advanced** tab and click **Environment Variables**.
3. Under **System Variables**, select `Path` and click **Edit**.
4. Check if this entry exists:
   `C:\Windows\System32\WindowsPowerShell\v1.0\`
   and:
   `C:\Windows\System32`
5. If missing, click **New** and add:
   `C:\Windows\System32\WindowsPowerShell\v1.0\`
   `C:\Windows\System32`
6. Click **OK** on all dialogs, then restart VS Code.

