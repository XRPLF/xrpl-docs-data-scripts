import express from 'express'

import 'dotenv/config'
import { Wallet, Client, xrpToDrops, dropsToXrp } from 'xrpl'
import { checkEnvVars } from '../src/check-env-vars.js'

if (checkEnvVars()) { process.exit(1) }

const PORT = process.env.FAUCET_PORT || 6061
const FUND_AMT = xrpToDrops(process.env.FUND_XRP || 1000)
const FAUCET_ADDRESS = process.env.FAUCET_ADDRESS || 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh'
const FAUCET_SEED = process.env.FAUCET_SEED || 'snoPBrXtMeMyMHUVTgbuqAfg1SUTb'
const FAUCET_KEY_TYPE = process.env.FAUCET_KEY_TYPE || 'secp256k1'

const app = express()
app.use(express.json())

const client = new Client(process.env.WS_URL)
await client.connect()

const wallet = Wallet.fromSeed(FAUCET_SEED, { algorithm: FAUCET_KEY_TYPE })

async function checkFaucetAccount () {
  if (wallet.address !== FAUCET_ADDRESS) {
    console.warn("Faucet seed doesn't match faucet address. Are env vars set correctly?")
    process.exit(1)
  }

  let acctInfo
  try {
    acctInfo = await client.request({
      command: 'account_info',
      account: wallet.address,
      ledger_index: 'validated'
    })
  } catch {
    console.warn("Faucet account doesn't exist or not set up")
    process.exit(1)
  }
  if (parseInt(acctInfo.result.account_data.Balance) < FUND_AMT) {
    console.warn(`Faucet account doesn't have enough XRP. Currently: ${dropsToXrp(acctInfo.result.account_data.Balance)} XRP`)
    process.exit(1)
  }
}
await checkFaucetAccount()

app.post('/accounts', async (req, res) => {
  let destination = req.body.destination
  let generatedWallet = null
  if (!destination) {
    generatedWallet = new Wallet()
    destination = generatedWallet.address
  }

  const resp = await client.submitAndWait({
    TransactionType: 'Payment',
    Account: wallet.address,
    Amount: FUND_AMT,
    Destination: destination
  }, { autofill: true, wallet })
  console.log(resp)

  const reply = {
    account: {
      address: destination,
      classicAddress: destination
    },
    amount: FUND_AMT,
    transactionHash: resp.result.hash
  }
  if (generatedWallet) {
    reply.account.secret = wallet.seed
  }
  res.send(reply)
})

app.listen(PORT, () => { console.log(
  `Faucet server up and running at http://localhost:${PORT}/accounts`
) })
