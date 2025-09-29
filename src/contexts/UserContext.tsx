// contexts/UserContext.tsx
"use client";

import { User } from "@/types/user/user.types";
import { createContext, useContext, useEffect, useState } from "react";


interface UserContextType {
  userDetail: User | null;
  setUserDetail: (userDetail: User | null) => void;
}

const UserContext = createContext<UserContextType>({
  userDetail: null,
  setUserDetail: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userDetail, setUserDetail] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/getProfileSecure`, {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();

          setUserDetail(data);
        }
      } catch (err) {
        setUserDetail(null);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ userDetail, setUserDetail }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
