import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Globe, MessageCircle } from "lucide-react";

const platforms = [
  {
    icon: MessageSquare,
    title: "Telegram",
    description: "Instant alerts",
    gradient: "from-[#0088cc] to-[#00D4FF]"
  },
  {
    icon: Globe,
    title: "Web App",
    description: "Full dashboard",
    gradient: "from-[#6F00FF] to-[#4B00E0]"
  },
  {
    icon: MessageCircle,
    title: "Discord",
    description: "Community",
    gradient: "from-[#5865F2] to-[#2B6EFF]"
  }
];

export const Platforms = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
            Cut the noise, anywhere
          </h2>
          <p className="text-xl text-secondary">
            One Platform. Every device.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {platforms.map((platform, index) => {
            const Icon = platform.icon;
            return (
              <Card 
                key={index}
                className="gradient-border bg-card/50 backdrop-blur hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${platform.gradient} flex items-center justify-center mx-auto mb-4 glow-effect`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl gradient-text">{platform.title}</CardTitle>
                  <CardDescription className="text-secondary text-lg">
                    {platform.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Scrolling ticker */}
        <div className="mt-16 overflow-hidden">
          <div className="flex gap-4 animate-[scroll_30s_linear_infinite] whitespace-nowrap">
            {[
              "BTC +12.4%",
              "ETH/USD",
              "SOL/USDT",
              "fees paid: 2.4 SOL",
              "bundle check: pass",
              "whale alert: 12 SOL",
              "JUP/USDC",
              "scanContract()"
            ].map((text, i) => (
              <div 
                key={i}
                className="inline-block gradient-border rounded-lg px-6 py-3 text-sm text-secondary font-mono"
              >
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
