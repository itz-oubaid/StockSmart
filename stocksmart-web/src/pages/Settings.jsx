import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export const Settings = () => {
  const { user } = useAuth();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsAlerts: false,
    theme: "light",
    language: "en",
  });

  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [prefsSuccess, setPrefsSuccess] = useState("");

  const handlePasswordChange = (field, value) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setPasswordError("");
    setPasswordSuccess("");
  };

  const handleChangePassword = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    console.log("Password changed");
    setPasswordSuccess("Password changed successfully!");
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handlePreferenceChange = (field, value) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: value,
    }));
    setPrefsSuccess("");
  };

  const handleSavePreferences = () => {
    console.log("Preferences saved", preferences);
    setPrefsSuccess("Preferences saved successfully!");
    setTimeout(() => setPrefsSuccess(""), 3000);
  };

  return (
    <div className="settings-container">
      <h1>Settings</h1>

      {/* Profile Section */}
      <div className="settings-section">
        <div className="section-header">
          <h2>Profile Information</h2>
          <p className="section-description">View and manage your account details</p>
        </div>
        <div className="profile-info">
          <div className="info-item">
            <label>Name</label>
            <p className="info-value">{user?.name || "User"}</p>
          </div>
          <div className="info-item">
            <label>Email</label>
            <p className="info-value">{user?.email || "user@example.com"}</p>
          </div>
          <div className="info-item">
            <label>Role</label>
            <p className="info-value">{user?.role || "Administrator"}</p>
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="settings-section">
        <div className="section-header">
          <h2>Security</h2>
          <p className="section-description">Change your password to keep your account secure</p>
        </div>

        <div className="form-group">
          <label>Current Password</label>
          <input
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
            className="form-input"
            placeholder="Enter your current password"
          />
        </div>

        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
            className="form-input"
            placeholder="Enter a new password"
          />
        </div>

        <div className="form-group">
          <label>Confirm New Password</label>
          <input
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
            className="form-input"
            placeholder="Confirm your new password"
          />
        </div>

        {passwordError && (
          <p className="error-message">{passwordError}</p>
        )}

        {passwordSuccess && (
          <p className="success-message">{passwordSuccess}</p>
        )}

        <button onClick={handleChangePassword} className="settings-btn">
          Update Password
        </button>
      </div>

      {/* Preferences Section */}
      <div className="settings-section">
        <div className="section-header">
          <h2>Preferences</h2>
          <p className="section-description">Customize your application experience</p>
        </div>

        <div className="preference-group">
          <label className="preference-label">
            <input
              type="checkbox"
              checked={preferences.emailNotifications}
              onChange={(e) => handlePreferenceChange("emailNotifications", e.target.checked)}
              className="preference-checkbox"
            />
            <span>Email Notifications</span>
          </label>
          <p className="preference-description">Receive email updates about inventory changes and alerts</p>
        </div>

        <div className="preference-group">
          <label className="preference-label">
            <input
              type="checkbox"
              checked={preferences.smsAlerts}
              onChange={(e) => handlePreferenceChange("smsAlerts", e.target.checked)}
              className="preference-checkbox"
            />
            <span>SMS Alerts</span>
          </label>
          <p className="preference-description">Get SMS notifications for critical inventory events</p>
        </div> 

        <div className="form-group">
          <label>Language</label>
          <select
            value={preferences.language}
            onChange={(e) => handlePreferenceChange("language", e.target.value)}
            className="form-select"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </select>
        </div>

        {prefsSuccess && (
          <p className="success-message">{prefsSuccess}</p>
        )}

        <button onClick={handleSavePreferences} className="settings-btn">
          Save Preferences
        </button>
      </div>

      {/* About Section */}
      <div className="settings-section about-section">
        <h2>About StockSmart</h2>
        <div className="about-info">
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Last Updated:</strong> April 8, 2026</p>
          <p className="about-description">StockSmart is your comprehensive inventory management solution designed to streamline warehouse operations and optimize supply chain efficiency.</p>
        </div>
      </div>
    </div>
  );
};
