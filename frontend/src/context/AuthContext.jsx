import { createContext, useReducer, useEffect, useCallback } from "react";
import { loginRequest, registerRequest, getMeRequest } from "../api/auth.api";

const STORAGE_KEY = "liga-amateur-auth";

const initialState = {
  user: null,
  token: null,
  status: "idle", // idle | loading | authenticated | error
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, status: "loading", error: null };
    case "AUTH_SUCCESS":
      return {
        ...state,
        status: "authenticated",
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case "AUTH_ERROR":
      return { ...state, status: "error", error: action.payload, user: null, token: null };
    case "LOGOUT":
      return { ...initialState, status: "idle" };
    case "UPDATE_USER":
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
}

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Al montar la app, recupera la sesion guardada en localStorage (si existe)
  // y valida el token contra el backend para asegurarse de que sigue siendo valido.
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const { token, user } = JSON.parse(stored);
    dispatch({ type: "AUTH_SUCCESS", payload: { user, token } });

    getMeRequest()
      .then((freshUser) => dispatch({ type: "UPDATE_USER", payload: freshUser }))
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
        dispatch({ type: "LOGOUT" });
      });
  }, []);

  const persist = (payload) => localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

  const login = useCallback(async (credentials) => {
    dispatch({ type: "AUTH_START" });
    try {
      const data = await loginRequest(credentials);
      const { token, ...user } = data;
      persist({ token, user });
      dispatch({ type: "AUTH_SUCCESS", payload: { token, user } });
      return user;
    } catch (error) {
      dispatch({ type: "AUTH_ERROR", payload: error.message });
      throw error;
    }
  }, []);

  const register = useCallback(async (formData) => {
    dispatch({ type: "AUTH_START" });
    try {
      const data = await registerRequest(formData);
      const { token, ...user } = data;
      persist({ token, user });
      dispatch({ type: "AUTH_SUCCESS", payload: { token, user } });
      return user;
    } catch (error) {
      dispatch({ type: "AUTH_ERROR", payload: error.message });
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: "LOGOUT" });
  }, []);

  const updateUser = useCallback(
    (partial) => {
      dispatch({ type: "UPDATE_USER", payload: partial });
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      persist({ ...stored, user: { ...stored.user, ...partial } });
    },
    []
  );

  const value = {
    user: state.user,
    token: state.token,
    status: state.status,
    error: state.error,
    isAuthenticated: state.status === "authenticated",
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
