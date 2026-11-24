# Deploying to Midnight Preprod

Status: **ledger 9 build ready, not yet deployed.** Preprod moved to ledger 9 on 9 November 2026
([Ledger 9 upgrade](https://docs.midnight.network/relnotes/ledger-9)). On 24 November 2026 the contract and the app were
rebuilt for ledger 9 (Compact 0.36.0, compact-runtime 0.21.0, Midnight.js 5.0.1); see the README section
"Ledger 9 and Preprod".

## The short way: the hosted app

The app at <https://khrisdidukh.github.io/veridom-milestones/> serves the proving keys, so nothing has to be
built or started locally.

1. **Wallet.** Chrome with [Lace](https://chromewebstore.google.com/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk),
   Midnight enabled, network **Preprod**.
2. **Test tokens.** tNIGHT from the [Preprod faucet](https://midnight-tmnight-preprod.nethermind.dev/) (captcha) to
   the wallet's unshielded address (`mn_addr_preprod1…`). In Lace, **Generate tDUST** and confirm. The ledger 9
   upgrade cleared Preprod DUST registrations that were not backed by cNIGHT, so do this again even if it was
   done before 9 November. Fees are paid in tDUST, which accrues
   over time after that step, so wait until the tDUST balance is above zero.
3. **Open** <https://khrisdidukh.github.io/veridom-milestones/?lace=preprod>. The link preselects the wallet
   path and Preprod.
4. **Connect Lace** and approve the connection. The first line under Transactions says how proofs are made and
   whether the wallet has tDUST.
5. **Deploy and run stage 1.** The checklist at the top shows eight transactions. Approve each one in Lace when
   it asks. Between approvals the app proves; with a proof server that is about half a minute per
   transaction, in the wallet itself it can take longer. Keep the tab open and in front.
6. **Download the record.** The JSON file holds the contract address, the eight tx ids and block heights. It
   holds no secret, amount or evidence hash. Add the address and tx ids to the README.

To stop after the deployment only, use **Deploy contract** instead of step 5 and continue by hand in the role
panels.

## If something fails

The failed step turns red and shows the message from the wallet or the node. **Try again from "…"** continues
from that step with the same contract. The record keeps the error text.

| Symptom | Cause | Fix |
| --- | --- | --- |
| "Midnight Lace was not found" | Extension missing or Midnight not enabled | Install Lace, enable Midnight, reload |
| "Lace is on a different network" | Lace not on Preprod | Switch network in Lace, reload |
| Connect line says "no tDUST yet" | tDUST not generated or not accrued | Lace: Generate tDUST, wait, reload |
| Transaction rejected for fees | Too little tDUST for this transaction | Wait for the tDUST balance to grow, then Try again |
| "Lace offered no way to make proofs" | No in-wallet prover and no proof server set | Lace: Settings > Midnight > proof server |
| A step stays on "proving" for minutes | In-wallet proving of a larger circuit | Wait; `discloseToAuditor` is the largest (10 MB proving key) |
| Page was reloaded mid-run | Private states live in the tab's memory | Start a new run; the old contract stays on chain but cannot be continued |

## Running the app locally instead

```bash
npm install
npm run compile      # proving keys, served to the wallet by the dev server
npm run dev          # http://localhost:5173/?lace=preprod
```

A local proof server (`docker run -p 6300:6300 midnightntwrk/proof-server:<matrix version>`, then Lace: Settings >
Midnight > Local `http://localhost:6300`) is the fastest way to prove.

To reopen a deployed contract in the same tab session, put the address in `ui/.env.local` as
`VITE_CONTRACT_ADDRESS=...` and use **Join** after connecting. The bank role only works in the tab that
deployed, because the bank secret lives in that tab's memory.

## Why not a headless deployment

The local devnet test deploys with a headless wallet. On Preprod that would need a Blockfrost project id
(Blockfrost has served the Preprod indexer and RPC since October 2026; the old `indexer.preprod.midnight.network`
answers 410) and a wallet sync of about an hour. The wallet path is also the one a bank or a builder would use.

## Version check before deploying

Preprod, Preview and Mainnet run ledger 9.1.0.1 on node 2.1.101 (support matrix of 13 November 2026). The
ledger 9 set is Compact 0.36.0 (language 0.28.0), compact-runtime 0.21.0, Midnight.js 5.0.0, Compact.js 3.0.0,
on-chain runtime v4, wallet SDK 2.0.0, DApp Connector API 4.1.0 (now under `@midnightntwrk`), proof server
9.0.0 and indexer 4.4.101. This repository uses that set since 24 November 2026 (Compact 0.36.0, compact-runtime 0.21.0, Midnight.js
5.0.1, DApp Connector API 4.1.0). Check the [support matrix](https://docs.midnight.network/relnotes/support-matrix) on the day.
