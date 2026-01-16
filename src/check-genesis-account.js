import { Client, AccountSetAsfFlags, dropsToXrp, RippledError } from 'xrpl'

export async function checkGenesisAccount (wsUrl) {
  console.log('-------- Checking genesis account -------------------------------')
  const client = new Client(wsUrl)
  await client.connect()

  let genesisAcctInfo
  try {
    genesisAcctInfo = await client.request({
      command: 'account_info',
      account: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
      ledger_index: 'validated'
    })
  } catch (err) {
    if (err instanceof RippledError) {
      if (err.data.error === 'actNotFound') {
        console.log('  ✅ Genesis account does not exist.')
        client.disconnect()
        return 0
      }
    }
    console.error('  ❌', err)
    return 1
  }
  const acctData = genesisAcctInfo.result.account_data

  const xrpHeld = dropsToXrp(acctData.Balance)
  if (xrpHeld) {
    // TODO: compare to reserve to see if any can be sent out
    console.log('  ⚠️  XRP Balance:', xrpHeld)
  } else {
    console.log('  ✅ No XRP in genesis account')
  }

  const disableMaster = acctData.Flags & AccountSetAsfFlags.asfDisableMaster
  if (disableMaster) {
    console.log('  ✅ Genesis master key is disabled')
  } else {
    console.log('  ⚠️  Genesis master key can be used')
  }

  if (acctData.RegularKey) {
    console.log('  Genesis account has regular key:', acctData.RegularKey)
  } else {
    console.log('  No regular key set.')
  }

  client.disconnect()
  return 0
}
