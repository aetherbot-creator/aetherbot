import { Button } from "@/components/ui/button";
import { ConnectWalletDialog } from "@/components/ConnectWalletDialog";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { WalletConnectResponse } from "@/lib/api";
import { Wallet } from "lucide-react";

export const Navigation = () => {
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if wallet is already connected on mount
  useEffect(() => {
    const token = localStorage.getItem("walletToken");
    const address = localStorage.getItem("walletAddress");
    if (token && address) {
      setIsConnected(true);
      setWalletAddress(address);
    }
  }, []);

  const handleWalletConnected = (response: WalletConnectResponse) => {
    setIsConnected(true);
    setWalletAddress(response.wallet.walletAddress);
    // Token is already stored in localStorage by PhantomConnectDialog
  };

  const handleDisconnect = () => {
    localStorage.removeItem("walletToken");
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("walletType");
    setIsConnected(false);
    setWalletAddress(null);
    navigate("/");
  };

  const handleDashboardClick = () => {
    if (isConnected) {
      navigate("/dashboard");
    } else {
      setShowConnectDialog(true);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logos.png" alt="AetherBot Logo" className="w-8 h-8 object-contain" />
            <span className="text-2xl font-bold gradient-text">AetherBot</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-foreground hover:text-accent">
              Features
            </Button>
            <Button variant="ghost" className="text-foreground hover:text-accent">
              Performance
            </Button>
            <Button variant="ghost" className="text-foreground hover:text-accent">
              Platforms
            </Button>
            
            {isConnected ? (
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleDashboardClick}
                  className="bg-gradient-to-r from-[#6F00FF] to-[#00D4FF] text-white hover:opacity-90 transition-opacity"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  {truncateAddress(walletAddress!)}
                </Button>
                <Button 
                  onClick={handleDisconnect}
                  variant="outline"
                  className="border-border hover:bg-muted"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => setShowConnectDialog(true)}
                className="bg-gradient-to-r from-[#6F00FF] to-[#00D4FF] text-white hover:opacity-90 transition-opacity"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </nav>

      <ConnectWalletDialog 
        open={showConnectDialog}
        onOpenChange={setShowConnectDialog}
        onWalletConnected={handleWalletConnected}
      />
    </>
  );
};
