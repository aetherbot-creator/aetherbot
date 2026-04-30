import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { WithdrawDialog } from "@/components/WithdrawDialog";
import { useState, useEffect } from "react";
import { 
  BarChart3, 
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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    fetchWalletDetails();
    fetchSolanaPrice();
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

  const handleTabClick = (tabId: string) => {
    if (tabId === "trading" || tabId === "history" || tabId === "bots" || tabId === "alerts") {
      setShowUpgradeModal(true);
      setActiveTab(tabId);
      return;
    }
    setActiveTab(tabId);
  };

  // ✅ FIXED: tabs array properly declared
  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "account", label: "Account", icon: User },
    { id: "trading", label: "Trading", icon: TrendingUp },
    { id: "history", label: "History", icon: History },
    { id: "bots", label: "Bots", icon: Bot },
    { id: "alerts", label: "Alerts", icon: Bell },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="w-full px-6 py-6 pt-24">
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
      <main className="w-full px-6 py-6 pt-24">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">Wallet Dashboard</h1>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Connected
              </div>
              {solPrice && walletDetails?.AetherbotBalance && (solPrice * walletDetails.AetherbotBalance) >= 50000 ? (
                <div className="flex items-center gap-1 text-blue-300 font-bold">
                  💎 DIAMOND TIER
                </div>
              ) : (
                <div className="flex items-center gap-1 text-yellow-400 font-bold">
                  🥇 GOLD TIER
                </div>
              )}
            </div>
          </div>
        </div>

        {/* The rest of your dashboard JSX stays exactly the same */}
      </main>
      <Footer />
      <WithdrawDialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen} />
    </div>
  );
};

export default Dashboard;
