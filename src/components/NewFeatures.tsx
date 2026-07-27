import { Link } from "react-router-dom";

const NewFeatures = () => {
  return (
    <div style={{ padding: '60px 0', backgroundColor: '#0a0a0f', color: '#ffffff' }}>
      
      {/* ===== HOW IT WORKS ===== */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ 
            fontSize: '48px', 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #6F00FF, #00D4FF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            How It Works in 3 Steps
          </h2>
          <p style={{ fontSize: '20px', color: '#a0a0b0' }}>Get started in minutes. No coding required.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
          {/* Step 1 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6F00FF, #00D4FF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '40px'
            }}>🔗</div>
            <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#00D4FF' }}>1</div>
            <h3 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #6F00FF, #00D4FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Connect Wallet</h3>
            <p style={{ color: '#a0a0b0' }}>Link your Phantom or MetaMask wallet. Your keys stay in YOUR hands.</p>
          </div>

          {/* Step 2 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6F00FF, #00D4FF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '40px'
            }}>⚙️</div>
            <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#00D4FF' }}>2</div>
            <h3 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #6F00FF, #00D4FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Set Up Bots</h3>
            <p style={{ color: '#a0a0b0' }}>Create bots in seconds. No coding required.</p>
          </div>

          {/* Step 3 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6F00FF, #00D4FF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '40px'
            }}>📈</div>
            <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#00D4FF' }}>3</div>
            <h3 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #6F00FF, #00D4FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Sit Back & Profit</h3>
            <p style={{ color: '#a0a0b0' }}>Bots execute 24/7. Catch every pump, avoid the dumps.</p>
          </div>
        </div>
      </div>

      {/* ===== FEATURES GRID ===== */}
      <div style={{ maxWidth: '1200px', margin: '80px auto 0', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ 
            fontSize: '48px', 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #6F00FF, #00D4FF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Packed with Power
          </h2>
          <p style={{ fontSize: '20px', color: '#a0a0b0' }}>Everything you need to trade like a pro.</p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '24px'
        }}>
          {[
            { icon: '⚡', title: 'Instant Execution', desc: 'Buy in 50ms. Sell before the rug pull.', tag: 'Optimized for Solana' },
            { icon: '🛡️', title: 'Dual Asset Class', desc: 'Trade Solana meme coins AND blue-chip stocks.', tag: '1000+ assets supported' },
            { icon: '🔔', title: 'Smart Alerts', desc: 'Get notified before the crowd. Whale moves, volume spikes.', tag: 'Push, SMS, email' },
            { icon: '🤖', title: 'Advanced Bots', desc: 'DCA, grid trading, momentum, reversal patterns.', tag: 'Unlimited configs' },
            { icon: '🔒', title: 'Military Security', desc: 'Non-custodial. SOC 2 certified.', tag: 'Audited smart contracts' },
            { icon: '👥', title: 'Social Trading', desc: 'Follow top traders. Mirror their strategies.', tag: 'Leaderboards & badges' }
          ].map((feature, i) => (
            <div key={i} style={{
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(20,20,30,0.5)',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #6F00FF, #00D4FF)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                marginBottom: '16px'
              }}>{feature.icon}</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff', marginBottom: '8px' }}>{feature.title}</h3>
              <p style={{ color: '#a0a0b0', fontSize: '14px', marginBottom: '12px' }}>{feature.desc}</p>
              <span style={{ color: '#00D4FF', fontSize: '12px', fontFamily: 'monospace' }}>{feature.tag}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== TESTIMONIALS ===== */}
      <div style={{ maxWidth: '1200px', margin: '80px auto 0', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ 
            fontSize: '48px', 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #6F00FF, #00D4FF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Trusted by 50K+ Traders
          </h2>
          <p style={{ fontSize: '20px', color: '#a0a0b0' }}>Real reviews from real users who found their edge.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
          {[
            { name: 'Alex Chen', role: 'Crypto Trader', quote: 'I made 12x on BONK using the auto-snipe bot. This is insane.', initials: 'AC' },
            { name: 'Maria Rodriguez', role: 'Stock & Crypto Hybrid', quote: 'Finally, one platform for crypto AND stocks. The alerts saved me $3K.', initials: 'MR' },
            { name: 'James Wilson', role: 'Bot Developer', quote: 'The UI is so clean. My mom could set up a bot.', initials: 'JW' }
          ].map((testimonial, i) => (
            <div key={i} style={{
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(20,20,30,0.5)'
            }}>
              <div style={{ fontSize: '32px', color: '#6F00FF', opacity: 0.5, marginBottom: '16px' }}>"</div>
              <p style={{ color: '#a0a0b0', fontStyle: 'italic', marginBottom: '16px' }}>"{testimonial.quote}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6F00FF, #00D4FF)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold'
                }}>{testimonial.initials}</div>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#00D4FF' }}>{testimonial.name}</div>
                  <div style={{ color: '#a0a0b0', fontSize: '14px' }}>{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== FINAL CTA ===== */}
      <div style={{ maxWidth: '1200px', margin: '80px auto 0', padding: '0 24px' }}>
        <div style={{
          padding: '48px 64px',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(20,20,30,0.5)',
          textAlign: 'center'
        }}>
          <h2 style={{ 
            fontSize: '40px', 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #6F00FF, #00D4FF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '16px'
          }}>
            Your Gains Start Today
          </h2>
          <p style={{ fontSize: '20px', color: '#a0a0b0', maxWidth: '600px', margin: '0 auto 32px' }}>
            Join 50,000+ traders catching moonshots and building wealth.
          </p>
          <Link to="/login">
            <button style={{
              padding: '16px 48px',
              background: 'linear-gradient(135deg, #6F00FF, #00D4FF)',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '18px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 0 40px rgba(111,0,255,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              Launch Dashboard →
            </button>
          </Link>
        </div>
      </div>

    </div>
  );
};

export default NewFeatures;
