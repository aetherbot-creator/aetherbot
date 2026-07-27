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
        localStorage.setItem("verifiedEmail", response.email);
        setShowOTPDialog(false);
        
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
    toast.success("Wallet connected successfully!");
    navigate("/dashboard");
  };

  return (
    <>
      <section className="min-h-[90vh] flex items-center justify-center relative overflow-hidden pt-20">
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="animate-fade-in">
            {/* NEW HERO TITLE */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text glow-text">
              Trade Meme Coins & Stocks.
              <br />
              Win Like a Pro.
            </h1>
            
            {/* NEW SUBTITLE */}
            <p className="text-xl md:text-2xl text-secondary mb-12 max-w-3xl mx-auto">
              Automated trading bots, real-time alerts, and advanced charting. The only platform built for both Solana's fastest movers AND traditional stocks.
            </p>
            
            {/* BUTTONS - KEEPING YOUR FUNCTIONALITY */}
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
                    Start Trading Free →
                  </>
                )}
              </Button>
              
              {/* VIEW PERFORMANCE BUTTON - SCROLLS TO PLATFORMS SECTION */}
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
          
          {/* STATS - NEW DESIGN */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">50K+</div>
              <div className="text-sm text-secondary">Active Traders</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">$2.3B</div>
              <div className="text-sm text-secondary">Traded Volume</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">2,477</div>
              <div className="text-sm text-secondary">Bot Executions</div>
            </div>
          </div>

          {/* FLOATING CODE SNIPPETS - KEPT */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
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

          {/* HIDDEN TRIGGER FOR NEWFEATURES CTA */}
          <button 
            id="hero-login-trigger" 
            onClick={() => setShowLoginDialog(true)}
            style={{ display: 'none' }}
          />
        </div>
      </section>

      {/* DIALOGS - KEPT UNCHANGED */}
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
