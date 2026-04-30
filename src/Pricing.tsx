import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const Pricing = () => {
  const tiers = [
    {
      name: "Gold",
      emoji: "🥇",
      price: 100,
      color: "from-yellow-600/20 to-yellow-500/5",
      border: "border-yellow-600/40",
      badge: "bg-yellow-500/20 text-yellow-400",
      button: "bg-yellow-500 hover:bg-yellow-600 text-black",
      features: [
        "Access to trading dashboard",
        "Basic bot configurations (up to 3 bots)",
        "Trade history & analytics",
        "Email support",
        "SOL balance tracking",
      ],
    },
    {
      name: "Diamond",
      emoji: "💎",
      price: 300,
      color: "from-blue-600/20 to-blue-500/5",
      border: "border-blue-500/40",
      badge: "bg-blue-500/20 text-blue-300",
      button: "bg-blue-600 hover:bg-blue-700 text-white",
      popular: true,
      features: [
        "Everything in Gold",
        "Advanced bot configurations (up to 10 bots)",
        "Priority trade execution",
        "Real-time alerts & notifications",
        "Portfolio tracking",
        "Priority support",
      ],
    },
    {
      name: "VIP",
      emoji: "👑",
      price: 500,
      color: "from-purple-600/20 to-purple-500/5",
      border: "border-purple-500/40",
      badge: "bg-purple-500/20 text-purple-300",
      button: "bg-purple-600 hover:bg-purple-700 text-white",
      features: [
        "Everything in Diamond",
        "Unlimited bot configurations",
        "Dedicated account manager",
        "Early access to new features",
        "Custom trading strategies",
        "24/7 VIP support",
        "Exclusive market insights",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="w-full px-6 py-6 pt-24">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Unlock the full power of Aetherbot. Select the tier that fits your trading goals and contact our support team to get started.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative bg-gradient-to-b ${tier.color} border ${tier.border} rounded-2xl p-8 flex flex-col`}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}

              {/* Tier Header */}
              <div className="text-center mb-8">
                <div className="text-5xl mb-3">{tier.emoji}</div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${tier.badge}`}>
                  {tier.name.toUpperCase()} TIER
                </span>
                <div className="mt-4">
                  <span className="text-5xl font-bold">${tier.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <Check className="h-4 w-4 mt-0.5 text-green-400 shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                className={`w-full font-bold py-6 text-base ${tier.button}`}
                onClick={() => window.open("https://t.me/aetherbot_support", "_blank")}
              >
                Contact Support to Subscribe
              </Button>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="text-center text-sm text-muted-foreground max-w-xl mx-auto">
          <p>All plans are billed monthly. Contact our support team via Telegram or live chat to activate your subscription.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
