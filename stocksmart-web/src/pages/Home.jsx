import { useNavigate } from "react-router-dom";

export const Home = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/home/dashboard");
  };

  const handleStartTrial = () => {
    navigate("/home/dashboard");
  };

  return (
    <div className="home-page-container">
      {/* Hero Section */}
      <div className="home-hero">
        <div className="hero-content">
          <h1>StockSmart</h1>
          <p className="hero-subtitle">Your Perfect Way to Manage Inventory</p>
          <p className="hero-description">
            A comprehensive inventory management solution designed to streamline your warehouse operations, 
            reduce stockouts, and optimize your supply chain efficiency.
          </p>
          <button className="hero-cta" onClick={handleGetStarted}>Get Started</button>
        </div>
        <div className="hero-image">
          <img src="/stock.jpeg" alt="stocksmart inventory management" />
        </div>
      </div>

      {/* Features Section */}
      <div className="home-section">
        <h2>Why Choose StockSmart?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Real-Time Analytics</h3>
            <p>Monitor your inventory levels, movements, and stock trends with instant, accurate data.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure & Reliable</h3>
            <p>Enterprise-grade security with encrypted data storage and regular backups.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Fast & Efficient</h3>
            <p>Lightning-quick search, filtering, and reporting to save you valuable time.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Mobile Friendly</h3>
            <p>Access your inventory data from any device, anywhere, anytime.</p>
          </div>
        </div>
      </div>

      {/* Trusted By Section */}
      <div className="home-section trusted-section">
        <h2>Trusted By Leading Companies</h2>
        <div className="trusted-logos">
          <div className="trusted-logo-item">
            <img src="/company1.png" alt="company1" />
          </div>
          <div className="trusted-logo-item">
            <img src="/company2.png" alt="company2" />
          </div>
          <div className="trusted-logo-item">
            <img src="/company3.png" alt="company3" />
          </div>
          <div className="trusted-logo-item">
            <img src="/company4.png" alt="company4" />
          </div>
        </div>
      </div>

      {/* Key Features Section */}
      <div className="home-section">
        <h2>Key Features</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <h3>📈 Sell More</h3>
            <p>Optimize your inventory levels to ensure you never miss a sale. Keep best-sellers in stock while reducing overstock of slow-moving items.</p>
          </div>
          <div className="benefit-card">
            <h3>🔐 Safe & Secure</h3>
            <p>Your data is protected with industry-leading security standards. Multi-factor authentication, encrypted connections, and regular security audits.</p>
          </div>
          <div className="benefit-card">
            <h3>🚀 Easy Access</h3>
            <p>Intuitive interface requires minimal training. Get your team up and running in minutes with our user-friendly dashboard and real-time notifications.</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="home-cta-section">
        <h2>Ready to Streamline Your Inventory?</h2>
        <p>Join hundreds of businesses already using StockSmart to manage their inventory efficiently.</p>
        <button className="cta-button" onClick={handleStartTrial}>Start Your Free Trial</button>
      </div>
    </div>
  );
};