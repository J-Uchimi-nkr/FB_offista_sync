# 対象ポート (※適宜変更)
$port = 3000
# WSL2のディストリビューション名 (※適宜変更)
$distName = "Ubuntu"


# 過去の設定をリセット
Remove-NetFirewallRule -DisplayName "WSL 2 Firewall Unlock"
netsh interface portproxy delete v4tov4 listenport=$port listenaddress=*

# Windows Defenderに穴あけ
New-NetFireWallRule -DisplayName "WSL 2 Firewall Unlock" -Direction Inbound -LocalPort $port -Action Allow -Protocol TCP
# WSL2の現在のIPに対するポートフォワーディング設定
netsh interface portproxy add v4tov4 listenport=$port listenaddress=* connectport=$port connectaddress=(wsl -d $distName -e hostname -I).trim()