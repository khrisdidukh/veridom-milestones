# Deploying to Midnight Preprod

Status: **not deployed yet.** Everything before the wallet step is done and tested. Deployment needs a
person: a Lace wallet, a faucet request behind a captcha, and approving transactions.

What already ran:

- the full flow with real ZK proofs on a local Midnight devnet, through the same midnight-js 4.1.1 calls
  (`deployContract`, `submitCallTx`, indexer and proof-server providers), with a headless wallet:
  [`contract/build-evidence/local-devnet-run.log`](../contract/build-evidence/local-devnet-run.log);
- the Lace provider code in [`ui/src/midnight/lace.ts`](../ui/src/midnight/lace.ts), type-checked against
  the DApp Connector API 4.0.1 and midnight-js 4.1.1, following the official zk-loan UI.

## Steps

1. **Wallet.** Install [Lace](https://chromewebstore.google.com/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk)
   in Chrome, create a Midnight wallet, and switch the network to **Preprod**. Keep the recovery phrase
   offline; it is never needed by this app.
2. **Proof server.** Lace proves with a local proof server. Start one and point Lace at it
   (**Settings > Midnight > Local `http://localhost:6300`**):

   ```bash
   docker run -p 6300:6300 midnightntwrk/proof-server:8.1.3
   ```
3. **Test tokens.** Copy the unshielded address (`mn_addr_preprod1...`), open the
   [Preprod faucet](https://midnight-tmnight-preprod.nethermind.dev/), paste it, solve the captcha and request
   tNIGHT (5,000 per request). Back in Lace, select **Generate tDUST** and confirm. Fees are paid in tDUST,
   which accrues over time once the NIGHT is registered.
4. **Build.** From the repository root:

   ```bash
   npm install
   npm run compile      # proving keys, needed by the proof server via the app
   npm run dev          # http://localhost:5173
   ```
5. **Deploy.** In the app choose **Lace wallet**, network **Preprod**, **Connect Lace**, and approve the
   connection. Press **Deploy contract** and approve the transaction. The contract address appears in the
   header.
6. **Run the flow.** Bank: register inspector, register project. Builder: accept, prove stage 1, request
   tranche. Bank: release. Builder: disclose. Each step is a transaction to approve in Lace (about half a
   minute each with a local proof server).
7. **Record it.** Add to the README: the contract address, the network (`preprod`), and one or two
   transaction ids. To reopen later, put the address in `ui/.env.local` as `VITE_CONTRACT_ADDRESS=...` and use
   **Join** after connecting. The bank role only works in the browser tab that deployed, because the bank
   secret lives in that tab's memory (by design of this demo).

## If something fails

| Symptom | Cause | Fix |
| --- | --- | --- |
| "Midnight Lace was not found" | Extension missing or Midnight not enabled | Install Lace, enable Midnight, reload |
| "Lace is on a different network" | Lace not on Preprod | Switch network in Lace |
| "Lace has no proof server configured" | Proof server setting empty | Step 2 |
| Proof server answers 400 / key not found | Proving keys missing | `npm run compile` (full, not `compile:fast`) |
| Transaction rejected for fees | No tDUST yet | Wait for the tDUST tank to fill (step 3) |

## Version check before deploying

The Preprod network runs ledger 8. This repository uses the matrix versions for it (compiler 0.31.1,
compact-runtime 0.16.0, midnight-js 4.1.1, proof server 8.1.3). Check the
[support matrix](https://docs.midnight.network/relnotes/support-matrix) on the day; do not upgrade to the
0.34/0.35 toolchains until Preprod moves to ledger 9.
