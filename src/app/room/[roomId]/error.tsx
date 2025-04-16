"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg max-w-wd w-full text-center">
        <h2 className="text-2xl font-bold mb-4"> Something went wrong!</h2>
        <p className="text-gray-400 mb-6">
          We couldn't load the room. Please try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            Try again
          </button>
          <Link
            href={"/"}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
}
