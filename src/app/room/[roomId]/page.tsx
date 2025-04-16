"use client";

import ScreenShare from "@/components/ScreenShare";
import VideoCall from "@/components/VideoCall";
import { socket } from "@/lib/socket/socket";
import { Copy, Users } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const [copied, setCopied] = useState(false);
  const [userCount, setUserCount] = useState(0);


  useEffect(() => {
    if (socket) {
      socket.on("room-info", (info) => {
        setUserCount(info.users.length);
      });

      socket.on("user-connected", (roomId, userId) => {
        console.log(userId, roomId)
        setUserCount((prevCount) => prevCount + 1);
      });

      socket.on("user-disconnected", () => {
        setUserCount((prevCount) => Math.max(1, prevCount - 1));
      });

      return () => {
        if (socket) {
          socket.off("room-info");
          socket.off("user-connected");
          socket.off("user-disconnected");
        }
      };
    }
  }, []);

  const copyRoomLink = () => {
    const url = window.location.href;

    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="">
            <h1 className="text-2xl font-bold">Watch Party</h1>
            <div className="flex items-center mt-2">
              <span className="text-gray-400 mr-2"> Room ID: {roomId}</span>
              <button
                onClick={copyRoomLink}
                className="text-blue-500 hover:text-blue-400 flex items-center"
              >
                <Copy className="mr-1" /> {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex items-center bg-gray-800 px-3 py-1 rounded-full ">
            <Users className="mr-2 text-blue-500" />
            <span className="text-white">
              {userCount} {userCount === 1 ? "person" : "persons"} in room
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh - 120px)]">
          <div className="h-full">
            <h2 className="text-xl font-medium mb-3">Video Call</h2>
            <div className="h-[calc(100%-40px)]">
              <VideoCall roomId={roomId} />
            </div>
          </div>
          <div className="h-full">
            <h2 className="text-xl font-medium mb-3">Shared Content</h2>
            <div className="h-[calc(100%-40px)]">
              <ScreenShare roomId={roomId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
