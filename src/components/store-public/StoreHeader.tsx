"use client";

// components/store/StoreHeader.tsx
import { PublicProduct } from "@/types/product/products.types";
import { StorePubilc } from "@/types/store/stores.types";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function StoreHeader({
  store,
  product,
}: {
  store: StorePubilc;
  product: PublicProduct[];
}) {
  const itemCount = product.length;

  const [following, setFollowing] = useState<boolean>(false);
  const [pending, setPending] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/store-follow/${store._id}/status`,
          { method: "GET", credentials: "include", cache: "no-store" }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { following: boolean };
        if (mounted) setFollowing(!!data.following);
      } catch {
        // เงียบไว้ก็ได้ หรือแจ้งเตือน
        // toast.error("โหลดสถานะติดตามไม่สำเร็จ");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [store._id]);

  const toggleFollow = async () => {
    if (pending) return;
    setPending(true);

    // optimistic
    const next = !following;
    setFollowing(next);

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/store-follow/${store._id}`;
      const res = await fetch(url, {
        method: next ? "POST" : "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        // rollback ถ้า error
        setFollowing(!next);
        const msg = `Follow ${next ? "" : "un"}failed (HTTP ${res.status})`;
        toast.error(msg);
        return;
      }
      toast.success(next ? "Followed store" : "Unfollowed store");
    } catch (e) {
      setFollowing(!next);
      toast.error("Network error");
    } finally {
      setPending(false);
    }
  };
  return (
    <div className="grid grid-cols-6 gap-4 border-b pb-4 mb-4">
      <div className="col-span-2 flex flex-row items-start gap-4 p-4">
        {/* Logo */}
        <Image
          src={store.logoUrl ?? store.logo?.url ?? "/default-banner.png"}
          alt={store.name}
          width={100}
          height={100}
          className="object-cover rounded border border-gray-600"
        />

        {/* Store Info + Follow */}
        <div className="flex flex-col justify-center">
          <h1 className="text-2xl font-bold text-white">{store.name}</h1>

          <button
            onClick={toggleFollow}
            disabled={pending}
            className={[
              "mt-3 w-fit rounded px-3 py-1.5 text-sm font-medium cursor-pointer transition",
              following
                ? "bg-orange-600 hover:bg-orange-700 text-white"
                : "bg-indigo-600 hover:bg-indigo-700 text-white",
              pending ? "opacity-60 cursor-not-allowed" : "",
            ].join(" ")}
          >
            {pending
              ? following
                ? "Following..."
                : "Following..."
              : following
              ? "Following"
              : "+ Follow"}
          </button>
        </div>
      </div>
      <div className="col-span-2 content-center">
        <p className="text-gray-600">Products: {itemCount}</p>
        {/* <p className="text-gray-600">Following: { store.followingCount ?? "-" }</p> */}
      </div>
      <div className="col-span-2 content-center">
        <p className="text-gray-600">Followers: {store.followersCount ?? "-"}</p>
        <p className="text-gray-600">Rating: {store.rating ?? "-"}</p>
      </div>
    </div>
  );
}
