const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://192.168.1.218:5000' 
  : `http://${window.location.hostname}:5000`;

export default API_BASE_URL; 