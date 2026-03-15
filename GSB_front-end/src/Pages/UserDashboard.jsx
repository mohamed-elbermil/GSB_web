import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';
import { BillsList } from '../Modals/Bills';
import ProfileModal from '../Modals/ProfileModal';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import {MdReceipt, MdPerson, MdLogout, MdGridView } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/gsb.png';

// Enregistrer les composants ChartJS nécessaires
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
);

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

// Composant principal Dashboard pour les utilisateurs réguliers
function UserDashboard() {
  const [activePage, setActivePage] = useState('dashboard');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // État pour les données utilisateur
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: 'User'
  });

  // État pour les données des factures
  const [bills, setBills] = useState([]);
  const [loadingBills, setLoadingBills] = useState(true);

  // Récupérer les factures de l'utilisateur
  useEffect(() => {
    const fetchBills = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://gsb-web.onrender.com'}/bills`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const billsData = await response.json();
          setBills(billsData);
          console.log('Factures récupérées:', billsData);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des factures:', error);
      } finally {
        setLoadingBills(false);
      }
    };

    if (activePage === 'dashboard') {
      fetchBills();
    }
  }, [activePage]);

  // Récupérer les informations de l'utilisateur connecté
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        console.log('Token trouvé:', token ? 'Oui' : 'Non');
        
        if (!token) {
          console.log('Aucun token trouvé, redirection vers login');
          navigate('/');
          return;
        }

        // D'abord décoder le JWT pour extraire les informations utilisateur
        const decodedToken = decodeJWT(token);
        console.log('Token décodé dans UserDashboard:', decodedToken);

        if (decodedToken) {
          // Vérifier si l'utilisateur est admin et le rediriger si nécessaire
          const userRole = decodedToken.role || decodedToken.Role;
          if (userRole === 'admin' || userRole === 'Admin') {
            console.log('Utilisateur admin détecté, redirection vers AdminDashboard');
            navigate('/admin');
            return;
          }

          // Définir les données utilisateur à partir du token
          const userDataFromToken = {
            name: decodedToken.name || decodedToken.nom || decodedToken.email || 'Utilisateur',
            email: decodedToken.email || 'email@example.com',
            role: userRole || 'User'
          };
          
          console.log('Données utilisateur extraites du token:', userDataFromToken);
          setUserData(userDataFromToken);
        }

        // Si on arrive ici et qu'on n'a pas de token décodé, il y a un problème
        if (!decodedToken) {
          console.log('Impossible de décoder le token, redirection vers login');
          localStorage.removeItem('token');
          navigate('/');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error);
        // En cas d'erreur, essayer le token JWT
        const token = localStorage.getItem('token');
        if (token) {
          const decodedToken = decodeJWT(token);
          if (decodedToken) {
            setUserData({
              name: decodedToken.name || decodedToken.nom || decodedToken.email || 'Utilisateur',
              email: decodedToken.email || 'email@example.com',
              role: decodedToken.role || decodedToken.Role || 'User'
            });
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Ouvrir le modal de profil
  const openProfileModal = () => {
    setIsProfileModalOpen(true);
  };

  // Fermer le modal de profil
  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  // Mettre à jour les données utilisateur
  const handleUpdateUserData = (updatedUserData) => {
    setUserData(prevData => ({
      ...prevData,
      ...updatedUserData
    }));
    console.log('Données utilisateur mises à jour:', updatedUserData);
    closeProfileModal();
  };

  // Calculer les statistiques des factures
  const calculateStats = () => {
    if (!bills.length) return { totalAmount: 0, monthlyData: [], typeData: [], statusData: [] };

    const totalAmount = bills.reduce((sum, bill) => sum + (bill.amount || 0), 0);
    
    // Données mensuelles (6 derniers mois)
    const monthlyData = [];
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
    const monthAmounts = new Array(6).fill(0);
    
    bills.forEach(bill => {
      const billDate = new Date(bill.date || bill.createdAt);
      const monthIndex = Math.min(5, Math.max(0, 5 - (new Date().getMonth() - billDate.getMonth())));
      if (monthIndex >= 0 && monthIndex < 6) {
        monthAmounts[monthIndex] += bill.amount || 0;
      }
    });
    
    months.forEach((month, index) => {
      monthlyData.push({
        month,
        amount: monthAmounts[index]
      });
    });

    // Données par type
    const typeData = {};
    bills.forEach(bill => {
      const type = bill.type || 'Autre';
      typeData[type] = (typeData[type] || 0) + (bill.amount || 0);
    });

    // Données par statut
    const statusData = {};
    bills.forEach(bill => {
      const status = bill.status || 'Inconnu';
      statusData[status] = (statusData[status] || 0) + 1;
    });

    return { totalAmount, monthlyData, typeData, statusData };
  };

  const { totalAmount, monthlyData, typeData, statusData } = calculateStats();

  // Données pour le graphique d'évolution mensuelle
  const lineData = {
    labels: monthlyData.map(d => d.month),
    datasets: [
      {
        label: 'Dépenses mensuelles',
        data: monthlyData.map(d => d.amount),
        fill: true,
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderColor: 'rgba(239, 68, 68, 1)',
        tension: 0.4,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value + '€';
          }
        }
      },
    },
  };

  // Données pour le graphique par type de dépenses
  const barData = {
    labels: Object.keys(typeData),
    datasets: [
      {
        label: 'Montant par type',
        data: Object.values(typeData),
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value + '€';
          }
        }
      },
    },
  };

  // Composant DashboardContent
  const DashboardContent = () => (
    <div className="dashboard-content">
      <div className="dashboard-card revenue-card">
        <div className="card-header">
          <h3>{totalAmount.toFixed(2)}€</h3>
          <p className="card-subtitle">Total des dépenses</p>
        </div>
        <div className="chart-container">
          <Line data={lineData} options={lineOptions} />
        </div>
        <div className="card-footer">
          <button className="details-btn" onClick={() => {
            setActivePage('bills');
          }}>Voir les factures</button>
        </div>
      </div>

      <div className="dashboard-card performance-card">
        <div className="card-header">
          <h3>Répartition par type</h3>
        </div>
        <div className="chart-container">
          <Bar data={barData} options={barOptions} />
        </div>
        <div className="stats-info">
          <p><strong>{bills.length}</strong> factures au total</p>
        </div>
      </div>

      <div className="dashboard-card status-card">
        <div className="card-header">
          <h3>Statut des factures</h3>
        </div>
        <div className="status-grid">
          {Object.entries(statusData).map(([status, count]) => (
            <div key={status} className="status-item">
              <span className="status-label">{status}</span>
              <span className="status-count">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Fonction pour rendre le contenu en fonction de la page active
  const renderContent = () => {
    switch(activePage) {
      case 'bills':
        return <BillsList userRole={userData.role} />;
      case 'profile':
        // Au lieu d'afficher la page profil, on ouvre le modal
        // et on affiche le dashboard
        if (!isProfileModalOpen) {
          openProfileModal();
        }
        return <DashboardContent />;
      case 'dashboard':
      default:
        return <DashboardContent />;
    }
  };

  // Afficher un indicateur de chargement pendant la récupération des données
  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
           <img src={Logo} alt="Logo" />
        </div>
        
        <div className="user-profile">
          <div className="profile-avatar">
            <svg 
              viewBox="0 0 24 24" 
              fill="currentColor" 
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
          </div>
          <div className="profile-info">
            <h3>{userData.name}</h3>
            <p>{userData.role === 'admin' ? 'Administrateur' : 'Utilisateur'}</p>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            <li className={activePage === 'dashboard' ? 'active' : ''}>
              <a href="#" onClick={() => setActivePage('dashboard')}><MdGridView /> Dashboard</a>
            </li>
            <li className={activePage === 'bills' ? 'active' : ''}>
              <a href="#" onClick={() => { setActivePage('bills'); }}><MdReceipt /> Bills</a>
            </li>
            <li className={activePage === 'profile' ? 'active' : ''}>
              <a href="#" onClick={() => { setActivePage('profile'); }}><MdPerson /> Profil</a>
            </li>
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={() => {
            console.log('Déconnexion utilisateur...');
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            navigate('/');
          }}><MdLogout /> Déconnexion</button>
        </div>
      </div>

      <div className="main-content">
        <div className="dashboard-header">
          <h1>
            {activePage === 'dashboard' && 'Tableau de bord'}
            {activePage === 'bills' && 'Mes Factures'}
            {activePage === 'profile' && 'Mon Profil'}
          </h1>
        </div>

        {renderContent()}
      </div>
      
      {/* Modal pour éditer le profil */}
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => {
          closeProfileModal();
          // Retourner au dashboard si on était sur la page profil
          if (activePage === 'profile') {
            setActivePage('dashboard');
          }
        }} 
        onSave={handleUpdateUserData}
        currentUser={userData} 
      />
    </div>
  );
}

export default UserDashboard; 