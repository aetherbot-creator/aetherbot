import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  RefreshCw, 
  ArrowLeft, 
  Activity, 
  Wallet, 
  Layers, 
  ChevronRight, 
  Briefcase,
  ArrowDownUp,
  Coins
} from "lucide-react";
import { walletAPI } from "@/lib/api";

interface Position {
  ticker: string;
  quantity: number;
  avgPrice: number;
}

const StockDashboard = () => {
  const [ticker, setTicker] = useState("AAPL");
  const [price, setPrice] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isFetching, setIsFetching] = useState(false);
  const [orderType, setOrderType] = useState<"BUY" | "SELL">("BUY");

  // --- New On-Ramp Conversion State ---
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [cryptoBalance, setCryptoBalance] = useState<number>(0);
  const [convertAmount, setConvertAmount] = useState<string>("");
  const [showSwapPane, setShowSwapPane] = useState<boolean>(false);

  // --- Persistent LocalStorage State Units ---
  const [virtualCash, setVirtualCash] = useState<number>(() => {
    const saved = localStorage.getItem("aether_stock_cash");
    return saved ? parseFloat(saved) : 0; // Starts at $0 until they convert!
  });

  const [positions, setPositions] = useState<Position[]>(() => {
    const saved = localStorage.getItem("aether_stock_positions");
    return saved ? JSON.parse(saved) : [];
  });

  // Sync state modifications to local registry updates
  useEffect(() => {
    localStorage.setItem("aether_stock_cash", virtualCash.toString());
  }, [virtualCash]);

  useEffect(() => {
    localStorage.setItem("aether_stock_positions", JSON.stringify(positions));
  }, [positions]);

  // Fetch live market data hooks
  const fetchMarketData = async () => {
    if (!ticker) return;
    try {
      setIsFetching(true);
      // 1. Fetch Stock Price
      const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_KEY || "YOUR_ALPHA_VANTAGE_KEY"; 
      const stockRes = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${apiKey}`
      );
      const stockData = await stockRes.json();
      if (stockData["Global Quote"] && stockData["Global Quote"]["05. price"]) {
        setPrice(parseFloat(stockData["Global Quote"]["05. price"]));
      }

      // 2. Fetch Live SOL conversion metric
      const cryptoRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
      const cryptoData = await cryptoRes.json();
      setSolPrice(cryptoData.solana.usd);

      // 3. Fetch Real User Crypto Balances
      const token = localStorage.getItem("walletToken");
      if (token) {
        const profile = await walletAPI.getWalletDetails(token);
        setCryptoBalance(profile.wallet?.AetherbotBalance ?? 0);
      }
    } catch (error) {
      console.error("Market synchronization failure:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, [ticker]);

  // Handle Conversion Action
  const executeLiquidityConversion = () => {
    const solToConvert = parseFloat(convertAmount);
    if (isNaN(solToConvert) || solToConvert <= 0) return alert("Enter a valid amount.");
    if (solToConvert > cryptoBalance) return alert("Insufficient available SOL balance to convert.");
    if (!solPrice) return alert("Price indexing offline. Try again shortly.");

    const creditUsdAmount = solToConvert * solPrice;

    // Deduct locally and add to standalone USD balance
    setCryptoBalance(prev => prev - solToConvert);
    setVirtualCash(prev => prev + creditUsdAmount);
    setConvertAmount("");
    setShowSwapPane(false);
    alert(`Successfully converted ${solToConvert} SOL into $${creditUsdAmount.toFixed(2)} USD!`);
  };

  const executeOrder = () => {
    if (!price) return;
    const totalCost = price * quantity;

    if (orderType === "BUY") {
      if (virtualCash < totalCost) {
        alert("Execution Error: Insufficient standalone liquidity. Convert more SOL.");
        return;
      }
      setVirtualCash(prev => prev - totalCost);
      setPositions(prev => {
        const existing = prev.find(p => p.ticker === ticker);
        if (existing) {
          const newQty = existing.quantity + quantity;
          const newAvg = ((existing.avgPrice * existing.quantity) + totalCost) / newQty;
          return prev.map(p => p.ticker === ticker ? { ...p, quantity: newQty, avgPrice: newAvg } : p);
        }
        return [...prev, { ticker, quantity, avgPrice: price }];
      });
    } else {
      const existing = positions.find(p => p.ticker === ticker);
      if (!existing || existing.quantity < quantity) {
        alert("Execution Error: Insufficient asset shares available to close.");
        return;
      }
      setVirtualCash(prev => prev + totalCost);
      setPositions(prev => {
        return prev
          .map(p => p.ticker === ticker ? { ...p, quantity: p.quantity - quantity } : p)
          .filter(p => p.quantity > 0);
      });
    }
  };

  const totalPortfolioValue = positions.reduce((sum, pos) => {
    const currentPrice = ticker === pos.ticker && price ? price : pos.avgPrice;
    return sum + (pos.quantity * currentPrice);
  }, 0);

  return (
    <div className="min-h-screen bg-[#090d16] text-[#e2e8f0] font-sans flex flex-col antialiased">
      
      {/* Dynamic Terminal Header */}
      <header className="border-b border-[#1e293b] bg-[#0d1527] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-[#1e293b] p-2 rounded-lg cursor-pointer hover:bg-[#1e293b]/80 transition-colors" onClick={() => window.location.href = "/dashboard"}>
            <ArrowLeft className="h-4 w-4 text-slate-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="font-mono text-lg font-bold tracking-wider text-slate-100">STOCK ROUTING TERMINAL</h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 font-mono text-xs">
          <Button 
            size="sm" 
            variant="outline" 
            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 gap-2 font-mono h-9"
            onClick={() => setShowSwapPane(!showSwapPane)}
          >
            <ArrowDownUp className="h-3.5 w-3.5" /> Convert SOL to USD
          </Button>
        </div>
      </header>

      {/* Main Container Core layout */}
      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-[1600px] mx-auto w-full relative">
        
        {/* SWAP POPUP COMPONENT MODULE */}
        {showSwapPane && (
          <div className="absolute top-4 right-6 w-80 bg-[#0d1527] border border-purple-500/40 rounded-xl p-5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-2 mb-4">
              <span className="font-mono font-bold text-purple-400 flex items-center gap-1.5"><Coins className="h-4 w-4" /> Liquidity Bridge</span>
              <button onClick={() => setShowSwapPane(false)} className="text-slate-500 hover:text-slate-300 text-sm">✕</button>
            </div>
            <div className="space-y-4 font-mono">
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>AVAILABLE LIQUIDITY:</span>
                  <span className="text-slate-200">{cryptoBalance.toFixed(4)} SOL</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={convertAmount}
                    onChange={(e) => setConvertAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-[#111a2e] border border-[#1e293b] rounded-lg text-sm focus:outline-none text-slate-100"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-500">SOL</span>
                </div>
              </div>
              
              {solPrice && convertAmount && !isNaN(parseFloat(convertAmount)) && (
                <div className="p-2 bg-purple-500/5 rounded border border-purple-500/10 text-center text-xs text-purple-300">
                  Estimated Value: <span className="font-bold text-white">${(parseFloat(convertAmount) * solPrice).toFixed(2)}</span> USD
                </div>
              )}

              <Button onClick={executeLiquidityConversion} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase h-10 tracking-wide">
                Confirm USD Bridge Transfer
              </Button>
            </div>
          </div>
        )}

        {/* Left Side Monitors Section */}
        <section className="lg:col-span-1 space-y-4">
          <div className="bg-[#0d1527] border border-[#1e293b] rounded-xl p-4">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider mb-3 flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-primary" /> Core Monitors
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {["AAPL", "TSLA", "NVDA", "MSFT", "AMZN"].map((sym) => (
                <button
                  key={sym}
                  onClick={() => setTicker(sym)}
                  className={`w-full text-left p-3 rounded-lg border font-mono flex items-center justify-between transition-all ${
                    ticker === sym 
                      ? "bg-primary/10 border-primary text-primary" 
                      : "bg-[#111a2e]/60 border-[#1e293b] text-slate-300"
                  }`}
                >
                  <span className="font-bold text-sm">{sym}</span>
                  <ChevronRight className="h-4 w-4 opacity-40" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#0d1527] border border-[#1e293b] rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <Wallet className="h-3.5 w-3.5 text-emerald-400" /> Account Cash
            </h3>
            <div className="bg-[#111a2e] border border-[#1e293b] rounded-lg p-3">
              <span className="text-[10px] text-slate-500 block font-mono">STANDALONE FIAT USD BALANCE</span>
              <span className="text-xl font-bold font-mono text-emerald-400 mt-0.5 block">
                ${virtualCash.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </section>

        {/* Middle Canvas Section */}
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-[#0d1527] border border-[#1e293b] rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
              <span className="font-mono bg-[#1a263d] px-2.5 py-1 rounded text-primary font-bold text-sm">{ticker}</span>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-[#111a2e] px-3 py-1.5 rounded-lg">
                <Activity className="h-3.5 w-3.5 text-primary animate-pulse" />
                <span>FEED STATUS: ACTIVE</span>
              </div>
            </div>

            <div className="h-72 bg-[#070b14] border border-[#1e293b] rounded-xl flex flex-col items-center justify-center p-6 text-center">
              <TrendingUp className="h-6 w-6 text-primary mb-2" />
              <h4 className="text-sm font-semibold text-slate-200">Interactive Canvas Template</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Alpha Vantage tracking live asset <span className="text-primary font-semibold">{ticker}</span>.
              </p>
            </div>
          </div>

          {/* Holdings Inventory Ledger */}
          <div className="bg-[#0d1527] border border-[#1e293b] rounded-xl p-5 shadow-xl">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-2">
              <Briefcase className="h-3.5 w-3.5 text-amber-400" /> Standalone Portfolio Holdings
            </h3>
            {positions.length === 0 ? (
              <div className="text-center py-8 border border-[#1e293b] border-dashed rounded-xl bg-[#111a2e]/30 text-xs text-slate-500 font-mono">
                NO SHARES LOGGED. SECURE STANDALONE USD BALANCE TO ACQUIRE EQUITIES.
              </div>
            ) : (
              <div className="border border-[#1e293b] rounded-xl overflow-hidden bg-[#0b1120]">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-[#111a2e] text-slate-400 border-b border-[#1e293b]">
                    <tr>
                      <th className="p-3">Asset</th>
                      <th className="p-3">Shares</th>
                      <th className="p-3">Avg Buy</th>
                      <th className="p-3 text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e293b]">
                    {positions.map((pos) => (
                      <tr key={pos.ticker}>
                        <td className="p-3 font-bold text-slate-100">{pos.ticker}</td>
                        <td className="p-3 text-slate-400">{pos.quantity}</td>
                        <td className="p-3 text-slate-400">${pos.avgPrice.toFixed(2)}</td>
                        <td className="p-3 font-semibold text-right text-slate-200">
                          ${(pos.quantity * (ticker === pos.ticker && price ? price : pos.avgPrice)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Execution Engine Desk Panel */}
        <section className="lg:col-span-1">
          <div className="bg-[#0d1527] border border-[#1e293b] rounded-xl p-5 shadow-xl flex flex-col justify-between">
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-mono font-bold uppercase text-slate-200 tracking-wider">Routing Desk</h3>
              </div>

              <div className="grid grid-cols-2 gap-1 p-1 bg-[#111a2e] border border-[#1e293b] rounded-lg font-mono text-xs">
                <button 
                  onClick={() => setOrderType("BUY")}
                  className={`py-2 rounded-md font-bold transition-all ${orderType === "BUY" ? "bg-emerald-600 text-white" : "text-slate-400"}`}
                >
                  BUY
                </button>
                <button 
                  onClick={() => setOrderType("SELL")}
                  className={`py-2 rounded-md font-bold transition-all ${orderType === "SELL" ? "bg-rose-600 text-white" : "text-slate-400"}`}
                >
                  SELL
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-[#111a2e] border border-[#1e293b] rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-mono">ASSET</span>
                    <span className="font-mono font-bold text-sm text-slate-200">{ticker}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block font-mono">FEED VALUE</span>
                    <div className="font-mono font-bold text-base text-slate-100 flex items-center justify-end gap-1.5">
                      {isFetching && <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />}
                      <span>{price ? `$${price.toFixed(2)}` : "—"}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">Shares</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 bg-[#111a2e] border border-[#1e293b] rounded-lg text-sm font-mono text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-[#1e293b] pt-4 space-y-4">
              <div className="flex justify-between items-center font-mono text-xs">
                <span className="text-slate-500">ESTIMATED COST:</span>
                <span className="font-bold text-sm text-slate-200">
                  {price ? `$${(price * quantity).toFixed(2)}` : "$0.00"}
                </span>
              </div>
              <Button
                className={`w-full font-mono font-bold uppercase py-5 rounded-lg text-white ${
                  orderType === "BUY" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                }`}
                disabled={!price || isFetching}
                onClick={executeOrder}
              >
                TRANSMIT {orderType} ORDER
              </Button>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default StockDashboard;
