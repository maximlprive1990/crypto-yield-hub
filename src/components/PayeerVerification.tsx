import { useEffect } from 'react';

const PayeerVerification = () => {
  useEffect(() => {
    // Définir les en-têtes pour simuler un fichier texte
    document.title = 'payeer_2252670589.txt';
    const meta = document.querySelector('meta[http-equiv="Content-Type"]');
    if (meta) {
      meta.setAttribute('content', 'text/plain');
    } else {
      const newMeta = document.createElement('meta');
      newMeta.setAttribute('http-equiv', 'Content-Type');
      newMeta.setAttribute('content', 'text/plain');
      document.head.appendChild(newMeta);
    }
  }, []);

  return (
    <pre style={{
      margin: 0,
      padding: 0,
      fontFamily: 'monospace',
      fontSize: '12px',
      backgroundColor: 'white',
      color: 'black',
      width: '100%',
      height: '100vh',
      display: 'block',
      whiteSpace: 'pre-wrap',
      border: 'none',
      outline: 'none'
    }}>2252670589</pre>
  );
};

export default PayeerVerification;