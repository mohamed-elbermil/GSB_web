import React, { useState, useEffect } from 'react';
import '../styles/AdminDashboard.css';
import { BillsList } from '../Modals/Bills';
import { MdSearch, MdAdd, MdEdit, MdDelete, MdCheck, MdArrowBack, MdLogout } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

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

function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('bills');
  const [selectedBills, setSelectedBills] = useState({
    'Coca': false,
    'Big Mac': false,
    'Nuggets': false
  });
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  const toggleBillSelection = (billName) => {
    setSelectedBills(prev => ({
      ...prev,
      [billName]: !prev[billName]
    }));
  };

  // Fonction de déconnexion
  const handleLogout = () => {
    console.log('Déconnexion admin...');
    localStorage.removeItem('token');
    navigate('/');
  };

  // Vérifier l'authentification et le rôle admin
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Vérification token admin:', token ? 'Présent' : 'Absent');
        
        if (!token) {
          console.log('Pas de token, redirection vers login');
          navigate('/');
          return;
        }

        // Décoder le JWT pour vérifier le rôle admin
        const decodedToken = decodeJWT(token);
        console.log('Token admin décodé:', decodedToken);

        if (decodedToken) {
          const role = decodedToken.role || decodedToken.Role || 'user';
          console.log('Rôle utilisateur depuis token:', role);
          setUserRole(role);
          
          // Vérifier si l'utilisateur est admin
          if (role != 'admin' && role != 'Admin') {
            console.log('Accès refusé: utilisateur non-admin selon token');
            navigate('/dashboard'); // Rediriger vers le dashboard utilisateur
            return;
          }
        } else {
          console.log('Impossible de décoder le token, redirection vers login');
          navigate('/');
          return;
        }
        
      } catch (error) {
        console.error('Erreur lors de la vérification d\'authentification:', error);
        navigate('/');
        return;
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const renderBillsList = () => {
    return (
      <div className="bills-view">
        <div className="bills-header">
          <button className="back-button">
            <MdArrowBack />
          </button>
          <span>Bills</span>
        </div>
        
        <div className="bills-form">
          <div className="form-group">
            <label>Product Name</label>
            <input type="text" placeholder="Name" className="form-input" />
          </div>
          
          <div className="form-group">
            <label>ID of bills</label>
            <input type="text" placeholder="ID" className="form-input" />
          </div>
          
          <div className="form-group">
            <label>State</label>
            <input type="text" placeholder="Status" className="form-input" />
          </div>
        </div>

        <div className="action-button">
          <span>Button</span>
        </div>
      </div>
    );
  };

  const renderBillsDetail = () => {
    return (
      <div className="bills-detail">
        <div className="bills-detail-header">
          <h3>Macdo's Bills</h3>
          <p className="bills-subtitle"></p>
        </div>
        
        <div className="bills-items">
          {Object.keys(selectedBills).map((item) => (
            <div className="bill-item" key={item}>
              <div className="item-marker">A</div>
              <div className="item-name">{item}</div>
              <div className="item-dots">:</div>
              <div 
                className={`item-checkbox ${selectedBills[item] ? 'checked' : ''}`}
                onClick={() => toggleBillSelection(item)}
              >
                {selectedBills[item] && <MdCheck />}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Afficher un indicateur de chargement pendant la vérification
  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Vérification des permissions...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="admin-container">
      <div className="admin-content">
        <div className="admin-sidebar">
          <div className="sidebar-header">
            <div className="logo">
              <span className="logo-g">G</span>
              <span className="logo-s">S</span>
              <span className="logo-b">B</span>
              <span className="logo-dot">.</span>
            </div>
            
            <div className="search-container">
              <div className="search-bar">
                <input type="text" placeholder="Rechercher..." />
                <MdSearch className="search-icon" />
              </div>
            </div>
            
            <div className="user-button">
              <button className="user-btn">Admin</button>
            </div>

            <div className="sidebar-footer">
              <button className="logout-btn" onClick={handleLogout}>
                <MdLogout /> Déconnexion
              </button>
            </div>
          </div>
        </div>
        
        <div className="admin-main">
          <BillsList userRole="admin" />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard; 