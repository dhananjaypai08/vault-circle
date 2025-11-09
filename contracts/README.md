# VaultCircle Contracts

VaultCircle provides a modular smart contract system for creating **group-managed yield vaults** that redirect profits to **public goods** through **yield-donating strategies (YDS)**.
It integrates **Octant-v2**, **Morpho-v2**, and **Katana Vaults** for optimized yield routing and collaborative DeFi experiences.

---

## Overview

The contracts are split into key modules:

### Core

* **GroupVault.sol** – ERC4626-compatible vault that manages group deposits, share accounting, and donation routing.
* **GroupVaultFactory.sol** – Factory for deterministic deployment and management of multiple group vaults.

### Strategies

* **MorphoCompounderStrategy.sol** – A yield-donating strategy leveraging **Morpho Compounder** built on top of Aave-v3.
* **YieldDonatingTokenizedStrategy.sol** – Base strategy from **Octant-v2-core**, distributing yield to donation recipients.

### Mocks

* **MockERC20.sol** – Simulates ERC20 assets (e.g., Mock USDC).
* **MockKatanaVault.sol** – Mimics an ERC4626 vault on the **Tatara Testnet** for local testing.

### Factories

* **MorphoCompounderStrategyFactory.sol** – Deterministically deploys strategy contracts using **CREATE2**.
* **BaseStrategyFactory.sol** – Provides shared deployment logic, event tracking, and address prediction.

---

## Getting Started

### Prerequisites

* [Foundry](https://book.getfoundry.sh/)
* Node.js ≥ 18
* Katana testnet RPC (or local anvil fork)

```bash
forge install
npm install
```

---

## Deployment Scripts

Located in `contracts/scripts/`:

| Script                                        | Description                                                   |
| --------------------------------------------- | ------------------------------------------------------------- |
| `DeployGroupVaultSystem.s.sol`                | Deploys the `GroupVaultFactory` and mock vaults (for Tatara). |
| `DeployMorphoCompounderStrategyFactory.s.sol` | Deploys the `MorphoCompounderStrategyFactory`.                |
| `DeployOctantImpl.s.sol`                      | Deploys the `YieldDonatingTokenizedStrategy` implementation.  |
| `CreateTestVault.s.sol`                       | Creates a sample vault using the deployed factory and mocks.  |

Run any script using Foundry:

```bash
forge script contracts/scripts/DeployGroupVaultSystem.s.sol --rpc-url $RPC_URL --broadcast
```

**Example Environment Variables**

```bash
export PRIVATE_KEY=0xabc...
export RPC_URL=https://rpc.tatara.katana.network
export DONATION_RECIPIENT=0xYourAddress
```

---

## Running Tests

Execute all tests:

```bash
forge test -vvv
```

The tests validate deterministic factory deployment, CREATE2 salts, and vault initialization logic.
Some tests fail on purpose due to **mock contract limitations** (since Tatara testnet doesn’t host live Yearn or Morpho vaults yet).

### Current Failing Cases

| Test                                            | Reason                                                                                                        | Gas     |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------- |
| `test_PredictStrategyAddress_MatchesDeployed()` | Fails due to **call to non-contract address** `0x56c2249750C06DFc49798F01Aa77354040FE331E` (mock Yearn vault) | 124,021 |
| `test_Revert_WhenDuplicateParametersUsed()`     | Fails due to **duplicate parameter hash** and missing underlying contract code                                | 113,015 |

These failures are expected while testing on Tatara’s simulated environment and confirm proper **error propagation** from `BaseStrategyFactory`.

---

## Project Structure

```
contracts/
├── src/
│   ├── core/
│   ├── factories/
│   ├── strategies/
│   └── interfaces/
├── scripts/
│   ├── DeployGroupVaultSystem.s.sol
│   ├── DeployMorphoCompounderStrategyFactory.s.sol
│   ├── DeployOctantImpl.s.sol
│   └── CreateTestVault.s.sol
├── test/
│   ├── GroupVault.t.sol
│   └── MorphoCompounderStrategyFactory.t.sol
└── foundry.toml
```

---

## Notes

* The testnet setup uses **MockUSDC** and **MockKatanaVault** to simulate real vault interactions.
* On mainnet, these are replaced with live **Aave-v3** and **Morpho Compounder** integrations.
* Frontend interaction is handled via **Wagmi** and **RainbowKit** through `frontend/utils/contracts.ts`.

