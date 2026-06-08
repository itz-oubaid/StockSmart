import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

export const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, hasPermission } = useAuth();

  useEffect(() => {
    if (user?.role === "Admin Système" && hasPermission("manage_tenants")) {
      navigate("/home/admin", { replace: true });
    } else if (user?.role === "Admin Tenant" && hasPermission("manage_users")) {
      navigate("/home/tenant", { replace: true });
    }
  }, [user, hasPermission, navigate]);

  const handleGetStarted = () => {
    navigate("/home/dashboard");
  };

  const handleStartTrial = () => {
    navigate("/home/dashboard");
  };

  return (
    <div className="home-page-container">
      <div className="home-hero">
        <div className="hero-content">
          <h1>{t('home.hero_title')}</h1>
          <p className="hero-subtitle">{t('home.hero_subtitle')}</p>
          <p className="hero-description">{t('home.hero_desc')}</p>
          <button className="hero-cta" onClick={handleGetStarted}>{t('home.get_started')}</button>
        </div>
        <div className="hero-image">
          <img src="/stock.jpeg" alt="stocksmart inventory management" />
        </div>
      </div>

      <div className="home-section">
        <h2>{t('home.why_choose')}</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>{t('home.feature_analytics')}</h3>
            <p>{t('home.feature_analytics_desc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>{t('home.feature_secure')}</h3>
            <p>{t('home.feature_secure_desc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>{t('home.feature_fast')}</h3>
            <p>{t('home.feature_fast_desc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>{t('home.feature_mobile')}</h3>
            <p>{t('home.feature_mobile_desc')}</p>
          </div>
        </div>
      </div>

      <div className="home-section trusted-section">
        <h2>{t('home.trusted_by')}</h2>
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

      <div className="home-section">
        <h2>{t('home.key_features')}</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <h3>{t('home.sell_more')}</h3>
            <p>{t('home.sell_more_desc')}</p>
          </div>
          <div className="benefit-card">
            <h3>{t('home.safe_secure')}</h3>
            <p>{t('home.safe_secure_desc')}</p>
          </div>
          <div className="benefit-card">
            <h3>{t('home.easy_access')}</h3>
            <p>{t('home.easy_access_desc')}</p>
          </div>
        </div>
      </div>

      <div className="home-cta-section">
        <h2>{t('home.cta_title')}</h2>
        <p>{t('home.cta_desc')}</p>
        <button className="cta-button" onClick={handleStartTrial}>{t('home.start_trial')}</button>
      </div>
    </div>
  );
};
