'use strict'

const WASM_BUILDER_CONTAINTER = 'ghcr.io/mhdawson/wasm-builder@sha256:666666959227f7a8a07a396da20c419305b49ef775fe4207fcc695d953d6ef10' // v0.0.7

const { execSync } = require("node:child_process");
const { resolve } = require("node:path");

const ROOT = resolve(__dirname, "../");

let platform = process.env.WASM_PLATFORM
if (!platform && process.argv[2]) {
  platform = execSync('docker info -f "{{.OSType}}/{{.Architecture}}"').toString().trim()
}

if (process.argv[2] === '--docker') {
  let cmd = `docker run --rm --platform=${platform.toString().trim()} `
  if (process.platform === 'linux') {
    cmd += ` --user ${process.getuid()}:${process.getegid()}`
  }

  cmd += ` --mount type=bind,source=${ROOT}/deps/swc/bindings,target=/home/node/build/bindings \
           --mount type=bind,source=${ROOT}/lib,target=/home/node/build/lib \
           --mount type=bind,source=${ROOT}/tools,target=/home/node/build/tools \
           --mount type=bind,source=${ROOT}/deps,target=/home/node/build/deps \
           -t ${WASM_BUILDER_CONTAINTER} node tools/build-wasm.js`
  console.log(`> ${cmd}\n\n`)
  execSync(cmd, { stdio: 'inherit' })
  process.exit(0)
}

execSync(`cd bindings/binding_typescript_wasm && \ 
          cargo install --locked wasm-pack && \
          PATH=/home/node/.cargo/bin:$PATH && \
          ./scripts/build.sh && \
          cp -r pkg/* ../../lib`,
         { stdio: 'inherit' })
