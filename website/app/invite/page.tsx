'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function InviteContent() {
  const searchParams = useSearchParams();
  const uid = searchParams.get('uid');

  useEffect(() => {
    if (uid) {
      // Try to open the app automatically
      window.location.href = `stayhealthiness://invite?uid=${uid}`;
    }
  }, [uid]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">You're Invited!</h1>
        <p className="text-gray-600 mb-8">
          A friend has invited you to join their focus circle on PaboFocus.
        </p>
        
        {uid ? (
          <a
            href={`stayhealthiness://invite?uid=${uid}`}
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition duration-200 shadow-md"
          >
            Open PaboFocus App
          </a>
        ) : (
          <p className="text-red-500">Invalid invite link. Please ask your friend for a new one.</p>
        )}
        
        <div className="mt-8 border-t pt-6">
          <p className="text-sm text-gray-500">
            Don't have the app yet? <br />
            <a href="https://apps.apple.com/hk/app/pabo-focus/id6755391886?l=en-GB" className="text-blue-600 font-semibold" target="_blank" rel="noopener noreferrer">Download on the App Store</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InviteContent />
    </Suspense>
  );
}
