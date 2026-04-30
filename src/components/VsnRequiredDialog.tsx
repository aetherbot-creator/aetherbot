import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { useState } from "react";

interface VsnRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VsnRequiredDialog = ({ open, onOpenChange }: VsnRequiredDialogProps) => {
  const [vsnCode, setVsnCode] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [error, setError] = useState("");

  const handleSubmitVsn = () => {
    if (!vsnCode.trim()) {
      setError("Please enter your VSN code");
      return;
    }
    // Here you can add VSN validation logic
    setError("");
    alert(`VSN code submitted: ${vsnCode}`);
    onOpenChange(false);
    setVsnCode("");
    setShowInput(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    setVsnCode("");
    setShowInput(false);
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
          <div className="bg-muted/50 border border-border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">
              To complete your withdrawal request, please contact our support team to obtain your VSN code.
            </p>
          </div>

          {/* Already have VSN section */}
          {!showInput ? (
            <button
              onClick={() => setShowInput(true)}
              className="w-full text-sm text-yellow-400 hover:text-yellow-300 border border-yellow-900/50 bg-yellow-950/20 rounded-lg p-3 transition-colors"
            >
              Already have a VSN code? Click here to enter it
            </button>
          ) : (
            <div className="space-y-3 border border-yellow-900/50 bg-yellow-950/20 rounded-lg p-4">
              <p className="text-sm font-medium text-yellow-400">Enter your VSN Code</p>
              <Input
                placeholder="Enter VSN code here..."
                value={vsnCode}
                onChange={(e) => setVsnCode(e.target.value)}
                className="bg-muted border-border font-mono"
              />
              {error && (
                <p className="text-xs text-red-400">{error}</p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setShowInput(false); setError(""); setVsnCode(""); }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                  onClick={handleSubmitVsn}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit VSN
                </Button>
              </div>
            </div>
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={handleClose}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
