export function checkEnvVars () {
  console.log('-------- Checking environment var setup -------------------------')
  if (process.env.WS_URL && (process.env.WS_URL.slice(0,5) === 'ws://' ||
                             process.env.WS_URL.slice(0,6) === 'wss://')) {
    console.log('  ✅ WS_URL', process.env.WS_URL)
  } else {
    console.error('  ❌ WS_URL not found or not a ws:// or wss:// URL')
    return 1
  }
  return 0
}
