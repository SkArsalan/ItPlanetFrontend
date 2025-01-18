import React, { createContext, useState, useContext, useEffect } from 'react';



// Create the context
const SectionContext = createContext();

// Create a provider component
export const SectionProvider = ({ children }) => {
  const [selectedSection, setSelectedSection] = useState(() => {
    return localStorage.getItem('selectedPage') || null;
  });

  useEffect(() => {
    if(selectedSection){
      localStorage.setItem('selectedPage', selectedSection)
    }
  }, [selectedSection]);


  return (
    <SectionContext.Provider value={{ selectedSection, setSelectedSection }}>
      {children}
    </SectionContext.Provider>
  );
};

// Custom hook to use the context
export const useSection = () => {
  return useContext(SectionContext);
};