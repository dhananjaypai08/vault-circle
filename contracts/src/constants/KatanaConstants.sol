// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title KatanaConstants
 * @notice Hardcoded contract addresses for Katana mainnet (Chain ID: 747474)
 * @dev All addresses are verified and deployed on Katana mainnet
 */
library KatanaConstants {
    // ============ Network ============
    uint256 internal constant CHAIN_ID = 747474;

    // ============ Vault Tokens (ERC-4626 compatible) ============
    // These are yield-bearing vault tokens on Katana
    address internal constant IBVB_ETH =
        0xEE7D8BCFb72bC1880D0Cf19822eB0A2e6577aB62;
    address internal constant IBVB_USDC =
        0x203A662b0BD271A6ed5a60EdFbd04bFce608FD36;
    address internal constant IBVB_USDS =
        0x62D6A123E8D19d06d68cf0d2294F9A3A0362c6b3;
    address internal constant IBVB_USDT =
        0x2DCa96907fde857dd3D816880A0df407eeB2D2F2;
    address internal constant IBVB_WBTC =
        0x0913DA6Da4b42f538B445599b46Bb4622342Cf52;

    // ============ Morpho ============
    address internal constant MORPHO =
        0x1e5eFCA3D0dB2c6d5C67a4491845c43253eB9e4e;

    // ============ Price Oracles ============
    address internal constant ETH_USD_ORACLE =
        0xE94c9f9A1893f23be38A5C0394E46Ac05e8a5f8C;
    address internal constant USDC_USD_ORACLE =
        0xbe5CE90e16B9d9d988D64b0E1f6ed46EbAfb9606;
    address internal constant USDS_USD_ORACLE =
        0x44cdCd6F81cEe5BAC68B21845Fc82846ee09A369;
    address internal constant USDT_USD_ORACLE =
        0xF03E1566Fc6B0eBFA3dD3aA197759C4c6617ec78;
    address internal constant BTC_USD_ORACLE =
        0xb67047eDF6204F4C81333248dA71F8387050790C;

    // ============ Utility Contracts ============
    address internal constant MULTICALL2 =
        0xe9128E672bc08E12deb1C2048E9f91e6D6E08e74;

    // ============ Helper Functions ============

    /**
     * @notice Get vault address by asset type
     * @param assetType 0=ETH, 1=USDC, 2=USDS, 3=USDT, 4=WBTC
     */
    function getVaultByAssetType(
        uint256 assetType
    ) internal pure returns (address) {
        if (assetType == 0) return IBVB_ETH;
        if (assetType == 1) return IBVB_USDC;
        if (assetType == 2) return IBVB_USDS;
        if (assetType == 3) return IBVB_USDT;
        if (assetType == 4) return IBVB_WBTC;
        revert("Invalid asset type");
    }

    /**
     * @notice Get oracle address by asset type
     * @param assetType 0=ETH, 1=USDC, 2=USDS, 3=USDT, 4=BTC
     */
    function getOracleByAssetType(
        uint256 assetType
    ) internal pure returns (address) {
        if (assetType == 0) return ETH_USD_ORACLE;
        if (assetType == 1) return USDC_USD_ORACLE;
        if (assetType == 2) return USDS_USD_ORACLE;
        if (assetType == 3) return USDT_USD_ORACLE;
        if (assetType == 4) return BTC_USD_ORACLE;
        revert("Invalid asset type");
    }
}
