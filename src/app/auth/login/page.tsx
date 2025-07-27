"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";
import toast from "react-hot-toast";
// import { login } from "@/services/auth.service";

export default function LoginPage(): React.ReactElement {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message);
        return;
      }

      toast.success("Login Success");
      router.push("/");
    } catch (error) {
      toast.error("Login Failed");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <form
        className="md:w-96 w-80 flex flex-col items-center justify-center"
        onSubmit={handleLogin}
      >
        <h2 className="text-5xl text-gray-900 font-medium my-6">Sign in</h2>

        <div className="flex items-center w-full bg-transparent border border-gray-300/60 h-12 rounded-full overflow-hidden pl-6 gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="#6B7280"
            className="icon icon-tabler icons-tabler-filled icon-tabler-user"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 2a5 5 0 1 1 -5 5l.005 -.217a5 5 0 0 1 4.995 -4.783z" />
            <path d="M14 14a5 5 0 0 1 5 5v1a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-1a5 5 0 0 1 5 -5h4z" />
          </svg>

          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Username or Email"
            className="bg-transparent text-gray-500/80 placeholder-gray-500/80 outline-none text-sm w-full h-full"
            required
          />
        </div>

        <div className="flex items-center mt-6 w-full bg-transparent border border-gray-300/60 h-12 rounded-full overflow-hidden pl-6 gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="#6B7280"
            className="icon icon-tabler icons-tabler-filled icon-tabler-lock"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 2a5 5 0 0 1 5 5v3a3 3 0 0 1 3 3v6a3 3 0 0 1 -3 3h-10a3 3 0 0 1 -3 -3v-6a3 3 0 0 1 3 -3v-3a5 5 0 0 1 5 -5m0 12a2 2 0 0 0 -1.995 1.85l-.005 .15a2 2 0 1 0 2 -2m0 -10a3 3 0 0 0 -3 3v3h6v-3a3 3 0 0 0 -3 -3" />
          </svg>

          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="bg-transparent text-gray-500/80 placeholder-gray-500/80 outline-none text-sm w-full h-full"
            required
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="pr-4 focus:outline-none cursor-pointer"
          >
            {showPassword ? (
              // 👁️ icon: eye-off
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6B7280"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icon-tabler-eye-off"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M3 3l18 18" />
                <path d="M10.584 10.587a2 2 0 0 0 2.829 2.828" />
                <path d="M9.878 5.879c.996 -.343 2.148 -.342 3.122 .002a9.03 9.03 0 0 1 6.496 6.119a9.045 9.045 0 0 1 -1.334 2.419" />
                <path d="M6.532 6.535a9.03 9.03 0 0 0 -3.226 4.465a9.03 9.03 0 0 0 6.117 6.502a8.964 8.964 0 0 0 4.58 -.002" />
              </svg>
            ) : (
              // 👁️ icon: eye
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6B7280"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icon-tabler-eye"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
              </svg>
            )}
          </button>
        </div>

        <div className="w-full flex items-center justify-between mt-8 text-gray-500/80">
          <div className="flex items-center gap-2">
            <input className="h-5" type="checkbox" id="checkbox" />

            <label className="text-sm" htmlFor="checkbox">
              Remember me
            </label>
          </div>

          <a className="text-sm underline" href="#">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          className="mt-8 w-full h-11 rounded-full text-white bg-indigo-500 hover:opacity-90 transition-opacity cursor-pointer"
          //   onClick={handleLogin}
        >
          Sign In
        </button>

        <div className="flex items-center gap-4 w-full my-6">
          <div className="w-full h-px bg-gray-300/90"></div>

          <p className="w-full text-nowrap text-center text-sm text-gray-500/90">
            or sign in with
          </p>

          <div className="w-full h-px bg-gray-300/90"></div>
        </div>

        <button
          type="button"
          className="w-full bg-gray-500/10 flex items-center justify-center h-12 rounded-full cursor-pointer mb-4"
        >
          <Image
            src={
              "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/login/googleLogo.svg"
            }
            alt={"googleLogo"}
            width={100}
            height={100}
          />
        </button>

        <p className="text-gray-500/90 text-sm mt-4">
          Don’t have an account?{" "}
          <Link
            href={"/auth/register"}
            className="text-indigo-400 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
