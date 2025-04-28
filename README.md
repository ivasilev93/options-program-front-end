## Developer Note
### The frontend was built primarily to test and demo the protocol logic of the Options program. 
### While it works as intended and has a clean-enough UI, the codebase is not architected for scale or production

## Installation
Clone the onchain program repo and run a local validator:
```bash
solana-test-validator --bind-address 0.0.0.0 --url https://api.mainnet-beta.solana.com --ledger .anchor/test-ledger --rpc-port 8899 --clone 7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE --reset
```

```bash
git clone https://github.com/ivasilev93/options-program-front-end.git
cd options-program-front-end
npm install
npm run dev
```