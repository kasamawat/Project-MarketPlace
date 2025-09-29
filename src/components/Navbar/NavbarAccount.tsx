// components/NavbarAccount.tsx
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { JwtPayload } from "@/models/JwtPayload";
import { User } from "@/types/user/user.types";
import Image from "next/image";

type Props = {
  user: JwtPayload;
  userDetail: User | null;
  onLogout: () => void;
};

export default function NavbarAccount({
  user,
  userDetail,
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
        className="flex items-center gap-2 cursor-pointer rounded-full bg-gray-500 px-4 py-2 text-white transition hover:bg-gray-600"
      >
        {/* Avatar */}
        <span className="relative h-8 w-8 overflow-hidden rounded-full ring-1 ring-white/10 bg-gray-700">
          {userDetail?.avatarUrl ? (
            <Image
              src={userDetail.avatarUrl}
              alt={`${user?.username || "Account"} avatar`}
              fill
              sizes="32px"
              className="object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xs text-gray-300">
              {(user?.username?.[0] || "A").toUpperCase()}
            </span>
          )}
        </span>

        {/* Username */}
        <span className="truncate text-sm font-medium flex-1 max-w-[72px]">
          {user ? user.username : "Account"}
        </span>

        {/* Dropdown Icon */}
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
          <Link
            href="/account/detail/profile"
            className="block px-4 py-2 hover:bg-gray-800"
          >
            My Account
          </Link>
          <Link
            href="/account/orders"
            className="block px-4 py-2 hover:bg-gray-800"
          >
            My Orders
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
