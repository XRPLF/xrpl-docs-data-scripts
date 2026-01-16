# XRPL Docs Data Scripts

The scripts contained in this repository re-create specific persistent data in an [XRP Ledger (XRPL)](https://xrpl.org) test network after that network has been reset, so that XRPL documentation can depend on the existence of that data.

***WARNING: This depends on the `faucetProtocol` parameter from [xrp.js PR #3186](https://github.com/XRPLF/xrpl.js/pull/3186). It won't work out of the box until that change is part of an xrpl.js release and the `package.json` is updated accordingly.***

## Setup & Usage

These scripts require Node.js (LTS) and `npm`.

```sh
npm i
```

Two things are needed before you can run the scripts:

1. You must provide secrets and environment information using an `.env` file at the repo top. See `example.env` for an example.
2. Your network or test server needs a faucet running. See [Faucet Setup](#faucet-setup) for examples.

With both of those in place, you can run the scripts:

```sh
npm run make-data
```

You can also run _just_ the read-only checks on network status, even without a faucet:

```sh
npm run test-only
```

### Network Setup - Stand-Alone Mode

You can test this using an XRP Ledger core server (`rippled` or `xrpld`) in stand-alone mode. First, start the server:

```sh
rippled -a --start
```

In this repo's `.env` file, set the `WS_URL` to use either the public or admin WebSocket API provided by your server. For example, to connect to the admin WS port of a locally-running `rippled` using the default config file:

```ini
WS_URL=ws://localhost:6006/
```

In stand-alone mode, the server won't close new ledgers automatically because there's no consensus process. You can approximate one by running `ledger_accept` automatically, for example, the following command automatically closes a ledger every 3 seconds:

```sh
watch -n 3 rippled ledger_accept
```

### Network Setup - Private Network with Docker

You can [run an entire multi-node private network using Docker](https://xrpl.org/docs/infrastructure/testing-and-auditing/run-private-network-with-docker). The network should automatically start when you start the containers. For example:

```sh
docker-compose up -d
```

If you followed the private network tutorial exactly, you can use the public WebSocket ports of any of the three validators, which are mapped to ports `8001`, `8002`, and `8003` on the host machine. For example:

```ini
WS_URL=ws://localhost:8001/
```

The private network closes ledgers automatically, so the only further setup is the faucet.


### Faucet Setup

This repo contains a minimalist XRP Faucet server you can use to fund accounts on a private network. It uses the same `.env` file for configuration as the main scripts. You can run the faucet as follows:

```sh
npm run faucet
```

The faucet runs until killed (for example with Ctrl-C), so run this in a separate shell from the one you're running the scripts in.

You can configure the faucet with the following vars:

| Field | Definition |
|-------|------------|
| `WS_URL` | The WebSocket URL the faucet should use to connect to the XRP Ledger server. The faucet uses the same configuration as the data scripts. |
| `FAUCET_PORT` | What port the faucet should listen on. If unspecifies, uses **6061**. |
| `FAUCET_ADDRESS` | Address (base58) of the faucet account which holds XRP. If unspecified, uses the genesis account **rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh**. |
| `FAUCET_SEED` | Seed (base58) of the faucet account. If unspecified, uses the genesis account's seed. |
| `FAUCET_KEY_TYPE` | Algorithm to use when deriving the faucet account's address from the seed (`secp256k1` or `ed25519`). If unspecified, uses **secp256k1**. |
| `FUND_XRP` | How much XRP (not drops) to provide on each call. If unspecified, uses **1000**. |

## Summary of Scripts Included

1. `check-env-vars.js` - Confirms that certain environment variables, necessary for these scripts to run, are defined properly.
2. `check-genesis-account.js` - Check the status of the genesis account to see if it has readily-available XRP. (Read-only)
3. `check-amendments.js` - Compare amendment status to Mainnet to see if this network is missing any amendments that are enabled on Mainnet. (Read-only)
4. `check-reserves.js` - Compare reserves and base transaction to see if this network's settings match Mainnet's. (Read-only)
5. `tst-offer-setup.js` - Ensures that the **TST Issuer** rP9jPyP5kyvFRb6ZiRghAGw5u8SGAmU4bd is funded and there are offers to buy and sell TST for XRP at a well-defined exchange rate and spread. These are used in DEX tutorials.

