import { useState, useEffect } from 'react';

export function useChromeStorage(key, initialValue) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (chrome?.storage?.sync) {
      chrome.storage.sync.get([key], (result) => {
        if (result[key] !== undefined) {
          setValue(result[key]);
        }
      });
    }
  }, [key]);

  const setStoredValue = (newValue) => {
    setValue(newValue);
    if (chrome?.storage?.sync) {
      chrome.storage.sync.set({ [key]: newValue });
    }
  };

  return [value, setStoredValue];
}