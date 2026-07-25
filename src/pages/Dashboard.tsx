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
  AlertTriangle,
  Loader2,
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { walletAPI } from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [walletDetails, setWalletDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Trading states
  const [tradeModal, setTradeModal] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<any>(null);
  const [tradeQuantity, setTradeQuantity] = useState('1');
  const [chartData, setChartData] = useState<any[]>([]);
  const [isTrading, setIsTrading] = useState(false);
  
  // Holdings state
  const [holdings, setHoldings] = useState<any[]>([]);
  const [holdingsLoading, setHoldingsLoading] = useState(false);
  
  // Portfolio totals
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);
  const [totalCostBasis, setTotalCostBasis] = useState(0);
  const [totalPnl, setTotalPnl] = useState(0);
  const [totalPnlPercent, setTotalPnlPercent] = useState(0);
  
  // Meme coins and new tokens
  const [memcoins, setMemcoins] = useState<any[]>([]);
  const [newTokens, setNewTokens] = useState<any[]>([]);
  const [memcoinsLoading, setMemcoinsLoading] = useState(false);
  const [newTokensLoading, setNewTokensLoading] = useState(false);

  useEffect(() => {
    fetchWalletDetails();
    fetchSolanaPrice();
    fetchHoldings();
    const priceInterval = setInterval(fetchSolanaPrice, 30000);
    return () => clearInterval(priceInterval);
  }, []);

  useEffect(() => {
    if (activeTab === 'trading') {
      fetchMemcoins();
      fetchNewTokens();
      fetchHoldings();
      const interval = setInterval(() => {
        fetchMemcoins();
        fetchNewTokens();
        fetchHoldings();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // Calculate portfolio totals whenever holdings change
  useEffect(() => {
    if (holdings.length > 0) {
      const portfolioValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
      const costBasis = holdings.reduce((sum, h) => sum + h.costBasis, 0);
      const pnl = portfolioValue - costBasis;
      const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

      setTotalPortfolioValue(portfolioValue);
      setTotalCostBasis(costBasis);
      setTotalPnl(pnl);
      setTotalPnlPercent(pnlPercent);
    } else {
      setTotalPortfolioValue(0);
      setTotalCostBasis(0);
      setTotalPnl(0);
      setTotalPnlPercent(0);
    }
  }, [holdings]);

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

  const fetchMemcoins = async () => {
    try {
      setMemcoinsLoading(true);
      const response = await fetch('https://aetherbotbackend.netlify.app/.netlify/functions/get-memcoins');
      const data = await response.json();
      setMemcoins(data.data || []);
    } catch (err) {
      console.error('Error fetching memcoins:', err);
    } finally {
      setMemcoinsLoading(false);
    }
  };

  const fetchNewTokens = async () => {
    try {
      setNewTokensLoading(true);
      const response = await fetch('https://aetherbotbackend.netlify.app/.netlify/functions/get-new-tokens');
      const data = await response.json();
      setNewTokens(data.data || []);
    } catch (err) {
      console.error('Error fetching new tokens:', err);
    } finally {
      setNewTokensLoading(false);
    }
  };

  const fetchHoldings = async () => {
    try {
      setHoldingsLoading(true);
      const token = localStorage.getItem("walletToken");
      
      const response = await walletAPI.getWalletDetails(token);
      const walletData = response.wallet;
      
      if (walletData?.memecoinHoldings) {
        const holdingsData = walletData.memecoinHoldings;
        const allMarketData = [...memcoins, ...newTokens];
        
        const holdingsArray = Object.entries(holdingsData).map(([symbol, data]: [string, any]) => {
          const marketData = allMarketData.find(coin => coin.symbol === symbol);
          const currentPrice = marketData?.price || data.avgPrice || 0;
          const change24h = marketData?.change24h || 0;
          
          const balance = data.quantity || 0;
          const avgPrice = data.avgPrice || 0;
          const currentValue = balance * currentPrice;
          const costBasis = balance * avgPrice;
          const pnl = currentValue - costBasis;
          const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
          
          return {
            symbol: symbol,
            balance: balance,
            avgPrice: avgPrice,
            currentPrice: currentPrice,
            currentValue: currentValue,
            costBasis: costBasis,
            pnl: pnl,
            pnlPercent: pnlPercent,
            change24h: change24h,
            name: marketData?.name || symbol,
            logo: marketData?.logo || null
          };
        });
        
        holdingsArray.sort((a, b) => b.currentValue - a.currentValue);
        setHoldings(holdingsArray);
      } else {
        setHoldings([]);
      }
    } catch (err) {
      console.error('Error fetching holdings:', err);
      setHoldings([]);
    } finally {
      setHoldingsLoading(false);
    }
  };

  const openTradeModal = (coin: any) => {
    setSelectedCoin(coin);
    setTradeModal(true);
    setTradeQuantity('1');
    
    // Generate 24-hour price data
    const mockData = Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      price: coin.price * (0.95 + Math.random() * 0.1)
    }));
    
    setChartData(mockData);
  };

  const handleMemecoinTrade = async (action: 'buy' | 'sell') => {
    if (!selectedCoin) return;

    const quantity = parseInt(tradeQuantity);
    const price = selectedCoin.price;
    const totalCost = quantity * price;
    
    if (action === 'buy') {
      const aetherbotBalance = walletDetails?.AetherbotBalance || 0;
      if (totalCost > aetherbotBalance) {
        alert(`❌ Insufficient balance! You need ${totalCost.toFixed(4)} SOL but only have ${aetherbotBalance.toFixed(4)} SOL`);
        return;
      }
    }
    
    if (action === 'sell') {
      const holding = holdings.find(h => h.symbol === selectedCoin.symbol);
      if (!holding || holding.balance < quantity) {
        alert(`❌ Insufficient balance. You only have ${holding?.balance || 0} ${selectedCoin.symbol}`);
        return;
      }
    }

    setIsTrading(true);
    try {
      const token = localStorage.getItem("walletToken");
      if (!token) {
        alert("Please login again");
        window.location.href = "/";
        return;
      }

      const requestBody = {
        action,
        coinSymbol: selectedCoin.symbol,
        price: parseFloat(price.toFixed(8)),
        quantity
      };

      const response = await fetch('https://aetherbotbackend.netlify.app/.netlify/functions/trade-memecoin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Successfully ${action === 'buy' ? 'bought' : 'sold'} ${quantity} ${selectedCoin.symbol}!`);
        await fetchWalletDetails();
        await fetchHoldings();
        setTradeModal(false);
        setSelectedCoin(null);
      } else {
        alert(`❌ Trade failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Trade error:', error);
      alert(`❌ Trade failed: ${error.message || 'Network error'}`);
    } finally {
      setIsTrading(false);
    }
  };

  const handleTabClick = (tabId: string) => {
    if (tabId === "history" || tabId === "bots" || tabId === "alerts") {
      setShowUpgradeModal(true);
      setActiveTab(tabId);
      return;
    }
    setActiveTab(tabId);
  };

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
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">Wallet Dashboard</h1>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Connected
              </div>
              {solPrice && (solPrice * (walletDetails?.AetherbotBalance ?? 0)) >= 50000 ? (
                <div className="flex items-center gap-1 text-blue-300 font-bold">
                  💎 DIAMOND TIER
                </div>
              ) : solPrice && (solPrice * (walletDetails?.AetherbotBalance ?? 0)) >= 300 ? (
                <div className="flex items-center gap-1 text-yellow-400 font-bold">
                  🥇 GOLD TIER
                </div>
              ) : (
                <div className="flex items-center gap-1 text-orange-400 font-bold">
                  🥉 BRONZE TIER
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchWalletDetails}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.location.href = "/stocks"}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Stock Mode
            </Button>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Welcome back, {walletDetails?.walletType || "Trader"} • {walletDetails?.walletAddress}
          </p>
        </div>

        {/* Low Balance Warning */}
        {(solPrice && (solPrice * (walletDetails?.AetherbotBalance ?? 0)) < 300) && (
          <Alert className="mb-6 bg-red-950/30 border-red-900/50">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-400">
              <strong>Insufficient Balance Warning</strong>
              <p className="mt-1">
                Your current balance is below the minimum required to trade effectively.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <div className="flex gap-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
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
        {/* Overview Tab */}
{activeTab === "overview" && (
  <div>
    {/* Main Stats */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <p className="text-sm text-muted-foreground mb-2">Aetherbot Balance</p>
        <p className="text-3xl font-bold text-green-400">{walletDetails?.AetherbotBalance?.toFixed(4) || "0"} SOL</p>
        {solPrice && (
          <p className="text-xs text-muted-foreground mt-2">${(solPrice * (walletDetails?.AetherbotBalance || 0)).toFixed(2)} USD</p>
        )}
      </div>
      
      <div className="bg-card border border-border rounded-lg p-6">
        <p className="text-sm text-muted-foreground mb-2">Portfolio Value</p>
        <p className="text-3xl font-bold text-blue-400">${totalPortfolioValue.toFixed(2)}</p>
        <p className="text-xs text-muted-foreground mt-2">{holdings.length} positions</p>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-6">
        <p className="text-sm text-muted-foreground mb-2">Total P&L</p>
        <p className={`text-3xl font-bold ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)}
        </p>
        <p className="text-xs text-muted-foreground mt-2">{totalPnlPercent.toFixed(2)}%</p>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-6">
        <p className="text-sm text-muted-foreground mb-2">Total Invested</p>
        <p className="text-3xl font-bold text-purple-400">${totalCostBasis.toFixed(2)}</p>
        <p className="text-xs text-muted-foreground mt-2">In holdings</p>
      </div>
    </div>

    {/* Quick Actions */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">🚀 Quick Actions</h3>
        <div className="flex flex-col gap-2">
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={() => handleTabClick("trading")}
          >
            📈 Start Trading
          </Button>
          <Button 
            variant="outline"
            className="w-full"
            onClick={() => setWithdrawDialogOpen(true)}
          >
            💰 Withdraw Funds
          </Button>
          <Button 
            variant="outline"
            className="w-full"
            onClick={() => handleTabClick("account")}
          >
            👤 Account Settings
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">📊 Account Info</h3>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Wallet Type</p>
            <p className="text-sm font-medium capitalize">{walletDetails?.walletType || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Member Since</p>
            <p className="text-sm font-medium">
              {walletDetails?.createdAt 
                ? new Date(walletDetails.createdAt).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Login Count</p>
            <p className="text-sm font-medium">{walletDetails?.loginCount || 0}</p>
          </div>
        </div>
      </div>
    </div>

    {/* Holdings Preview */}
    <div>
      <h3 className="text-2xl font-bold mb-4">💼 Holdings Summary</h3>
      {holdings.length > 0 ? (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Coin</th>
                  <th className="px-4 py-3 font-medium text-right">Balance</th>
                  <th className="px-4 py-3 font-medium text-right">Value</th>
                  <th className="px-4 py-3 font-medium text-right">P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {holdings.slice(0, 5).map((holding) => (
                  <tr key={holding.symbol} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {holding.logo ? (
                          <img src={holding.logo} alt={holding.symbol} className="w-6 h-6 rounded-full" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/40'} />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-bold">
                            {holding.symbol.charAt(0)}
                          </div>
                        )}
                        <p className="font-medium text-sm">{holding.symbol}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-mono">
                      {holding.balance}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold">
                      ${holding.currentValue.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <span className={holding.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {holding.pnl >= 0 ? '+' : ''}{holding.pnl.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No holdings yet</p>
          <Button 
            className="mt-4 bg-blue-600 hover:bg-blue-700"
            onClick={() => handleTabClick("trading")}
          >
            Start Trading
          </Button>
        </div>
      )}
    </div>
  </div>
)}

        {/* Trading Tab */}
        {activeTab === "trading" && (
          <div>
            {/* Portfolio Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Portfolio Value</p>
                <p className="text-2xl font-bold">${totalPortfolioValue.toFixed(2)}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Total Invested</p>
                <p className="text-2xl font-bold">${totalCostBasis.toFixed(2)}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Total P&L</p>
                <p className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)}
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">P&L %</p>
                <p className={`text-2xl font-bold ${totalPnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {totalPnlPercent >= 0 ? '+' : ''}{totalPnlPercent.toFixed(2)}%
                </p>
              </div>
            </div>

            {/* My Holdings */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">💼 My Portfolio</h2>
                  <p className="text-sm text-muted-foreground">
                    {holdings.length} positions • Last updated: {new Date().toLocaleTimeString()}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => fetchHoldings()}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${holdingsLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              
              {holdingsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : holdings.length > 0 ? (
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr className="text-left text-sm text-muted-foreground">
                          <th className="px-4 py-3 font-medium">Coin</th>
                          <th className="px-4 py-3 font-medium text-right">Balance</th>
                          <th className="px-4 py-3 font-medium text-right">Avg Price</th>
                          <th className="px-4 py-3 font-medium text-right">Current Price</th>
                          <th className="px-4 py-3 font-medium text-right">Value</th>
                          <th className="px-4 py-3 font-medium text-right">P&L</th>
                          <th className="px-4 py-3 font-medium text-right">24h Change</th>
                          <th className="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {holdings.map((holding) => (
                          <tr key={holding.symbol} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {holding.logo ? (
                                  <img src={holding.logo} alt={holding.symbol} className="w-8 h-8 rounded-full" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/40'} />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-sm font-bold">
                                    {holding.symbol.charAt(0)}
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium">{holding.symbol}</p>
                                  <p className="text-xs text-muted-foreground">{holding.name}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right font-mono">
                              {holding.balance}
                            </td>
                            <td className="px-4 py-3 text-right font-mono">
                              ${holding.avgPrice.toFixed(8)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono">
                              ${holding.currentPrice.toFixed(8)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-bold">
                              ${holding.currentValue.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className={`font-mono ${holding.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {holding.pnl >= 0 ? '+' : ''}{holding.pnl.toFixed(2)}
                                <span className="text-xs ml-1">
                                  ({holding.pnlPercent >= 0 ? '+' : ''}{holding.pnlPercent.toFixed(2)}%)
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                holding.change24h >= 0 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {holding.change24h >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                {holding.change24h >= 0 ? '+' : ''}{holding.change24h.toFixed(2)}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex gap-2 justify-end">
                                <Button 
                                  size="sm" 
                                  className="bg-green-600 hover:bg-green-700 h-8 px-3"
                                  onClick={() => {
                                    setSelectedCoin(holding);
                                    setTradeModal(true);
                                    const mockData = Array.from({ length: 24 }, (_, i) => ({
                                      time: `${i}:00`,
                                      price: holding.currentPrice * (0.95 + Math.random() * 0.1)
                                    }));
                                    setChartData(mockData);
                                  }}
                                >
                                  Buy
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="bg-red-600 hover:bg-red-700 h-8 px-3"
                                  onClick={() => {
                                    setSelectedCoin(holding);
                                    setTradeModal(true);
                                    const mockData = Array.from({ length: 24 }, (_, i) => ({
                                      time: `${i}:00`,
                                      price: holding.currentPrice * (0.95 + Math.random() * 0.1)
                                    }));
                                    setChartData(mockData);
                                  }}
                                >
                                  Sell
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-lg p-12 text-center">
                  <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No holdings yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Start trading to build your portfolio</p>
                </div>
              )}
            </div>

            {/* Meme Coins */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4">📉 Meme Coins (Under 500M)</h2>
              {memcoinsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {memcoins.map(coin => (
                    <div key={coin.address} className="bg-card border border-border rounded-lg p-4 hover:border-primary transition-colors">
                      <div className="flex items-center gap-2 mb-3">
                        <img src={coin.logo} alt={coin.name} className="w-10 h-10 rounded-full" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/40'} />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold truncate">{coin.symbol}</p>
                          <p className="text-xs text-muted-foreground truncate">{coin.name}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Price</p>
                          <p className="text-lg font-bold">${coin.price.toFixed(coin.price < 0.01 ? 8 : 2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">24h Change</p>
                          <p className={`text-sm font-semibold ${coin.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Market Cap</p>
                          <p className="text-sm">${(coin.marketCap / 1000000).toFixed(2)}M</p>
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full bg-blue-600 hover:bg-blue-700 mt-2"
                          onClick={() => openTradeModal(coin)}
                        >
                          📈 View & Trade
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* New Tokens */}
            <div>
              <h2 className="text-2xl font-bold mb-4">⭐ New Tokens (100k - 10M)</h2>
              {newTokensLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {newTokens.map(coin => (
                    <div key={coin.address} className="bg-card border border-border rounded-lg p-4 hover:border-primary transition-colors">
                      <div className="flex items-center gap-2 mb-3">
                        <img src={coin.logo} alt={coin.name} className="w-10 h-10 rounded-full" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/40'} />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold truncate">{coin.symbol}</p>
                          <p className="text-xs text-muted-foreground truncate">{coin.name}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Price</p>
                          <p className="text-lg font-bold">${coin.price.toFixed(coin.price < 0.01 ? 8 : 2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">24h Change</p>
                          <p className={`text-sm font-semibold ${coin.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Market Cap</p>
                          <p className="text-sm">${(coin.marketCap / 1000000).toFixed(2)}M</p>
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full bg-yellow-600 hover:bg-yellow-700 mt-2"
                          onClick={() => openTradeModal(coin)}
                        >
                          ⭐ View & Trade
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === "account" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-6">Wallet Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Wallet Address</label>
                  <div className="mt-1 px-3 py-2 bg-muted rounded-md flex items-center gap-2">
                    <span className="text-sm font-mono flex-1 truncate">
                      {walletDetails?.walletAddress || "N/A"}
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(walletDetails?.walletAddress || "")}
                      className="text-primary hover:text-primary/80"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Member Since</label>
                  <div className="mt-1 px-3 py-2 bg-muted rounded-md">
                    <span className="text-sm">
                      {walletDetails?.createdAt 
                        ? new Date(walletDetails.createdAt).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4 border-red-900/50 text-red-400"
                  onClick={() => {
                    localStorage.removeItem("walletToken");
                    localStorage.removeItem("walletAddress");
                    window.location.href = "/";
                  }}
                >
                  Disconnect Wallet
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Other Tabs */}
        {(activeTab === "history" || activeTab === "bots" || activeTab === "alerts") && (
          <div className="flex flex-col items-center justify-center py-24 space-y-6">
            <div className="text-6xl">🔒</div>
            <h2 className="text-2xl font-bold text-center">Premium Feature</h2>
            <p className="text-muted-foreground text-center max-w-md">
              Upgrade your subscription to access this feature.
            </p>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-3" onClick={() => window.location.href = "/pricing"}>
              Subscribe Now
            </Button>
          </div>
        )}
      </main>

      {/* Trade Modal with Chart */}
      {tradeModal && selectedCoin && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <img src={selectedCoin.logo} alt={selectedCoin.name} className="w-12 h-12 rounded-full" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/40'} />
                  <div>
                    <h2 className="text-2xl font-bold">{selectedCoin.symbol}</h2>
                    <p className="text-sm text-muted-foreground">{selectedCoin.name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setTradeModal(false)}
                  className="text-2xl text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Price Info */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-2xl font-bold">${selectedCoin.price.toFixed(8)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">24h Change</p>
                  <p className={`text-2xl font-bold ${selectedCoin.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedCoin.change24h >= 0 ? '+' : ''}{selectedCoin.change24h.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Market Cap</p>
                  <p className="text-2xl font-bold">${(selectedCoin.marketCap / 1000000).toFixed(2)}M</p>
                </div>
              </div>

              {/* Chart */}
              <div className="mb-6 bg-muted rounded-lg p-4 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="time" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                      formatter={(value: any) => `$${value.toFixed(8)}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#667eea" 
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Trade Form */}
              <div className="bg-muted rounded-lg p-4 space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Quantity</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={tradeQuantity}
                    onChange={(e) => setTradeQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-background rounded-lg border border-border mt-1"
                  />
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                  <p className="text-2xl font-bold">${(selectedCoin.price * (parseInt(tradeQuantity) || 0)).toFixed(2)}</p>
                </div>

                <div className="flex gap-3">
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={isTrading}
                    onClick={() => handleMemecoinTrade('buy')}
                  >
                    {isTrading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Buy {selectedCoin.symbol}
                  </Button>
                  <Button 
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    disabled={isTrading}
                    onClick={() => handleMemecoinTrade('sell')}
                  >
                    {isTrading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Sell {selectedCoin.symbol}
                  </Button>
                </div>
                
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => setTradeModal(false)}
                  disabled={isTrading}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <WithdrawDialog 
        open={withdrawDialogOpen}
        onOpenChange={setWithdrawDialogOpen}
        maxBalance={walletDetails?.AetherbotBalance ?? 0}
      />
      <Footer />
    </div>
  );
};

export default Dashboard;
