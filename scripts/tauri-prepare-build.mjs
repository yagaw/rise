import fs from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"

const root = process.cwd()
const nextDir = path.join(root, ".next")
const standaloneDir = path.join(nextDir, "standalone")
const resourcesDir = path.join(root, "src-tauri", "resources", "next")
const frontendDist = path.join(root, "src-tauri", "frontend-dist")

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

function copyIfExists(from, to) {
  if (!fs.existsSync(from)) {
    return
  }

  fs.cpSync(from, to, { recursive: true })
}

run("npm", ["run", "build"])

if (!fs.existsSync(path.join(standaloneDir, "server.js"))) {
  console.error("Next standalone output was not created at .next/standalone/server.js")
  process.exit(1)
}

fs.rmSync(resourcesDir, { recursive: true, force: true })
fs.mkdirSync(resourcesDir, { recursive: true })
fs.cpSync(standaloneDir, resourcesDir, { recursive: true })
copyIfExists(path.join(nextDir, "static"), path.join(resourcesDir, ".next", "static"))
copyIfExists(path.join(root, "public"), path.join(resourcesDir, "public"))

fs.rmSync(frontendDist, { recursive: true, force: true })
fs.mkdirSync(frontendDist, { recursive: true })
fs.writeFileSync(
  path.join(frontendDist, "index.html"),
  '<!doctype html><html><head><meta charset="utf-8"><title>Rise</title></head><body>Loading Rise...</body></html>\n',
)
