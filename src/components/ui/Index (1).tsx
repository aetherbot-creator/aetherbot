import { MatrixRain } from "@/components/MatrixRain";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { PerformanceTracker } from "@/components/PerformanceTracker";
import { Platforms } from "@/components/Platforms";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <MatrixRain />
      <Navigation />
      <Hero />
      <Features />
      <PerformanceTracker />
      <Platforms />
      
      {/* Footer */}
      <footer className="py-12 border-t border-border relative z-10">
        <div className="container mx-auto px-6 text-center">
          <p className="text-secondary">
            © 2025 AetherBot. Built to help you win.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
