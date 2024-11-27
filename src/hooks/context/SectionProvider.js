import React, { createContext, useState, useContext } from 'react';

// Create the context
const SectionContext = createContext();

// Create a provider component
export const SectionProvider = ({ children }) => {
  const [selectedSection, setSelectedSection] = useState('Accessories Section');

  const handleSelectSection = (section) => {
    setSelectedSection(section);
  };

  return (
    <SectionContext.Provider value={{ selectedSection, handleSelectSection }}>
      {children}
    </SectionContext.Provider>
  );
};

// Custom hook to use the context
export const useSection = () => {
  return useContext(SectionContext);
};