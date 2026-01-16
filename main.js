import 'dotenv/config'

import { checkEnvVars, getFaucetOptions } from './src/check-env-vars.js'
import { checkGenesisAccount } from './src/check-genesis-account.js'
import { checkAmendments } from './src/check-amendments.js'
import { checkReserves } from './src/check-reserves.js'
import { setupTSTIssuer } from './src/tst-offer-setup.js'

const args = process.argv.slice(2)
const testOnly = (args.length && args[0] === 'test-only')

console.log('======== XRPL Docs Data Setup Script ============================')
const faucetOptions = getFaucetOptions()
if (checkEnvVars()) { process.exit(1) }
await checkGenesisAccount(process.env.WS_URL)
await checkAmendments(process.env.WS_URL)
await checkReserves(process.env.WS_URL)

if (testOnly) { process.exit(0) }
// Scripts that create data below.
if (await setupTSTIssuer(process.env.WS_URL, faucetOptions)) { process.exit(1) }

console.log('======== All setup scripts done 🎉 ==============================')
