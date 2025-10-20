import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Target, Award } from "lucide-react";
import PerformanceModal from "@/components/ui/PerformanceModal";

interface PerformanceData {
  status?: string;
  data_v2?: {
    balanced?: {
      daily?: {
        stats?: {
          calls: number;
          wins: number;
          losses: number;
          win_rate: number;
          avg_win: number;
          median_multiplier: number;
        };
        top_performers?: Array<{
          name: string;
          symbol: string;
          peak_market_cap_multiplier: number | string;
        }>;
      };
    };
  };
}

export const PerformanceTracker = () => {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const response = await fetch(
          "https://token-finder-v2-686937891845.us-central1.run.app/performance-data/v2"
        );
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch performance data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, []);

  // Extract stats from data
  const dailyStats = data?.data_v2?.balanced?.daily?.stats;
  const winRate = dailyStats?.win_rate;
  const topPerformer = data?.data_v2?.balanced?.daily?.top_performers?.[0];
  const avgMultiplier = dailyStats?.avg_win;

  return (
    <section className="py-24 relative" id="performance">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
            Performance Tracking
          </h2>
          <div className="flex items-center justify-center gap-4 flex-col">
            <p className="text-xl text-secondary max-w-2xl mx-auto">
              Win rates, medians, multipliers tracked daily with full transparency.
            </p>
            <PerformanceModal />
          </div>
        </div>

        <Tabs defaultValue="overview" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-card">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="winrate">Win Rate</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="gradient-border bg-card/50 backdrop-blur">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-accent">
                    <TrendingUp className="w-5 h-5" />
                    Win Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-3xl font-bold animate-pulse">---%</div>
                  ) : (
                    <div className="text-3xl font-bold gradient-text">
                      {winRate ? `${winRate.toFixed(1)}%` : "N/A"}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="gradient-border bg-card/50 backdrop-blur">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-accent">
                    <Target className="w-5 h-5" />
                    Avg Multiplier
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-3xl font-bold animate-pulse">---x</div>
                  ) : (
                    <div className="text-3xl font-bold gradient-text">
                      {avgMultiplier ? `${avgMultiplier.toFixed(2)}x` : "N/A"}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="gradient-border bg-card/50 backdrop-blur">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-accent">
                    <Award className="w-5 h-5" />
                    Daily Calls
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-3xl font-bold animate-pulse">---</div>
                  ) : (
                    <div className="text-3xl font-bold gradient-text">
                      {dailyStats?.calls || "N/A"}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="winrate">
            <Card className="gradient-border bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="gradient-text">Win Rate Analysis</CardTitle>
                <CardDescription className="text-secondary">
                  Real-time performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-48 flex items-center justify-center">
                    <div className="text-secondary animate-glow-pulse">Loading data...</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-6xl font-bold gradient-text text-center py-8">
                      {winRate ? `${winRate.toFixed(1)}%` : "N/A"}
                    </div>
                    <p className="text-center text-secondary">
                      Daily win rate (1.15x+ multiplier)
                    </p>
                    {dailyStats && (
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-accent">{dailyStats.wins}</div>
                          <div className="text-sm text-secondary">Winning Calls</div>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-accent">{dailyStats.losses}</div>
                          <div className="text-sm text-secondary">Losing Calls</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <Card className="gradient-border bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="gradient-text">Detailed Statistics</CardTitle>
                <CardDescription className="text-secondary">
                  Comprehensive performance breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-48 flex items-center justify-center">
                    <div className="text-secondary animate-glow-pulse">Loading data...</div>
                  </div>
                ) : dailyStats ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                      <span className="text-secondary font-mono text-sm">Total Calls</span>
                      <span className="font-bold text-accent">{dailyStats.calls}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                      <span className="text-secondary font-mono text-sm">Wins</span>
                      <span className="font-bold text-accent">{dailyStats.wins}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                      <span className="text-secondary font-mono text-sm">Losses</span>
                      <span className="font-bold text-accent">{dailyStats.losses}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                      <span className="text-secondary font-mono text-sm">Win Rate</span>
                      <span className="font-bold text-accent">{dailyStats.win_rate.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                      <span className="text-secondary font-mono text-sm">Average Multiplier</span>
                      <span className="font-bold text-accent">{dailyStats.avg_win.toFixed(2)}x</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                      <span className="text-secondary font-mono text-sm">Median Multiplier</span>
                      <span className="font-bold text-accent">{dailyStats.median_multiplier.toFixed(2)}x</span>
                    </div>
                    {topPerformer && (
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                        <span className="text-secondary font-mono text-sm">Top Performer</span>
                        <span className="font-bold text-accent">
                          {topPerformer.symbol} ({typeof topPerformer.peak_market_cap_multiplier === 'string' 
                            ? topPerformer.peak_market_cap_multiplier 
                            : topPerformer.peak_market_cap_multiplier.toFixed(2)}x)
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-secondary">No data available</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};
