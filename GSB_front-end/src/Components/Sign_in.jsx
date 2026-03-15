import React, { useState } from 'react';
import '../styles/Sign_in.css';
import { useNavigate } from 'react-router-dom';
import { MdPerson, MdEmail } from 'react-icons/md';
import { FaLock } from 'react-icons/fa';

function SignIn() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

    // Validation côté client
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
          role: 'user' // Ajout du rôle par défaut
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
          navigate('/');
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
  };

  const handleLoginRedirect = () => {
    navigate('/');
  };

  return (
    <div className="sign-in-container">
      <div className="form-container">
        <div className="avatar-container">
          <div className="avatar-circle">
            <img src="/user-icon.svg" alt="User Icon" className="avatar-icon" />
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="signin-name">Prénom</label>
            <div className="input-with-icon">
              <MdPerson className="input-icon" />
              <input
                type="text"
                id="signin-name"
                name="name"
                placeholder="Prénom"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="signin-email">Email</label>
            <div className="input-with-icon">
              <MdEmail className="input-icon" />
              <input
                type="email"
                id="signin-email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="signin-password">Mot de passe</label>
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input
                type="password"
                id="signin-password"
                name="password"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
              />
            </div>
          </div>
          
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Création en cours...' : 'Créer le compte'}
          </button>
        </form>

        <button onClick={handleLoginRedirect} className="login-redirect-btn">
          Déjà un compte ? Se connecter
        </button>
      </div>
    </div>
  );
}

export default SignIn;
