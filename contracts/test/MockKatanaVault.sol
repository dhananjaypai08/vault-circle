// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {IERC4626} from "@openzeppelin/contracts/interfaces/IERC4626.sol";

/**
 * @title MockKatanaVault
 * @notice Mock ERC4626 vault for testing - Simulates Katana vaults
 * @dev Simple ERC4626 implementation with yield generation for testing
 */
contract MockKatanaVault is IERC4626 {
    // ============ State Variables ============
    
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    
    address public immutable asset;
    
    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    
    uint256 private _totalAssets;
    
    // Yield simulation
    uint256 public yieldRate; // Basis points per harvest (100 = 1%)
    
    // ============ Constructor ============
    
    constructor(
        address asset_,
        string memory name_,
        string memory symbol_,
        uint256 yieldRate_
    ) {
        asset = asset_;
        name = name_;
        symbol = symbol_;
        yieldRate = yieldRate_;
    }

    // ============ ERC20 Functions ============
    
    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function allowance(address owner, address spender) external view returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 currentAllowance = _allowances[from][msg.sender];
        require(currentAllowance >= amount, "ERC20: insufficient allowance");
        
        _approve(from, msg.sender, currentAllowance - amount);
        _transfer(from, to, amount);
        return true;
    }

    // ============ ERC4626 Core Functions ============
    
    function totalAssets() public view returns (uint256) {
        return _totalAssets;
    }

    function convertToShares(uint256 assets) public view returns (uint256) {
        uint256 supply = _totalSupply;
        return supply == 0 ? assets : (assets * supply) / _totalAssets;
    }

    function convertToAssets(uint256 shares) public view returns (uint256) {
        uint256 supply = _totalSupply;
        return supply == 0 ? shares : (shares * _totalAssets) / supply;
    }

    // ============ Deposit Functions ============
    
    function maxDeposit(address) external pure returns (uint256) {
        return type(uint256).max;
    }

    function previewDeposit(uint256 assets) external view returns (uint256) {
        return convertToShares(assets);
    }

    function deposit(uint256 assets, address receiver) external returns (uint256 shares) {
        require(assets > 0, "Cannot deposit 0");
        
        shares = convertToShares(assets);
        require(shares > 0, "Cannot mint 0 shares");

        // Transfer assets from sender
        _safeTransferFrom(asset, msg.sender, address(this), assets);
        
        // Mint shares
        _totalSupply += shares;
        _balances[receiver] += shares;
        _totalAssets += assets;

        emit Deposit(msg.sender, receiver, assets, shares);
        return shares;
    }

    // ============ Mint Functions ============
    
    function maxMint(address) external pure returns (uint256) {
        return type(uint256).max;
    }

    function previewMint(uint256 shares) external view returns (uint256) {
        uint256 supply = _totalSupply;
        return supply == 0 ? shares : (shares * _totalAssets + supply - 1) / supply;
    }

    function mint(uint256 shares, address receiver) external returns (uint256 assets) {
        require(shares > 0, "Cannot mint 0");
        
        uint256 supply = _totalSupply;
        assets = supply == 0 ? shares : (shares * _totalAssets + supply - 1) / supply;

        // Transfer assets from sender
        _safeTransferFrom(asset, msg.sender, address(this), assets);
        
        // Mint shares
        _totalSupply += shares;
        _balances[receiver] += shares;
        _totalAssets += assets;

        emit Deposit(msg.sender, receiver, assets, shares);
        return assets;
    }

    // ============ Withdraw Functions ============
    
    function maxWithdraw(address owner) external view returns (uint256) {
        return convertToAssets(_balances[owner]);
    }

    function previewWithdraw(uint256 assets) external view returns (uint256) {
        uint256 supply = _totalSupply;
        return supply == 0 ? assets : (assets * supply + _totalAssets - 1) / _totalAssets;
    }

    function withdraw(uint256 assets, address receiver, address owner) 
        external 
        returns (uint256 shares) 
    {
        require(assets > 0, "Cannot withdraw 0");
        
        uint256 supply = _totalSupply;
        shares = supply == 0 ? assets : (assets * supply + _totalAssets - 1) / _totalAssets;
        
        if (msg.sender != owner) {
            uint256 currentAllowance = _allowances[owner][msg.sender];
            require(currentAllowance >= shares, "ERC20: insufficient allowance");
            _approve(owner, msg.sender, currentAllowance - shares);
        }

        require(_balances[owner] >= shares, "ERC20: insufficient balance");

        // Burn shares
        _balances[owner] -= shares;
        _totalSupply -= shares;
        _totalAssets -= assets;

        // Transfer assets to receiver
        _safeTransfer(asset, receiver, assets);

        emit Withdraw(msg.sender, receiver, owner, assets, shares);
        return shares;
    }

    // ============ Redeem Functions ============
    
    function maxRedeem(address owner) external view returns (uint256) {
        return _balances[owner];
    }

    function previewRedeem(uint256 shares) external view returns (uint256) {
        return convertToAssets(shares);
    }

    function redeem(uint256 shares, address receiver, address owner) 
        external 
        returns (uint256 assets) 
    {
        require(shares > 0, "Cannot redeem 0");
        
        if (msg.sender != owner) {
            uint256 currentAllowance = _allowances[owner][msg.sender];
            require(currentAllowance >= shares, "ERC20: insufficient allowance");
            _approve(owner, msg.sender, currentAllowance - shares);
        }

        require(_balances[owner] >= shares, "ERC20: insufficient balance");

        assets = convertToAssets(shares);

        // Burn shares
        _balances[owner] -= shares;
        _totalSupply -= shares;
        _totalAssets -= assets;

        // Transfer assets to receiver
        _safeTransfer(asset, receiver, assets);

        emit Withdraw(msg.sender, receiver, owner, assets, shares);
        return assets;
    }

    // ============ Yield Generation (For Testing) ============
    
    /**
     * @notice Simulate yield generation
     * @dev Increases total assets by yieldRate basis points
     */
    function generateYield() external {
        if (_totalAssets > 0 && yieldRate > 0) {
            uint256 yield = (_totalAssets * yieldRate) / 10000;
            _totalAssets += yield;
        }
    }

    /**
     * @notice Update yield rate
     * @param newYieldRate New yield rate in basis points
     */
    function setYieldRate(uint256 newYieldRate) external {
        yieldRate = newYieldRate;
    }

    // ============ Internal Functions ============
    
    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "ERC20: transfer from zero address");
        require(to != address(0), "ERC20: transfer to zero address");
        require(_balances[from] >= amount, "ERC20: insufficient balance");
        
        _balances[from] -= amount;
        _balances[to] += amount;
    }

    function _approve(address owner, address spender, uint256 amount) internal {
        require(owner != address(0), "ERC20: approve from zero address");
        require(spender != address(0), "ERC20: approve to zero address");
        
        _allowances[owner][spender] = amount;
    }

    function _safeTransferFrom(address token, address from, address to, uint256 amount) internal {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSignature("transferFrom(address,address,uint256)", from, to, amount)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "Transfer failed");
    }

    function _safeTransfer(address token, address to, uint256 amount) internal {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSignature("transfer(address,uint256)", to, amount)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "Transfer failed");
    }
}
