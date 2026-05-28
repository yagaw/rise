import net from "node:net"
import { spawn } from "node:child_process"

const host = "127.0.0.1"
const port = 3000

function isPortOpen() {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port })

    socket.once("connect", () => {
      socket.destroy()
      resolve(true)
    })

    socket.once("error", () => {
      socket.destroy()
      resolve(false)
    })
  })
}

if (await isPortOpen()) {
  console.log(`Next.js dev server already running at http://${host}:${port}`)
  setInterval(() => {}, 2 ** 31 - 1)
} else {
  const child = spawn("npm", ["run", "dev"], {
    stdio: "inherit",
  })

  const stop = () => {
    child.kill()
  }

  process.once("SIGINT", stop)
  process.once("SIGTERM", stop)

  child.once("exit", (code) => {
    process.exit(code ?? 0)
  })
}
