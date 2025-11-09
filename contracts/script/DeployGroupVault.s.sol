// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Script.sol";
import { GroupVaultStrategy } from "../src/strategies/GroupVaultStrategy.sol";

contract DeployGroupVault is Script {
    // Octant implementation address
    address constant OCTANT_IMPL = vm.envAddress("YDS_STRATEGY_ADDRESS");
    
    address constant USDC = vm.envAddress("ASSET_ADDRESS");
    address constant KATANA_USDC_VAULT = vm.envAddress("KATANA_VAULT_ADDRESS");
    address constant DONATION_ADDRESS = vm.envAddress("DONATION_ADDRESS");
    
    function run() external {
        address deployer = vm.addr(vm.envUint("PRIVATE_KEY"));
        
        vm.startBroadcast();
        
        GroupVaultStrategy vault = new GroupVaultStrategy(OCTANT_IMPL);
        
        vault.initialize(
            USDC,                           // asset
            "Community Yield Vault",        // name
            KATANA_USDC_VAULT,             // underlying ERC4626 vault
            deployer,                       // management (admin)
            deployer,                       // keeper
            deployer,                       // emergency admin
            DONATION_ADDRESS,                          // donation recipient
            1000 * 1e6,                    // min deposit (1000 USDC)
            0,                              // deposit cap (0 = unlimited)
            1 days                          // harvest interval
        );
        
        console.log("GroupVaultStrategy:", address(vault));
        
        vm.stopBroadcast();
    }
}