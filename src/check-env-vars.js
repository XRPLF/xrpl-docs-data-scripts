export function checkEnvVars () {
  console.log('-------- Checking environment var setup -------------------------')
  if (process.env.WS_URL && (process.env.WS_URL.slice(0, 5) === 'ws://' ||
                             process.env.WS_URL.slice(0, 6) === 'wss://')) {
    console.log('  ✅ WS_URL', process.env.WS_URL)
  } else {
    console.error('  ❌ WS_URL not found or not a ws:// or wss:// URL')
    return 1
  }

  if (process.env.FAUCET_PORT) {
    try {
      const portInt = parseInt(process.env.FAUCET_PORT)
      if (portInt < 1000) {
        console.error('  ❌ Faucet port < 1000 requires admin')
        return 1
      }
    } catch (err) {
      console.error('  ❌ Faucet port not set correctly')
      return 1
    }
  }

  return 0
}

export function getFaucetOptions () {
  if (process.env.FAUCET_PORT) {
    return {
      faucetHost: `localhost:${process.env.FAUCET_PORT}`,
      faucetPath: '/accounts',
      faucetProtocol: 'http'
    }
  }
  return {} // Use default faucet if faucet port is not specified in env
}
