// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/core/GroupVault.sol";
import "../src/core/GroupVaultFactory.sol";
import "../test/MockERC20.sol";
import "../test/MockKatanaVault.sol";
import "../types/GroupVaultTypes.sol";

/**
 * @title GroupVaultTest
 * @notice Comprehensive tests for Group Vault system
 */
contract GroupVaultTest is Test {
    GroupVaultFactory public factory;
    MockERC20 public usdc;
    MockKatanaVault public katanaVault;
    GroupVault public vault;

    address public admin = makeAddr("admin");
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    address public charlie = makeAddr("charlie");
    address public donationRecipient = makeAddr("donationRecipient");

    uint256 public constant INITIAL_MINT = 1000000 * 10**6; // 1M USDC
    uint256 public constant MIN_DEPOSIT = 1000 * 10**6; // 1000 USDC
    uint256 public constant DEPOSIT_CAP = 500000 * 10**6; // 500K USDC

    function setUp() public {
        // Deploy mock USDC
        usdc = new MockERC20("USD Coin", "USDC", 6);
        
        // Deploy mock Katana vault
        katanaVault = new MockKatanaVault(
            address(usdc),
            "Katana USDC Vault",
            "kUSDC",
            100 // 1% yield per harvest
        );

        // Deploy factory
        factory = new GroupVaultFactory();

        // Create a vault
        vm.prank(admin);
        address vaultAddress = factory.createVault(
            "Test Group Vault",
            address(usdc),
            address(katanaVault),
            donationRecipient,
            MIN_DEPOSIT,
            DEPOSIT_CAP
        );
        vault = GroupVault(vaultAddress);

        // Mint USDC to test users
        usdc.mint(alice, INITIAL_MINT);
        usdc.mint(bob, INITIAL_MINT);
        usdc.mint(charlie, INITIAL_MINT);
    }

    // ============ Factory Tests ============

    function testFactoryCreateVault() public {
        vm.prank(admin);
        address newVault = factory.createVault(
            "New Vault",
            address(usdc),
            address(katanaVault),
            donationRecipient,
            MIN_DEPOSIT,
            0
        );

        assertTrue(factory.isVault(newVault));
        assertEq(factory.getVaultCount(), 2); // Including setUp vault
    }

    function testFactoryGetVaultsByCreator() public view {
        address[] memory vaults = factory.getVaultsByCreator(admin);
        assertEq(vaults.length, 1);
        assertEq(vaults[0], address(vault));
    }

    function testFactoryRevertZeroAddress() public {
        vm.prank(admin);
        vm.expectRevert(IGroupVaultFactory.ZeroAddress.selector);
        factory.createVault(
            "Bad Vault",
            address(0),
            address(katanaVault),
            donationRecipient,
            MIN_DEPOSIT,
            0
        );
    }

    // ============ Deposit Tests ============

    function testDeposit() public {
        uint256 depositAmount = 10000 * 10**6; // 10K USDC

        vm.startPrank(alice);
        usdc.approve(address(vault), depositAmount);
        uint256 shares = vault.deposit(depositAmount, alice);
        vm.stopPrank();

        // Verify shares (1:1 ratio)
        assertEq(shares, depositAmount);
        assertEq(vault.balanceOf(alice), depositAmount);

        // Verify member info
        GroupVaultTypes.Member memory member = vault.getMemberInfo(alice);
        assertTrue(member.isActive);
        assertEq(member.shares, depositAmount);
        assertEq(member.totalDeposited, depositAmount);
    }

    function testMultipleDeposits() public {
        uint256 aliceDeposit = 10000 * 10**6;
        uint256 bobDeposit = 20000 * 10**6;

        // Alice deposits
        vm.startPrank(alice);
        usdc.approve(address(vault), aliceDeposit);
        vault.deposit(aliceDeposit, alice);
        vm.stopPrank();

        // Bob deposits
        vm.startPrank(bob);
        usdc.approve(address(vault), bobDeposit);
        vault.deposit(bobDeposit, bob);
        vm.stopPrank();

        // Verify total assets
        uint256 totalAssets = vault.totalAssets();
        assertGe(totalAssets, aliceDeposit + bobDeposit);

        // Verify member count
        address[] memory members = vault.getMembers();
        assertEq(members.length, 2);
    }

    function testDepositBelowMinimum() public {
        uint256 smallDeposit = 100 * 10**6; // 100 USDC (below minimum)

        vm.startPrank(alice);
        usdc.approve(address(vault), smallDeposit);
        vm.expectRevert(
            abi.encodeWithSelector(
                IGroupVault.InsufficientDeposit.selector,
                MIN_DEPOSIT,
                smallDeposit
            )
        );
        vault.deposit(smallDeposit, alice);
        vm.stopPrank();
    }

    function testDepositCapReached() public {
        uint256 largeDeposit = 600000 * 10**6; // 600K USDC (over cap)

        vm.startPrank(alice);
        usdc.approve(address(vault), largeDeposit);
        vm.expectRevert(
            abi.encodeWithSelector(
                IGroupVault.DepositCapReached.selector,
                DEPOSIT_CAP,
                largeDeposit
            )
        );
        vault.deposit(largeDeposit, alice);
        vm.stopPrank();
    }

    // ============ Withdraw Tests ============

    function testWithdraw() public {
        uint256 depositAmount = 10000 * 10**6;

        // Deposit
        vm.startPrank(alice);
        usdc.approve(address(vault), depositAmount);
        uint256 shares = vault.deposit(depositAmount, alice);
        vm.stopPrank();

        // Withdraw
        uint256 aliceBalanceBefore = usdc.balanceOf(alice);
        
        vm.prank(alice);
        uint256 assetsReceived = vault.withdraw(shares, alice, alice);

        uint256 aliceBalanceAfter = usdc.balanceOf(alice);

        // Verify withdrawal
        assertGt(assetsReceived, 0);
        assertGt(aliceBalanceAfter, aliceBalanceBefore);
        assertEq(vault.balanceOf(alice), 0);
    }

    function testPartialWithdraw() public {
        uint256 depositAmount = 10000 * 10**6;
        uint256 withdrawAmount = 5000 * 10**6;

        // Deposit
        vm.startPrank(alice);
        usdc.approve(address(vault), depositAmount);
        vault.deposit(depositAmount, alice);
        vm.stopPrank();

        // Partial withdraw
        vm.prank(alice);
        vault.withdraw(withdrawAmount, alice, alice);

        // Verify remaining balance
        uint256 remainingShares = vault.balanceOf(alice);
        assertEq(remainingShares, depositAmount - withdrawAmount);
    }

    function testWithdrawUnauthorized() public {
        uint256 depositAmount = 10000 * 10**6;

        // Alice deposits
        vm.startPrank(alice);
        usdc.approve(address(vault), depositAmount);
        uint256 shares = vault.deposit(depositAmount, alice);
        vm.stopPrank();

        // Bob tries to withdraw Alice's funds
        vm.prank(bob);
        vm.expectRevert(IGroupVault.Unauthorized.selector);
        vault.withdraw(shares, bob, alice);
    }

    // ============ Harvest & Yield Tests ============

    function testHarvestYield() public {
        uint256 depositAmount = 100000 * 10**6; // 100K USDC

        // Alice deposits
        vm.startPrank(alice);
        usdc.approve(address(vault), depositAmount);
        vault.deposit(depositAmount, alice);
        vm.stopPrank();

        // Generate yield in Katana vault (1%)
        katanaVault.generateYield();

        // Harvest
        uint256 yieldGenerated = vault.harvest();

        // Verify yield was generated
        assertGt(yieldGenerated, 0);
        console.log("Yield generated:", yieldGenerated);

        // Verify donation recipient received shares
        uint256 recipientShares = vault.balanceOf(donationRecipient);
        assertGt(recipientShares, 0);
        console.log("Recipient shares:", recipientShares);

        // Verify donation history
        GroupVaultTypes.DonationRecord[] memory history = vault.getDonationHistory();
        assertEq(history.length, 1);
        assertEq(history[0].recipient, donationRecipient);
        assertEq(history[0].amount, yieldGenerated);
    }

    function testMultipleHarvests() public {
        uint256 depositAmount = 100000 * 10**6;

        // Alice deposits
        vm.startPrank(alice);
        usdc.approve(address(vault), depositAmount);
        vault.deposit(depositAmount, alice);
        vm.stopPrank();

        // First harvest
        katanaVault.generateYield();
        uint256 yield1 = vault.harvest();

        // Second harvest
        katanaVault.generateYield();
        uint256 yield2 = vault.harvest();

        // Verify multiple donations
        GroupVaultTypes.DonationRecord[] memory history = vault.getDonationHistory();
        assertEq(history.length, 2);
        assertGt(yield1, 0);
        assertGt(yield2, 0);
    }

    function testPrincipalPreservation() public {
        uint256 depositAmount = 100000 * 10**6;

        // Alice deposits
        vm.startPrank(alice);
        usdc.approve(address(vault), depositAmount);
        uint256 aliceShares = vault.deposit(depositAmount, alice);
        vm.stopPrank();

        // Generate yield multiple times
        for (uint i = 0; i < 5; i++) {
            katanaVault.generateYield();
            vault.harvest();
        }

        // Alice's shares should remain constant (principal preservation)
        assertEq(vault.balanceOf(alice), aliceShares);

        // But donation recipient should have shares (from yields)
        uint256 recipientShares = vault.balanceOf(donationRecipient);
        assertGt(recipientShares, 0);
    }

    // ============ Admin Tests ============

    function testUpdateDonationRecipient() public {
        address newRecipient = makeAddr("newRecipient");

        vm.prank(admin);
        vault.updateDonationRecipient(newRecipient);

        GroupVaultTypes.VaultConfig memory config = vault.getVaultInfo();
        assertEq(config.donationRecipient, newRecipient);
    }

    function testUpdateMinDeposit() public {
        uint256 newMinDeposit = 5000 * 10**6;

        vm.prank(admin);
        vault.updateMinDeposit(newMinDeposit);

        GroupVaultTypes.VaultConfig memory config = vault.getVaultInfo();
        assertEq(config.minDeposit, newMinDeposit);
    }

    function testPauseUnpause() public {
        // Pause
        vm.prank(admin);
        vault.pause();

        GroupVaultTypes.VaultConfig memory config = vault.getVaultInfo();
        assertTrue(config.isPaused);

        // Try to deposit while paused
        vm.startPrank(alice);
        usdc.approve(address(vault), MIN_DEPOSIT);
        vm.expectRevert(IGroupVault.VaultPaused.selector);
        vault.deposit(MIN_DEPOSIT, alice);
        vm.stopPrank();

        // Unpause
        vm.prank(admin);
        vault.unpause();

        config = vault.getVaultInfo();
        assertFalse(config.isPaused);

        // Should be able to deposit again
        vm.startPrank(alice);
        vault.deposit(MIN_DEPOSIT, alice);
        vm.stopPrank();
    }

    function testUnauthorizedAdmin() public {
        vm.prank(alice);
        vm.expectRevert(IGroupVault.Unauthorized.selector);
        vault.pause();
    }

    // ============ View Function Tests ============

    function testGetPerformance() public {
        uint256 depositAmount = 100000 * 10**6;

        // Deposit
        vm.startPrank(alice);
        usdc.approve(address(vault), depositAmount);
        vault.deposit(depositAmount, alice);
        vm.stopPrank();

        // Generate yield and harvest
        katanaVault.generateYield();
        vault.harvest();

        // Get performance
        GroupVaultTypes.PerformanceReport memory perf = vault.getPerformance();

        assertGt(perf.totalAssets, 0);
        assertGt(perf.totalShares, 0);
        assertGt(perf.yieldGenerated, 0);
        assertGt(perf.yieldDonated, 0);
        assertEq(perf.memberCount, 2); // Alice + donation recipient
    }

    function testGetMembers() public {
        // Multiple deposits
        vm.startPrank(alice);
        usdc.approve(address(vault), MIN_DEPOSIT);
        vault.deposit(MIN_DEPOSIT, alice);
        vm.stopPrank();

        vm.startPrank(bob);
        usdc.approve(address(vault), MIN_DEPOSIT);
        vault.deposit(MIN_DEPOSIT, bob);
        vm.stopPrank();

        // Get members
        address[] memory members = vault.getMembers();
        assertEq(members.length, 2);
    }

    // ============ Integration Tests ============

    function testFullLifecycle() public {
        console.log("\n=== Full Lifecycle Test ===");

        // 1. Multiple users deposit
        console.log("\n1. Users depositing...");
        uint256 aliceDeposit = 50000 * 10**6;
        uint256 bobDeposit = 30000 * 10**6;

        vm.startPrank(alice);
        usdc.approve(address(vault), aliceDeposit);
        vault.deposit(aliceDeposit, alice);
        vm.stopPrank();

        vm.startPrank(bob);
        usdc.approve(address(vault), bobDeposit);
        vault.deposit(bobDeposit, bob);
        vm.stopPrank();

        console.log("Alice deposited:", aliceDeposit);
        console.log("Bob deposited:", bobDeposit);

        // 2. Generate yield over time
        console.log("\n2. Generating yields...");
        for (uint i = 0; i < 3; i++) {
            katanaVault.generateYield();
            uint256 yield = vault.harvest();
            console.log("Harvest %s: %s yield", i + 1, yield);
        }

        // 3. Check donation recipient received yields
        console.log("\n3. Checking donations...");
        uint256 recipientShares = vault.balanceOf(donationRecipient);
        console.log("Donation recipient shares:", recipientShares);

        // 4. Users withdraw
        console.log("\n4. Users withdrawing...");
        uint256 aliceShares = vault.balanceOf(alice);
        uint256 bobShares = vault.balanceOf(bob);

        vm.prank(alice);
        vault.withdraw(aliceShares / 2, alice, alice); // Partial withdraw

        vm.prank(bob);
        vault.withdraw(bobShares, bob, bob); // Full withdraw

        // 5. Final state
        console.log("\n5. Final state:");
        GroupVaultTypes.PerformanceReport memory finalPerf = vault.getPerformance();
        console.log("Total assets:", finalPerf.totalAssets);
        console.log("Total yield generated:", finalPerf.yieldGenerated);
        console.log("Total donations:", finalPerf.yieldDonated);
        console.log("Member count:", finalPerf.memberCount);

        // Assertions
        assertGt(finalPerf.yieldGenerated, 0);
        assertGt(recipientShares, 0);
    }
}
