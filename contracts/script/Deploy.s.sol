// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {GroupVaultFactory} from "../src/core/GroupVaultFactory.sol";
import {KatanaConstants} from "../src/constants/KatanaConstants.sol";

/**
 * @title DeployScript
 * @notice Deploys the GroupVaultFactory on Katana mainnet
 * @dev Run with: forge script script/Deploy.s.sol:DeployScript --rpc-url katana --broadcast --verify
 */
contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy factory
        GroupVaultFactory factory = new GroupVaultFactory();

        console.log("===========================================");
        console.log("GroupVaultFactory deployed at:", address(factory));
        console.log("===========================================");
        console.log("");
        console.log("Katana Network Configuration:");
        console.log("Chain ID:", KatanaConstants.CHAIN_ID);
        console.log("");
        console.log("Available Strategies (Katana Vaults):");
        console.log("- IbvbUSDC:", KatanaConstants.IBVB_USDC);
        console.log("- IbvbUSDT:", KatanaConstants.IBVB_USDT);
        console.log("- IbvbETH:", KatanaConstants.IBVB_ETH);
        console.log("- IbvbWBTC:", KatanaConstants.IBVB_WBTC);
        console.log("===========================================");

        vm.stopBroadcast();
    }
}
