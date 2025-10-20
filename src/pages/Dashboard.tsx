import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { WithdrawDialog } from "@/components/WithdrawDialog";
import { useState, useEffect } from "react";
import { 
  BarChart3, 
  Wallet, 
  TrendingUp, 
  History, 
  Bot, 
  Bell, 
  User, 
  Eye, 
  RefreshCw, 
  ArrowLeft,
  AlertTriangle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { walletAPI } from "@/lib/api";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [walletDetails, setWalletDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);

  useEffect(() => {
    fetchWalletDetails();
    fetchSolanaPrice();
    
    // Fetch Solana price every 30 seconds
    const priceInterval = setInterval(fetchSolanaPrice, 30000);
    
    return () => clearInterval(priceInterval);
  }, []);

  const fetchSolanaPrice = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
      const data = await response.json();
      setSolPrice(data.solana.usd);
    } catch (error) {
      console.error('Failed to fetch Solana price:', error);
    }
  };

  const fetchWalletDetails = async () => {
    const token = localStorage.getItem("walletToken");
    if (!token) {
      window.location.href = "/";
      return;
    }

    try {
      setIsLoading(true);
      const response = await walletAPI.getWalletDetails(token);
      setWalletDetails(response.wallet);
    } catch (error) {
      console.error("Failed to fetch wallet details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "account", label: "Account", icon: User },
    { id: "portfolio", label: "Portfolio", icon: Wallet },
    { id: "trading", label: "Trading", icon: TrendingUp },
    { id: "history", label: "History", icon: History },
    { id: "bots", label: "Bots", icon: Bot },
    { id: "alerts", label: "Alerts", icon: Bell },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="w-full px-6 py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="w-full px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">Wallet Dashboard</h1>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Connected
              </div>
              {walletDetails?.solsnipeBalance < 0.5 && (
                <div className="flex items-center gap-1 text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  Low Balance
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                SOL Price: {solPrice ? `$${solPrice.toFixed(2)}` : 'Loading...'}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchWalletDetails}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.location.href = "/"}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Trading
            </Button>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Welcome back, {walletDetails?.walletType || "Trader"} • {walletDetails?.walletAddress}
          </p>
        </div>

        {/* Low Balance Warning - Always Show */}
        <Alert className="mb-6 bg-red-950/30 border-red-900/50">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-400">
            <strong>Insufficient Balance Warning</strong>
            <p className="mt-1">
             Your current balance is below the minimum required to trade effectively.
              Most platform features are temporarily disabled until you add more  funds.
            </p>
            <div className="flex gap-2 mt-3">
                <Button size="sm" className="bg-red-600 hover:bg-red-700">
                  Add Funds
                </Button>
                <Button size="sm" variant="outline">
                  View Markets
                </Button>
              </div>
            </AlertDescription>
          </Alert>

        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <div className="flex gap-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dashboard Content */}
        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total Balance */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-muted-foreground">Total Balance</h3>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold mb-1">
              ${solPrice && walletDetails?.solsnipeBalance 
                ? (solPrice * walletDetails.solsnipeBalance).toLocaleString('en-US', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })
                : "0.00"}
            </p>
            {/* <p className="text-sm text-green-400">+0.00% P&L</p> */}
          </div>

          {/* SOL Balance */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-muted-foreground">SOL Balance</h3>
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-xs">◎</span>
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{walletDetails?.solsnipeBalance.toFixed(4) || "0.0000"} SOL</p>
            <p className="text-sm text-muted-foreground">
              ≈ ${solPrice && walletDetails?.solsnipeBalance 
                ? (solPrice * walletDetails.solsnipeBalance).toFixed(2) 
                : "0.00"}
            </p>
            {/* {walletDetails?.solsnipeBalance < 0.5 && (
              <p className="text-xs text-red-400 mt-1">Below minimum (0.5 SOL)</p>
            )} */}
          </div>

          {/* AutoSnipe Bots */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-muted-foreground">AutoSnipe Bots</h3>
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <p className="text-3xl font-bold mb-1">{walletDetails?.autoSnipeBot || 0}</p>
            <p className="text-sm text-blue-400">{walletDetails?.autoSnipeBot || 0} total configs</p>
          </div>

          {/* Total Trades */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-muted-foreground">Total Trades</h3>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold mb-1">{walletDetails?.totalTrade || 0}</p>
            <p className="text-sm text-muted-foreground">All time</p>
          </div>
        </div>

        {/* Account Status & Deposits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Account Status */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Account Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="text-sm text-green-400">active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Member since</span>
                <span className="text-sm">
                  {walletDetails?.createdAt 
                    ? new Date(walletDetails.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Deposits & Withdrawals */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Deposits & Withdrawals</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Deposited:</span>
                <span className="text-sm text-green-400">
                  {walletDetails?.depositedAmount?.toFixed(4) || '0.0000'} SOL
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Withdrawn:</span>
                <span className="text-sm text-red-400">0.0000 SOL</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => setWithdrawDialogOpen(true)}
            >
              Withdraw Funds
            </Button>
          </div>

          {/* Last Activity */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Last Activity</h3>
            <p className="text-2xl font-bold">
              {walletDetails?.lastLoginAt 
                ? new Date(walletDetails.lastLoginAt).toLocaleString()
                : "N/A"}
            </p>
          </div>
        </div>

        {/* AutoSnipe Configurations */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bot className="h-5 w-5" />
            <h3 className="text-lg font-semibold">AutoSnipe Configurations</h3>
          </div>
          <p className="text-muted-foreground text-center py-12">No AutoSnipe configurations found</p>
        </div>
        </>
        )}

        {/* Account Tab Content */}
        {activeTab === "account" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Wallet Information */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-6">Wallet Information</h3>
              <p className="text-sm text-muted-foreground mb-6">Your connected wallet details</p>
              
              <div className="space-y-4">
                {/* Wallet Name */}
                <div>
                  <label className="text-sm text-muted-foreground">Wallet Name</label>
                  <div className="mt-1 px-3 py-2 bg-muted rounded-md flex items-center gap-2">
                    <span className="text-sm capitalize">{walletDetails?.walletType || "N/A"}</span>
                    <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded">
                      {walletDetails?.walletType || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Wallet Address */}
                <div>
                  <label className="text-sm text-muted-foreground">Wallet Address</label>
                  <div className="mt-1 px-3 py-2 bg-muted rounded-md flex items-center gap-2">
                    <span className="text-sm font-mono flex-1 truncate">
                      {walletDetails?.walletAddress || "N/A"}
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(walletDetails?.walletAddress || "")}
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Connection Method */}
                <div>
                  <label className="text-sm text-muted-foreground">Connection Method</label>
                  <div className="mt-1 px-3 py-2 bg-muted rounded-md">
                    <span className="text-sm capitalize">
                      {walletDetails?.inputType === "seed_phrase" ? "Seed Phrase" : 
                       walletDetails?.inputType === "passphrase" ? "Private Key" : "N/A"}
                    </span>
                  </div>
                </div>

                {/* Member Since */}
                <div>
                  <label className="text-sm text-muted-foreground">Member Since</label>
                  <div className="mt-1 px-3 py-2 bg-muted rounded-md">
                    <span className="text-sm">
                      {walletDetails?.createdAt 
                        ? new Date(walletDetails.createdAt).toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })
                        : "N/A"}
                    </span>
                  </div>
                </div>

                {/* Disconnect Button */}
                <Button 
                  variant="outline" 
                  className="w-full mt-4 border-red-900/50 text-red-400 hover:bg-red-950/30 hover:text-red-300"
                  onClick={() => {
                    localStorage.removeItem("walletToken");
                    localStorage.removeItem("walletAddress");
                    localStorage.removeItem("walletType");
                    window.location.href = "/";
                  }}
                >
                  Disconnect Wallet
                </Button>
              </div>
            </div>

            {/* API Keys */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-6">API Keys</h3>
              <p className="text-sm text-muted-foreground mb-6">Manage your API keys for external integrations</p>
              
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 1v6m0 6v6"/>
                    <path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24"/>
                    <path d="M1 12h6m6 0h6"/>
                    <path d="m4.93 19.07 4.24-4.24m5.66-5.66 4.24-4.24"/>
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium mb-1">No API keys generated</p>
                  <p className="text-xs text-muted-foreground">Create API keys for external integrations</p>
                </div>
                <Button variant="outline" className="mt-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M5 12h14"/>
                    <path d="M12 5v14"/>
                  </svg>
                  Generate API Key
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <WithdrawDialog 
        open={withdrawDialogOpen}
        onOpenChange={setWithdrawDialogOpen}
        maxBalance={walletDetails?.solsnipeBalance || 0}
      />

      <Footer />
    </div>
  );
};

export default Dashboard;
