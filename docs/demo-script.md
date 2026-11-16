# Demo video

[`docs/video/veridom-milestones-demo.mp4`](video/veridom-milestones-demo.mp4), about 2 min 17 s, captions drawn
into the picture, no sound.

The video is generated, not screen-captured by hand, so it can be rebuilt after any change:

```bash
npm run dev                                   # the app, simulator mode
node docs/slides/render-pdf.mjs               # slide images
node docs/video/record-demo.mjs /tmp/parts    # slides + app, with captions (Playwright)

npm run compile && npm run devnet:up          # the part with real proofs
RECORD_VIDEO_DIR=/tmp/devnet npm run test:e2e -w contract -- e2e/lace-connector

DEVNET_SKIP=11 docs/video/build-video.sh /tmp/parts /tmp/devnet/<file>.webm /tmp/out   # ffmpeg
```

## Shot list

| Part | Picture | Caption |
| --- | --- | --- |
| Problem | Deck slides 1, 2, 5 | A bank pays a construction loan stage by stage; the builder hands over everything; the bank needs three yes-or-no facts; public ledger against private state |
| Guided run | Live app, simulator | One button runs stage 1 for all four roles: eight transactions, each with what its proof shows |
| Dual ledger | Public ledger and builder's private state side by side | What the chain holds, and what never leaves the device |
| Stage 2 by hand | Builder, inspector, builder | Evidence hashed in the browser, inspector signs the hash, builder proves the signature on chain |
| The money | Tranche over the cap, then a valid one, bank release | Over the cap the circuit refuses; a valid amount passes without being published; the bank checks it against the commitment |
| Disclosure | Auditor panel | One fact with consent on chain; without consent the contract refuses |
| Real proofs | The same app on a local Midnight devnet (ledger 8) through the wallet connector, sped up | Eight proven transactions with tx ids and blocks |
| Close | Deck slides 6, 9, 10 | Tests, next steps, closing line |

What the video does not show: a public network. The devnet part uses a stand-in for the Lace extension backed
by the devnet's funded wallet (see `contract/e2e/lace-connector.e2e.test.ts`).
