# /bin/bash

# 确保脚本抛出遇到的错误
set -e

# 读取 package.json 中的 version
version=`jq -r .version package.json`

# 打包构建
pnpm build

# 提交版本更新代码到github
git add .
git cm -m "update $version"
git push

# 发布到 npm，pnpm(高性能的npm)
pnpm publish



