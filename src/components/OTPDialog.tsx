import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface OTPDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  onBack: () => void;
  onVerify: (otp: string) => Promise<void>;
  isVerifying?: boolean;
}

export const OTPDialog = ({
  open,
  onOpenChange,
  email,
  onBack,
  onVerify,
  isVerifying = false,
}: OTPDialogProps) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (open) {
      setOtp(["", "", "", "", "", ""]);
      setTimer(60);
      setCanResend(false);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [open]);

  useEffect(() => {
    if (timer > 0 && !canResend) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setCanResend(true);
    }
  }, [timer, canResend]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split("");
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setOtp(newOtp);
      const lastIndex = Math.min(digits.length, 5);
      inputRefs.current[lastIndex]?.focus();
    }
  };

  const handleSubmit = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }
    await onVerify(otpString);
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      setTimer(60);
      setCanResend(false);
      toast.success("New code sent to your email");
    } catch (error) {
      toast.error("Failed to resend code");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-text">Enter Verification Code</DialogTitle>
          <DialogDescription className="text-secondary">
            We sent a 6-digit code to <span className="text-accent font-medium">{email}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* OTP Input */}
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center text-2xl font-bold bg-muted/50 border-border focus:border-accent"
                disabled={isVerifying}
              />
            ))}
          </div>

          {/* Timer / Resend */}
          <div className="text-center">
            {canResend ? (
              <button
                onClick={handleResend}
                className="text-sm text-accent hover:text-accent/80 transition-colors"
              >
                Resend code
              </button>
            ) : (
              <p className="text-sm text-secondary">
                Resend code in <span className="text-accent font-medium">{timer}s</span>
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleSubmit}
              disabled={isVerifying || otp.some((d) => !d)}
              className="w-full bg-gradient-to-r from-[#6F00FF] to-[#00D4FF] text-white hover:opacity-90"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={onBack}
              disabled={isVerifying}
              className="text-secondary hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
