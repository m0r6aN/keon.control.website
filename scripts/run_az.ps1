New-Item -Force -ItemType Directory C:\temp | Out-Null
$pyexe = 'C:\Program Files\Microsoft SDKs\Azure\CLI2\python.exe'
$script = 'D:\Repos\keon-omega\keon.control.website\scripts\az_token_test.py'
$output = & $pyexe $script 2>&1
$output | Out-File -FilePath 'C:\temp\az_py_out.txt' -Encoding utf8
Write-Host "EXIT_CODE: $LASTEXITCODE"
Write-Host "OUTPUT_LINES: $($output.Count)"
$output | ForEach-Object { Write-Host $_ }

