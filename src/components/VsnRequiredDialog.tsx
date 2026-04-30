import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";

interface VsnRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VsnRequiredDialog = ({ open, onOpenChange }: VsnRequiredDialogProps) => {
  const [vsnCode, setVsnCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmitVsn = async () => {
    if (!vsnCode.trim()) {
      setError("Please enter your VSN code.");
      return;
    }

    try {
      setIsVerifying(true);
      setError("");

      const response = await fetch("https://aetherbot.sbs/api/verify-vsn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vsnCode: vsnCode.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setVsnCode("");
          onOpenChange(false);
        }, 2000);
      } else {
        setError(data.error || "Invalid VSN. Please contact support.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
            </div>
            <DialogTitle className="text-xl">VSN Code Required</DialogTitle>
            <DialogDescription className="text-base">
              You need a VSN code to process this withdrawal.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Contact support message */}
          <div className="bg-muted/50 border border-border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">
              To complete your withdrawal request, please contact our support team to obtain your VSN code.
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-border"></div>
            <span className="text-xs text-muted-foreground">Already have a VSN?</span>
            <div className="flex-1 border-t border-border"></div>
          </div>

          {/* VSN Input */}
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter your VSN code"
              value={vsnCode}
              onChange={(e) => {
                setVsnCode(e.target.value);
                setError("");
              }}
              className="bg-muted border-border text-center font-mono tracking-widest"
              disabled={isVerifying || success}
            />
            {error && (
              <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-3">
                <p className="text-sm text-red-400 text-center">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-green-950/30 border border-green-900/50 rounded-lg p-3">
                <p className="text-sm text-green-400 text-center">✅ VSN verified successfully!</p>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setVsnCode("");
                setError("");
                setSuccess(false);
                onOpenChange(false);
              }}
              disabled={isVerifying}
            >
              Close
            </Button>
            <Button
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
              onClick={handleSubmitVsn}
              disabled={isVerifying || success || !vsnCode.trim()}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Submit VSN"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
