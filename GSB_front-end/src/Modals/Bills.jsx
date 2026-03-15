import { useEffect, useRef, useState } from 'react';
import { MdAdd } from 'react-icons/md';
import AddBillModal from './AddBillModal';
import EditBillModal from './EditBillModal';
import '../styles/Bills.css';

// Composant pour afficher la liste des factures
export function BillsList({ userRole = 'user' }) {
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [billToEdit, setBillToEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Récupérer le token depuis localStorage
        const authToken = localStorage.getItem('token');
        
        if (!authToken) {
          throw new Error('Token d\'authentification manquant');
        }
        
        console.log('Token utilisé pour bills:', authToken ? 'Présent' : 'Absent');
        
        const response = await fetch(`${API_URL}/bills`, {
          method: 'GET',  
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
        });
        

        console.log('Statut réponse bills:', response.status);

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Token d\'authentification invalide ou expiré');
          }
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('Données factures reçues:', data);
        
        // S'assurer que data est un tableau
        if (Array.isArray(data)) {
          setBills(data);
        } else if (data && Array.isArray(data.bills)) {
          setBills(data.bills);
        } else {
          console.warn('Format de données inattendu:', data);
          setBills([]);
        }
        
      } catch (e) {
        console.error('Erreur lors de la récupération des factures:', e);
        setError(e.message);
        setBills([]); // S'assurer que bills reste un tableau même en cas d'erreur
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, []);
  
  const openModal = (bill) => {
    console.log('Bill data:', bill); // Debug: voir les données de la facture
    setSelectedBill(bill);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  const openAddModal = () => {
    setIsAddModalOpen(true);
  };
  
  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const openEditModal = (bill) => {
    setBillToEdit(bill);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setBillToEdit(null);
  };

  const handleDeleteBill = async (billId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      try {
        const authToken = localStorage.getItem('token');
        
        if (!authToken) {
          throw new Error('Token d\'authentification manquant');
        }
        
        const response = await fetch(`${API_URL}/bills/${billId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        // Supprimer la facture de la liste
        setBills(prevBills => prevBills.filter(bill => (bill._id || bill.id) !== billId));
        
        console.log('Facture supprimée:', billId);
        
      } catch (error) {
        console.error('Erreur lors de la suppression de la facture:', error);
        alert('Erreur lors de la suppression de la facture');
      }
    }
  };
  
  

  const handleUpdateBill = async (updatedBill) => {
    try {
      // Pour l'instant, on simule la mise à jour côté client
      // Vous pouvez implémenter l'appel API PUT/PATCH ici plus tard
      console.log('Facture mise à jour:', updatedBill);
      
      // Mettre à jour la facture dans la liste locale
      setBills(prevBills => 
        prevBills.map(bill => 
          (bill._id || bill.id) === (updatedBill._id || updatedBill.id) ? updatedBill : bill
        )
      );
      
      // Fermer le modal
      closeEditModal();
      
      // Optionnel: afficher un message de succès
      alert('Facture mise à jour avec succès !');
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la facture:', error);
      throw error;
    }
  };
  
  return (
    <div className="bills-container">
      <div className="bills-header">
        <h2 className="bills-title">Mes Factures</h2>
        <button 
          className="add-bill-button"
          onClick={openAddModal}
        >
          <MdAdd /> Ajouter une facture
        </button>
      </div>
      
      {loading ? (
        <div className="loading-message">
          <p>Chargement des factures...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>Erreur: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-button"
          >
            Réessayer
          </button>
        </div>
      ) : bills.length === 0 ? (
        <p className="no-bills-message">Aucune facture disponible</p>
      ) : (
        <div className="bills-table-container">
          <table className="bills-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map(bill => (
                <tr key={bill._id || bill.id} className="bill-row">
                  <td className="bill-id">{bill._id || bill.id}</td>
                  <td className="bill-date">
                    {(() => {
                      if (!bill.date) return 'No date';
                      
                      // Essayer de parser la date
                      const date = new Date(bill.date);
                      
                      // Si la date est invalide, afficher la date brute
                      if (isNaN(date.getTime())) {
                        return bill.date;
                      }
                      
                      // Sinon, formater la date
                      return date.toLocaleDateString('fr-FR');
                    })()}
                  </td>
                  <td className="bill-type">{bill.type}</td>
                  <td className="bill-amount">${bill.amount.toFixed(2)}</td>
                  <td>
                    <span className={`bill-status status-${bill.status.toLowerCase()}`}>
                      {bill.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button 
                      className="view-button"
                      onClick={() => openModal(bill)}
                    >
                      View
                    </button>
                    {userRole === 'admin' && (
                      <>
                        <button 
                          className="edit-button"
                          onClick={() => openEditModal(bill)}
                          title="Modifier"
                        >
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708L10.5 8.207l-3-3L12.146.146zM11.207 9l-3-3L2.5 11.707V14.5a.5.5 0 0 0 .5.5h2.793L11.207 9z"/>
                          </svg>
                        </button>
                        <button 
                          className="delete-button"
                          onClick={() => handleDeleteBill(bill._id || bill.id)}
                          title="Supprimer"
                        >
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                          </svg>
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {selectedBill && (
        <BillModal 
          bill={selectedBill} 
          isOpen={isModalOpen} 
          onClose={closeModal} 
        />
      )}
      
      {/* Modal d'ajout de facture */}
      <AddBillModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
      />

      {/* Modal de modification de facture */}
      {billToEdit && (
        <EditBillModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          bill={billToEdit}
          onSave={handleUpdateBill}
        />
      )}
        </div>
  );
}

 

// Composant modal existant
export default function BillModal({ bill, isOpen, onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    // Handle escape key press
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    // Handle click outside modal
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Don't render anything if modal is closed or no bill data
  if (!isOpen || !bill) return null;

  // Debug: afficher la structure de la facture
  console.log('Bill object in modal:', bill);
  console.log('Bill keys:', Object.keys(bill));

  // Function to determine status badge color
  const getStatusClasses = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="modal-container" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="modal-wrapper">
        {/* Backdrop with blur effect */}
        <div 
          className="modal-backdrop" 
          aria-hidden="true"
          onClick={onClose}
        ></div>
        
        <span className="modal-alignment-helper" aria-hidden="true">&#8203;</span>
        
        {/* Modal content */}
        <div 
          ref={modalRef}
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-body">
            <div className="modal-header">
              <div className="modal-title-container">
                <div className="modal-title-wrapper">
                  <h3 className="modal-title">Bill Details</h3>
                  <span className={`status-badge ${getStatusClasses(bill.status)}`}>
                    {bill.status}
                  </span>
                </div>
                
                <div className="bill-details">
                  <div className="details-grid">
                    <div className="detail-item">
                      <p className="detail-label">Bill ID</p>
                      <p className="detail-value">
                        {bill.id || bill._id || bill.billId || 'No ID'}
                        {/* Debug - Toutes les clés: {JSON.stringify(Object.keys(bill))} */}
                      </p>
                    </div>
                    <div className="detail-item">
                      <p className="detail-label">Date</p>
                      <p className="detail-value">
                        {(() => {
                          if (!bill.date) return 'No date';
                          
                          // Essayer de parser la date
                          const date = new Date(bill.date);
                          
                          // Si la date est invalide, afficher la date brute
                          if (isNaN(date.getTime())) {
                            return bill.date;
                          }
                          
                          // Sinon, formater la date
                          return date.toLocaleDateString('fr-FR');
                        })()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <p className="detail-label">Type</p>
                    <p className="detail-value">{bill.type}</p>
                  </div>
                  
                  <div className="detail-item">
                    <p className="detail-label">Amount</p>
                    <p className="detail-value amount">${bill.amount.toFixed(2)}</p>
                  </div>
                  
                  {bill.description && (
                    <div className="detail-item">
                      <p className="detail-label">Description</p>
                      <p className="detail-value">{bill.description}</p>
                    </div>
                  )}
                  
                  {(bill.proof || bill.Proof) && (
                    <div className="detail-item">
                      <p className="detail-label">Proof</p>
                      <div className="proof-link">
                        {(bill.proof || bill.Proof).startsWith('http') ? (
                          <a href={bill.proof || bill.Proof} target="_blank" rel="noopener noreferrer" className="proof-link-text">
                            <svg className="proof-icon" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                            Voir l'image
                          </a>
                        ) : (
                          <div className="proof-info">
                            <svg className="proof-icon" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                            <span className="proof-text">{bill.proof || bill.Proof}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button
              type="button"
              className="close-button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 