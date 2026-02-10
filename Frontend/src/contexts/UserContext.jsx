import { createContext, useState, useEffect } from "react";
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

  const login = async (userData) => {
    try {
      let machines = [];
      if (userData?.customer_id) {
        const res = await Requests({
          url: `/machine/${userData.customer_id}`,
        });
        console.log("Machine response:", res.data);
        // Response is directly the array of machines
        if (Array.isArray(res.data)) {
          machines = res.data;
        }
      }
      const mergedUser = {
        ...userData,
        machines,
      };
      setUser(mergedUser);
      localStorage.setItem("user", JSON.stringify(mergedUser));
    } catch (err) {
      console.error("Failed to fetch machine", err);
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    }
  };

  const refreshUser = async (overrideUser) => {
    const current = overrideUser || user;
    if (!current) return null;
    const userId = current.customer_id;
    if (!userId) return null;
    try {
      const res = await Requests({
        url: `/settings/${userId}`,
        method: "GET",
      });
      if (res.data?.ok && res.data.user) {
        const merged = {
          ...current,
          ...res.data.user,
          machines: current.machines, // Preserve machines
        };
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
          // Preserve machines array when merging
          const merged = {
            ...user,
            ...res.data.user,
            machines: user.machines, // Keep existing machines
          };
          setUser(merged);
          localStorage.setItem("user", JSON.stringify(merged));
        }
      } catch (err) {
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

  const [selectedMachine, setSelectedMachine] = useState(() => {
    const stored = localStorage.getItem("selectedMachine");
    return stored ? JSON.parse(stored) : null;
  });

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        refreshUser,
        selectedMachine,
        setSelectedMachine,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export default UserContext;
