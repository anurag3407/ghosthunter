"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";

interface WalletContextType {
  address: string | null;
  signer: JsonRpcSigner | null;
  isConnecting: boolean;
  isConnected: boolean;
  chainId: number | null;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToSepolia: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

// Sepolia chain configuration
const SEPOLIA_CHAIN_ID = 11155111;
const SEPOLIA_CONFIG = {
  chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}`,
  chainName: "Sepolia Testnet",
  nativeCurrency: {
    name: "SepoliaETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://ethereum-sepolia-rpc.publicnode.com"],
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
};

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isConnected = !!address && !!signer;

  const connect = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setError("Please install MetaMask to connect your wallet");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      
      const network = await provider.getNetwork();
      setChainId(Number(network.chainId));

      const walletSigner = await provider.getSigner();
      const walletAddress = await walletSigner.getAddress();

      setSigner(walletSigner);
      setAddress(walletAddress);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to connect wallet";
      setError(message);
      console.error("Wallet connection error:", err);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setSigner(null);
    setChainId(null);
    setError(null);
  }, []);

  const switchToSepolia = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setError("MetaMask is not installed");
      return;
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CONFIG.chainId }],
      });
    } catch (switchError: unknown) {
      // Chain not added, try to add it
      if ((switchError as { code?: number })?.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [SEPOLIA_CONFIG],
          });
        } catch (addError) {
          console.error("Error adding Sepolia network:", addError);
          setError("Failed to add Sepolia network");
        }
      } else {
        console.error("Error switching network:", switchError);
        setError("Failed to switch network");
      }
    }
  }, []);

  // Listen for account and chain changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== address) {
        setAddress(accounts[0]);
      }
    };

    const handleChainChanged = (newChainId: string) => {
      setChainId(parseInt(newChainId, 16));
    };

    window.ethereum.on?.("accountsChanged", handleAccountsChanged as (...args: unknown[]) => void);
    window.ethereum.on?.("chainChanged", handleChainChanged as (...args: unknown[]) => void);

    return () => {
      window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged as (...args: unknown[]) => void);
      window.ethereum?.removeListener?.("chainChanged", handleChainChanged as (...args: unknown[]) => void);
    };
  }, [address, disconnect]);

  return (
    <WalletContext.Provider
      value={{
        address,
        signer,
        isConnecting,
        isConnected,
        chainId,
        error,
        connect,
        disconnect,
        switchToSepolia,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}

export const SEPOLIA_CHAIN_ID_NUM = SEPOLIA_CHAIN_ID;

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}
