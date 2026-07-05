
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import {
  X, RefreshCw, DollarSign, Wallet, ArrowLeft,
  TrendingUp, AlertTriangle, Loader2
} from "lucide-react";
import { walletAPI } from "@/lib/api";

// ─── Constants ────────────────────────────────────────────────────────────────
const API_BASE = "https://aetherbot.sbs/api";
const DEFAULT_STOCKS = [
  { ticker: "AAPL", name: "Apple Inc.",        sector: "tech",    price: 0, change: 0, changePct: 0 },
  { ticker: "MSFT", name: "Microsoft Corp.",    sector: "tech",    price: 0, change: 0, changePct: 0 },
  { ticker: "GOOGL",name: "Alphabet Inc.",      sector: "tech",    price: 0, change: 0, changePct: 0 },
  { ticker: "NVDA", name: "NVIDIA Corp.",       sector: "tech",    price: 0, change: 0, changePct: 0 },
  { ticker: "META", name: "Meta Platforms",     sector: "tech",    price: 0, change: 0, changePct: 0 },
  { ticker: "AMZN", name: "Amazon.com Inc.",    sector: "tech",    price: 0, change: 0, changePct: 0 },
  { ticker: "JPM",  name: "JPMorgan Chase",     sector: "finance", price: 0, change: 0, changePct: 0 },
  { ticker: "BAC",  name: "Bank of America",    sector: "finance", price: 0, change: 0, changePct: 0 },
  { ticker: "GS",   name: "Goldman Sachs",      sector: "finance", price: 0, change: 0, changePct: 0 },
  { ticker: "JNJ",  name: "Johnson & Johnson",  sector: "health",  price: 0, change: 0, changePct: 0 },
  { ticker: "PFE",  name: "Pfizer Inc.",        sector: "health",  price: 0, change: 0, changePct: 0 },
  { ticker: "UNH",  name: "UnitedHealth Group", sector: "health",  price: 0, change: 0, changePct: 0 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt    = (n: number) => "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtS   = (n: number) => (n >= 0 ? "+" : "-") + fmt(n);
const fmtSOL = (n: number) => n.toFixed(4) + " SOL";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Stock { ticker: string; name: string; sector: string; price: number; change: number; changePct: number; }
interface Holding { shares: number; avgPrice: number; }
type ModalType =
  | { type: "convert-to-usd" }
  | { type: "convert-to-sol" }
  | { type: "buy";  ticker: string; shares: number }
  | { type: "sell"; ticker: string; shares: number };

// ─── Component ────────────────────────────────────────────────────────────────
const StockDashboard = () => {
  // wallet state
  const [solBalance,   setSolBalance]   = useState(0);
  const [stockBalance, setStockBalance] = useState(0);
  const [solPrice,     setSolPrice]     = useState(0);
  const [holdings,     setHoldings]     = useState<Record<string, Holding>>({});
  const [walletLoading, setWalletLoading] = useState(true);

  // stock data
  const [stocks,       setStocks]       = useState<Stock[]>(DEFAULT_STOCKS);
  const [stocksLoading, setStocksLoading] = useState(true);
  const [lastUpdated,  setLastUpdated]  = useState<string | null>(null);

  // ui
  const [search,    setSearch]    = useState("");
  const [filter,    setFilter]    = useState("all");
  const [modal,     setModal]     = useState<ModalType | null>(null);
  const [convertAmt,setConvertAmt]= useState("");
  const [toast,     setToast]     = useState("");
  const [toastType, setToastType] = useState<"success"|"error">("success");
  const [isSaving,  setIsSaving]  = useState(false);

  const showToast = (msg: string, type: "success"|"error" = "success") => {
    setToast(msg); setToastType(type);
    setTimeout(() => setToast(""), 3500);
  };

  // ── Fetch wallet details ──
  const fetchWallet = useCallback(async () => {
    const token = localStorage.getItem("walletToken");
    if (!token) { window.location.href = "/"; return; }
    try {
      setWalletLoading(true);
      const res = await walletAPI.getWalletDetails(token);
      const w = res.wallet;
      setSolBalance(w.AetherbotBalance || 0);
      setStockBalance(w.stockBalance || 0);
      setHoldings(w.stockHoldings || {});
    } catch (err) {
      console.error("Failed to fetch wallet:", err);
    } finally {
      setWalletLoading(false);
    }
  }, []);

  // ── Fetch SOL price ──
  const fetchSolPrice = useCallback(async () => {
    try {
      const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
      const data = await res.json();
      setSolPrice(data.solana.usd);
    } catch {
      console.error("Failed to fetch SOL price");
    }
  }, []);

  // ── Fetch stock prices from backend ──
  const fetchStockPrices = useCallback(async () => {
    try {
      setStocksLoading(true);
      const tickers = DEFAULT_STOCKS.map(s => s.ticker).join(",");
      const res = await fetch(`${API_BASE}/get-stock-price?tickers=${tickers}`);
      const data = await res.json();
      if (data.success) {
        setStocks(prev => prev.map(s => {
          const live = data.data[s.ticker];
          if (live && !live.error) {
            return { ...s, price: live.price, change: live.change, changePct: live.changePct };
          }
          return s;
        }));
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error("Failed to fetch stock prices:", err);
    } finally {
      setStocksLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
    fetchSolPrice();
    fetchStockPrices();
    // Refresh SOL price every 30 seconds
    const solInterval = setInterval(fetchSolPrice, 30000);
    // Refresh stock prices every 5 minutes (Alpha Vantage free tier)
    const stockInterval = setInterval(fetchStockPrices, 300000);
    return () => { clearInterval(solInterval); clearInterval(stockInterval); };
  }, []);

  // ── Portfolio calculations ──
  const portfolioValue = Object.entries(holdings).reduce((sum, [ticker, h]) => {
    const s = stocks.find(x => x.ticker === ticker);
    return sum + (s ? s.price * h.shares : 0);
  }, 0);

  const totalCost   = Object.entries(holdings).reduce((sum, [, h]) => sum + h.avgPrice * h.shares, 0);
  const totalReturn = portfolioValue - totalCost;
  const todayGain   = Object.entries(holdings).reduce((sum, [ticker, h]) => {
    const s = stocks.find(x => x.ticker === ticker);
    return sum + (s ? s.change * h.shares : 0);
  }, 0);

  // ── Filtered stocks ──
  const filteredStocks = stocks.filter(s => {
    const matchSector = filter === "all" || s.sector === filter;
    const matchSearch = !search || s.ticker.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase());
    return matchSector && matchSearch;
  });

  // ── Convert SOL → USD ──
  const handleConvertToUSD = async () => {
    const sol = parseFloat(convertAmt);
    if (!sol || sol <= 0) { showToast("Enter a valid SOL amount.", "error"); return; }
    if (sol > solBalance)  { showToast("Insufficient SOL balance.", "error"); return; }
    if (solPrice === 0)    { showToast("SOL price not loaded yet.", "error"); return; }
    const usd = sol * solPrice;
    try {
      setIsSaving(true);
      const token = localStorage.getItem("walletToken");
      await fetch(`${API_BASE}/convert-sol-to-usd`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ solAmount: sol, usdAmount: usd, solPrice })
      });
      setSolBalance(b => b - sol);
      setStockBalance(b => b + usd);
      showToast(`Converted ${fmtSOL(sol)} → ${fmt(usd)} USD`);
      setConvertAmt(""); setModal(null);
    } catch {
      showToast("Conversion failed. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Convert USD → SOL ──
  const handleConvertToSOL = async () => {
    const usd = parseFloat(convertAmt);
    if (!usd || usd <= 0)   { showToast("Enter a valid USD amount.", "error"); return; }
    if (usd > stockBalance) { showToast("Insufficient stock wallet balance.", "error"); return; }
    if (solPrice === 0)     { showToast("SOL price not loaded yet.", "error"); return; }
    const sol = usd / solPrice;
    try {
      setIsSaving(true);
      const token = localStorage.getItem("walletToken");
      await fetch(`${API_BASE}/convert-usd-to-sol`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ usdAmount: usd, solAmount: sol, solPrice })
      });
      setStockBalance(b => b - usd);
      setSolBalance(b => b + sol);
      showToast(`Converted ${fmt(usd)} → ${fmtSOL(sol)}`);
      setConvertAmt(""); setModal(null);
    } catch {
      showToast("Conversion failed. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Buy stock ──
  const handleBuy = async () => {
    if (!modal || modal.type !== "buy") return;
    const shares = modal.shares;
    if (shares < 1) { showToast("Enter at least 1 share.", "error"); return; }
    const s = stocks.find(x => x.ticker === modal.ticker)!;
    const cost = shares * s.price;
    if (cost > stockBalance) { showToast("Insufficient stock wallet balance.", "error"); return; }
    try {
      setIsSaving(true);
      const token = localStorage.getItem("walletToken");
      await fetch(`${API_BASE}/buy-stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ ticker: modal.ticker, shares, price: s.price, totalCost: cost })
      });
      setStockBalance(b => b - cost);
      setHoldings(h => {
        const ex = h[modal.ticker];
        if (ex) {
          const tot = ex.shares + shares;
          return { ...h, [modal.ticker]: { shares: tot, avgPrice: ((ex.avgPrice * ex.shares) + (s.price * shares)) / tot } };
        }
        return { ...h, [modal.ticker]: { shares, avgPrice: s.price } };
      });
      showToast(`Bought ${shares} share${shares > 1 ? "s" : ""} of ${modal.ticker} for ${fmt(cost)}`);
      setModal(null);
    } catch {
      showToast("Purchase failed. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Sell stock ──
  const handleSell = async () => {
    if (!modal || modal.type !== "sell") return;
    const shares = modal.shares;
    const h = holdings[modal.ticker];
    if (!h || shares > h.shares) { showToast("Not enough shares.", "error"); return; }
    const s = stocks.find(x => x.ticker === modal.ticker)!;
    const proceeds = shares * s.price;
    try {
      setIsSaving(true);
      const token = localStorage.getItem("walletToken");
      await fetch(`${API_BASE}/sell-stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ ticker: modal.ticker, shares, price: s.price, proceeds })
      });
      setStockBalance(b => b + proceeds);
      setHoldings(prev => {
        const newShares = prev[modal.ticker].shares - shares;
        if (newShares === 0) { const { [modal.ticker]: _, ...rest } = prev; return rest; }
        return { ...prev, [modal.ticker]: { ...prev[modal.ticker], shares: newShares } };
      });
      showToast(`Sold ${shares} share${shares > 1 ? "s" : ""} of ${modal.ticker} for ${fmt(proceeds)}`);
      setModal(null);
    } catch {
      showToast("Sale failed. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const modalStock  = modal?.type === "buy" || modal?.type === "sell" ? stocks.find(x => x.ticker === modal.ticker) : null;
  const modalShares = modal?.type === "buy" || modal?.type === "sell" ? modal.shares : 0;
  const modalTotal  = modalStock ? modalShares * modalStock.price : 0;
  const modalPnl    = modal?.type === "sell" && modalStock && holdings[modal.ticker]
    ? (modalStock.price - holdings[modal.ticker].avgPrice) * modalShares : 0;

  if (walletLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="flex items-center justify-center min-h-[400px] pt-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="w-full px-6 py-6 pt-24">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">📈 Stock Dashboard</h1>
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-medium">LIVE TRADING</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">SOL Price</p>
              <p className="text-sm font-medium">{solPrice ? fmt(solPrice) : "Loading..."}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => { fetchStockPrices(); fetchSolPrice(); }}>
              <RefreshCw className={`h-4 w-4 mr-2 ${stocksLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.location.href = "/dashboard"}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Crypto Mode
            </Button>
          </div>
        </div>

        {/* ── Last updated ── */}
        {lastUpdated && (
          <p className="text-xs text-muted-foreground mb-4">
            Prices last updated: {lastUpdated} · Refreshes every 5 minutes
          </p>
        )}

        {/* ── Balance cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-muted-foreground">Aetherbot SOL Balance</span>
            </div>
            <p className="text-2xl font-bold">{fmtSOL(solBalance)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              ≈ {solPrice ? fmt(solBalance * solPrice) : "..."} USD
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-400" />
              <span className="text-sm text-muted-foreground">Stock Wallet (USD)</span>
            </div>
            <p className="text-2xl font-bold">{fmt(stockBalance)}</p>
            <p className="text-sm text-muted-foreground mt-1">Available for trading</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-5">
            <p className="text-sm text-muted-foreground mb-3">Convert between wallets</p>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs"
                onClick={() => { setConvertAmt(""); setModal({ type: "convert-to-usd" }); }}>
                SOL → USD
              </Button>
              <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                onClick={() => { setConvertAmt(""); setModal({ type: "convert-to-sol" }); }}>
                USD → SOL
              </Button>
            </div>
          </div>
        </div>

        {/* ── Empty wallet alert ── */}
        {stockBalance === 0 && Object.keys(holdings).length === 0 && (
          <Alert className="mb-6 bg-yellow-950/30 border-yellow-900/50">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-400">
              Your stock wallet is empty. Convert some SOL to USD to start trading stocks.
              <Button size="sm" className="ml-3 bg-yellow-500 hover:bg-yellow-600 text-black text-xs"
                onClick={() => { setConvertAmt(""); setModal({ type: "convert-to-usd" }); }}>
                Convert Now
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* ── Portfolio metrics ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Portfolio Value</p>
            <p className="text-2xl font-bold">{fmt(portfolioValue)}</p>
            <p className="text-xs text-muted-foreground mt-1">{Object.keys(holdings).length} stock{Object.keys(holdings).length !== 1 ? "s" : ""}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Return</p>
            <p className={`text-2xl font-bold ${totalReturn >= 0 ? "text-green-400" : "text-red-400"}`}>
              {totalReturn === 0 ? "$0.00" : fmtS(totalReturn)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalCost > 0 ? `${totalReturn >= 0 ? "+" : ""}${((totalReturn / totalCost) * 100).toFixed(2)}% all time` : "—"}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Holdings</p>
            <p className="text-2xl font-bold">{Object.keys(holdings).length}</p>
            <p className="text-xs text-muted-foreground mt-1">stocks owned</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Today's Gain</p>
            <p className={`text-2xl font-bold ${todayGain >= 0 ? "text-green-400" : "text-red-400"}`}>
              {todayGain === 0 ? "$0.00" : fmtS(todayGain)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalCost > 0 ? `${todayGain >= 0 ? "+" : ""}${((todayGain / totalCost) * 100).toFixed(2)}% today` : "—"}
            </p>
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Watchlist */}
          <div className="lg:col-span-2 bg-card border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-semibold">Market Watchlist</h3>
              <div className="flex gap-1">
                {["all", "tech", "finance", "health"].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                      filter === f ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"
                    }`}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="px-4 py-2 border-b border-border">
              <Input placeholder="Search ticker or company..." value={search}
                onChange={e => setSearch(e.target.value)} className="h-8 text-sm" />
            </div>
            <div className="divide-y divide-border max-h-96 overflow-y-auto">
              {stocksLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading live prices...</span>
                </div>
              ) : filteredStocks.map(s => (
                <div key={s.ticker} className="flex items-center px-4 py-3 hover:bg-muted/30 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground mr-3 flex-shrink-0">
                    {s.ticker.slice(0, 3)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{s.sector}</p>
                  </div>
                  <div className="text-right mr-3">
                    <p className="font-medium text-sm">{s.price > 0 ? fmt(s.price) : "—"}</p>
                    {s.price > 0 && (
                      <p className={`text-xs ${s.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {fmtS(s.change)} ({s.changePct >= 0 ? "+" : ""}{s.changePct.toFixed(2)}%)
                      </p>
                    )}
                  </div>
                  <Button size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setModal({ type: "buy", ticker: s.ticker, shares: 1 })}
                    disabled={stockBalance === 0 || s.price === 0}>
                    Buy
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">My Portfolio</h3>
              {portfolioValue > 0 && (
                <Button size="sm" variant="outline"
                  className="text-xs text-blue-400 border-blue-900/50 hover:bg-blue-950/30"
                  onClick={() => { setConvertAmt(""); setModal({ type: "convert-to-sol" }); }}>
                  Withdraw → SOL
                </Button>
              )}
            </div>
            <div className="divide-y divide-border max-h-96 overflow-y-auto">
              {Object.keys(holdings).length === 0 ? (
                <div className="px-4 py-8 text-center text-muted-foreground text-sm leading-relaxed">
                  No holdings yet.<br />Buy a stock to get started.
                </div>
              ) : (
                Object.entries(holdings).map(([ticker, h]) => {
                  const s = stocks.find(x => x.ticker === ticker);
                  const currentPrice = s?.price || h.avgPrice;
                  const val  = currentPrice * h.shares;
                  const pnl  = (currentPrice - h.avgPrice) * h.shares;
                  const pnlP = (pnl / (h.avgPrice * h.shares)) * 100;
                  return (
                    <div key={ticker} className="flex items-center px-4 py-3">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{ticker}</p>
                        <p className="text-xs text-muted-foreground">{h.shares} shares @ {fmt(h.avgPrice)}</p>
                      </div>
                      <div className="text-right mr-2">
                        <p className="font-medium text-sm">{fmt(val)}</p>
                        <p className={`text-xs ${pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {fmtS(pnl)} ({pnl >= 0 ? "+" : ""}{pnlP.toFixed(2)}%)
                        </p>
                      </div>
                      <Button size="sm" variant="outline"
                        className="text-red-400 border-red-900/50 hover:bg-red-950/30 text-xs"
                        onClick={() => setModal({ type: "sell", ticker, shares: 1 })}>
                        Sell
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ══════════ MODALS ══════════ */}
        {/* Convert SOL → USD */}
        {modal?.type === "convert-to-usd" && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
            <div className="bg-card border border-border rounded-2xl p-6 w-80 mx-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">Convert SOL → USD</h3>
                  <p className="text-sm text-muted-foreground">Fund your stock wallet</p>
                </div>
                <button onClick={() => setModal(null)}><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Amount in SOL (max {fmtSOL(solBalance)})</p>
                  <Input type="number" min={0.01} max={solBalance} step={0.01}
                    placeholder="0.00" value={convertAmt} onChange={e => setConvertAmt(e.target.value)} />
                </div>
                <div className="bg-muted/30 rounded-lg p-3 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">SOL price</span><span className="font-medium">{solPrice ? fmt(solPrice) : "..."}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">You receive</span><span className="font-medium text-green-400">{fmt((parseFloat(convertAmt) || 0) * solPrice)} USD</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">SOL balance after</span><span className="font-medium">{fmtSOL(solBalance - (parseFloat(convertAmt) || 0))}</span></div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setModal(null)} disabled={isSaving}>Cancel</Button>
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white" onClick={handleConvertToUSD} disabled={isSaving}>
                  {isSaving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Converting...</> : "Convert"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Convert USD → SOL */}
        {modal?.type === "convert-to-sol" && (          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
            <div className="bg-card border border-border rounded-2xl p-6 w-80 mx-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">Convert USD → SOL</h3>
                  <p className="text-sm text-muted-foreground">Move funds back to Aetherbot</p>
                </div>
                <button onClick={() => setModal(null)}><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Amount in USD (max {fmt(stockBalance)})</p>
                  <Input type="number" min={0.01} max={stockBalance} step={0.01}
                    placeholder="0.00" value={convertAmt} onChange={e => setConvertAmt(e.target.value)} />
                </div>
                <div className="bg-muted/30 rounded-lg p-3 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">SOL price</span><span className="font-medium">{solPrice ? fmt(solPrice) : "..."}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">You receive</span><span className="font-medium text-purple-400">{fmtSOL((parseFloat(convertAmt) || 0) / (solPrice || 1))}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">USD balance after</span><span className="font-medium">{fmt(stockBalance - (parseFloat(convertAmt) || 0))}</span></div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setModal(null)} disabled={isSaving}>Cancel</Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleConvertToSOL} disabled={isSaving}>
                  {isSaving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Converting...</> : "Convert"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Buy / Sell */}
        {(modal?.type === "buy" || modal?.type === "sell") && modalStock && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
            <div className="bg-card border border-border rounded-2xl p-6 w-80 mx-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">{modal.type === "buy" ? "Buy" : "Sell"} {modal.ticker}</h3>
                  <p className="text-sm text-muted-foreground">{modalStock.name}</p>
                </div>
                <button onClick={() => setModal(null)}><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Number of shares {modal.type === "buy"
                      ? `(max ${Math.floor(stockBalance / modalStock.price)})`
                      : `(max ${holdings[modal.ticker]?.shares || 0})`}
                  </p>
                  <Input type="number" min={1}
                    max={modal.type === "buy" ? Math.floor(stockBalance / modalStock.price) : holdings[modal.ticker]?.shares}
                    value={modal.shares}
                    onChange={e => setModal({ ...modal, shares: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="bg-muted/30 rounded-lg p-3 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Price per share</span><span className="font-medium">{fmt(modalStock.price)}</span></div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{modal.type === "buy" ? "Total cost" : "You receive"}</span>
                    <span className="font-medium">{fmt(modalTotal)}</span>
                  </div>
                  {modal.type === "buy" ? (
                    <div className="flex justify-between"><span className="text-muted-foreground">Stock wallet balance</span><span className="font-medium">{fmt(stockBalance)}</span></div>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">P&L on sale</span>
                      <span className={`font-medium ${modalPnl >= 0 ? "text-green-400" : "text-red-400"}`}>{fmtS(modalPnl)}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setModal(null)} disabled={isSaving}>Cancel</Button>
                <Button
                  className={`flex-1 text-white ${modal.type === "buy" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
                  onClick={modal.type === "buy" ? handleBuy : handleSell}
                  disabled={isSaving}>
                  {isSaving
                    ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />{modal.type === "buy" ? "Buying..." : "Selling..."}</>
                    : modal.type === "buy" ? "Buy" : "Sell"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className={`fixed bottom-6 right-6 border rounded-lg px-4 py-3 text-sm shadow-lg z-50 bg-card ${
            toastType === "error" ? "border-red-900/50 text-red-400" : "border-green-900/50 text-green-400"
          }`}>
            <div className="flex items-center gap-2">
              {toastType === "error" ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <TrendingUp className="h-4 w-4" />
              )}
              <span>{toast}</span>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default StockDashboard;

