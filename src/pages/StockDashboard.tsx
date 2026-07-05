import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  RefreshCw, 
  ArrowLeft, 
  Activity, 
  Wallet, 
  Briefcase,
  ArrowDownUp,
  Coins,
  Search,
  CheckCircle2
} from "lucide-react";
import { walletAPI } from "@/lib/api";

interface Position {
  ticker: string;
  quantity: number;
  avgPrice: number;
}

interface SearchMatch {
  symbol: string;
  name: string;
  type: string;
}

const StockDashboard = () => {
  const [ticker, setTicker] = useState("AAPL");
  const [price, setPrice] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isFetching, setIsFetching] = useState(false);
  const [orderType, setOrderType] = useState<"BUY" | "SELL">("BUY");

  // --- Multi-Token Search State Management ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});

  // --- On-Ramp Conversion State ---
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [cryptoBalance, setCryptoBalance] = useState<number>(0);
  const [convertAmount, setConvertAmount] = useState<string>("");
  const [showSwapPane, setShowSwapPane] = useState<boolean>(false);

  // --- Persistent Storage State Engines ---
  const [virtualCash, setVirtualCash] = useState<number>(() => {
    const saved = localStorage.getItem("aether_stock_cash");
    return saved ? parseFloat(saved) : 0;
  });

  const [positions, setPositions] = useState<Position[]>(() => {
    const saved = localStorage.getItem("aether_stock_positions");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("aether_stock_cash", virtualCash.toString());
  }, [virtualCash]);

  useEffect(() => {
    localStorage.setItem("aether_stock_positions", JSON.stringify(positions));
  }, [positions]);

  // Alpha Vantage Dynamic Security Search Engine Execution
  const handleTickerLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      const secretApiKey = import.meta.env.VITE_STOCK_DATA_KEY || "demo";
      const searchRes = await fetch(
        `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${searchQuery}&apikey=${secretApiKey}`
      );
      const searchData = await searchRes.json();
      
      if (searchData && searchData["bestMatches"]) {
        const matches = searchData["bestMatches"].map((item: any) => ({
          symbol: item["1. symbol"],
          name: item["2. name"],
          type: item["3. type"],
        }));
        setSearchResults(matches);
      }
    } catch (err) {
      console.error("Token matching operational lookup failure:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Main Live Market Execution Sync Framework
  const fetchMarketData = async () => {
    if (!ticker) return;
    try {
      setIsFetching(true);
      const secretApiKey = import.meta.env.VITE_STOCK_DATA_KEY || "demo";

      const stockRes = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${secretApiKey}`
      );
      const stockData = await stockRes.json();
      
      if (stockData["Global Quote"] && stockData["Global Quote"]["05. price"]) {
        const latestPrice = parseFloat(stockData["Global Quote"]["05. price"]);
        setPrice(latestPrice);
        setLivePrices(prev => ({ ...prev, [ticker]: latestPrice }));
      }

      const cryptoRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
      const cryptoData = await cryptoRes.json();
      if (cryptoData?.solana?.usd) {
        setSolPrice(cryptoData.solana.usd);
      }

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
    const currentPrice = livePrices[pos.ticker] || pos.avgPrice;
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
              <h1 className="font-mono text-lg font-bold tracking-wider text-slate-100">GLOBAL QUANT ROUTING DESK</h1>
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

      {/* Main Container Layout */}
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

              <Button onClick={() => {
                const solToConvert = parseFloat(convertAmount);
                if (isNaN(solToConvert) || solToConvert <= 0 || solToConvert > cryptoBalance || !solPrice) return alert("Validation Check Failed.");
                setCryptoBalance(prev => prev - solToConvert);
                setVirtualCash(prev => prev + (solToConvert * solPrice));
                setConvertAmount("");
                setShowSwapPane(false);
              }} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase h-10 tracking-wide">
                Confirm USD Bridge Transfer
              </Button>
            </div>
          </div>
        )}

        {/* Left Side Monitors Section (Replaced with Live Universal Asset Search) */}
        <section className="lg:col-span-1 space-y-4">
          <div className="bg-[#0d1527] border border-[#1e293b] rounded-xl p-4">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider mb-3 flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-primary" /> Token & Stock Indexer
            </h3>
            
            <form onSubmit={handleTickerLookup} className="flex gap-2 mb-4">
              <input 
                type="text" 
                placeholder="Search symbol (e.g. TSLA, IBM)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-[#111a2e] border border-[#1e293b] rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none font-mono"
              />
              <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90 px-3">
                {isSearching ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
              </Button>
            </form>

            <div className="space-y-1 max-h-72 overflow-y-auto pr-1 dynamic-scrollbar">
              {searchResults.length === 0 ? (
                <div className="text-center py-6 text-[11px] text-slate-500 font-mono border border-dashed border-[#1e293b] rounded-lg">
                  Submit keywords above to scan indexes.
                </div>
              ) : (
                searchResults.map((match) => (
                  <button
                    key={match.symbol}
                    onClick={() => {
                      setTicker(match.symbol);
                      setSearchResults([]);
                      setSearchQuery("");
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs font-mono transition-all flex justify-between items-center ${
                      ticker === match.symbol 
                        ? "bg-primary/10 border-primary text-primary" 
                        : "bg-[#111a2e]/40 border-[#1e293b] hover:bg-[#111a2e] text-slate-300"
                    }`}
                  >
                    <div className="flex flex-col truncate max-w-[80%]">
                      <span className="font-bold text-slate-200">{match.symbol}</span>
                      <span className="text-[10px] text-slate-500 truncate">{match.name}</span>
                    </div>
                    {ticker === match.symbol && <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />}
                  </button>
                ))
              )}
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
              <span className="font-mono bg-[#1a263d] px-2.5 py-1 rounded text-primary font-bold text-sm tracking-wider">{ticker}</span>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-[#111a2e] px-3 py-1.5 rounded-lg">
                <Activity className="h-3.5 w-3.5 text-primary animate-pulse" />
                <span>INDEX ROUTER: ONLINE</span>
              </div>
            </div>

            <div className="h-72 bg-[#070b14] border border-[#1e293b] rounded-xl flex flex-col items-center justify-center p-6 text-center">
              <TrendingUp className="h-6 w-6 text-primary mb-2" />
              <h4 className="text-sm font-semibold text-slate-200">Interactive Technical Monitor</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1 font-mono">
                Currently tracking execution values for asset element <span className="text-primary font-semibold">{ticker}</span>.
              </p>
            </div>
          </div>

          {/* Holdings Inventory Ledger */}
          <div className="bg-[#0d1527] border border-[#1e293b] rounded-xl p-5 shadow-xl">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-2">
              <Briefcase className="h-3.5 w-3.5 text-amber-400" /> Live Standalone Asset Portfolio (${totalPortfolioValue.toFixed(2)})
            </h3>
            {positions.length === 0 ? (
              <div className="text-center py-8 border border-[#1e293b] border-dashed rounded-xl bg-[#111a2e]/30 text-xs text-slate-500 font-mono">
                NO ASSET BALANCE LOGGED. BRIDGE SOL TO INITIATE EQUITY TRADES.
              </div>
            ) : (
              <div className="border border-[#1e293b] rounded-xl overflow-hidden bg-[#0b1120]">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-[#111a2e] text-slate-400 border-b border-[#1e293b]">
                    <tr>
                      <th className="p-3">Asset Matrix</th>
                      <th className="p-3">Shares</th>
                      <th className="p-3">Cost Basis</th>
                      <th className="p-3 text-right">Market Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e293b]">
                    {positions.map((pos) => {
                      const currentPrice = livePrices[pos.ticker] || pos.avgPrice;
                      const assetValue = pos.quantity * currentPrice;
                      const returnProfit = assetValue - (pos.quantity * pos.avgPrice);
                      return (
                        <tr key={pos.ticker} className="hover:bg-[#111a2e]/30 transition-all">
                          <td className="p-3 font-bold text-slate-100 flex flex-col">
                            <span>{pos.ticker}</span>
                            <span className="text-[10px] text-slate-500 font-normal">Mkt: ${currentPrice.toFixed(2)}</span>
                          </td>
                          <td className="p-3 text-slate-400 align-middle">{pos.quantity}</td>
                          <td className="p-3 text-slate-400 align-middle">${pos.avgPrice.toFixed(2)}</td>
                          <td className="p-3 text-right align-middle">
                            <span className="font-semibold text-slate-200 block">${assetValue.toFixed(2)}</span>
                            <span className={`text-[10px] block font-bold ${returnProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                              {returnProfit >= 0 ? "+" : ""}{returnProfit.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
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
                <h3 className="text-sm font-mono font-bold uppercase text-slate-200 tracking-wider">Trading Desk</h3>
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
                    <span className="text-[10px] text-slate-500 block font-mono">TARGET SYMBOL</span>
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
