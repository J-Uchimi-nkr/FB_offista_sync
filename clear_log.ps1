#logファイルをすべて削除するスクリプト

# カレントディレクトリを取得
$currentDir = Get-Location

# 削除対象のディレクトリパスを組み立て
$targetDir = Join-Path $currentDir "src\log"

# .jsonファイルを一括で削除
Remove-Item -Path "$targetDir\*.json" -Force

Write-Host "削除が完了しました。"
