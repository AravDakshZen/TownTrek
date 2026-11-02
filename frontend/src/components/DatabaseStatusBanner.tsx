import React from 'react';
import { Database, AlertTriangle } from 'lucide-react';
import api from '../services/api';

export const DatabaseStatusBanner: React.FC = () => {
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    api.get('/health')
      .then((res) => {
        if (res.data.database !== 'CONNECTED') {
          setErrorMsg(res.data.database || 'Database unavailable');
        }
      })
      .catch((err) => {
        const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Cannot reach backend on port 8080';
        setErrorMsg(msg);
      });
  }, []);

  // Removed the green "Connected to MySQL" banner as requested by the user.
  // Only display an alert if there is an actual system connection error.
  if (!errorMsg) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-900 px-4 py-2 text-xs flex items-center justify-center space-x-2">
      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
      <span>
        <strong>Backend Notice:</strong> {errorMsg}. Ensure MySQL and Spring Boot are active.
      </span>
    </div>
  );
};
