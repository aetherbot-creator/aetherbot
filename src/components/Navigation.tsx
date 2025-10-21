import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Wallet, LogOut } from "lucide-react";

export const Navigation = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check wallet connection status
  useEffect(() => {
    const token = localStorage.getItem("walletToken");
    const address = localStorage.getItem("walletAddress");
    
    if (token && address) {
      setIsConnected(true);
      setWalletAddress(address);
    } else {
      setIsConnected(false);
      setWalletAddress(null);
    }
  }, [location.pathname]); // Re-check on route change

  const handleDisconnect = () => {
    localStorage.removeItem("walletToken");
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("walletType");
    localStorage.removeItem("verifiedEmail");
    setIsConnected(false);
    setWalletAddress(null);
    navigate("/");
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <img src="/logos.png" alt="AetherBot Logo" className="w-8 h-8 object-contain" />
          <span className="text-2xl font-bold gradient-text">AetherBot</span>
        </div>

        {/* Show wallet info if connected */}
        {isConnected && walletAddress && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="text-sm font-mono text-primary">
                {truncateAddress(walletAddress)}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};
