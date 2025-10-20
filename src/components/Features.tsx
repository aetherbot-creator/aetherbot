import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Shield, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Beat Everyone to Gems",
    description: "Catch organic tokens as soon as they show momentum.",
    code: "scanContract()"
  },
  {
    icon: Shield,
    title: "Avoid Rugs",
    description: "Automatically filters rugs with adaptive scam detection.",
    code: "filterScams()"
  },
  {
    icon: TrendingUp,
    title: "Performance Tracking",
    description: "Win rates, medians, multipliers tracked daily with full transparency.",
    code: "trackPerformance()"
  }
];

export const Features = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
            How AetherBot Gives You the Edge
          </h2>
          <p className="text-xl text-secondary max-w-3xl mx-auto">
            Advanced filtering, rug filtration, and full transparency. Built to help you win and simplify the game.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="gradient-border bg-card/50 backdrop-blur hover:bg-card/70 transition-all duration-300 group"
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#6F00FF] to-[#00D4FF] flex items-center justify-center mb-4 group-hover:glow-effect transition-all">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl gradient-text">{feature.title}</CardTitle>
                  <CardDescription className="text-secondary text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 rounded-lg p-3 font-mono text-sm text-accent border border-border">
                    {feature.code}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional info cards */}
        <div className="mt-16 grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          <div className="gradient-border rounded-lg p-6 text-center">
            <div className="text-sm text-secondary mb-2">CONTRACT STATUS</div>
            <div className="space-y-1">
              <div className="text-accent">✓ mint disabled</div>
              <div className="text-accent">✓ freeze disabled</div>
              <div className="text-accent">✓ contract renounced</div>
            </div>
          </div>
          <div className="gradient-border rounded-lg p-6 text-center">
            <div className="text-sm text-secondary mb-2">SAFETY CHECKS</div>
            <div className="space-y-1">
              <div className="text-accent">✓ bundle check: pass</div>
              <div className="text-accent">✓ whale alert active</div>
              <div className="text-accent">✓ marketCap {'>'} 100K</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
