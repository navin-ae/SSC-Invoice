Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
strDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.Run Chr(34) & strDir & "\start-billing.bat" & Chr(34), 0, False
Set WshShell = Nothing
Set fso = Nothing
