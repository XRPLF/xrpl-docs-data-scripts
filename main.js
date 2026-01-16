import 'dotenv/config'

import { checkEnvVars, getFaucetOptions } from './src/check-env-vars.js'
import { setupTSTIssuer } from './src/tst-offer-setup.js'

console.log('======== XRPL Docs Data Setup Script ============================')
const faucetOptions = getFaucetOptions()
if (checkEnvVars()) { process.exit(1) }
if (await setupTSTIssuer(process.env.WS_URL, faucetOptions)) { process.exit(1) }

console.log('======== All setup scripts done 🎉 ==============================')
