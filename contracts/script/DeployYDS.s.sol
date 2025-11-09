// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Script.sol";
import { YieldDonatingTokenizedStrategy } from "@octant-v2-core/src/strategies/yieldDonating/YieldDonatingTokenizedStrategy.sol";

contract DeployOctantImpl is Script {
    function run() external {
        vm.startBroadcast();
        
        YieldDonatingTokenizedStrategy impl = new YieldDonatingTokenizedStrategy();
        
        console.log("YDS Strategy Implementation:", address(impl));
        
        vm.stopBroadcast();
    }
}