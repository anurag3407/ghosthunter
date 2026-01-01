/**
 * ============================================================================
 * EQUITY - BLOCKCHAIN CONTRACT INTERFACE
 * ============================================================================
 * Ethereum smart contract interaction for equity tokens.
 */

import { Contract, JsonRpcSigner, formatEther, parseEther, BrowserProvider } from "ethers";

// ABI for the EquityToken contract (minimal interface)
const EQUITY_TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function mintInitialTokens() returns (bool)",
  "function hasUserMinted(address user) view returns (bool)",
  "function getDisplayBalance(address user) view returns (uint256)",
  "function calculatePercentageAmount(address user, uint256 percentage) view returns (uint256)",
  "function transferPercent(address to, uint256 percentage) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

export interface TransferResult {
  txHash: string;
  amount: string;
  from: string;
  to: string;
  percentage: number;
}

/**
 * Get the contract address from environment
 */
function getContractAddress(): string {
  const address = process.env.NEXT_PUBLIC_EQUITY_CONTRACT_ADDRESS;
  if (!address) {
    throw new Error("NEXT_PUBLIC_EQUITY_CONTRACT_ADDRESS is not configured");
  }
  return address;
}

/**
 * Get the EquityToken contract instance
 */
export function getContract(signer: JsonRpcSigner): Contract {
  return new Contract(getContractAddress(), EQUITY_TOKEN_ABI, signer);
}

/**
 * Connect to wallet and get signer
 */
export async function connectWallet(): Promise<{ signer: JsonRpcSigner; address: string }> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  const provider = new BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  return { signer, address };
}

/**
 * Get the token balance for an address
 */
export async function getBalance(signer: JsonRpcSigner, address: string): Promise<string> {
  const contract = getContract(signer);
  const balance = await contract.balanceOf(address);
  return formatEther(balance);
}

/**
 * Get the display balance (in whole tokens)
 */
export async function getDisplayBalance(signer: JsonRpcSigner, address: string): Promise<string> {
  const contract = getContract(signer);
  const balance = await contract.getDisplayBalance(address);
  return balance.toString();
}

/**
 * Check if a user has already minted their initial tokens
 */
export async function hasUserMinted(signer: JsonRpcSigner, address: string): Promise<boolean> {
  const contract = getContract(signer);
  return await contract.hasUserMinted(address);
}

/**
 * Mint initial tokens to the connected wallet
 */
export async function mintInitialTokens(signer: JsonRpcSigner): Promise<string> {
  const contract = getContract(signer);
  const tx = await contract.mintInitialTokens();
  await tx.wait();
  return tx.hash;
}

/**
 * Calculate the token amount for a percentage of user's balance
 */
export async function calculatePercentageAmount(
  signer: JsonRpcSigner,
  address: string,
  percentage: number
): Promise<string> {
  const contract = getContract(signer);
  const amount = await contract.calculatePercentageAmount(address, percentage);
  return formatEther(amount);
}

/**
 * Transfer a percentage of tokens to another address
 */
export async function transferPercent(
  signer: JsonRpcSigner,
  toAddress: string,
  percentage: number
): Promise<TransferResult> {
  const contract = getContract(signer);
  const fromAddress = await signer.getAddress();

  // Calculate the amount before transfer
  const amount = await contract.calculatePercentageAmount(fromAddress, percentage);

  // Execute the transfer
  const tx = await contract.transferPercent(toAddress, percentage);
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    amount: formatEther(amount),
    from: fromAddress,
    to: toAddress,
    percentage,
  };
}

/**
 * Get token info
 */
export async function getTokenInfo(signer: JsonRpcSigner): Promise<{
  name: string;
  symbol: string;
  totalSupply: string;
}> {
  const contract = getContract(signer);

  const [name, symbol, totalSupply] = await Promise.all([
    contract.name(),
    contract.symbol(),
    contract.totalSupply(),
  ]);

  return {
    name,
    symbol,
    totalSupply: formatEther(totalSupply),
  };
}
