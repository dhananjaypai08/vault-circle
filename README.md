# VaultCircle

VaultCircle is a decentralized group vault protocol that allows small groups or friend circles to pool assets together and earn automated yield from integrated strategies such as Morpho, Yearn, and Katana. Each vault is collectively owned by its members and automatically donates a portion of its yield to a chosen recipient.

The system includes smart contracts, deployment scripts, and a frontend interface for creating and managing vaults.

---

## Overview

**Goal:** Enable groups of users to form shared vaults that compound yield automatically and contribute a portion to a donation address.
**Core contracts:**

* `GroupVaultFactory` — creates and tracks vaults.
* `MorphoCompounderStrategyFactory` — deploys yield-compounding strategies integrated with Morpho.
* `YieldDonatingTokenizedStrategy` — base strategy that manages yield donation.
* `MockERC20`, `MockKatanaVault` — test contracts simulating tokens and ERC4626 vaults.

---

## Repository Structure

```
vaultcircle/
├── contracts/
│   ├── src/
│   │   ├── factories/
│   │   │   ├── GroupVaultFactory.sol
│   │   │   └── MorphoCompounderStrategyFactory.sol
│   │   └── strategies/
│   │       └── yieldDonating/
│   │           └── YieldDonatingTokenizedStrategy.sol
│   ├── test/
│   │   └── MorphoCompounderStrategyFactory.t.sol
│   └── scripts/
│       ├── DeployGroupVaultSystem.s.sol
│       ├── DeployMocks.s.sol
│       ├── CreateTestVault.s.sol
│       ├── DeployMorphoCompounderStrategyFactory.s.sol
├── frontend/
│   ├── components/
│   ├── app/
│   └── utils/contracts.ts
├── package.json
└── README.md
```

---

## How Group Vaults Work

1. **Vault Creation**
   A user deploys a vault via `GroupVaultFactory.createVault()`.
   The vault defines:

   * Asset (ERC20 token)
   * Strategy (ERC4626-compatible vault)
   * Donation recipient address
   * Minimum deposit and deposit cap

2. **Group Use**
   Members deposit tokens into the vault and receive shares.
   The vault automatically compounds yield through its underlying strategy (e.g., Katana, Morpho).

3. **Donations**
   The yield generated is periodically donated to the designated recipient, such as a shared cause or project fund.

Vaults can be shared privately among friends or publicly as community saving circles.

---

## Contracts Runbook

The following scripts under `contracts/scripts` define deployment and setup flow using Foundry (`forge script`):

### 1. DeployGroupVaultSystem.s.sol

Deploys the main factory for creating group vaults.

```bash
forge script contracts/scripts/DeployGroupVaultSystem.s.sol --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast
```

### 2. DeployMocks.s.sol

Deploys mock tokens and a mock ERC4626 Katana vault for testing.

```bash
forge script contracts/scripts/DeployMocks.s.sol --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast
```

### 3. CreateTestVault.s.sol

Creates a test vault using the deployed factory and mocks.

```bash
FACTORY_ADDRESS=<factory> MOCK_USDC=<mock_usdc> MOCK_KATANA_VAULT=<mock_vault> DONATION_RECIPIENT=<address> forge script contracts/scripts/CreateTestVault.s.sol --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast
```

### 4. DeployMorphoCompounderStrategyFactory.s.sol

Deploys the factory that creates Morpho yield-compounding strategies.

```bash
forge script contracts/scripts/DeployMorphoCompounderStrategyFactory.s.sol --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast
```

---

## Test Setup

### Running Tests

Run all tests using Foundry:

```bash
cd contracts
forge test -vvv
```

### Test Output Example

```
[FAIL: call to non-contract address 0x56c2249750C06DFc49798F01Aa77354040FE331E] test_PredictStrategyAddress_MatchesDeployed() (gas: 124021)
[FAIL: call to non-contract address 0x56c2249750C06DFc49798F01Aa77354040FE331E] test_Revert_WhenDuplicateParametersUsed() (gas: 113015)
```

**Note:**
These failures occur because the test references a non-deployed mock address for the Yearn USDC vault. They can be ignored when running in isolation or resolved by mocking that address.

---

## Frontend Setup

### Prerequisites

* Node.js v18+
* npm

### Install Dependencies

```bash
npm install
```

### Build Frontend

```bash
npm run frontend:build
```

### Connect Contracts

After deploying, update `frontend/app/utils/contracts.ts` with:

* `FACTORY_ADDRESS`
* `YDS_STRATEGY`
* `MORPHO_TOKENIZED_STRATEGY`
* Token and strategy addresses (mock or live)

### Run Development Server

```bash
cd frontend
npm run dev
```

The interface provides:

* Create Vault form
* Deposit and Withdraw functionality
* Real-time vault performance metrics

---

## Linting and Formatting

Ensure consistent formatting across Solidity contracts.

```bash
npm run contracts:lint
npm run contracts:format
npm run contracts:format:check
```

---

## Recommended Development Flow

1. **Deploy Mocks**
   Deploy `MockERC20` and `MockKatanaVault` locally.

2. **Deploy GroupVaultFactory**
   Using `DeployGroupVaultSystem.s.sol`.

3. **Deploy Morpho Compounder Factory**
   Run `DeployMorphoCompounderStrategyFactory.s.sol`.

4. **Create a Test Vault**
   Run `CreateTestVault.s.sol` with correct environment variables.

5. **Link Frontend**
   Update contract addresses in frontend and start the UI.


This setup allows anyone to coordinate pooled investments transparently, automate yield donation, and manage assets collaboratively.
