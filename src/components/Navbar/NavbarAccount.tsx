// components/NavbarAccount.tsx
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { JwtPayload } from "@/models/JwtPayload";

type Props = {
  user: JwtPayload;
  onLogout: () => void;
};

export default function NavbarAccount({
  user,
  onLogout,
}: Props): React.ReactElement {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();

  const dropdownAccountRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleLogout = () => {
    onLogout(); // clear token or user state
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownAccountRef.current &&
        !dropdownAccountRef.current.contains(target)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setDropdownOpen(false);
  }, [pathname]);

  return (
    <div ref={dropdownAccountRef} className="relative inline-block text-left">
      <button
        onClick={toggleDropdown}
        className="cursor-pointer px-5 py-2 bg-gray-500 hover:bg-gray-600 transition text-white rounded-full flex"
      >
        <p className="mr-2">{user ? user.username : "Account"}</p>
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
        <div className="absolute right-0 mt-7 w-48 bg-gray-900 shadow-lg rounded-lg p-4 z-50">
          <Link href="/user" className="block px-4 py-2 hover:bg-gray-800">
            Account
          </Link>
          <Link href="/orders" className="block px-4 py-2 hover:bg-gray-800">
            My Orders
          </Link>
          <Link href="/purchase" className="block px-4 py-2 hover:bg-gray-800">
            My Purchase
          </Link>

          {user.storeId && (
            <div>
              <div className="border-t border-gray-700 my-2" />
              <Link
                href="/store/dashboard"
                className="block px-4 py-2 hover:bg-gray-800"
              >
                My Store
              </Link>
            </div>
          )}
          <div className="border-t border-gray-700 my-2" />
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
}
