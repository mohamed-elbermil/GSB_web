import React, { useState, useEffect } from 'react';
import { MdArrowBack, MdSave, MdClose } from 'react-icons/md';
import '../styles/ProfileModal.css';

const ProfileModal = ({ isOpen, onClose, onSave, currentUser }) => {
  // États pour les champs du formulaire
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mettre à jour les champs lorsque currentUser change
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setRole(currentUser.role || 'user');
      // Ne pas définir le mot de passe ici pour des raisons de sécurité
      setPassword('');
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedbackMessage('');

    try {
      // Préparation des données à envoyer
      const updatedUserData = {
        name,
        email,
        role
      };
      
      // Si un mot de passe est fourni, l'inclure
      if (password) {
        updatedUserData.password = password;
      }

      // Simuler une requête API (vous pourriez remplacer ceci par un vrai appel API)
      // Dans un contexte réel, vous enverriez ces données à votre API

      // Mettre à jour l'état du composant parent
      if (onSave) {
        onSave(updatedUserData);
        setFeedbackMessage('Profil mis à jour avec succès!');
      } else {
        // Fallback si onSave n'est pas fourni
        console.log('Profil mis à jour:', updatedUserData);
        onClose();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      setFeedbackMessage('Erreur lors de la mise à jour du profil');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="profile-modal">
        <div className="profile-header">
          <button className="back-button" onClick={onClose}>
            <MdArrowBack />
          </button>
          <h2>Modifier le profil</h2>
        </div>

                  <div className="profile-content">
          <div className="profile-avatar-container">
            <div className="profile-avatar-large">
              <svg 
                viewBox="0 0 24 24" 
                fill="currentColor" 
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
            </div>
            <div className="profile-user-info">
              <h3>{currentUser?.name || 'Utilisateur'}</h3>
              <p className="user-role">{currentUser?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}</p>
              <p className="user-email">{currentUser?.email}</p>
            </div>
          </div>

          {feedbackMessage && (
            <div className={`feedback-message ${feedbackMessage.includes('Erreur') ? 'error' : 'success'}`}>
              {feedbackMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="name">Nom</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nom"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre-email@exemple.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Laissez vide pour ne pas changer"
              />
            </div>

            <div className="profile-actions">
              <button 
                type="button" 
                className="cancel-button" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Annuler <MdClose />
              </button>
              <button 
                type="submit" 
                className="save-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'} {!isSubmitting && <MdSave />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal; 