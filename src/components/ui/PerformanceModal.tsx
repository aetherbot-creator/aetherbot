import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogClose,
} from "./dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, X, TrendingUp } from "lucide-react";

interface TopPerformer {
  mint: string;
  name: string;
  symbol: string;
  peak_market_cap_multiplier: number | string;
  is_win: boolean;
}

interface PeriodStats {
  calls: number;
  wins: number;
  losses: number;
  win_rate: number;
  avg_win: number;
  median_multiplier: number;
}

interface PeriodData {
  stats: PeriodStats;
  top_performers: TopPerformer[];
}

interface StrategyData {
  daily: PeriodData;
  weekly?: PeriodData;
  monthly?: PeriodData;
}

interface ApiResponse {
  status: string;
  data_v2: {
    balanced: StrategyData;
    risky: StrategyData;
    conservative: StrategyData;
    daily?: PeriodData;
    weekly?: PeriodData;
    monthly?: PeriodData;
  };
}

export const PerformanceModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          "https://token-finder-v2-686937891845.us-central1.run.app/performance-data/v2"
        );
        const json = await res.json();
        if (!mounted) return;
        setData(json);
      } catch (err) {
        console.error("Failed to fetch performance modal data:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [open]);

  const renderStrategyContent = (strategyData: StrategyData | undefined) => {
    if (!strategyData) return null;

    const { daily, weekly, monthly } = strategyData;
    
    // Get top performer from daily
    const topPerformer = daily.top_performers[0];
    
    // Calculate highest expected return (using daily stats)
    const expectedReturnMultiplier = 1.15; // Based on the balanced strategy
    const winRate = daily.stats.win_rate;

    // Heat check logic
    const callsAbove10x = daily.top_performers.filter(p => {
      const mult = typeof p.peak_market_cap_multiplier === 'string' 
        ? parseFloat(p.peak_market_cap_multiplier) 
        : p.peak_market_cap_multiplier;
      return mult >= 10;
    }).length;
    
    const heatLabel = callsAbove10x > 0 ? "Warm" : "Cold";

    return (
      <>
        {/* Top Stats - Single Bordered Container */}
        <div className="border border-emerald-400/30 md:border-2 rounded-lg md:rounded-xl bg-gradient-to-br from-emerald-900/10 to-transparent p-4 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {/* Top Performer */}
            <div className="text-center">
              <div className="text-xs md:text-sm text-secondary mb-1 md:mb-2">Top Performer</div>
              <div className="text-3xl md:text-5xl font-bold text-emerald-400 mb-1 md:mb-2">
                {topPerformer ? `${typeof topPerformer.peak_market_cap_multiplier === 'string' ? topPerformer.peak_market_cap_multiplier : topPerformer.peak_market_cap_multiplier.toFixed(2)}x` : "-"}
              </div>
              <div className="text-xs md:text-sm text-secondary">
                {topPerformer?.symbol || "—"}
              </div>
            </div>

            {/* Highest Expected Return */}
            <div className="text-center">
              <div className="text-xs md:text-sm text-secondary mb-1 md:mb-2">Highest Expected Return</div>
              <div className="flex items-baseline justify-center gap-1 md:gap-2 mb-1 md:mb-2">
                <span className="text-2xl md:text-3xl font-bold text-white">
                  {expectedReturnMultiplier}x
                </span>
                <span className="text-2xl md:text-3xl font-bold text-emerald-400">
                  {winRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-center gap-2 md:gap-4 text-[10px] md:text-xs text-secondary">
                <span>Multiplier</span>
                <span>Win Rate</span>
              </div>
            </div>

            {/* Heat Check */}
            <div className="text-center">
              <div className="text-xs md:text-sm text-secondary mb-1 md:mb-2">Heat Check</div>
              <div className="flex items-center justify-center gap-1 md:gap-2 mb-1 md:mb-2">
                <span className="text-xl md:text-2xl">🌡️</span>
                <span className="text-2xl md:text-3xl font-bold text-amber-400">
                  {heatLabel}
                </span>
              </div>
              <div className="text-[10px] md:text-xs text-secondary">
                {callsAbove10x} call{callsAbove10x !== 1 ? 's' : ''} hit 10x+
              </div>
            </div>
          </div>
        </div>

        {/* Performance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {/* Daily Performance */}
          <div className="bg-[#0F1117] rounded-lg p-3 md:p-4 border border-accent/10">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="font-semibold text-sm md:text-base">Daily Performance</h3>
              <BarChart3 className="w-3 h-3 md:w-4 md:h-4 text-secondary" />
            </div>
            <div className="flex items-end justify-between mb-1">
              <div className="text-2xl md:text-3xl font-bold">{daily.stats.calls}</div>
              <div className="text-emerald-400 font-bold text-base md:text-lg">
                {daily.stats.win_rate.toFixed(1)}%
              </div>
            </div>
            <div className="flex justify-between text-[10px] md:text-xs text-secondary mb-2 md:mb-3">
              <span>Total Calls</span>
              <span>Win Rate (1.15x+)</span>
            </div>
            <div className="space-y-1 text-xs md:text-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Average</span>
                <span className="font-medium">{daily.stats.avg_win.toFixed(2)}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Median</span>
                <span className="font-medium">{daily.stats.median_multiplier.toFixed(2)}x</span>
              </div>
            </div>
          </div>

          {/* Weekly Performance */}
          {weekly && (
            <div className="bg-[#0F1117] rounded-lg p-3 md:p-4 border border-accent/10">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h3 className="font-semibold text-sm md:text-base">Weekly Performance</h3>
                <BarChart3 className="w-3 h-3 md:w-4 md:h-4 text-secondary" />
              </div>
              <div className="flex items-end justify-between mb-1">
                <div className="text-2xl md:text-3xl font-bold">{weekly.stats.calls}</div>
                <div className="text-emerald-400 font-bold text-base md:text-lg">
                  {weekly.stats.win_rate.toFixed(1)}%
                </div>
              </div>
              <div className="flex justify-between text-[10px] md:text-xs text-secondary mb-2 md:mb-3">
                <span>Total Calls</span>
                <span>Win Rate (1.15x+)</span>
              </div>
              <div className="space-y-1 text-xs md:text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary">Average</span>
                  <span className="font-medium">{weekly.stats.avg_win.toFixed(2)}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Median</span>
                  <span className="font-medium">{weekly.stats.median_multiplier.toFixed(2)}x</span>
                </div>
              </div>
            </div>
          )}

          {/* Monthly Performance */}
          {monthly && (
            <div className="bg-[#0F1117] rounded-lg p-3 md:p-4 border border-accent/10">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h3 className="font-semibold text-sm md:text-base">Monthly Performance</h3>
                <BarChart3 className="w-3 h-3 md:w-4 md:h-4 text-secondary" />
              </div>
              <div className="flex items-end justify-between mb-1">
                <div className="text-2xl md:text-3xl font-bold">{monthly.stats.calls}</div>
                <div className="text-emerald-400 font-bold text-base md:text-lg">
                  {monthly.stats.win_rate.toFixed(1)}%
                </div>
              </div>
              <div className="flex justify-between text-[10px] md:text-xs text-secondary mb-2 md:mb-3">
                <span>Total Calls</span>
                <span>Win Rate (1.15x+)</span>
              </div>
              <div className="space-y-1 text-xs md:text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary">Average</span>
                  <span className="font-medium">{monthly.stats.avg_win.toFixed(2)}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Median</span>
                  <span className="font-medium">{monthly.stats.median_multiplier.toFixed(2)}x</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top Performers Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {/* Daily Top Performers */}
          <div className="bg-[#0F1117] rounded-lg p-3 md:p-4 border border-accent/10">
            <h3 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Daily - Top Performers</h3>
            <div className="space-y-2 md:space-y-3">
              {daily.top_performers.slice(0, 3).map((performer, idx) => (
                <div key={performer.mint} className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-xs md:text-sm truncate">{performer.symbol}</div>
                    <div className="text-[10px] md:text-xs text-secondary truncate">{performer.name}</div>
                  </div>
                  <div className="px-2 md:px-3 py-0.5 md:py-1 bg-emerald-500 text-white rounded-full text-[10px] md:text-sm font-medium whitespace-nowrap">
                    {typeof performer.peak_market_cap_multiplier === 'string' 
                      ? parseFloat(performer.peak_market_cap_multiplier).toFixed(2)
                      : performer.peak_market_cap_multiplier.toFixed(2)}x
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Top Performers */}
          {weekly && (
            <div className="bg-[#0F1117] rounded-lg p-3 md:p-4 border border-accent/10">
              <h3 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Weekly - Top Performers</h3>
              <div className="space-y-2 md:space-y-3">
                {weekly.top_performers.slice(0, 3).map((performer, idx) => (
                  <div key={performer.mint} className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-xs md:text-sm truncate">{performer.symbol}</div>
                      <div className="text-[10px] md:text-xs text-secondary truncate">{performer.name}</div>
                    </div>
                    <div className="px-2 md:px-3 py-0.5 md:py-1 bg-emerald-500 text-white rounded-full text-[10px] md:text-sm font-medium whitespace-nowrap">
                      {typeof performer.peak_market_cap_multiplier === 'string' 
                        ? parseFloat(performer.peak_market_cap_multiplier).toFixed(2)
                        : performer.peak_market_cap_multiplier.toFixed(2)}x
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monthly Top Performers */}
          {monthly && (
            <div className="bg-[#0F1117] rounded-lg p-3 md:p-4 border border-accent/10">
              <h3 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Monthly - Top Performers</h3>
              <div className="space-y-2 md:space-y-3">
                {monthly.top_performers.slice(0, 3).map((performer, idx) => (
                  <div key={performer.mint} className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-xs md:text-sm truncate">{performer.symbol}</div>
                      <div className="text-[10px] md:text-xs text-secondary truncate">{performer.name}</div>
                    </div>
                    <div className="px-2 md:px-3 py-0.5 md:py-1 bg-emerald-500 text-white rounded-full text-[10px] md:text-sm font-medium whitespace-nowrap">
                      {typeof performer.peak_market_cap_multiplier === 'string' 
                        ? parseFloat(performer.peak_market_cap_multiplier).toFixed(2)
                        : performer.peak_market_cap_multiplier.toFixed(2)}x
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="px-6 py-2 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent transition-colors font-medium">
          Open Performance Tracker
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl w-full bg-[#0A0B14] border-accent/20 text-white p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-accent/10 sticky top-0 bg-[#0A0B14] z-10">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="text-emerald-400">
              <TrendingUp className="w-4 h-4 md:w-6 md:h-6" />
            </div>
            <h2 className="text-lg md:text-2xl font-bold">Performance Tracker</h2>
            <span className="text-[10px] md:text-xs px-2 md:px-3 py-0.5 md:py-1 bg-accent/10 rounded-full text-secondary">
              updates every 5 min
            </span>
          </div>
          <DialogClose className="opacity-70 hover:opacity-100 transition-opacity">
            <X className="h-4 w-4 md:h-5 md:w-5" />
          </DialogClose>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="balanced" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-transparent border-b border-accent/10 rounded-none h-10 md:h-12 px-2 md:px-6">
            <TabsTrigger 
              value="risky" 
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:text-white rounded-none text-secondary text-xs md:text-sm"
            >
              Risky
            </TabsTrigger>
            <TabsTrigger 
              value="balanced"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-emerald-400 data-[state=active]:text-white rounded-none text-secondary text-xs md:text-sm"
            >
              Balanced
            </TabsTrigger>
            <TabsTrigger 
              value="conservative"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:text-white rounded-none text-secondary text-xs md:text-sm"
            >
              Conservative
            </TabsTrigger>
          </TabsList>

          <TabsContent value="balanced" className="p-3 md:p-6 space-y-4 md:space-y-6 mt-0">
            {loading ? (
              <div className="text-center py-12 text-secondary text-sm">Loading performance data...</div>
            ) : (
              renderStrategyContent(data?.data_v2?.balanced)
            )}
          </TabsContent>

          {/* Risky Tab */}
          <TabsContent value="risky" className="p-3 md:p-6 space-y-4 md:space-y-6 mt-0">
            {loading ? (
              <div className="text-center py-12 text-secondary text-sm">Loading performance data...</div>
            ) : (
              renderStrategyContent(data?.data_v2?.risky)
            )}
          </TabsContent>

          {/* Conservative Tab */}
          <TabsContent value="conservative" className="p-3 md:p-6 space-y-4 md:space-y-6 mt-0">
            {loading ? (
              <div className="text-center py-12 text-secondary text-sm">Loading performance data...</div>
            ) : (
              renderStrategyContent(data?.data_v2?.conservative)
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PerformanceModal;
