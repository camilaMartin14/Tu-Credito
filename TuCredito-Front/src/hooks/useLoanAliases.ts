import { useState, useEffect } from 'react';

const STORAGE_KEY = 'loan_aliases';

interface LoanAliases {
  [key: string]: string;
}

export function useLoanAliases() {
  const [aliases, setAliases] = useState<LoanAliases>({});

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setAliases(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing loan aliases:', e);
      }
    }
  }, []);

  const getAlias = (loanId: number | string) => {
    return aliases[String(loanId)] || '';
  };

  const setAlias = (loanId: number | string, alias: string) => {
    const newAliases = { ...aliases, [String(loanId)]: alias };
    setAliases(newAliases);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAliases));
  };

  const removeAlias = (loanId: number | string) => {
    const newAliases = { ...aliases };
    delete newAliases[String(loanId)];
    setAliases(newAliases);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAliases));
  };

  return {
    aliases,
    getAlias,
    setAlias,
    removeAlias
  };
}
