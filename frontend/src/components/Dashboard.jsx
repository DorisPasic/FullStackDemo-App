import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({});
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated && !loading) {
      navigate('/login');
    }
    
    // Fetch additional user data
    const fetchUserData = async () => {
      try {
        // This API call will include the httpOnly cookie automatically
        const response = await axios.get('http://localhost:3000/user/dashboard', { withCredentials: true });
        console.log('response data', response.data);
        
        setStatusMessage(`Server status: ${response.data.status} at ${response.data.time}`);
        const createDate = new Date(response.data.user.createdAt); 
        // Simulate fetching user-specific data
        setUserData({
          lastLogin: new Date().toLocaleString(),
          accountStatus: 'Active',
          role: response.data.user.roles,
          name : response.data.user.name,
          createdAt : createDate.toLocaleString(),
          profileImage: response.data.user.profileImage,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated, navigate, loading]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <div className="user-info">
        <h2>Welcome, {userData?.name}</h2>
        <p><img width="150px" src={userData.profileImage} alt="" /></p>
        <input type= "file" accept=".jpg, .jpeg, .png, .gif" />  <button>Upload</button>  {/* <input type="submit" value="Upload" />  Hier wird die Formatierung für den Button nicht übernommen! */ }
        <p>Email: {user?.email}</p>
        <p>Last Login: {userData.lastLogin}</p>
        <p>Created At : {userData.createdAt}</p>
        <p>Account Status: {userData.accountStatus}</p>
        <p>Role: {userData.role}</p>
      </div>
      <div className="dashboard-content">
        <h3>Your Account</h3>
        <p>This is a protected dashboard page that can only be accessed by authenticated users.</p>
        <p>The authentication is handled using httpOnly cookies for secure sessions.</p>
        <p className="status-message">{statusMessage}</p>
        <div className="cookie-info">
          <h4>How httpOnly Cookies Work</h4>
          <p>Your session is secured using httpOnly cookies, which means:</p>
          <ul>
            <li>The authentication token is stored in a cookie that cannot be accessed by JavaScript</li>
            <li>This prevents XSS attacks from stealing your session token</li>
            <li>The cookie is automatically sent with every request to the server</li>
            <li>Your session persists even if you refresh the page</li>
          </ul>
        </div>
      </div>
      <button onClick={handleLogout} disabled={loading}>
        {loading ? 'Logging out...' : 'Logout'}
      </button>
    </div>
  );
};

export default Dashboard;