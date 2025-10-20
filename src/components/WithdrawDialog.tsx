import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { VsnRequiredDialog } from "@/components/VsnRequiredDialog";
import { X } from "lucide-react";
import { useState } from "react";

interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maxBalance: number;
}

export const WithdrawDialog = ({ open, onOpenChange, maxBalance }: WithdrawDialogProps) => {
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState("");
  const [note, setNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showVsnDialog, setShowVsnDialog] = useState(false);

  const handleWithdraw = async () => {
    if (!amount || !wallet) {
      alert("Please fill in all required fields");
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (withdrawAmount > maxBalance) {
      alert(`Insufficient balance. Maximum withdrawal: ${maxBalance.toFixed(4)} SOL`);
      return;
    }

    try {
      setIsProcessing(true);
      
      // Add your withdrawal API call here
      console.log("Withdrawal request:", {
        amount: withdrawAmount,
        wallet,
        note,
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Close the withdraw dialog first
      onOpenChange(false);
      
      // Show VSN required dialog
      setShowVsnDialog(true);
      
      // Reset form
      setAmount("");
      setWallet("");
      setNote("");
    } catch (error) {
      console.error("Withdrawal failed:", error);
      alert("Withdrawal failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMaxClick = () => {
    setAmount(maxBalance.toFixed(4));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Withdraw Funds</DialogTitle>
              <DialogDescription className="mt-1">
                Enter the details to withdraw SOL from your account
              </DialogDescription>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (SOL) *</Label>
            <div className="flex gap-2">
              <Input
                id="amount"
                type="number"
                step="0.0001"
                placeholder="0.0000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-muted border-border"
                disabled={isProcessing}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleMaxClick}
                disabled={isProcessing}
              >
                MAX
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Available: {maxBalance.toFixed(4)} SOL
            </p>
          </div>

          {/* Wallet Address */}
          <div className="space-y-2">
            <Label htmlFor="wallet">Wallet Address *</Label>
            <Input
              id="wallet"
              type="text"
              placeholder="Enter destination wallet address"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              className="bg-muted border-border font-mono text-sm"
              disabled={isProcessing}
            />
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              placeholder="Add a note for this withdrawal..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="bg-muted border-border min-h-[80px]"
              disabled={isProcessing}
            />
          </div>

          {/* Warning */}
          <div className="bg-yellow-950/30 border border-yellow-900/50 rounded-lg p-3">
            <p className="text-xs text-yellow-400">
              ⚠️ Please double-check the wallet address before confirming. Transactions cannot be reversed.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={handleWithdraw}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Confirm Withdrawal"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

      <VsnRequiredDialog 
        open={showVsnDialog}
        onOpenChange={setShowVsnDialog}
      />
    </>
  );
};
