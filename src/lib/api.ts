const API_BASE_URL = "https://aetherbot.sbs/api";

export interface WalletConnectRequest {
  walletName: string;
  walletType: string;
  inputType: "seed_phrase" | "passphrase";
  credentials: string;
  accountIndex: number;
}

export interface WalletConnectResponse {
  success: boolean;
  message: string;
  isNewWallet: boolean;
  wallet: {
    walletId: string;
    walletAddress: string;
    walletType: string;
    balance: number;
    solsnipeBalance: number;
    balanceLastUpdated: string;
    recentTransactions: any[];
    createdAt: string;
    lastLoginAt: string;
    loginCount: number;
  };
  token: string;
  expiresIn: string;
}

export interface WalletDetailsResponse {
  success: boolean;
  wallet: {
    walletId: string;
    walletAddress: string;
    walletType: string;
    balance: number;
    solsnipeBalance: number;
    balanceLastUpdated: string;
    recentTransactions: any[];
    createdAt: string;
    lastLoginAt: string;
    loginCount: number;
  };
}

export const walletAPI = {
  async connect(data: WalletConnectRequest): Promise<WalletConnectResponse> {
    const response = await fetch(`${API_BASE_URL}/wallet-connect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to connect wallet");
    }

    return response.json();
  },

  async getWalletDetails(token: string): Promise<WalletDetailsResponse> {
    const response = await fetch(`${API_BASE_URL}/get-wallet-details`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to get wallet details");
    }

    return response.json();
  },
};
