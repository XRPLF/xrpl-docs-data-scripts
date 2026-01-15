# XRPL Docs Data Scripts [DRAFT]

The scripts contained in this repository re-create specific persistent data in an [XRP Ledger (XRPL)](https://xrpl.org) test network after that network has been reset, so that XRPL documentation can depend on the existence of that data.

## Setup & Usage

These scripts require Node.js (LTS) and `npm`.

```sh
npm i
```

Secrets must be provided using an `.env` file at the repo top. With that in place, you can run the scripts:

```sh
npm run make-data
```
