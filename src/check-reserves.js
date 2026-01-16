import { Client, xrpToDrops } from 'xrpl'

export async function checkReserves (wsUrl) {
  console.log('-------- Checking reserves --------------------------------------')
  console.log('  checking Mainnet reserves...')
  const mainnetClient = new Client('wss://s1.ripple.com/')
  await mainnetClient.connect()
  const mainnetInfo = await mainnetClient.request({ command: 'server_info' })
  const dataMainnet = mainnetInfo.result.info.validated_ledger
  mainnetClient.disconnect()

  console.log('  checking this network reserves...')
  const client = new Client(wsUrl)
  await client.connect()
  const thisNetInfo = await client.request({ command: 'server_info' })
  const dataThisNet = thisNetInfo.result.info.validated_ledger
  client.disconnect()

  let errorCount = 0
  if (dataMainnet.reserve_base_xrp === dataThisNet.reserve_base_xrp) {
    console.log('  ✅ Base reserve matches')
  } else {
    console.log(`  ❌ Base reserve mismatch: ${dataThisNet.reserve_base_xrp} XRP vs ${dataMainnet.reserve_base_xrp} XRP on Mainnet`)
    errorCount += 1
  }
  if (dataMainnet.reserve_inc_xrp === dataThisNet.reserve_inc_xrp) {
    console.log('  ✅ Owner reserve matches')
  } else {
    console.log(`  ❌ Owner reserve mismatch: ${dataThisNet.reserve_inc_xrp} XRP vs ${dataMainnet.reserve_inc_xrp} XRP on Mainnet`)
    errorCount += 1
  }
  if (dataMainnet.base_fee_xrp === dataThisNet.base_fee_xrp) {
    console.log('  ✅ Transaction fee matches')
  } else {
    console.log(`  ❌ Transaction fee mismatch: ${xrpToDrops(dataThisNet.base_fee_xrp)} drops vs ${xrpToDrops(dataMainnet.base_fee_xrp)} drops on Mainnet`)
    errorCount += 1
  }

  return errorCount
}
