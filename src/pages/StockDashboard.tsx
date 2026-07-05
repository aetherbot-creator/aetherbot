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
  Briefcase 
} from "lucide-react";

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
  const [virtualCash, setVirtualCash] = useState<number>(100000);
  const [positions, setPositions] = useState<Position[]>([]);
  const [orderType, setOrderType] = useState<"BUY" | "SELL">("BUY");

  // Alpha Vantage fetch logic
  const fetchStockPrice = async (symbol: string) => {
    if (!symbol) return;
    try {
      setIsFetching(true);
      const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_KEY || "YOUR_ALPHA_VANTAGE_KEY"; 
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
      );
      const data = await response.json();
      
      if (data["Global Quote"] && data["Global Quote"]["05. price"]) {
        setPrice(parseFloat(data["Global Quote"]["05. price"]));
      }
    } catch (error) {
      console.error("Alpha Vantage tracking failure:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchStockPrice(ticker);
  }, [ticker]);

  const executeOrder = () => {
    if (!price) return;
    const totalCost = price * quantity;

    if (orderType === "BUY") {
      if (virtualCash < totalCost) {
        alert("Execution Error: Insufficient sandbox liquidity.");
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

  const netAssetValue = virtualCash + totalPortfolioValue;

  return (
    <div className="min-h-screen bg-[#090d16] text-[#e2e8f0] font-sans flex flex-col antialiased">
      
      {/* Header Bar */}
      <header className="border-b border-[#1e293b] bg-[#0d1527] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-[#1e293b] p-2 rounded-lg cursor-pointer" onClick={() => window.location.href = "/dashboard"}>
            <ArrowLeft className="h-4 w-4 text-slate-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="font-mono text-lg font-bold tracking-wider text-slate-100">STOCK ROUTING TERMINAL</h1>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 font-mono text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Net Liquid Value</span>
            <span className="text-slate-200 font-semibold">${netAssetValue.toLocaleString()}</span>
          </div>
        </div>
      </header>

      {/* Grid Content Desk */}
      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-[1600px] mx-auto w-full">
        
        {/* Left Ticker Options Panel */}
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
              <span className="text-[10px] text-slate-500 block font-mono">AVAILABLE SETTLED USD</span>
              <span className="text-xl font-bold font-mono text-emerald-400 mt-0.5 block">
                ${virtualCash.toLocaleString()}
              </span>
            </div>
          </div>
        </section>

        {/* Center Canvas & Ledger Panel */}
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-[#0d1527] border border-[#1e293b] rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
              <span className="font-mono bg-[#1a263d] px-2.5 py-1 rounded text-primary font-bold text-sm">{ticker}</span>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-[#111a2e] px-3 py-1.5 rounded-lg">
                <Activity className="h-3.5 w-3.5 text-primary animate-pulse" />
                <span>FEED STATUS: ACTIVE</span>
              </div>
            </div>

            {/* Simulated Chart Container */}
            <div className="h-72 bg-[#070b14] border border-[#1e293b] rounded-xl flex flex-col items-center justify-center p-6 text-center">
              <TrendingUp className="h-6 w-6 text-primary mb-2" />
              <h4 className="text-sm font-semibold text-slate-200">Interactive Canvas Template</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Alpha Vantage tracking live asset <span className="text-primary font-semibold">{ticker}</span>.
              </p>
            </div>
          </div>

          {/* Ledger Array */}
          <div className="bg-[#0d1527] border border-[#1e293b] rounded-xl p-5 shadow-xl">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-2">
              <Briefcase className="h-3.5 w-3.5 text-amber-400" /> Active Portfolio Holdings
            </h3>
            {positions.length === 0 ? (
              <div className="text-center py-8 border border-[#1e293b] border-dashed rounded-xl bg-[#111a2e]/30 text-xs text-slate-500 font-mono">
                NO SECTOR SHARES CURRENTLY RECORDED IN SANDBOX
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

        {/* Right Routing Execution Desk */}
        <section className="lg:col-span-1">
          <div className="bg-[#0d1527] border border-[#1e293b] rounded-xl p-5 shadow-xl flex flex-col justify-between">
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-mono font-bold uppercase text-slate-200 tracking-wider">Routing Desk</h3>
              </div>

              {/* Order Toggle */}
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

              {/* Pricing Box */}
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

                {/* Volumetric Input Control */}
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
                <span className="text-slate-500">ESTIMATED VALUATION:</span>
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
