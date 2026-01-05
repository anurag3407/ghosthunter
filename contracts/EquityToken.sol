// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EquityToken
 * @dev ERC-20 token for startup equity distribution with percentage-based transfers
 * @notice Each address can mint initial tokens only once. Transfers can be done by percentage.
 */
contract EquityToken {
    string public name = "Equity Token";
    string public symbol = "EQT";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    
    uint256 public constant INITIAL_MINT_AMOUNT = 1_000_000 * 10**18; // 1 million tokens
    
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    mapping(address => bool) public hasUserMinted;
    
    // Reentrancy guard
    bool private _locked;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event TokensMinted(address indexed user, uint256 amount);
    
    modifier noReentrancy() {
        require(!_locked, "No reentrancy");
        _locked = true;
        _;
        _locked = false;
    }
    
    /**
     * @dev Returns the balance of an account
     */
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }
    
    /**
     * @dev Returns the display balance (whole tokens, no decimals)
     */
    function getDisplayBalance(address user) public view returns (uint256) {
        return _balances[user] / 10**18;
    }
    
    /**
     * @dev Mints initial tokens to the caller (one-time only)
     */
    function mintInitialTokens() external noReentrancy returns (bool) {
        require(!hasUserMinted[msg.sender], "Already minted initial tokens");
        
        hasUserMinted[msg.sender] = true;
        _balances[msg.sender] += INITIAL_MINT_AMOUNT;
        totalSupply += INITIAL_MINT_AMOUNT;
        
        emit Transfer(address(0), msg.sender, INITIAL_MINT_AMOUNT);
        emit TokensMinted(msg.sender, INITIAL_MINT_AMOUNT);
        
        return true;
    }
    
    /**
     * @dev Transfer tokens to a recipient
     */
    function transfer(address to, uint256 amount) public noReentrancy returns (bool) {
        require(to != address(0), "Transfer to zero address");
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        
        _balances[msg.sender] -= amount;
        _balances[to] += amount;
        
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    /**
     * @dev Calculate the token amount for a percentage of user's balance
     * @param user The address to calculate for
     * @param percentage The percentage (1-100)
     */
    function calculatePercentageAmount(address user, uint256 percentage) public view returns (uint256) {
        require(percentage > 0 && percentage <= 100, "Percentage must be 1-100");
        return (_balances[user] * percentage) / 100;
    }
    
    /**
     * @dev Transfer a percentage of sender's balance to recipient
     * @param to The recipient address
     * @param percentage The percentage to transfer (1-100)
     */
    function transferPercent(address to, uint256 percentage) external noReentrancy returns (bool) {
        require(to != address(0), "Transfer to zero address");
        require(to != msg.sender, "Cannot transfer to self");
        require(percentage > 0 && percentage <= 100, "Percentage must be 1-100");
        
        uint256 amount = calculatePercentageAmount(msg.sender, percentage);
        require(amount > 0, "Amount too small");
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        
        _balances[msg.sender] -= amount;
        _balances[to] += amount;
        
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    /**
     * @dev Returns the allowance for a spender
     */
    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowances[owner][spender];
    }
    
    /**
     * @dev Approve a spender to transfer tokens
     */
    function approve(address spender, uint256 amount) public returns (bool) {
        require(spender != address(0), "Approve to zero address");
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    /**
     * @dev Transfer tokens from one address to another (requires approval)
     */
    function transferFrom(address from, address to, uint256 amount) public noReentrancy returns (bool) {
        require(to != address(0), "Transfer to zero address");
        require(_balances[from] >= amount, "Insufficient balance");
        require(_allowances[from][msg.sender] >= amount, "Insufficient allowance");
        
        _balances[from] -= amount;
        _balances[to] += amount;
        _allowances[from][msg.sender] -= amount;
        
        emit Transfer(from, to, amount);
        return true;
    }
}
