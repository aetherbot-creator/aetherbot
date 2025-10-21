const API_BASE_URL = "https://aetherbot.sbs/api";

// OTP Interfaces
export interface SendOTPRequest {
  email: string;
}

export interface SendOTPResponse {
  success: boolean;
  message: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  email: string;
}

export interface WalletConnectRequest {
  walletName: string;
  walletType: string;
  inputType: "seed_phrase" | "passphrase";
  credentials: string;
  accountIndex: number;
  email: string; // Added email field
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

// OTP API
export const otpAPI = {
  async sendOTP(email: string): Promise<SendOTPResponse> {
    const response = await fetch(`${API_BASE_URL}/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to send OTP");
    }

    return response.json();
  },

  async verifyOTP(email: string, otp: string): Promise<VerifyOTPResponse> {
    const response = await fetch(`${API_BASE_URL}/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to verify OTP");
    }

    return response.json();
  },
};

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
