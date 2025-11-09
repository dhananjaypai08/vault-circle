// SPDX-License-Identifier: MIT
pragma solidity >=0.8.25;

import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {MorphoCompounderStrategy} from "@octant-v2-core/src/strategies/yieldDonating/MorphoCompounderStrategy.sol";
import {BaseStrategyFactory} from "@octant-v2-core/src/factories/BaseStrategyFactory.sol";

/**
 * @title Tweaked MorphoCompounderStrategyFactory
 * @author [Golem Foundation](https://golem.foundation)
 * @custom:security-contact security@golem.foundation
 * @notice Factory for deploying Morpho Compounder yield donating strategies
 * @dev Uses CREATE2 for deterministic deployments; records deployments via BaseStrategyFactory
 *
 *      MORPHO INTEGRATION:
 *      This factory deploys strategies that deposit into Yearn USDC vaults,
 *      which in turn deploy into Morpho lending markets for yield generation.
 *      Morpho is a lending pool optimizer built on top of Compound/Aave.
 */
contract MorphoCompounderStrategyFactory is BaseStrategyFactory {
    /// @notice Katnaa Yearn Strategy USDC vault address (target vault for deposits)
    address public constant YS_USDC =
        0x56c2249750C06DFc49798F01Aa77354040FE331E;

    /// @notice USDC token address (0xCFca8A0F6279e337D6e994f67F550Ac9ccb41D7e on Katana testnet)
    address public constant USDC = 0xCFca8A0F6279e337D6e994f67F550Ac9ccb41D7e;

    /// @notice Emitted on successful strategy deployment
    /// @param deployer Transaction sender performing deployment
    /// @param donationAddress Donation destination address for strategy
    /// @param strategyAddress Deployed strategy address
    /// @param vaultTokenName Vault token name associated with strategy
    event StrategyDeploy(
        address indexed deployer,
        address indexed donationAddress,
        address indexed strategyAddress,
        string vaultTokenName
    );

    /**
     * @notice Deploy a new MorphoCompounder strategy
     * @dev Deterministic salt derived from all parameters to avoid duplicates
     * @param _name Strategy share token name
     * @param _management Management address (can update params)
     * @param _keeper Keeper address (calls report)
     * @param _emergencyAdmin Emergency admin address
     * @param _donationAddress Dragon router address (receives profit shares)
     * @param _enableBurning True to enable burning shares during loss protection
     * @param _tokenizedStrategyAddress TokenizedStrategy implementation address
     * @return strategyAddress Deployed MorphoCompounderStrategy address
     */
    function createStrategy(
        string memory _name,
        address _management,
        address _keeper,
        address _emergencyAdmin,
        address _donationAddress,
        bool _enableBurning,
        address _tokenizedStrategyAddress
    ) external returns (address) {
        bytes32 parameterHash = keccak256(
            abi.encode(
                YS_USDC,
                USDC,
                _name,
                _management,
                _keeper,
                _emergencyAdmin,
                _donationAddress,
                _enableBurning,
                _tokenizedStrategyAddress
            )
        );

        bytes memory bytecode = abi.encodePacked(
            type(MorphoCompounderStrategy).creationCode,
            abi.encode(
                YS_USDC,
                USDC,
                _name,
                _management,
                _keeper,
                _emergencyAdmin,
                _donationAddress,
                _enableBurning,
                _tokenizedStrategyAddress
            )
        );

        address strategyAddress = _deployStrategy(bytecode, parameterHash);
        _recordStrategy(_name, _donationAddress, strategyAddress);

        emit StrategyDeploy(
            msg.sender,
            _donationAddress,
            strategyAddress,
            _name
        );
        return strategyAddress;
    }
}
