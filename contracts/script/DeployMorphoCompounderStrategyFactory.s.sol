// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Script.sol";
import { MorphoCompounderStrategyFactory } from "../src/factories/MorphoCompounderStrategyFactory.sol";

contract MorphoCompounderStrategyScript is Script {
    function run() external {
        vm.startBroadcast();
        
        MorphoCompounderStrategyFactory impl = new MorphoCompounderStrategyFactory();
        
        console.log("Morpho compounder strategy Factory Implementation:", address(impl));
        
        vm.stopBroadcast();
    }
}

contract CreateStrategyScript is Script {
    function run() external {
        vm.startBroadcast();
        address addImpl = vm.envAddress("FACTORY_ADDRESS");
        MorphoCompounderStrategyFactory impl = MorphoCompounderStrategyFactory(addImpl);
        
        address admin = vm.envAddress("ADMIN");
        address ydsStrategy = vm.envAddress("YDS_STRATEGY");
        
        address strategyContract = impl.createStrategy(
            "KAT OGs",
            admin,
            admin,
            admin,
            admin,
            true,
            ydsStrategy
        );

        console.log("Tokenized Strategy Address on Morpho:", strategyContract);
        vm.stopBroadcast();
    }
}