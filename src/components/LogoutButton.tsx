"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ redirect: true, callbackUrl: "/auth/login" })}
      className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
    >
      Log out
    </button>
  );
}
