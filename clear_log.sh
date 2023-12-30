#logファイルをすべて削除するスクリプト


# カレントディレクトリを取得
current_dir=$(pwd)
# 削除対象のディレクトリパスを組み立て
target_dir="${current_dir}/src/log"

# .jsonファイルを一括で削除
rm -f "${target_dir}"/*.json

echo "削除が完了しました。"
