extension=ysnows.poe-quora
deployRootDir="/Users/ysnows/Library/Application Support/Enconvo/extension/"
deployDir="/Users/ysnows/Library/Application Support/Enconvo/extension/${extension}"
# 动态获取当前脚本所在目录
sourceDir=$(pwd)

rm -rf "$deployDir"
mkdir -p "$deployDir"
cp -r "$sourceDir" "$deployRootDir"
