# Demo video script (about 2 min 40 s)

For recording by the presenter. Screen: the app at `http://localhost:5173` in simulator mode, browser at
1440 px wide, zoom 100 %. Before recording, reload the page so it starts empty. Read the voice-over at a calm
pace; on-screen actions are in italics.

---

### 0:00 to 0:20. The problem

*Slide 2 of the deck ("Every tranche costs the builder their privacy").*

> When a bank finances a private home build, it pays the loan out in tranches: foundation, shell, roof. For
> every tranche the builder hands over everything: site photos, invoices, contractors, amounts, personal data.
> But the bank only needs three facts. Is the stage finished? Did an inspector it trusts confirm it? Does the
> payout stay within the loan?

### 0:20 to 0:35. What this is

*Switch to the app. Point at the house drawing.*

> This is Veridom Milestones, a new module of Veridom, our house-building control app. It proves those three
> facts on Midnight, and the documents never leave the builder's device. Four roles: the bank, the builder,
> the inspector and an auditor.

### 0:35 to 1:00. The bank sets up the loan

*Press **Deploy contract**. Bank tab: **Register inspector #7**. Builder tab: **Send loan application to the
bank** (defaults). Bank tab: point at the terms, then **Register project on chain**. Builder tab: **Accept
project and prove the terms**.*

> The bank deploys the contract and authorises an inspector. The builder prepares the loan terms: a limit of
> three hundred thousand euros over six stages. On chain, the bank registers only a commitment to those terms.
> The builder accepts by proving it holds exactly the terms the bank committed to, without showing them.

### 1:00 to 1:35. One stage, proven

*Builder tab, stage 1: **Use a sample bundle**, **Send bundle to the inspector**. Inspector tab: point at the file
list, **Sign stage 1**. Builder tab: **Prove stage 1 complete**. Wait for the foundation to ink in on the drawing.*

> The foundation is done. The builder collects photos, the invoice and the contractor record. They are hashed
> right here in the browser. The inspector visits the site, sees the bundle, and signs its hash for this
> project and this stage. The builder now proves on chain that an authorised inspector signed this stage.
> The ledger shows "stage one, proven, inspector seven". Not the photos, not the hash.

### 1:35 to 2:00. The tranche, within the limit

*Builder tab: type **70000** into the tranche field (the cap is 60,000), **Request tranche 1**. Point at the red
line in Transactions. Change to **58000**, **Request tranche 1** again. Bank tab: point at "Amount matches the
on-chain commitment", **Release tranche 1**.*

> Now the money. If the builder asks for more than this stage allows, the contract refuses. With a valid
> amount, the proof shows the tranche fits the stage cap and the running total stays within the loan, and
> no amount is published. The bank receives the amount privately, checks it against the commitment, and
> releases the tranche.

### 2:00 to 2:25. One fact for an auditor

*Builder tab: **Disclose tranche amount** (stage 1). Auditor tab: **Verify against the ledger**, let the green
checks show. Then **Open a fact without consent**; point at the rejection.*

> Later, an auditor needs to see what was paid for the foundation. The builder opens exactly that one fact.
> The auditor checks it against the ledger: the value matches, and the builder's consent is on chain. Without
> that consent, the contract refuses, even to someone holding a copy of the builder's records.

### 2:25 to 2:40. Public versus private, and close

*Scroll to the two panes "Public ledger" and "Builder's private state".*

> On the left, everything anyone can read: hashes, commitments, stage status. On the right, what stays with
> the builder. The contract is written in Compact, has fifty passing tests, and has run with real
> zero-knowledge proofs on a local Midnight network. Veridom Milestones: the bank sees the facts, the builder
> keeps the files.

---

## Notes for recording

- Total voice-over: about 380 words, which fits 2:40 at about 140 words a minute. If it runs long, shorten the 2:25 segment.
- If the presenter wants to show real proofs, an optional cut-in: a terminal running `npm run test:e2e`, or
  `contract/build-evidence/local-devnet-run.log` with its transaction ids and block heights.
- Everything said about Veridom in the script stays within these facts: the app is live and tracks a private
  build against approved plans with a diary, photos and inspections; specialists are testing it; there are talks
  with banks and investment firms; the first pilot is the founder's own build; no paying users yet.
