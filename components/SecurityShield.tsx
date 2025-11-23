import React, { useEffect } from 'react';

const SecurityShield: React.FC = () => {
  useEffect(() => {
    // 1. Disable Right Click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 2. Disable Keyboard Shortcuts (Ctrl+U, F12, Ctrl+S, etc.)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F12
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Prevent Ctrl+Shift+I (DevTools), Ctrl+Shift+J (Console), Ctrl+Shift+C (Inspect)
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Prevent Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Prevent Ctrl+S (Save Page)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // 3. Debugger Trap (Anti-Reverse Engineering)
    // This makes the browser "pause" constantly if DevTools is open, making it hard to read code.
    const antiDebug = () => {
      const start = new Date().getTime();
      // eslint-disable-next-line no-debugger
      debugger; 
      const end = new Date().getTime();
      if (end - start > 100) {
        // DevTools is open, clear console or redirect
        console.clear();
        console.log("%c SECURITY ALERT: UNAUTHORIZED INSPECTION DETECTED ", "color: red; font-size: 20px; font-weight: bold; background: black; padding: 10px;");
      }
    };

    // 4. Console Clear Loop
    const clearConsole = setInterval(() => {
      console.clear();
      console.log("%c KEYVAULT PRO | SECURE ENVIRONMENT ", "color: #10b981; font-weight: bold;");
    }, 2000);

    // Attach Listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    
    // Run Anti-Debug loop
    const debugInterval = setInterval(antiDebug, 1000);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      clearInterval(debugInterval);
      clearInterval(clearConsole);
    };
  }, []);

  // This component renders nothing visibly
  return null;
};

export default SecurityShield;