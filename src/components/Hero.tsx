import { Button } from "@/components/ui/button";
import { TrendingUp, LogIn, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import { LoginDialog } from "@/components/LoginDialog";
import { OTPDialog } from "@/components/OTPDialog";
import { ConnectWalletDialog } from "@/components/ConnectWalletDialog";
import { toast } from "sonner";
import { otpAPI } from "@/lib/api";
import type { WalletConnectResponse } from "@/lib/api";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [showConnectWalletDialog, setShowConnectWalletDialog] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const navigate = useNavigate();

  // Check if email is already verified on mount
  useEffect(() => {
    const cachedEmail = localStorage.getItem("verifiedEmail");
    if (cachedEmail) {
      setUserEmail(cachedEmail);
      setIsEmailVerified(true);
    }
  }, []);

  const scrollToPerformance = () => {
    const performanceSection = document.getElementById('performance');
    if (performanceSection) {
      performanceSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleEmailSubmit = async (email: string) => {
    try {
      setUserEmail(email);
      const response = await otpAPI.sendOTP(email);
      
      if (response.success) {
        setShowLoginDialog(false);
        setShowOTPDialog(true);
        toast.success(`Verification code sent to ${email}`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
    }
  };

  const handleOTPVerify = async (otp: string) => {
    try {
      const response = await otpAPI.verifyOTP(userEmail, otp);
      
      if (response.success) {
        // Cache the verified email
        localStorage.setItem("verifiedEmail", response.email);
        
        // Close OTP dialog first
        setShowOTPDialog(false);
        
        // Update state after a small delay to ensure dialog closes
        setTimeout(() => {
          setIsEmailVerified(true);
          setUserEmail(response.email);
          toast.success("Email verified successfully! You can now connect your wallet.");
        }, 100);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to verify OTP");
    }
  };

  const handleBackToEmail = () => {
    setShowOTPDialog(false);
    setShowLoginDialog(true);
  };

  const handleConnectWalletClick = () => {
    if (isEmailVerified) {
      setShowConnectWalletDialog(true);
    } else {
      setShowLoginDialog(true);
    }
  };

  const handleWalletConnected = (response: WalletConnectResponse) => {
    // Navigate to dashboard immediately after successful wallet connection
    toast.success("Wallet connected successfully!");
    navigate("/dashboard");
  };

  return (
    <>
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="animate-fade-in">
            <h1 className="text-7xl md:text-8xl font-bold mb-6 gradient-text glow-text">
              Be First To The
              <br />
              Next Big Play
            </h1>
            
            <p className="text-xl md:text-2xl text-secondary mb-12 max-w-3xl mx-auto">
              20,000+ tokens launch daily. AetherBot finds the 0.1% that actually run.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-[#6F00FF] to-[#00D4FF] text-white hover:opacity-90 transition-opacity text-lg px-8 py-6 glow-effect"
                onClick={handleConnectWalletClick}
              >
                {isEmailVerified ? (
                  <>
                    <Wallet className="mr-2 h-5 w-5" />
                    Connect Wallet
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Login / Signup
                  </>
                )}
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-accent text-accent hover:bg-accent/10 text-lg px-8 py-6"
                onClick={scrollToPerformance}
              >
                <TrendingUp className="mr-2 h-5 w-5" />
                View Performance
              </Button>
            </div>
          </div>
          
          {/* Floating code snippets */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              "fees paid: 2.4 SOL",
              "fresh wallet hold: 52%",
              "marketCap > 100K",
              "volume spike +180%"
            ].map((text, i) => (
              <div 
                key={i}
                className="gradient-border rounded-lg p-4 text-sm text-secondary font-mono animate-float"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      <LoginDialog 
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        onEmailSubmit={handleEmailSubmit}
      />

      <OTPDialog 
        open={showOTPDialog}
        onOpenChange={setShowOTPDialog}
        email={userEmail}
        onBack={handleBackToEmail}
        onVerify={handleOTPVerify}
      />

      <ConnectWalletDialog 
        open={showConnectWalletDialog}
        onOpenChange={setShowConnectWalletDialog}
        onWalletConnected={handleWalletConnected}
      />
    </>
  );
};
