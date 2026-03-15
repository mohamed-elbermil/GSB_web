import React, { useState, useEffect, useRef } from 'react';
import '../styles/EditBillModal.css';

// Fonction utilitaire pour convertir la date en format YYYY-MM-DD
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  
  // Si la date est au format DD-MM-YYYY, la convertir
  if (dateString.includes('-') && dateString.split('-')[0].length === 2) {
    const [day, month, year] = dateString.split('-');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // Sinon, essayer de parser comme une date normale
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Erreur de parsing de date:', error);
    return '';
  }
};

const EditBillModal = ({ isOpen, onClose, bill, onSave }) => {
  const modalRef = useRef(null);
  const [formData, setFormData] = useState({
    type: '',
    amount: '',
    date: '',
    description: '',
    status: 'Pending',
    proof: '',
    merchant: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fonction pour initialiser les données du formulaire
  const initializeFormData = () => {
    if (!bill) return;
    
    setFormData({
      type: bill.type || '',
      amount: bill.amount || '',
      date: formatDateForInput(bill.date),
      description: bill.description || '',
      status: bill.status || 'Pending',
      proof: bill.proof || '',
      merchant: bill.merchant || ''
    });
    setErrors({});
  };

  // Initialiser le formulaire avec les données de la facture
  useEffect(() => {
    if (bill && isOpen) {
      initializeFormData();
    }
  }, [bill, isOpen]);

  // Gestion des événements clavier et clic extérieur
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Supprimer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.type) newErrors.type = 'Le type de facture est requis';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Le montant doit être supérieur à 0';
    if (!formData.date) newErrors.date = 'La date est requise';
    if (!formData.status) newErrors.status = 'Le statut est requis';
    if (!formData.merchant) newErrors.merchant = 'Le marchand est requis';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateBill = async (billId, billData) => {
    try {
      const token = localStorage.getItem('token');
      console.log("billData dylan", billData);
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }
      
      // Envoyer les données au backend en JSON
      const response = await fetch(`${API_URL}/bills/${billId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(billData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur de la réponse:', errorText);
        throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
      }

      const updatedBill = await response.json();
      console.log('Facture mise à jour:', updatedBill);
      
      return updatedBill;
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la facture:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const billId = bill._id || bill.id;
      
      // Préparer les données en objet JSON simple
      const billData = {
        date: formData.date,
        amount: Number(formData.amount),
        proof: formData.proof || '',
        merchant: formData.merchant,
        description: formData.description || '',
        status: formData.status,
        type: formData.type
      };

      console.log('Données envoyées:', billData);

      // Appeler la fonction updateBill
      const updatedBill = await updateBill(billId, billData);

      // Appeler onSave si fourni (pour mettre à jour la liste dans le parent)
      if (onSave) {
        await onSave(updatedBill);
      }
      
      onClose();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setErrors({ submit: 'Erreur lors de la mise à jour de la facture' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    initializeFormData();
  };

  if (!isOpen) return null;

  const billTypes = [
    'Restaurant', 'Transport', 'Hébergement', 'Fournitures', 
    'Carburant', 'Téléphone', 'Internet', 'Formation', 'Autre'
  ];

  const statusOptions = [
    { value: 'Pending', label: 'En attente' },
    { value: 'Approved', label: 'Approuvé' },
    { value: 'Rejected', label: 'Rejeté' }
  ];

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal-container" ref={modalRef}>
        {/* Header du modal */}
        <div className="edit-modal-header">
          <div className="edit-modal-title-section">
            <h2 className="edit-modal-title">Modifier la facture</h2>
            <p className="edit-modal-subtitle">ID: {bill?._id || bill?.id || 'N/A'}</p>
          </div>
          <button className="edit-modal-close-btn" onClick={onClose} type="button">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
            </svg>
          </button>
        </div>

        {/* Corps du modal */}
        <div className="edit-modal-body">
          <form onSubmit={handleSubmit} className="edit-bill-form">
            {/* Erreur générale */}
            {errors.submit && (
              <div className="error-message">{errors.submit}</div>
            )}

            {/* Type de facture */}
            <div className="form-group">
              <label htmlFor="type" className="form-label">Type de facture *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={`form-input ${errors.type ? 'error' : ''}`}
                required
              >
                <option value="">Sélectionner un type</option>
                {billTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.type && <span className="error-text">{errors.type}</span>}
            </div>

            {/* Montant */}
            <div className="form-group">
              <label htmlFor="amount" className="form-label">Montant (€) *</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className={`form-input ${errors.amount ? 'error' : ''}`}
                step="0.01"
                min="0"
                placeholder="0.00"
                required
              />
              {errors.amount && <span className="error-text">{errors.amount}</span>}
            </div>

            {/* Marchand */}
            <div className="form-group">
              <label htmlFor="merchant" className="form-label">Marchand *</label>
              <input
                type="text"
                id="merchant"
                name="merchant"
                value={formData.merchant}
                onChange={handleChange}
                className={`form-input ${errors.merchant ? 'error' : ''}`}
                placeholder="Nom du marchand ou établissement"
                required
              />
              {errors.merchant && <span className="error-text">{errors.merchant}</span>}
            </div>

            {/* Date */}
            <div className="form-group">
              <label htmlFor="date" className="form-label">Date *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`form-input ${errors.date ? 'error' : ''}`}
                required
              />
              {errors.date && <span className="error-text">{errors.date}</span>}
            </div>

            {/* Justificatif */}
            <div className="form-group">
              <label htmlFor="proof" className="form-label">Justificatif</label>
              <input
                type="text"
                id="proof"
                name="proof"
                value={formData.proof}
                onChange={handleChange}
                className="form-input"
                placeholder="URL ou chemin vers le justificatif (optionnel)"
              />
            </div>

            {/* Statut */}
            <div className="form-group">
              <label htmlFor="status" className="form-label">Statut *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`form-input ${errors.status ? 'error' : ''}`}
                required
              >
                {statusOptions.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              {errors.status && <span className="error-text">{errors.status}</span>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-input form-textarea"
                rows="4"
                placeholder="Description de la facture (optionnel)..."
              />
            </div>

            {/* Actions */}
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleReset}
                disabled={isSubmitting}
              >
                Réinitialiser
              </button>
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? (
                  <>
                    <svg className="spinner" width="16" height="16" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="32" strokeDashoffset="32">
                        <animate attributeName="stroke-dashoffset" dur="1s" values="32;0" repeatCount="indefinite"/>
                      </circle>
                    </svg>
                    Sauvegarde...
                  </>
                ) : (
                  'Sauvegarder'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBillModal; 