# AKINDO submission text (Midnight Buildathon, wave 3)

The text of the submission, kept with the code it describes.

Wave 3 submission deadline on AKINDO: 30 Nov 2026, 15:00 UTC.

## Product name
Veridom Milestones

## Tagline
Construction-loan draws, proven on Midnight without handing over the paperwork.

## Links
- GitHub repository (public, Apache-2.0): https://github.com/khrisdidukh/veridom-milestones
- Live app / deliverable URL: https://khrisdidukh.github.io/veridom-milestones/
- Slide deck (PDF): https://github.com/khrisdidukh/veridom-milestones/blob/main/docs/slides/veridom-milestones-deck.pdf
- Demo video: https://github.com/khrisdidukh/veridom-milestones/blob/main/docs/video/veridom-milestones-demo.mp4
- Existing product: https://veridom.space

## Description

A bank pays a construction loan in tranches, one per finished stage of the build: foundation, shell, roof.
Today the builder hands over site photos, invoices, contractor names, amounts and personal data for every
tranche, and copies of all of it stay in the bank's systems and with its surveyors. But the bank needs only
three yes-or-no facts: is the stage finished, did an inspector it trusts confirm that, and does the payout
stay within the approved loan?

Veridom Milestones proves those three facts on Midnight and leaves the documents on the builder's device.

**How privacy shapes the design**

- The public ledger holds outcomes and hiding commitments: lender and builder key hashes, the inspector
  panel, a commitment to the loan terms, stage status, a commitment to each tranche and to the running total,
  nullifiers of used signatures, and salted consent receipts.
- Private state holds everything sensitive: the loan limit and stage caps, the running total drawn, each
  tranche amount, the hash of the evidence bundle, the inspector's signature and both parties' secrets.
- The proofs connect the two. `attestMilestone` verifies the inspector's Schnorr signature inside the circuit
  and binds it to this contract, project and stage. `requestTranche` checks `0 < amount <= cap[stage]` and
  `total + amount <= limit` over private values, then replaces the total commitment through a write-back
  witness. Caller identity comes from a witness secret, not from the wallet.
- Selective disclosure: the builder opens exactly one fact to an auditor. The value travels off chain; the
  consent is recorded on chain as a salted receipt, and the auditor checks both against the ledger. Without the
  receipt the contract refuses, even to someone holding a copy of the builder's records.

**What exists today**

- One Compact contract (compiler 0.31.1), 8 provable circuits and 8 pure circuits, with private-state
  management through witnesses and write-back witnesses.
- 50 simulator tests, including over-limit and over-cap tranches, rogue and revoked inspectors, evidence
  swapped after signing, replayed attestations across stages, projects and contracts, disclosure without
  consent, and a scan of the whole public state for any private value.
- 6 end-to-end tests with real ZK proofs on a local Midnight devnet (node 1.0.400, indexer 4.3.5, proof
  server 8.1.3): 17 proven transactions recorded with tx ids and blocks. Eight of them come from the web app
  in a browser, through the DApp Connector API.
- A four-role web app (bank, builder, inspector, auditor) that shows the public ledger next to the builder's
  private state. It is live, and one button runs a whole stage in the browser with no wallet and no install.
- Preprod: not deployed. Midnight moved Preprod to ledger 9 on 9 November, which refuses new contracts built
  with the ledger 8 toolchain used here (Compact 0.31.1). The rebuild for ledger 9 is the next step.

It is a new module of Veridom (veridom.space), a house-building control app for private homebuilders that
tracks a build against the approved plans with a diary, photos and inspections. The evidence a stage proof
needs is what Veridom already collects.

**Who it is for.** Lenders that finance private home construction and pay it out by stage, their borrowers,
and the inspectors they appoint. The lender pays per active construction loan: fewer documents to collect,
store and protect, and a verifiable record of every release. Builders use it free inside Veridom. The same
contract fits other staged payouts, such as insurers' completion checks and stage-based reconstruction grants.

## Progress during this Wave (updates in this wave)

First submission. Everything in the repository was built during Wave 3 (3 to 30 November), in two rounds.

Round 1, the protocol:
- Compact contract: roles from witness secrets, inspector registry, commitment to the loan terms, in-circuit
  Schnorr verification of inspector attestations, spent-signature nullifiers, private running total as a
  commitment updated by write-back witnesses, stage-cap and loan-limit checks over private values, selective
  disclosure with salted consent receipts.
- 50 simulator tests on the official compact-runtime.
- End-to-end run on a local Midnight devnet with real proofs: deploy plus 8 circuit calls, state read back
  from the indexer, an auditor packet verified against it.
- React + TypeScript web app with four roles and a dual view of public and private state.

Round 2, from "wired for a wallet" to "tested through the wallet connector":
- Guided run: one button deploys a fresh contract and walks stage 1 through all eight circuits, as a checklist
  that says what each proof shows and lists tx id and block. Works in the simulator and through the wallet;
  stops at the first failure and continues from that step.
- New end-to-end test that drives the real web app in Chromium on the devnet through a stand-in with the
  shape of the DApp Connector API 4.0.1, then checks the contract on the indexer independently of the page.
  Before this the wallet path was only type-checked.
- Public run record (contract address, tx ids, blocks) kept by the app and downloadable; a test checks that it
  holds no amount, salt or secret.
- The app reports whether the wallet has tDUST before the first transaction, and falls back to the wallet's
  proof server if the wallet offers no prover.
- Live app on GitHub Pages with the proving keys, demo video, updated deck, README with architecture, test
  instructions and honest limits.

## What changed since the previous Wave
Not applicable: this is our first submission to the Buildathon.

## Next milestones

1. Now: rebuild for ledger 9 (Compact 0.36.0, compact-runtime 0.21.0, Midnight.js 5.0.0), rerun the devnet
   tests on a ledger 9 devnet, then the Preprod run through Lace from the hosted app, with the contract address
   and transaction ids in the README.
2. Next 4 weeks: evidence bundles straight from the Veridom diary (a stage's photos, inspection report and
   invoices feed the proof); private state encrypted and persisted in the browser so roles survive a reload;
   one session per role instead of four roles in one tab.
3. Next 3 months: inspector signing app with hardware-held keys; several inspectors per stage (k of n);
   stage-gated grants as a second use of the same contract.
4. After that: pilot on the founder's own build, then with a lender; replace the Schnorr polyfill with a
   native verifier when the standard library ships one.

## How to test (for judges)

1. Open https://khrisdidukh.github.io/veridom-milestones/ and press "Run stage 1 for me". No wallet needed.
2. `git clone`, `npm install`, `npm test`: 50 tests pass in about 6 seconds.
3. `npm run compile && npm run devnet:up && npm run test:e2e`: 6 tests with real proofs, about 15 minutes.
Details in the README.

## Checklist against the rules

- [x] Public GitHub repository
- [ ] `midnightntwrk` topic on the repository (set by the owner in the repository settings)
- [x] At least one Compact contract that compiles: `contract/build-evidence/compile.log`
- [x] Apache-2.0: `LICENSE`, `NOTICE`
- [x] README with project, setup, architecture, Midnight integration and how to test
- [x] Slide deck: `docs/slides/veridom-milestones-deck.pdf`
- [x] Demo video: `docs/video/veridom-milestones-demo.mp4`
- [x] Description of the progress during the wave
- [ ] Preprod run (optional, after the ledger 9 rebuild): `docs/deploy-preprod.md`
