$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$AppDir = $PSScriptRoot
if (-not $AppDir) { $AppDir = (Get-Location).Path }
$ShortcutPath = Join-Path $DesktopPath "Raajamani Billing.lnk"
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "$AppDir\start-billing.bat"
$Shortcut.WorkingDirectory = "$AppDir"
$Shortcut.Description = "Raajamani Traders Retail Billing System"
$Shortcut.IconLocation = "$AppDir\public\favicon.ico"
$Shortcut.Save()
Write-Host "Desktop shortcut created successfully at: $ShortcutPath"
