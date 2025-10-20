import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface VsnRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VsnRequiredDialog = ({ open, onOpenChange }: VsnRequiredDialogProps) => {
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
          <div className="bg-muted/50 border border-border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              To complete your withdrawal request, please contact our support team to obtain your VSN code.
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
