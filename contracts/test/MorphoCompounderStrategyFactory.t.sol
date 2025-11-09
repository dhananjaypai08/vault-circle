// SPDX-License-Identifier: MIT
pragma solidity >=0.8.25 <0.9.0;

import { Test, console2 } from "forge-std/Test.sol";
import { MorphoCompounderStrategyFactory } from "src/factories/MorphoCompounderStrategyFactory.sol";
import { MorphoCompounderStrategy } from "@octant-v2-core/src/strategies/yieldDonating/MorphoCompounderStrategy.sol";
import { BaseStrategyFactory } from "@octant-v2-core/src/factories/BaseStrategyFactory.sol";

/**
 * @title MorphoCompounderStrategyFactoryTest
 * @notice Unit tests for `MorphoCompounderStrategyFactory`
 * @dev Uses Foundry framework (`forge test`) for deterministic deployment and state verification
 */
contract MorphoCompounderStrategyFactoryTest is Test {
    // ---------------------------------------------------------------------
    // Test variables
    // ---------------------------------------------------------------------

    MorphoCompounderStrategyFactory internal factory;

    address internal management = makeAddr("management");
    address internal keeper = makeAddr("keeper");
    address internal emergencyAdmin = makeAddr("emergencyAdmin");
    address internal donationRecipient = makeAddr("donationRecipient");
    address internal tokenizedStrategyImpl = makeAddr("tokenizedStrategyImpl");

    string internal strategyName = "Morpho USDC Yield Strategy";

    // Constants from factory (Katana testnet mock)
    address internal constant YS_USDC = 0x08A4aC9e28Ae741f3B25a2201775D4eEb464069a;
    address internal constant USDC = 0x93358Fd354b9D8887DA94ea70683dB156Fc5F0D4;

    // ---------------------------------------------------------------------
    // Setup
    // ---------------------------------------------------------------------

    /**
     * @notice Deploys a fresh factory before each test.
     */
    function setUp() public {
        factory = new MorphoCompounderStrategyFactory();
    }

    // ---------------------------------------------------------------------
    // Tests
    // ---------------------------------------------------------------------

    /**
     * @notice Ensures that strategies deployed with identical parameters revert due to CREATE2 collision
     */
    function test_Revert_WhenDuplicateParametersUsed() public {
        // First deployment should succeed
        factory.createStrategy(
            strategyName,
            management,
            keeper,
            emergencyAdmin,
            donationRecipient,
            true,
            tokenizedStrategyImpl
        );

        // Second deployment with identical parameters must revert (StrategyAlreadyExists)
        vm.expectRevert(BaseStrategyFactory.StrategyAlreadyExists.selector);
        factory.createStrategy(
            strategyName,
            management,
            keeper,
            emergencyAdmin,
            donationRecipient,
            true,
            tokenizedStrategyImpl
        );
    }

    /**
     * @notice Validates deterministic address prediction matches the actual deployed address.
     */
    function test_PredictStrategyAddress_MatchesDeployed() public {
        // Compute parameter hash like factory does
        bytes32 paramHash = keccak256(
            abi.encode(
                YS_USDC,
                USDC,
                strategyName,
                management,
                keeper,
                emergencyAdmin,
                donationRecipient,
                true,
                tokenizedStrategyImpl
            )
        );

        // Predict address
        bytes memory bytecode = abi.encodePacked(
            type(MorphoCompounderStrategy).creationCode,
            abi.encode(
                YS_USDC,
                USDC,
                strategyName,
                management,
                keeper,
                emergencyAdmin,
                donationRecipient,
                true,
                tokenizedStrategyImpl
            )
        );
        address predicted = factory.predictStrategyAddress(paramHash, address(this), bytecode);

        // Deploy and verify the address matches
        address actual = factory.createStrategy(
            strategyName,
            management,
            keeper,
            emergencyAdmin,
            donationRecipient,
            true,
            tokenizedStrategyImpl
        );

        assertEq(predicted, actual, "CREATE2 predicted address mismatch");
    }
}
