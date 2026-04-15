import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export const Login = () =>{
  const [email, setEmail] = useState("");
  const [password, setPassword] =useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState("login");
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [loading , setLoading] = useState(false);

  const handleLogin = (e) =>{
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()){
      setError("email and password are required");
      return;
    }
    setLoading(true);
    setTimeout(() =>{
      const res = login(email, password);
      setLoading(false);
      if(res.success){
        navigate("/home");
      }else{
        setError(res.error);
      }
    }, 600);
  };

  const handleSignup = (e) =>{
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim() || !username.trim()){
      setError("all fields are required");
      return;
    }
    setLoading(true);
    setTimeout(() =>{
      const res = signup(email, password, username);
      setLoading(false);
      if(res.success){
        navigate("/home");
      }else{
        setError(res.error);
      }
    }, 600);
  };
return (
  <div className="starting-page">
    {mode === "login" ? (
      <div className="login-page">
        <div className="login-image" >
          <img src="/stock.jpeg" alt="login background" />
        </div>
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">Welcome To StockSmart</h1>
            <p className="login-sub">Connect To Your Account</p>
          </div>
          {error && <div className="error-message">{error}</div>}
          <form className="login-form" onSubmit={handleLogin}>
            <div className="login-field">
              <input id="login-email" className="login-email" type="email" placeholder="email.eg@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
            </div>
            <div className="login-field">
              <input id="login-password" className="login-password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="submit-container">
              <button className="login-btn" type="submit" disabled={loading}>
                {loading ? (
                  <span className="login-spinner" />
                ) : (
                  'Log In'
                )}
              </button>
            </div>
          </form>
          <p className="toggle-mode">Don't have an account? <button type="button" onClick={() => {setMode("signup"); setError('')}}>Sign Up</button></p>
        </div>
      </div>
    ) : (
      <div className="signup-page">
        <div className="signup-image" >
          <img src="/stock.jpeg" alt="signup background" />
        </div>
        <div className="signup-card">
          <div className="signup-header">
            <h1 className="signup-title">Welcome To StockSmart</h1>
            <p className="signup-sub">Create Your Account</p>
          </div>
          {error && <div className="error-message">{error}</div>}
          <form className="signup-form" onSubmit={handleSignup}>
            <div className="signup-field">
              <input id="signup-email" className="signup-email" type="email" placeholder="email.eg@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
            </div>
            <div className="signup-field">
              <input id="signup-username" className="signup-username" type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="signup-field">
              <input id="signup-password" className="signup-password" type="password" placeholder="Create Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="signup-field">
              <input id="signup-confirm-password" className="signup-password" type="password" placeholder="Confirm Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="submit-container">
              <button className="signup-btn" type="submit" disabled={loading}>
                {loading ? (
                  <span className="signup-spinner" />
                ) : (
                  'Sign Up'
                )}
              </button>
            </div>
          </form>
          <p className="toggle-mode">Already have an account? <button type="button" onClick={() => {setMode("login"); setError('')}}>Log In</button></p>
        </div>
      </div>
    )}
  </div>
)

}