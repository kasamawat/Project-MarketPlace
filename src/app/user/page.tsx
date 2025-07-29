"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import toast from "react-hot-toast";

export default function UserPage() {
  const { user } = useUser();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");

  const [isEditing, setIsEditing] = useState(false); // ✅ new

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
      setFirstname(user.firstname || "");
      setLastname(user.lastname || "");
      setGender(user.gender || "");
      setDob(user.dob ? new Date(user.dob).toISOString().slice(0, 10) : ""); // slice to yyyy-mm-dd
    }
  }, [user]);

  const handleSave = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/update`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, email, firstname, lastname, gender, dob }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || "Update failed");
        return;
      }

      toast.success("Profile updated successfully");
      setIsEditing(false); // ✅ exit edit mode after save
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    }
  };

  //   if (!user) {
  //     return <div className="p-4 text-red-500">กรุณาเข้าสู่ระบบ</div>;
  //   }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col rounded border border-gray-700">
        <div className="flex items-center justify-between bg-gray-700 p-4">
          <h1 className="text-2xl text-black">My Profile</h1>
        </div>

        <div className="shadow-sm px-4 py-4 bg-gray-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-4 mb-4">
            <div>
              <label className="block text-white mb-1 font-semibold">
                Username
              </label>
              <input
                className={`w-full border border-gray-700 p-2 bg-gray-800 text-white rounded ${
                  isEditing ? "" : "opacity-50"
                }`}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="block text-white mb-1 font-semibold">
                Email
              </label>
              <input
                className={`w-full border border-gray-700 p-2 bg-gray-800 text-white rounded opacity-50`}
                type="email"
                value={email}
                disabled={true}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-4 mb-4">
            <div>
              <label className="block text-white mb-1 font-semibold">
                First Name
              </label>
              <input
                className={`w-full border border-gray-700 p-2 bg-gray-800 text-white rounded ${
                  isEditing ? "" : "opacity-50"
                }`}
                type="text"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="block text-white mb-1 font-semibold">
                Last Name
              </label>
              <input
                className={`w-full border border-gray-700 p-2 bg-gray-800 text-white rounded ${
                  isEditing ? "" : "opacity-50"
                }`}
                type="text"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-4 mb-4">
            <div>
              <label className="block text-white mb-1 font-semibold">
                Gender
              </label>
              <select
                className={`w-full border border-gray-700 p-2 bg-gray-800 text-white rounded ${
                  isEditing ? "" : "opacity-50"
                }`}
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                disabled={!isEditing}
              >
                <option value=""> --- Select ---</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-white mb-1 font-semibold">
                Date of Birth
              </label>
              <input
                type="date"
                className={`w-full border border-gray-700 p-2 bg-gray-800 text-white rounded ${
                  isEditing ? "" : "opacity-50"
                }`}
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>

          {/* EDIT */}
          <div className="flex justify-end items-center gap-3 mt-6 mx-4">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
              >
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    if (user) {
                      setUsername(user.username);
                      setEmail(user.email);
                      setFirstname(user.firstname || "");
                      setLastname(user.lastname || "");
                    }
                  }}
                  className="text-sm px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  className="text-sm px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition cursor-pointer"
                >
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
