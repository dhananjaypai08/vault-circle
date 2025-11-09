// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/GroupVaultFactory.sol";
import "../test/MockERC20.sol";
import "../test/MockKatanaVault.sol";

/**
 * @title DeployGroupVaultSystem
 * @notice Deployment script for Group Vault system
 * @dev Deploys factory and optionally mock tokens/vaults for testing
 */
contract DeployGroupVaultSystem is Script {
    
    address public factory;
    address public mockUSDC;
    address public mockKatanaVault;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying from:", deployer);
        console.log("Deployer balance:", deployer.balance);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy Factory
        console.log("\n=== Deploying GroupVaultFactory ===");
        GroupVaultFactory factoryContract = new GroupVaultFactory();
        factory = address(factoryContract);
        console.log("GroupVaultFactory deployed at:", factory);

        vm.stopBroadcast();

        // Log deployment summary
        console.log("\n=== Deployment Summary ===");
        console.log("Factory:", factory);
        console.log("\n=== Next Steps ===");
        console.log("1. Export FACTORY_ADDRESS=%s", factory);
        console.log("2. Update frontend/app/utils/contracts.ts with factory address");
        console.log("3. Verify contract: forge verify-contract %s GroupVaultFactory --chain <chain-id>", factory);
    }
}

/**
 * @title DeployMocks
 * @notice Deploy mock tokens and vaults for testing
 */
contract DeployMocks is Script {
    
    address public mockUSDC;
    address public mockKatanaVault;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy Mock USDC
        console.log("\n=== Deploying Mock USDC ===");
        MockERC20 usdc = new MockERC20("USD Coin", "USDC", 6);
        mockUSDC = address(usdc);
        console.log("Mock USDC deployed at:", mockUSDC);

        // Deploy Mock Katana Vault (ERC4626)
        console.log("\n=== Deploying Mock Katana Vault ===");
        MockKatanaVault katanaVault = new MockKatanaVault(
            mockUSDC,
            "Katana USDC Vault",
            "kUSDC",
            100 // 1% yield per harvest
        );
        mockKatanaVault = address(katanaVault);
        console.log("Mock Katana Vault deployed at:", mockKatanaVault);

        // Mint some USDC to deployer for testing
        usdc.mint(msg.sender, 1000000 * 10**6); // 1M USDC
        console.log("Minted 1,000,000 USDC to deployer");

        vm.stopBroadcast();

        // Log deployment summary
        console.log("\n=== Mock Deployment Summary ===");
        console.log("Mock USDC:", mockUSDC);
        console.log("Mock Katana Vault:", mockKatanaVault);
        console.log("\n=== For Testing ===");
        console.log("export MOCK_USDC=%s", mockUSDC);
        console.log("export MOCK_KATANA_VAULT=%s", mockKatanaVault);
    }
}

/**
 * @title CreateTestVault
 * @notice Create a test vault using the factory
 */
contract CreateTestVault is Script {
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Get addresses from environment
        address factoryAddress = vm.envAddress("FACTORY_ADDRESS");
        address assetAddress = vm.envAddress("MOCK_USDC");
        address strategyAddress = vm.envAddress("MOCK_KATANA_VAULT");
        address donationRecipient = vm.envAddress("DONATION_RECIPIENT");

        console.log("\n=== Creating Test Vault ===");
        console.log("Factory:", factoryAddress);
        console.log("Asset:", assetAddress);
        console.log("Strategy:", strategyAddress);
        console.log("Donation Recipient:", donationRecipient);

        vm.startBroadcast(deployerPrivateKey);

        GroupVaultFactory factory = GroupVaultFactory(factoryAddress);
        
        address vault = factory.createVault(
            "Test Group Vault",
            assetAddress,
            strategyAddress,
            donationRecipient,
            1000 * 10**6, // 1000 USDC min deposit
            0 // No deposit cap
        );

        console.log("\n=== Vault Created ===");
        console.log("Vault Address:", vault);
        console.log("export TEST_VAULT=%s", vault);

        vm.stopBroadcast();
    }
}
