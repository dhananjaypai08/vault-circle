// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {GroupVault} from "../core/GroupVault.sol";
import {IGroupVaultFactory} from "../../interfaces/IGroupVaultFactory.sol";

/**
 * @title GroupVaultFactory
 * @notice Factory contract for creating Group Vaults with YDS pattern
 * @dev Deploys new GroupVault instances and tracks them
 */
contract GroupVaultFactory is IGroupVaultFactory {
    address[] private _allVaults;
    mapping(address => address[]) private _vaultsByCreator;
    mapping(address => bool) private _isVault;

    /**
     * @notice Create a new Group Vault
     * @param name Name of the vault
     * @param asset Underlying asset address
     * @param strategy Katana vault address (ERC4626)
     * @param donationRecipient Address to receive donated yields
     * @param minDeposit Minimum deposit amount
     * @param depositCap Maximum total deposits (0 for no cap)
     * @return vault Address of created vault
     */
    function createVault(
        string calldata name,
        address asset,
        address strategy,
        address donationRecipient,
        uint256 minDeposit,
        uint256 depositCap
    ) external returns (address vault) {
        if (asset == address(0)) revert ZeroAddress();
        if (strategy == address(0)) revert ZeroAddress();
        if (donationRecipient == address(0)) revert ZeroAddress();
        if (bytes(name).length == 0) revert InvalidVaultName();
        if (minDeposit == 0) revert InvalidMinDeposit();

        // Deploy new vault
        vault = address(
            new GroupVault(
                name,
                asset,
                strategy,
                donationRecipient,
                msg.sender,
                minDeposit,
                depositCap
            )
        );

        _allVaults.push(vault);
        _vaultsByCreator[msg.sender].push(vault);
        _isVault[vault] = true;

        emit VaultCreated(
            vault,
            msg.sender,
            name,
            asset,
            strategy,
            donationRecipient
        );

        return vault;
    }

    function getVaultsByCreator(
        address creator
    ) external view returns (address[] memory) {
        return _vaultsByCreator[creator];
    }

    function getAllVaults() external view returns (address[] memory) {
        return _allVaults;
    }

    function getVaultCount() external view returns (uint256) {
        return _allVaults.length;
    }

    function isVault(address vault) external view returns (bool) {
        return _isVault[vault];
    }
}
