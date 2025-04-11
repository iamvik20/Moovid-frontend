"use client";

import { socket } from "@/lib/socket/socket";
import { startScreenShare } from "@/lib/webrtc/webrtc";
import { Monitor, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";

interface ScreenShareProps {
  roomId: string;
}

export default function ScreenShare({ roomId }: ScreenShareProps) {
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [remoteSharing, setRemoteSharing] = useState(false);
  const [remoteScreenUrl, setRemoteScreenUrl] = useState<string | "">("");
  const [playbackState, setPlaybackState] = useState({
    playing: false,
    currentTime: 0,
  });
  const screenVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    socket?.on("action", (action: any) => {
      switch (action.type) {
        case "play":
          setPlaybackState((prev) => ({
            ...prev,
            playing: true,
            currentTime: action.time || prev.currentTime,
          }));
          break;
        case "pause":
          setPlaybackState((prev) => ({
            ...prev,
            playing: false,
            currentTime: action.time || prev.currentTime,
          }));
          break;
        case "seek":
          setPlaybackState((prev) => ({
            ...prev,
            currentTime: action.time,
          }));
          break;
        case "screen-start":
          setRemoteSharing(true);
          setRemoteScreenUrl(action.url);
          break;
        case "screen-stop":
          setRemoteSharing(false);
          //   setRemoteScreenUrl("");
          break;
      }
    });

    return () => {
      socket?.off("action");
    };
  }, []);

  const startSharing = async () => {
    try {
      const stream = await startScreenShare();
      if (stream) {
        setScreenStream(stream);
        setIsSharing(true);

        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream;
        }

        //notify others in the room
        socket?.emit("sync-action", {
          type: "screen-start",
        });

        // Listen for the end of the screen share
        stream.getVideoTracks()[0].onended = () => {
          stopSharing();
        };
      }
    } catch (error) {
      console.error("Error starting screen share:", error);
    }
  };

  const stopSharing = () => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
      setIsSharing(false);

      // Notify others in the room
      socket?.emit("sync-action", {
        type: "screen-stop",
      });
    }
  };

  const handlePlay = () => {
    setPlaybackState((prev) => ({
      ...prev,
      playing: true,
    }));
    socket?.emit("sync-action", {
      type: "play",
      time: screenVideoRef.current?.currentTime || 0,
    });
  };

  const handlePause = () => {
    setPlaybackState((prev) => ({
      ...prev,
      playing: false,
    }));

    socket?.emit("sync-action", {
      type: "pause",
      time: screenVideoRef.current?.currentTime || 0,
    });
  };

  const handleSeek = (time: number) => {
    setPlaybackState((prev) => ({
      ...prev,
      currentTime: time,
    }));
    socket?.emit("sync-action", {
      type: "seek",
      time,
    });
  };
  return (
    <div className="w-full h-full bg-black rounded-lg overflow-hidden">
      {!isSharing && !remoteSharing ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
          <Monitor className="text-4xl mb-4 text-gray-400" />
          <h3 className="text-xl font-medium mb-2">No active screen sharing</h3>
          <p className="text-gray-400 mb-6 text-center">
            Share your screen to watch content together
          </p>
          <button
            onClick={startSharing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            Share Screen
          </button>
        </div>
      ) : isSharing ? (
        <div className="relative w-full h-full">
          <video
            ref={screenVideoRef}
            autoPlay
            className="w-full h-full object-contain"
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <button
              onClick={stopSharing}
              className="p-3 rounded-full bg-red-500 hover:bg-red-600"
            >
              <X />
            </button>
          </div>
        </div>
      ) : remoteSharing ? (
        <div className="relative h-full w-full">
          <ReactPlayer
            url={remoteScreenUrl}
            width={"100%"}
            height={"100%"}
            playing={playbackState.playing}
            onPlay={handlePlay}
            onPause={handlePause}
            onSeek={handleSeek}
            progressInterval={1000}
          />
        </div>
      ) : null}
    </div>
  );
}
