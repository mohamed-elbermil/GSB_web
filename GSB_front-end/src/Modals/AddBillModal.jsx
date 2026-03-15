import React, { useState } from 'react';
import { MdCalendarToday, MdClose, MdCheck } from 'react-icons/md';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/AddBillModal.css';

const AddBillModal = ({ isOpen, onClose, onSave }) => {
  const [billData, setBillData] = useState({
    date: new Date(),
    amount: '',
    description: '',
    merchant: '',
    type: 'expense',
    proof: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  

  // Réinitialiser le formulaire quand le modal se ferme
  React.useEffect(() => {
    if (!isOpen) {
      setBillData({
        date: new Date(),
        amount: '',
        description: '',
        merchant: '',
        type: 'expense',
        proof: null
      });
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBillData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setBillData(prev => ({
      ...prev,
      date: date
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Le fichier ne doit pas dépasser 5MB');
        return;
      }
      
      // Vérifier le type de fichier
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Seuls les fichiers JPG, PNG et PDF sont autorisés');
        return;
      }
      
      setBillData(prev => ({
        ...prev,
        proof: file
      }));
      setError(''); // Effacer les erreurs précédentes
    }
  };

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const handleSaveBill = async (formData) => {
    try {
      // Récupérer le token depuis localStorage
      const token = localStorage.getItem('token');
      console.log("formData dylan", formData);
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }
      
      // Envoyer les données au backend avec FormData pour gérer les fichiers
      const response = await fetch(`${API_URL}/bills`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Ne pas définir Content-Type pour FormData, le navigateur le fera automatiquement
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const newBill = await response.json();
      console.log('Nouvelle facture ajoutée:', newBill);
      
      // Cette partie sera gérée par le composant parent
      return newBill;
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la facture:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // Vérifier que le fichier justificatif est présent (obligatoire maintenant)
      if (!billData.proof) {
        setError('Le justificatif est obligatoire');
        setIsSubmitting(false);
        return;
      }

      // Créer un FormData pour gérer les fichiers
      const formData = new FormData();
      
      // Préparer les métadonnées
      const metadata = {
        date: formatDate(billData.date),
        amount: Number(billData.amount),
        description: billData.description,
        merchant: billData.merchant,
        status: 'pending',
        type: billData.type
      };
      
      // Ajouter les métadonnées en tant que JSON stringifié
      formData.append('metadata', JSON.stringify(metadata));
      
      // Ajouter le fichier avec la clé "proof"
      formData.append('proof', billData.proof);
      
      console.log('Métadonnées envoyées:', metadata);
      console.log('Fichier envoyé:', billData.proof.name);
      
      // Si onSave est fourni, l'utiliser (pour la compatibilité avec Bills.jsx)
      if (onSave) {
        await onSave(formData);
      } else {
        // Sinon, utiliser la fonction locale
        await handleSaveBill(formData);
      }
      
      // Réinitialiser le formulaire
      setBillData({
        date: new Date(),
        amount: '',
        description: '',
        merchant: '',
        type: 'expense',
        proof: null
      });
      onClose();  // Fermer le modal seulement si l'opération réussit
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      setError(error.message || "Une erreur est survenue lors de l'enregistrement");
      // Ne pas fermer le modal en cas d'erreur
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target.className === 'modal-overlay') onClose();
    }}>
      <div className="add-bill-modal">
        <div className="add-bill-header">
          <h2>Ajouter une facture</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="add-bill-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="form-group date-group">
            <DatePicker
              selected={billData.date}
              onChange={handleDateChange}
              placeholderText="Date"
              className="date-input"
              dateFormat="dd-MM-yyyy"
              required
            />
            <div className="date-icon">
              <MdCalendarToday />
            </div>
          </div>
          
          <div className="form-group">
            <input 
              type="number" 
              name="amount" 
              placeholder="Montant" 
              value={billData.amount}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <input 
              type="text" 
              name="merchant" 
              placeholder="Nom du marchand" 
              value={billData.merchant}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <textarea 
              name="description" 
              placeholder="Description de la facture" 
              value={billData.description}
              onChange={handleChange}
              rows={4}
              required
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="proof">Justificatif (obligatoire)*</label>
            <div className="file-input-container">
              <input 
                type="file" 
                id="proof"
                name="proof"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                className="file-input"
                required
              />
              <label htmlFor="proof" className="file-input-label">
                <svg className="file-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                {billData.proof ? billData.proof.name : 'Choisir un fichier *'}
              </label>
            </div>
            {billData.proof && (
              <div className="file-info">
                <span className="file-name">{billData.proof.name}</span>
                <span className="file-size">({(billData.proof.size / 1024 / 1024).toFixed(2)} MB)</span>
                <button 
                  type="button" 
                  className="remove-file-btn"
                  onClick={() => setBillData(prev => ({ ...prev, proof: null }))}
                >
                  ×
                </button>
              </div>
            )}
            <small className="file-help">JPG, PNG ou PDF - Max 5MB (Obligatoire)</small>
          </div>
          
          <div className="form-actions">
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
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'} {!isSubmitting && <MdCheck />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBillModal; 