import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { WalletConnectResponse } from "@/lib/api";

interface ConnectWalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWalletConnected: (response: WalletConnectResponse) => void;
}

export const ConnectWalletDialog = ({
  open,
  onOpenChange,
  onWalletConnected,
}: ConnectWalletDialogProps) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      // Simulate wallet connection
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const mockResponse: WalletConnectResponse = {
        success: true,
        walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
        chainId: 1,
      };
      
      onWalletConnected(mockResponse);
    } catch (error) {
      toast.error("Failed to connect wallet. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-text">Connect Your Wallet</DialogTitle>
          <DialogDescription className="text-secondary">
            Connect your wallet to start trading with AetherBot
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full h-14 bg-gradient-to-r from-[#6F00FF] to-[#00D4FF] text-white hover:opacity-90 transition-opacity text-lg"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="mr-3 h-5 w-5" />
                Connect Wallet
              </>
            )}
          </Button>

          <p className="text-xs text-secondary text-center mt-4">
            By connecting, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
