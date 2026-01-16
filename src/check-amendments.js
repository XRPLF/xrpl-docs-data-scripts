import { Client } from 'xrpl'

const RETIRED_BY_VERSION = {
  // Reminder to update this list each time a new release retires pre-amendment
  // functionality.
  FeeEscalation: '1.2.0',
  MultiSign: '1.6.0',
  TrustSetAuth: '1.6.0',
  Flow: '1.6.0',
  CryptoConditions: '1.6.0',
  TickSize: '1.6.0',
  PayChan: '1.6.0',
  fix1368: '1.6.0',
  Escrow: '1.6.0',
  fix1373: '1.6.0',
  EnforceInvariants: '1.6.0',
  SortedDirectories: '1.6.0',
  fix1528: '1.6.0',
  fix1523: '1.6.0',
  fix1512: '1.6.0',
  fix1201: '1.6.0',
  FlowCross: '2.6.0'
}

export async function checkAmendments (wsUrl) {
  console.log('-------- Checking amendments ------------------------------------')
  console.log('  checking Mainnet amendment status...')
  const mainnetClient = new Client('wss://s1.ripple.com/')
  await mainnetClient.connect()
  const mainnetFeature = await mainnetClient.request({ command: 'feature' })
  mainnetClient.disconnect()

  console.log('  checking this network amendment status...')
  const client = new Client(wsUrl)
  await client.connect()
  const feature = await client.request({ command: 'feature' })
  const serverInfo = await client.request({ command: 'server_info' })
  const serverVersion = serverInfo.result.info.build_version
  client.disconnect()

  let missingAmendmentCount = 0
  for (const amendID in feature.result.features) {
    const amendStatus = feature.result.features[amendID]
    const mainnetStatus = mainnetFeature.result.features[amendID]
    if (!mainnetStatus) {
      console.log(`  Unknown on Mainnet: ${amendStatus.name}`)
    } else if (amendStatus.enabled) {
      if (!mainnetStatus.enabled) {
        console.log(`  ⚠️  Not enabled on Mainnet: ${amendStatus.name}`)
      }
    } else {
      if (mainnetStatus.enabled) {
        if (amendStatus.name in RETIRED_BY_VERSION &&
            RETIRED_BY_VERSION[amendStatus.name] < serverVersion) {
          // console.log(`  Retired: ${amendStatus.name}`)
        } else {
          console.log(`  ❌ Enabled on Mainnet but not this net: ${amendStatus.name}`)
          missingAmendmentCount += 1
        }
      }
    }
  }

  if (!missingAmendmentCount) {
    console.log('  ✅ All Mainnet amendments enabled here')
  }
  return missingAmendmentCount
}
