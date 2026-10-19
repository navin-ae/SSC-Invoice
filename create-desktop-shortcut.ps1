$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $DesktopPath "Raajamani Billing.lnk"
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "wscript.exe"
$Shortcut.Arguments = "`"E:\SSC-Invoice\start-billing.vbs`""
$Shortcut.WorkingDirectory = "E:\SSC-Invoice"
$Shortcut.Description = "Raajamani Traders Retail Billing System"
$Shortcut.IconLocation = "E:\SSC-Invoice\public\favicon.ico"
$Shortcut.Save()
Write-Host "Desktop shortcut created successfully at: $ShortcutPath"
