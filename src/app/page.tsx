"use client";

import ScreenShare from "@/components/ScreenShare";
import VideoCall from "@/components/VideoCall";
import { Clapperboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const router = useRouter();

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 15);
    setRoomId(newRoomId);
    router.push(`/room/${newRoomId}`);
  };

  const joinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId?.trim()) {
      router.push(`/room/${roomId}`);
    }
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          <Clapperboard className="w-12 h-12 mx-auto text-blue-500" />
          <h2 className="mt-6 text-3xl font-bold text-gray-200">Watch Party</h2>
          <p className="mt-2 text-gray-400">Watch videos together</p>
        </div>
        <div className="mt-8 space-y-4">
          <button
            onClick={createRoom}
            className="cursor-pointer w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create New Room
          </button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gray-800 px-2 text-gray-400">
                join existing
              </span>
            </div>
          </div>
          <form
            onSubmit={joinRoom}
            className="flex flex-col items-center space-y-4"
          >
            <input
              type="text"
              value={roomId || ""}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter Room ID"
              className="w-full px-4 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="cursor-pointer py-2 px-4 border border-transparent rounded-md shadow-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Join Room
            </button>
          </form>
          {/* <VideoCall roomId={roomId} /> */}
          {/* <ScreenShare roomId={roomId} /> */}
        </div>
      </div>
    </main>
  );
}
