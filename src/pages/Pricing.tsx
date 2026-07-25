import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Check, X, ArrowLeft, Copy } from "lucide-react";

const SOLANA_PAYMENT_WALLET = "S8NreX5AG6cRzXsv16vMfVGDP6Xff3YzRVBhBVxpakXRm"; // Replace with your wallet

const Pricing = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const tiers = [
    {
      name: "Gold",
      emoji: "🥇",
      sol: 2,
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
      sol: 3.5,
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
      sol: 5,
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

  const handleSubscribe = (tier: any) => {
    setSelectedTier(tier);
    setShowModal(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(SOLANA_PAYMENT_WALLET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="w-full px-6 py-6 pt-24">

        {/* Back Button */}
        <div className="mb-8">
          <Button variant="outline" size="sm" onClick={() => window.location.href = "/dashboard"}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Unlock the full power of Aetherbot. Select the tier that fits your trading goals.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative bg-gradient-to-b ${tier.color} border ${tier.border} rounded-2xl p-8 flex flex-col`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <div className="text-5xl mb-3">{tier.emoji}</div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${tier.badge}`}>
                  {tier.name.toUpperCase()} TIER
                </span>
                <div className="mt-4">
                  <div className="mb-2">
                    <span className="text-4xl font-bold">${tier.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <div className="text-sm text-green-400 font-semibold">
                    {tier.sol} SOL
                  </div>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <Check className="h-4 w-4 mt-0.5 text-green-400 shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full font-bold py-6 text-base ${tier.button}`}
                onClick={() => handleSubscribe(tier)}
              >
                Subscribe to {tier.name} Tier
              </Button>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="text-center text-sm text-muted-foreground max-w-xl mx-auto">
          <p>All plans are billed monthly. After payment, contact support with your transaction hash to activate.</p>
        </div>
      </main>

      {/* Subscribe Modal with Solana Payment */}
      {showModal && selectedTier && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowModal(false);
                setSelectedTier(null);
              }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">{selectedTier.emoji}</div>
              <h2 className="text-2xl font-bold mb-2">{selectedTier.name} Tier</h2>
              <p className="text-muted-foreground">Send exactly <span className="text-green-400 font-bold">{selectedTier.sol} SOL</span></p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-6 p-4 bg-muted rounded-lg">
              <QRCode 
                value={`solana:${SOLANA_PAYMENT_WALLET}?amount=${selectedTier.sol}`}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>

            {/* Wallet Address */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">Or send to this address:</p>
              <div className="flex items-center gap-2 bg-muted rounded-lg p-3">
                <code className="text-xs font-mono flex-1 truncate">
                  {SOLANA_PAYMENT_WALLET}
                </code>
                <button
                  onClick={copyToClipboard}
                  className="text-primary hover:text-primary/80 flex-shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              {copied && <p className="text-xs text-green-400 mt-2">✓ Copied to clipboard</p>}
            </div>

            {/* Amount to Send */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-1">Amount to send</p>
              <p className="text-3xl font-bold text-green-400">{selectedTier.sol} SOL</p>
              <p className="text-xs text-muted-foreground mt-1">≈ ${selectedTier.price}</p>
            </div>

            {/* Duration */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-1">Subscription Duration</p>
              <p className="text-xl font-bold text-blue-400">1 Month</p>
            </div>

            {/* Instructions */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-sm mb-3 text-yellow-400">📋 Next Steps:</h4>
              <ol className="text-xs space-y-2 text-muted-foreground">
                <li>1. Scan QR code with your Solana wallet (Phantom, Magic Eden, etc.)</li>
                <li>2. Or manually send {selectedTier.sol} SOL to the address above</li>
                <li>3. Wait for transaction to confirm</li>
                <li>4. Copy your transaction hash (TXID)</li>
                <li>5. Contact support with your TXID and wallet address</li>
              </ol>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 font-bold py-6"
                onClick={() => {
                  window.open('https://phantom.app', '_blank');
                }}
              >
                🔗 Open Phantom Wallet
              </Button>
              <Button 
                variant="outline"
                className="w-full font-bold py-6"
                onClick={() => {
                  window.location.href = "/support";
                }}
              >
                💬 Contact Support
              </Button>
              <Button 
                variant="ghost"
                className="w-full font-bold py-6"
                onClick={() => {
                  setShowModal(false);
                  setSelectedTier(null);
                }}
              >
                Close
              </Button>
            </div>

            {/* Warning */}
            <p className="text-xs text-muted-foreground text-center mt-4">
              ⚠️ Keep your transaction hash safe. You'll need it to contact support.
            </p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Pricing;
