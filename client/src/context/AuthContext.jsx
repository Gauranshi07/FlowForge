import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getCurrentUser,
  login as loginRequest,
  register as registerRequest,
} from "../services/authService.js";
import { getApiErrorMessage } from "../services/api.js";
import {
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from "../utils/authToken.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionError, setSessionError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const token = getAuthToken();

    if (!token) {
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    getCurrentUser()
      .then((currentUser) => {
        if (isMounted) setUser(currentUser);
      })
      .catch((error) => {
        if (!isMounted) return;
        if (error?.response?.status === 401) {
          clearAuthToken();
          setSessionError("Your session has expired. Please sign in again.");
        } else {
          setSessionError(
            getApiErrorMessage(
              error,
              "Your session could not be verified. Please sign in again.",
            ),
          );
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const completeAuthentication = useCallback((result) => {
    setAuthToken(result.token);
    setUser(result.user);
    setSessionError("");
    return result.user;
  }, []);

  const login = useCallback(
    async (credentials) =>
      completeAuthentication(await loginRequest(credentials)),
    [completeAuthentication],
  );

  const signup = useCallback(
    async (details) =>
      completeAuthentication(await registerRequest(details)),
    [completeAuthentication],
  );

  const logout = useCallback(() => {
    clearAuthToken();
    setUser(null);
    setSessionError("");
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      sessionError,
      login,
      signup,
      logout,
    }),
    [user, isLoading, sessionError, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
