#!/bin/sh
# made for docker so no much commands

# init env
node -v
corepack enable pnpm
pnpm -v

pnpm i
pnpm build
pnpm start
cp ./src/package.json.template ./private/package.json

PKG_TOKEN=8614a238a97249223cedc574b13c6b2c7c325abc
pnpm config set @agxcoy:registry https://git.liteyuki.org/api/packages/AgxCOy/npm
pnpm config set -- '//git.liteyuki.org/api/packages/AgxCOy/npm/:_authToken' "$PKG_TOKEN"

cd ./private
NVER=$(cat ./VERSION | sed 's/^v//' | awk -F. '{if($3==null) print$1"."$2".0"; else print$0}')
pnpm version $NVER --no-git-tag-version
pnpm adduser --registry https://git.liteyuki.org/api/packages/AgxCOy/npm --scope=@agxcoy --auth-type=legacy
pnpm publish --access public
