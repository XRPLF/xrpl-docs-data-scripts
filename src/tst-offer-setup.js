import { Wallet, Client, AccountSetAsfFlags, xrpToDrops } from 'xrpl'

// Create offers to issue TST on testnet pegged to XRP at a rate of
// 1 TST = 10 XRP with a spread of ±15%.
// Issues up to 1 billion TST (chosen to be large enough that it won't likely
// run out, but the total amount of XRP requested after spread is plenty less
// than 100 billion)

const XRP_PER_TST = 10
const SPREAD = 0.149
const TOTAL_TST = 1000000000
const TST_ISSUER = 'rP9jPyP5kyvFRb6ZiRghAGw5u8SGAmU4bd'

export async function setupTSTIssuer (wsUrl, faucetOptions) {
  console.log('-------- Setting up TST issuer ----------------------------------')
  if (!process.env.TST_SEED || process.env.TST_SEED.slice(0, 1) !== 's') {
    console.error('❌ TST_SEED env var unavailable or incorrect:', process.env.TST_SEED)
    return 1
  }

  const wallet = Wallet.fromSeed(process.env.TST_SEED, { algorithm: 'secp256k1' })
  if (wallet.address !== TST_ISSUER) {
    console.error('❌ TST issuer address mismatch. Wrong key type?', wallet.address, TST_ISSUER)
    return 2
  }
  const client = new Client(wsUrl)
  await client.connect()

  console.log('  funding issuer from faucet...')
  await client.fundWallet(wallet, faucetOptions) // Throws on error, probably.
  console.log('  ✅ TST issuer funded.')

  console.log('  setting Default Ripple flag...')
  const defaultRippleAccountSet = {
    TransactionType: 'AccountSet',
    Account: TST_ISSUER,
    SetFlag: AccountSetAsfFlags.asfDefaultRipple
  }
  const response1 = await client.submitAndWait(defaultRippleAccountSet, { autofill: true, wallet })
  if (response1.result.meta.TransactionResult === 'tesSUCCESS') {
    console.log('  ✅ TST issuer Default Ripple enabled.')
  } else {
    console.error('  ❌ Error setting Default Ripple:', response1.result)
    client.disconnect()
    return 3
  }

  console.log('  Offering to issue tokens for XRP...')
  const sellTokenOffer = {
    TransactionType: 'OfferCreate',
    Account: TST_ISSUER,
    TakerGets: {
      currency: 'TST',
      issuer: TST_ISSUER,
      value: String(TOTAL_TST)
    },
    TakerPays: xrpToDrops((TOTAL_TST * XRP_PER_TST) * (1+SPREAD))
  }
  const response2 = await client.submitAndWait(sellTokenOffer, { autofill: true, wallet })
  // TODO: maybe use failHard?
  if (response2.result.meta.TransactionResult === 'tesSUCCESS') {
    console.log('  ✅ TST sell (issuing) offer placed.')
  } else {
    console.error('  ❌ Error placing TST sell offer:', response2.result)
    client.disconnect()
    return 4
  }

  console.log('  Offering to buy tokens back...')
  const buyTokenOffer = {
    TransactionType: 'OfferCreate',
    Account: TST_ISSUER,
    TakerGets: xrpToDrops((TOTAL_TST * XRP_PER_TST) * (1-SPREAD)),
    TakerPays: {
      currency: 'TST',
      issuer: TST_ISSUER,
      value: String(TOTAL_TST)
    }
  }
  const response3 = await client.submitAndWait(buyTokenOffer, {autofill: true, wallet:wallet})
  if (response3.result.meta.TransactionResult === 'tesSUCCESS') {
    console.log('  ✅ TST buy (redemption) offer placed.')
  } else {
    console.error('  ❌ Error placing TST buy offer:', response3.result)
    client.disconnect()
    return 5
  }

  console.log('  ✅ TST issuer setup done')
  client.disconnect()
  return 0
}
