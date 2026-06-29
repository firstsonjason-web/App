"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Users } from "lucide-react";
import AppStoreButton from "@/components/AppStoreButton";

function InviteContent() {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");

  useEffect(() => {
    if (uid) {
      window.location.href = `stayhealthiness://invite?uid=${uid}`;
    }
  }, [uid]);

  return (
    <div className="flex min-h-[70dvh] items-center justify-center px-4 py-24">
      <div className="w-full max-w-md rounded-card border border-white/10 bg-surface p-8 text-center shadow-glow-teal">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-card bg-lumo-teal/15 text-lumo-teal">
          <Users size={28} aria-hidden />
        </div>
        <h1 className="text-2xl font-bold text-white">You are invited</h1>
        <p className="mt-3 text-text-secondary">
          A friend invited you to their focus circle on LumoLife.
        </p>

        {uid ? (
          <a
            href={`stayhealthiness://invite?uid=${uid}`}
            className="mt-8 block w-full rounded-pill bg-lumo-teal py-4 font-semibold text-lumo-ink transition active:scale-[0.98] hover:bg-lumo-teal/90"
          >
            Open LumoLife
          </a>
        ) : (
          <p className="mt-8 text-sm text-red-400">Invalid invite link. Ask your friend to send a new one.</p>
        )}

        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="text-sm text-text-secondary">Need the app first?</p>
          <div className="mt-4 flex justify-center">
            <AppStoreButton />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50dvh] items-center justify-center text-text-secondary">Loading...</div>
      }
    >
      <InviteContent />
    </Suspense>
  );
}
