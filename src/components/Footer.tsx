export const Footer = () => {
  return (
    <footer className="bg-background/80 backdrop-blur-lg border-t border-border py-8 mt-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <img src="/logos.png" alt="AetherBot Logo" className="w-6 h-6 object-contain" />
              <span className="text-xl font-bold gradient-text">AetherBot</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Advanced AI-powered trading bot for cryptocurrency markets.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#features" className="hover:text-accent transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#performance" className="hover:text-accent transition-colors">
                  Performance
                </a>
              </li>
              <li>
                <a href="#platforms" className="hover:text-accent transition-colors">
                  Platforms
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Disclaimer
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} AetherBot. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
