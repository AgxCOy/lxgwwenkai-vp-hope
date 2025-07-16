#!/bin/sh
# made for docker so no much commands

# init env
node -v
corepack enable pnpm
pnpm -v

# 安装 package.json 里所有的生产依赖
pnpm --production

# pnpm i cn-font-split
# pnpm i commander

node lxgw.js -i /lxgw
pnpx css-minify -d /dist

PKG_TOKEN=8614a238a97249223cedc574b13c6b2c7c325abc
pnpm config set @agxcoy:registry https://git.liteyuki.org/api/packages/AgxCOy/npm
pnpm config set -- '//git.liteyuki.org/api/packages/AgxCOy/npm/:_authToken' "$PKG_TOKEN"

cd /dist
pnpm adduser --registry https://git.liteyuki.org/api/packages/AgxCOy/npm --scope=@agxcoy --auth-type=legacy
pnpm publish --access public
