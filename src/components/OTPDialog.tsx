import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Mail } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface OTPDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  onBack: () => void;
  onVerify: (otp: string) => void;
}

export const OTPDialog = ({ open, onOpenChange, email, onBack, onVerify }: OTPDialogProps) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (open && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [open]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only the last character
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (index === 5 && value && newOtp.every(digit => digit !== "")) {
      onVerify(newOtp.join(""));
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
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, index) => {
      if (index < 6) {
        newOtp[index] = char;
      }
    });
    setOtp(newOtp);

    // Focus last filled input or last input
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleResend = () => {
    // Simulate resending code
    console.log("Resending code to:", email);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#2a2a2a] border-[#3a3a3a]">
        <button
          onClick={onBack}
          className="absolute left-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none"
        >
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span className="sr-only">Back</span>
        </button>

        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none"
        >
          <X className="h-4 w-4 text-gray-400" />
          <span className="sr-only">Close</span>
        </button>

        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          {/* Mail Icon */}
          <div className="w-16 h-16 flex items-center justify-center bg-emerald-500/10 rounded-full">
            <Mail className="w-8 h-8 text-emerald-500" />
          </div>

          <DialogHeader>
            <DialogTitle className="text-center text-xl text-white">
              Enter confirmation code
            </DialogTitle>
          </DialogHeader>

          {/* Email Information */}
          <p className="text-center text-sm text-gray-400 px-4">
            Please check <span className="text-white font-medium">{email}</span> for an email
            from aetherbot.app and enter your code below.
          </p>

          {/* OTP Input */}
          <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className={`w-12 h-14 text-center text-xl font-semibold bg-transparent border-2 rounded-lg text-white focus:outline-none transition-colors ${
                  digit
                    ? "border-emerald-500"
                    : "border-gray-600 focus:border-emerald-500"
                }`}
              />
            ))}
          </div>

          {/* Resend Code */}
          <div className="text-sm text-gray-400">
            Didn't get an email?{" "}
            <button
              onClick={handleResend}
              className="text-emerald-500 hover:text-emerald-400 font-medium"
            >
              Resend code
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
