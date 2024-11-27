// src/context/AuthContext.js

import React, { createContext, useContext, useReducer } from "react";
import API from "../../api/axios";


const AuthContext = createContext();

const initialState = {
  isAuthenticated: false,
  user: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
      };

    case 'LOGOUT':
      return initialState;

    default:
      return state;
  }
}

function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  async function login(credentials) {
    try {
      const response = await API.post('/login', credentials);
      dispatch({type: 'LOGIN', payload: response.data.user});
      return {success: true, message: response.data.message};
    } catch (error) {
      return {success: false, message: error.response?.data?.message || 'Login Failed'}
    }
  }

  async function logout() {
    try {
      await API.post('/logout');
      dispatch({ type: 'LOGOUT' });
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Logout failed' };
    }
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

export { AuthProvider, useAuth };
