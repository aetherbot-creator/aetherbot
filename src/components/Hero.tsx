import { Button } from "@/components/ui/button";
import { TrendingUp, Zap } from "lucide-react";

export const Hero = () => {
  const scrollToPerformance = () => {
    const performanceSection = document.getElementById('performance');
    if (performanceSection) {
      performanceSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
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
            >
              <Zap className="mr-2 h-5 w-5" />
              connect wallet
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
  );
};
