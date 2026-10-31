import { useState } from 'react';
import { authService } from './services/authService';
import { AuthLogin } from './components/AuthLogin';
import { InvoiceGenerator } from './components/InvoiceGenerator';
function App() {
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };
  if (!currentUser) {
    return <AuthLogin onLoginSuccess={setCurrentUser} />;
  }
  return <InvoiceGenerator currentUser={currentUser} onLogout={handleLogout} />;
}
export default App;