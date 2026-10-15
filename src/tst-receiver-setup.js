import { Wallet, Client } from 'xrpl'

// Set up a well-known account that holds a TST trust line with the maximum
// limit, so tutorials can send TST to it without needing the receiver's keys.
// Used by the "Send a Trust Line Token" tutorial.

const TST_ISSUER = 'rP9jPyP5kyvFRb6ZiRghAGw5u8SGAmU4bd'
const TST_RECEIVER = 'rG6ZCtKCURU58DP2iiff4qziApBGSuvPqE'
// Largest value a token amount can hold; see Currency Formats.
const MAX_TOKEN_VALUE = '9999999999999999e80'

export async function setupTSTReceiver (wsUrl, faucetOptions) {
  console.log('-------- Setting up TST receiver --------------------------------')
  if (!process.env.TST_RECEIVER_SEED || process.env.TST_RECEIVER_SEED.slice(0, 1) !== 's') {
    console.error('❌ TST_RECEIVER_SEED env var unavailable or incorrect:', process.env.TST_RECEIVER_SEED)
    return 1
  }

  const wallet = Wallet.fromSeed(process.env.TST_RECEIVER_SEED, { algorithm: 'ed25519' })
  if (wallet.address !== TST_RECEIVER) {
    console.error('❌ TST receiver address mismatch. Wrong key type?', wallet.address, TST_RECEIVER)
    return 2
  }
  const client = new Client(wsUrl)
  await client.connect()

  console.log('  funding receiver from faucet...')
  await client.fundWallet(wallet, faucetOptions) // Throws on error, probably.
  console.log('  ✅ TST receiver funded.')

  console.log('  creating TST trust line with maximum limit...')
  const trustSet = {
    TransactionType: 'TrustSet',
    Account: TST_RECEIVER,
    LimitAmount: {
      currency: 'TST',
      issuer: TST_ISSUER,
      value: MAX_TOKEN_VALUE
    }
  }
  const response = await client.submitAndWait(trustSet, { autofill: true, wallet })
  if (response.result.meta.TransactionResult === 'tesSUCCESS') {
    console.log('  ✅ TST receiver trust line set.')
  } else {
    console.error('  ❌ Error setting TST trust line:', response.result)
    client.disconnect()
    return 3
  }

  console.log('  ✅ TST receiver setup done')
  client.disconnect()
  return 0
}
