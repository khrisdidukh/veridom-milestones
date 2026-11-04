# AKINDO submission notes (Midnight Buildathon, wave 3)

Text ready to paste into the AKINDO submission form, and the checklist of what the rules require.

## Project name

Veridom Milestones

## Tagline

Construction-loan draws, proven on Midnight without handing over the paperwork.

## Description

A bank pays a construction loan in tranches, one per finished stage of the build. Today the builder hands over
site photos, invoices, contractors, amounts and personal data for every tranche. Veridom Milestones replaces
that with zero-knowledge proofs on Midnight: a Compact contract proves that stage k is complete, signed by an
inspector the bank authorised, and that the cumulative draw stays within the approved limit and the stage cap.
The evidence, the amounts, the contractors and the builder's identity stay on the builder's device. When an
auditor needs one fact, the builder opens exactly that fact, and the consent is recorded on chain as a salted
receipt.

It is a new module of Veridom (veridom.space), a live app that tracks a private home build against the
approved plans with a diary, photos and inspections.

## Progress during this wave

First submission; everything was built during wave 3:

- Compact contract (compiler 0.31.1): 8 provable circuits, inspector Schnorr signatures verified inside the
  proof, signature nullifiers, private running total kept as a commitment and updated by write-back witnesses,
  stage-cap and loan-limit checks over private values, selective disclosure with salted consent receipts.
- 50 simulator tests passing, including tranche over the limit, unauthorised and revoked inspectors, replayed
  attestations, disclosure without consent and a leak scan of the whole public state.
- End-to-end run on a local Midnight devnet with real ZK proofs: deploy plus 8 calls, recorded with tx ids.
- React + TypeScript frontend with four roles, running the contract in the browser and wired for Lace.
- Slide deck and demo video.

## What changed since the previous wave

Not applicable: first submission.

## Checklist (from the rules)

- [ ] Public GitHub repository (owner publishes this local repo)
- [ ] GitHub topic `midnightntwrk` on the repository (Settings > About > Topics); optionally also `midnight`,
      `compact`, `zero-knowledge`
- [x] At least one Compact contract that compiles: `contract/build-evidence/compile.log`
- [x] Apache-2.0 license: `LICENSE`, `NOTICE`
- [x] README with project, setup, architecture, Midnight integration and how to test
- [x] Slide deck: `docs/slides/veridom-milestones-deck.pdf`
- [ ] Demo video: record from `docs/demo-script.md`, upload, add the link to the README and the form
- [ ] Discord ID and Telegram ID (required questions on the AKINDO entry form)
- [ ] Optional before submitting: Preprod deployment (`docs/deploy-preprod.md`), then add the contract
      address to the README

Deadline shown on the AKINDO API for wave 3: 30 Nov 2026, 15:00 UTC; the programme page lists the wave-3 build
period as ending 16 Nov 2026. Submitting by 16 Nov is safe for both.
