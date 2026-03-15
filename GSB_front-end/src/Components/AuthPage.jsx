import React, { useState } from 'react';
import '../styles/Auth.css';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://gsb-web.onrender.com';

// Fonction pour décoder un JWT
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Erreur lors du décodage du JWT:', error);
    return null;
  }
};

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (isLogin) {
      // Login logic
      if (!formData.email || !formData.password) {
        setError('Veuillez remplir tous les champs');
        setLoading(false);
        return;
      }

      try {
        console.log('Tentative de connexion avec:', { email: formData.email });
        
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          }),
        });

        console.log('Statut de la réponse:', response.status);
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Email ou mot de passe incorrect');
          } else if (response.status === 404) {
            throw new Error('Service de connexion non disponible');
          } else if (response.status >= 500) {
            throw new Error('Erreur serveur. Veuillez réessayer plus tard.');
          }
        }

        const data = await response.json();

        if (response.ok) {
          console.log('Connexion réussie:', data);
          
          const token = data.token || data.accessToken;
          
          if (token) {
            if (rememberMe) {
              localStorage.setItem('token', token);
            } else {
              sessionStorage.setItem('token', token);
            }
            
            const decodedToken = decodeJWT(token);
            
            if (decodedToken) {
              const userFromToken = {
                id: decodedToken.id,
                email: decodedToken.email,
                role: decodedToken.role || decodedToken.Role,
                name: decodedToken.name || decodedToken.nom || decodedToken.email
              };
              
              const userRole = userFromToken.role;
              
              if (userRole === 'admin' || userRole === 'Admin') {
                navigate('/admin');
              } else {
                navigate('/dashboard');
              }
            } else {
              setError('Erreur lors du traitement du token d\'authentification');
              return;
            }
          } else {
            setError('Aucun token d\'authentification reçu');
            return;
          }
        } else {
          setError(data.message || 'Identifiants incorrects');
        }
      } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          setError(`Impossible de se connecter au serveur. Vérifiez que le serveur backend est démarré sur ${API_URL}`);
        } else {
          setError(error.message || 'Erreur de connexion au serveur');
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Register logic
      if (!formData.email || !formData.password || !formData.name) {
        setError('Veuillez remplir tous les champs');
        setLoading(false);
        return;
      }

      try {
        console.log('Tentative d\'inscription avec:', { 
          email: formData.email,
          name: formData.name,
          password: '***'
        });

        const response = await fetch(`${API_URL}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: 'user'
          }),
        });

        console.log('Statut de la réponse:', response.status);

        const responseText = await response.text();
        console.log('Réponse brute du serveur:', responseText);

        let data;
        try {
          data = responseText ? JSON.parse(responseText) : {};
        } catch (e) {
          console.error('Erreur de parsing JSON:', e);
          throw new Error('Le serveur a renvoyé une réponse invalide');
        }

        if (response.ok) {
          console.log('Inscription réussie:', data);
          setSuccess('Compte créé avec succès ! Redirection vers la connexion...');
          setTimeout(() => {
            setIsLogin(true);
            setFormData({ name: '', email: '', password: '' });
            setSuccess('');
          }, 2000);
        } else {
          if (response.status === 400) {
            setError(data.message || 'Données d\'inscription invalides');
          } else if (response.status === 409) {
            setError('Un compte avec cet email existe déjà');
          } else if (response.status === 500) {
            setError('Erreur serveur. Veuillez réessayer plus tard.');
          } else {
            setError(data.message || 'Erreur lors de la création du compte');
          }
        }
      } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        setError(error.message || 'Erreur de connexion au serveur');
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setFormData({ name: '', email: '', password: '' });
  };

  const handleGoogleSignIn = () => {
    // TODO: Implement Google OAuth
    console.log('Google sign-in not implemented yet');
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password
    console.log('Forgot password not implemented yet');
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-left-content">
          <img 
            src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face" 
            alt="Person smiling" 
            className="auth-image"
          />
        </div>
      </div>
      
      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-header">
            <h1 className="auth-title">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="auth-subtitle">
              {isLogin 
                ? 'Enter your credentials to access your account' 
                : 'Fill in your information to get started'
              }
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name" className="form-label">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                required
                minLength={isLogin ? undefined : "6"}
              />
            </div>

            {isLogin && (
              <>
                <div className="auth-checkbox">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember">Remember sign in details</label>
                </div>
                
                <div className="auth-forgot">
                  <a href="#" onClick={handleForgotPassword}>Forgot password?</a>
                </div>
              </>
            )}
            
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading 
                ? (isLogin ? 'Signing in...' : 'Creating account...') 
                : (isLogin ? 'Log in' : 'Sign up')
              }
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>
          <div className="auth-switch">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <a href="#" onClick={toggleMode}>
              {isLogin ? 'Sign up' : 'Log in'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
