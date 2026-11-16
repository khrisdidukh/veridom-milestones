# Veridom Milestones

**Private milestone proofs for construction-loan draws, on Midnight.**

A bank pays a construction loan in tranches, one per finished stage of the build: foundation, shell,
roof and so on. Today the builder hands over everything for every tranche: site photos, invoices,
contractor names, amounts, personal data. Copies of it end up in the bank's systems and with the
bank's surveyors.

Veridom Milestones replaces that hand-over with proofs. A Compact contract on Midnight shows, on a public
ledger, that

- **stage _k_ is complete**: an inspector the bank authorised signed the evidence bundle for exactly this
  project, this stage and this contract;
- **the cumulative draw stays within the approved loan limit** and each tranche within its stage cap;

while the evidence, the amounts, the contractors and the builder's identity stay on the builder's device.
When an auditor needs one fact, the builder opens exactly that fact, with consent recorded on chain.

Veridom Milestones is a new module of [Veridom](https://veridom.space), a live house-building control app that
tracks a private home build against the approved plans with a diary, photos and inspections.

| | |
| --- | --- |
| Contract | [`contract/src/veridom-milestones.compact`](contract/src/veridom-milestones.compact), 8 provable circuits, 8 pure circuits |
| Toolchain | `compact` 0.5.3, compiler **0.31.1**, language 0.23, compact-runtime 0.16.0, midnight-js 4.1.1 (the [support matrix](https://docs.midnight.network/relnotes/support-matrix) for Preview, Preprod and Mainnet) |
| Compile record | [`contract/build-evidence/compile.log`](contract/build-evidence/compile.log) |
| Live app | **<https://khrisdidukh.github.io/veridom-milestones/>**: press **Run stage 1 for me**. No wallet, no install |
| Tests | 50 simulator tests (`npm test`); 6 end-to-end tests with real ZK proofs on a local devnet (`npm run test:e2e`), one of which drives the web app through the wallet connector; a browser flow test (`npm run test:ui`) |
| Devnet run record | [`contract/build-evidence/local-devnet-run.log`](contract/build-evidence/local-devnet-run.log): 17 proven transactions with tx ids and blocks (9 from the headless run, 8 from the web app) |
| Frontend | React + TypeScript, runs the contract in the browser (simulator) or through the Lace wallet |
| Preprod | Not deployed yet. One link and two buttons: see [Deploying to Preprod](#deploying-to-preprod) |
| Pitch | [slide deck (PDF)](docs/slides/veridom-milestones-deck.pdf) ([HTML source](docs/slides/deck.html)) |
| Demo video | [docs/video/veridom-milestones-demo.mp4](docs/video/veridom-milestones-demo.mp4) (2 min 30 s, captions, no sound needed) |
| License | [Apache-2.0](LICENSE); third-party attribution in [NOTICE](NOTICE) |

![The app after two paid stages: elevation drawing, public draw schedule, bank actions](docs/images/ui-two-stages-paid.png)

---

## What we built this wave

This is our first Midnight Buildathon submission (wave 3). Everything in this repository was written during
the wave, in two rounds.

**Round 1 (4 to 7 November): the protocol.**

- **Compact contract** with lender and builder roles derived from witness secrets, an inspector registry, a
  commitment to the loan terms, in-circuit Schnorr verification of inspector attestations, spent-signature
  nullifiers, a private running total kept as a commitment and updated through write-back witnesses, stage-cap
  and loan-limit checks over private values, and salted selective-disclosure receipts.
- **Simulator test suite**: 50 tests, including every negative case we could name: tranche over the limit,
  tranche over the stage cap, unauthorised, rogue and revoked inspectors, evidence swapped after signing, a
  replayed attestation (same stage, other stage, other project, other contract), disclosure without consent,
  a tampered disclosure packet, a forged Schnorr challenge reduction, and a scan of the full public state for
  any private value.
- **End-to-end run on a local Midnight devnet** (node 1.0.400, indexer 4.3.5, proof server 8.1.3): deploy plus 8
  circuit calls with real ZK proofs, state read back from the indexer, an auditor packet verified against it.
- **Frontend** with four roles, a dual view of the public ledger and the builder's private state, and a log of
  what moves on chain next to what moves off chain.

**Round 2 (16 November): from "wired for a wallet" to "tested through the wallet connector".**

- **Guided run.** One button deploys a fresh contract and walks stage 1 through all eight circuits, as a
  checklist that says what each transaction proves and shows its tx id and block. It works in the simulator
  and through the wallet, stops at the first failure and continues from that step.
- **The web app tested through the DApp Connector on a devnet.** A new end-to-end test opens the real app in
  Chromium, gives it a stand-in for the Lace extension backed by the devnet's funded wallet, presses the one
  button, and then reads the contract back from the indexer on its own. Eight proven transactions come from
  the browser. Before this, the wallet path was only type-checked.
- **A public run record.** The app keeps the contract address, tx ids and block heights of a network run in
  the browser and offers them as a JSON file. A test checks that no amount, salt or secret is in it.
- **Wallet checks.** The app reports whether the wallet has tDUST for fees before the first transaction, and
  uses the wallet's proof server directly if the wallet offers no prover of its own.
- **Live app** on GitHub Pages with the proving keys next to it, a demo video and an updated deck.

Next: the Preprod run (see [the stop-point below](#deploying-to-preprod)), and connecting the evidence bundle
to the Veridom diary so a stage's photos and inspection report feed the proof directly. The full list is in
[Roadmap](#roadmap).

---

## How judges can test it

### 0. In the browser, nothing to install

Open <https://khrisdidukh.github.io/veridom-milestones/> and press **Run stage 1 for me**. The compiled
circuits run in your tab on the official `compact-runtime`. Then continue by hand with stage 2 in the role
panels, or follow the walk-through in option 2.

### Locally

Requirements: Node.js 22, npm 11 (`npx npm@11 ...` works if your npm is older). Docker only for option 3.

```bash
git clone <this repo> && cd veridom-milestones
npm install            # npm 11.10+; npm 10 fails on vitest 5 peer deps (use npx npm@11.21.0 install)
```

### 1. Contract tests (one minute, no network)

```bash
npm test
```

Runs the compiled circuits on the official `@midnight-ntwrk/compact-runtime` against a real contract state.
Expected: `Test Files 5 passed, Tests 50 passed`.

### 2. The app in your browser (no wallet, no network)

```bash
npm run dev            # http://localhost:5173
```

Keep **Simulator** selected. **Run stage 1 for me** does steps 1 to 9 below in one go. To do them yourself,
press **Deploy contract** and walk through the roles on the right:

1. **Bank**: Register inspector #7.
2. **Builder**: Send loan application to the bank (the default plan: limit EUR 300,000, six stages).
3. **Bank**: Register project on chain.
4. **Builder**: Accept project and prove the terms.
5. **Builder**: Use a sample bundle (or add your own photos; they are hashed locally, never uploaded),
   then Send bundle to the inspector.
6. **Inspector**: Sign stage 1.
7. **Builder**: Prove stage 1 complete. The drawing inks in the foundation. Then Request tranche 1.
   Try an amount above the cap first: the contract rejects it.
8. **Bank**: the amount it received off chain is checked against the on-chain commitment. Release tranche 1.
9. **Builder**: Open one fact to an auditor. **Auditor**: Verify against the ledger. Then
   Open a fact without consent: the contract refuses.

Watch the **Public ledger** pane: it never shows an amount, a hash of the evidence, or a secret. The
**Builder's private state** pane shows what stays on the device.

The same flow is automated: with `npm run dev` running, `npx playwright install chromium` once, then
`npm run test:ui`.

### 3. Real proofs on a local Midnight devnet (about 5 minutes)

```bash
npm run compile        # full compile with proving keys (~45 s); keys are not committed
npm run devnet:up      # node 1.0.400, indexer 4.3.5, proof server 8.1.3 (Docker)
npx playwright install chromium   # once, for the web-app test
npm run test:e2e
npm run devnet:down
```

Two test files run, about 15 minutes together on a laptop-class machine:

- `local-devnet.e2e.test.ts` deploys the contract and runs the whole flow through midnight-js with a headless
  wallet, including a replayed attestation and an over-limit tranche that never reach the chain.
- `lace-connector.e2e.test.ts` opens the web app in Chromium with a stand-in for the Lace extension (DApp
  Connector API 4.0.1 shape, backed by the devnet's funded wallet), presses **Deploy and run stage 1**, waits
  for eight proven transactions and checks the contract state on the indexer independently of the page.

Each proven transaction takes 25 to 60 seconds. The run writes
[`contract/build-evidence/local-devnet-run.log`](contract/build-evidence/local-devnet-run.log).
The wallet is the local devnet's public genesis seed, which only exists on a local network.

### Recompiling

```bash
npm run compile        # needs the Compact toolchain: compact update 0.31.1
```

The script records versions, the compiler output and SHA-256 hashes of all artifacts in
`contract/build-evidence/compile.log`. Generated bindings, ZKIR and verifier keys are committed in
`contract/src/managed/veridom-milestones`; proving keys (36 MB) are regenerated by the compile.

---

## Architecture

```mermaid
flowchart LR
  subgraph Builder device
    B[Builder UI] --> BPS[(Private state:<br/>terms + salts,<br/>running total,<br/>evidence hashes,<br/>tranche amounts)]
    BPS -->|witnesses| PROVER
  end
  subgraph Inspector
    I[Inspector signer<br/>Jubjub Schnorr key]
  end
  subgraph Bank
    K[Bank UI] --> KPS[(Bank secret)]
  end
  subgraph Midnight
    PROVER[Proof server] -->|ZK proof| TX[Transaction]
    TX --> L[(Public ledger:<br/>key hashes, inspector keys,<br/>commitments, stage status,<br/>nullifiers, receipts)]
    L --> IDX[Indexer]
  end
  A[Auditor] -->|verify packet with<br/>pure circuits| IDX

  B -. evidence bundle .-> I
  I -. signature over contract, project,<br/>stage, evidence hash .-> B
  B -. loan terms + salt in the agreement .-> K
  B -. tranche amount + salt .-> K
  B -. one fact + opening .-> A
  K -->|registerInspector, registerProject,<br/>releaseTranche| PROVER
```

Dotted lines are off-chain hand-overs between the parties; solid lines are transactions or reads. A more
detailed write-up with a sequence diagram is in [docs/architecture.md](docs/architecture.md).

```
contract/
  src/veridom-milestones.compact   the contract
  src/schnorr.compact              Jubjub Schnorr verifier (from the official zk-loan example)
  src/witnesses.ts                 private state and witnesses
  src/inspector.ts                 inspector key pair and milestone signer
  src/project.ts                   loan terms, evidence bundles, planned draws
  src/disclosure.ts                disclosure packets and the auditor's check
  src/simulator.ts                 in-process simulator used by tests and the UI
  src/managed/veridom-milestones/  compiler output (bindings, ZKIR, verifier keys)
  test/                            50 simulator tests
  e2e/                             local devnet end-to-end tests (headless, and the web app via the connector)
  build-evidence/                  compile record, devnet run record
ui/
  src/useMilestones.ts             app state: parties, actions, off-chain hand-overs, the guided run
  src/guided.ts                    plan and public record of the guided run
  src/backend/simulator.ts         contract in the browser
  src/midnight/lace.ts             Lace wallet + midnight-js providers
  src/components/                  drawing, role panels, ledger views
  e2e/simulator-flow.mjs           browser flow test
devnet/compose.yml                 local Midnight network
docs/                              architecture, Preprod guide, slides, demo video, submission notes
```

---

## Midnight integration

### The dual ledger, field by field

| Data | Where | Why |
| --- | --- | --- |
| Bank secret, builder secret | Private (witness `localSecret`) | Caller identity. Only `persistentHash` of each, with a role tag, reaches the ledger |
| Loan limit, per-stage caps | Private (witness `loanTerms`) | Checked in circuit against `termsCommitment` |
| Cumulative amount drawn | Private (witness `drawnTotal`) | Checked against `drawnCommitment`, replaced by a fresh commitment on each draw |
| Tranche amount | Private (witness `trancheAmount`) | Proven `> 0`, `<= cap[k]`, `total + amount <= limit`; stored as `trancheCommitment` |
| Evidence-bundle hash (photos, invoices, contractors) | Private (witness `milestoneEvidence`) | Only inside the inspector's signed message and a hiding commitment |
| Inspector signature | Private (witness) | Verified in circuit; only a nullifier of it is published |
| Lender key hash, builder key hash | Public | Pseudonymous; reveal no identity |
| Inspector id and public key | Public | The bank's panel; a stage record shows which inspector signed |
| Stage status, counts | Public | What the bank needs: stage _k_ proven, tranche requested, paid |
| Commitments (terms, total, evidence, tranche) | Public | Hiding (`persistentCommit` with a 32-byte salt); openable to one party at a time |
| Disclosure receipts | Public | Salted commitments: the ledger shows that a disclosure happened, not what or to whom |

### Circuits

| Circuit | Caller | Proves / does |
| --- | --- | --- |
| constructor | bank | Pins `lenderKey(secret)` as lender |
| `registerInspector`, `revokeInspector` | bank | Maintains the inspector registry |
| `registerProject` | bank | Project id, builder key hash, terms commitment, stage count |
| `acceptProject` | builder | Builder holds exactly the committed terms; opens a private running total at zero |
| `attestMilestone` | builder | Registered inspector's Schnorr signature over (contract, project, stage, evidence hash); signature not spent; stages in order |
| `requestTranche` | builder | Stage attested; terms and running total open their commitments; `0 < amount <= cap[k]`; `total + amount <= limit` |
| `releaseTranche` | bank | Marks the tranche paid (payment itself runs on the bank's rails) |
| `discloseToAuditor` | builder | Builder holds the opening of the chosen fact's commitment; records a salted receipt |

Pure circuits (`lenderKey`, `builderKey`, `termsCommitment`, `amountCommitment`, `evidenceCommitment`,
`receiptCommitment`, `milestoneMessage`, `schnorrChallenge`) are generated as TypeScript too, so the bank,
the inspector and the auditor compute exactly what the contract computes.

### Design notes

- **Identity from witness secrets, not wallets.** As the
  [zk-loan tutorial](https://docs.midnight.network/tutorials/zk-loan/smart-contract) explains,
  `ownPublicKey()` is prover-supplied, so every role check compares a ledger key hash with
  `persistentHash(tag, localSecret())`. One consequence is useful: any wallet can pay the fee for any role.
- **Inspector signatures verified inside the proof.** Compiler 0.31.1 has no standard-library Schnorr verifier
  yet, so `schnorr.compact` is the documented polyfill from the official example, including the range check
  on the witness-assisted challenge reduction. A regression test feeds an out-of-range quotient and expects
  rejection.
- **Replay protection on three levels.** The signed message binds `kernel.self()`, the project and the stage;
  a nullifier of each signature goes into `usedAttestations`; stages are attested in order.
- **Private state that changes.** `storeAcceptance` and `storeDraw` are write-back witnesses: they draw fresh
  salts and record the new running total and the tranche opening in the caller's private state, which
  midnight-js persists once the transaction succeeds. A failed assert leaves both states untouched (tested).
- **Vector index at proving time.** Compact needs constant vector indices, so `capForStage` folds over the caps
  together with a constant index vector.
- **Selective disclosure with consent on chain.** The value travels off chain as a packet; the auditor checks
  it against the ledger (`verifyDisclosurePacket`): the value opens the on-chain commitment, and a consent
  receipt from the builder exists. A leaked packet without a receipt fails.

### Honest limits

- Payment of the tranche happens on the bank's own rails; the contract records the release.
- `TotalDrawn` disclosures are point-in-time: after the next draw the commitment changes and the old packet no
  longer verifies.
- Stage numbers, inspector ids and the fact that a disclosure happened are public by design. Which stage a
  disclosure concerns is visible from the transaction transcript.
- The inspector's key lives in the browser in this demo; production keys belong in an HSM or hardware wallet.
- In the demo one person plays all four roles in one tab. In production each party runs its own instance and
  keeps its own private state.
- In wallet mode the private states live in the tab's memory. Reloading the page loses the bank's and the
  builder's secrets, so a contract deployed from a tab can only be continued from that tab.
- Not deployed on a public network yet (see below). All on-chain evidence so far is from a local devnet.

---

## Deploying to Preprod

**Status: not deployed yet.** We say so plainly because the last step needs a person: a Lace wallet with test
tokens and a click on each approval. Everything up to that click is built and tested:

- the same midnight-js calls (`deployContract`, `submitCallTx`, indexer and proof providers) run on the local
  devnet with a headless wallet;
- the app's wallet path in [`ui/src/midnight/lace.ts`](ui/src/midnight/lace.ts) runs on the local devnet
  through a stand-in with the connector's shape (`lace-connector.e2e.test.ts`).

What that does not cover is the Lace extension itself and the Preprod network.

The run itself is short, because the live app already serves the proving keys:

1. In Chrome with [Lace](https://chromewebstore.google.com/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk) on
   **Preprod**, funded with tNIGHT from the [faucet](https://faucet.preprod.midnight.network/) and with tDUST
   generated, open <https://khrisdidukh.github.io/veridom-milestones/?lace=preprod>.
2. Press **Connect Lace** and approve the connection. The log line says whether the wallet has tDUST.
3. Press **Deploy and run stage 1**. Approve each of the eight transactions in Lace as it comes up.
4. Press **Download the record**. The file holds the contract address, tx ids and block heights.

If a step fails, the checklist shows the wallet's or the node's message and a button to continue from that
step. Full detail and a table of known failure causes: [docs/deploy-preprod.md](docs/deploy-preprod.md).

Running a headless deployment from CI instead would need a Blockfrost project id, since Blockfrost has served
the Preprod indexer since October 2026; we chose the wallet path because that is how a bank or a builder would
use it.

---

## Roadmap

| When | What |
| --- | --- |
| Now | Preprod run through Lace, contract address and tx ids in this README |
| Next 4 weeks | Evidence bundles straight from the Veridom diary (photos, inspection report, invoices of a stage); private state persisted and encrypted in the browser, so the roles survive a reload; each role in its own session instead of one tab |
| Next 3 months | Inspector signing app with hardware-held keys; several inspectors per stage (k of n); stage-gated grants as a second use of the same contract |
| After that | Pilot on the founder's own build, then with a lender; standard-library Schnorr once ledger 9 reaches Preprod and Mainnet |

---

## Versions

| Component | Version | Source |
| --- | --- | --- |
| Compact devtools (`compact`) | 0.5.3 | official installer, `compact-installer.sh` |
| Compact compiler | 0.31.1 (language 0.23.0) | `compactc_v0.31.1_x86_64-unknown-linux-musl.zip` release |
| `@midnight-ntwrk/compact-runtime` | 0.16.0 | required by the generated code |
| `@midnight-ntwrk/midnight-js-*` | 4.1.1 | |
| `@midnight-ntwrk/dapp-connector-api` | 4.0.1 | |
| `@midnight-ntwrk/wallet-sdk` | 1.2.0 | e2e only |
| `@midnight-ntwrk/ledger-v8` / `onchain-runtime-v3` | 8.1.2 / 3.1.1 | overrides as in the official examples |
| Node / proof server / indexer | 1.0.400 / 8.1.3 / 4.3.5 | devnet images |

These are the versions the [support matrix](https://docs.midnight.network/relnotes/support-matrix) lists for
Preview, Preprod and Mainnet (updated 2 Nov 2026). Newer toolchains (0.34, 0.35) target ledger 9 and do not
deploy to those networks yet.

---

## License and attribution

Apache License 2.0, see [LICENSE](LICENSE). `contract/src/schnorr.compact`, the Schnorr signer and parts of the
Lace provider wiring are adapted from
[midnightntwrk/midnight-examples](https://github.com/midnightntwrk/midnight-examples) (Apache-2.0,
Midnight Foundation); see [NOTICE](NOTICE).

Built on [Midnight](https://midnight.network) with Compact and Midnight.js.
