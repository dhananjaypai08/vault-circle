// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Script.sol";
import { GroupVaultFactory } from "../src/factories/GroupVaultFactory.sol";

contract DeployOctantImpl is Script {
    function run() external {
        vm.startBroadcast();
        
        GroupVaultFactory impl = new GroupVaultFactory();
        
        console.log("Vault Factory:", address(impl));
        
        vm.stopBroadcast();
    }
}