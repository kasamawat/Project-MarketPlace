// contexts/UserContext.tsx
"use client";

import { IUser } from "@/models/User";
import { createContext, useContext, useEffect, useState } from "react";


interface UserContextType {
  user: IUser | null;
  setUser: (user: IUser | null) => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/getProfile`, {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          console.log(data,"data");
          
          setUser(data.user);
        }
      } catch (err) {
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
