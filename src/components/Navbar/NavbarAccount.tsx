// components/NavbarAccount.tsx
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type User = {
  username: string;
};

type Props = {
  user: User;
  onLogout: () => void;
};

const NavbarAccount: React.FC<Props> = ({ user, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleLogout = () => {
    onLogout(); // clear token or user state
    router.push("/auth/login");
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={toggleDropdown}
        className="cursor-pointer px-8 py-2 bg-gray-500 hover:bg-gray-600 transition text-white rounded-full flex"
      >
        <p className="mr-1">{user ? user.username : "Account"}</p>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="icon icon-tabler icons-tabler-outline icon-tabler-menu-2"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M4 6l16 0" />
          <path d="M4 12l16 0" />
          <path d="M4 18l16 0" />
        </svg>
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded shadow-md z-10">
          <Link href="/account" className="block px-4 py-2 hover:bg-gray-800">
            Account
          </Link>
          <Link href="/orders" className="block px-4 py-2 hover:bg-gray-800">
            My Orders
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 hover:bg-gray-800 text-red-600 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default NavbarAccount;
