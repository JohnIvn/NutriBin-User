import { createContext, useContext, useState, useEffect } from "react";
import Requests from "@/utils/Requests";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
        return null;
      }
    }
    return null;
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const refreshUser = async (overrideUser) => {
    const current = overrideUser || user;
    if (!current) return null;
    const userId =
      current.customer_id;
    if (!userId) return null;
    try {
      const res = await Requests({
        url: `/settings/${userId}`,
        method: "GET",
      });
      if (res.data?.ok && res.data.user) {
        const merged = { ...current, ...res.data.user };
        setUser(merged);
        localStorage.setItem("user", JSON.stringify(merged));
        return merged;
      }
    } catch (err) {
      console.error("Failed to refresh user profile:", err);
    }
    return null;
  };

  // Keep user profile up-to-date (fetch avatar/profile fields from backend)
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const userId = user.customer_id;
      if (!userId) return;
      try {
        const res = await Requests({
          url: `/settings/${userId}`,
          method: "GET",
        });
        if (res.data?.ok && res.data.user) {
          const merged = { ...user, ...res.data.user };
          setUser(merged);
          localStorage.setItem("user", JSON.stringify(merged));
        }
      } catch (err) {
        // ignore profile fetch errors
        console.error("Failed to refresh user profile:", err);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.customer_id]);

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <UserContext.Provider value={{ user, login, logout, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
