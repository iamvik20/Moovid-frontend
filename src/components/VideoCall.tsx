"use client";

import { socket } from "@/lib/socket/socket";
import {
  addPeerListeners,
  createPeer,
  startVideoCall,
} from "@/lib/webrtc/webrtc";
import { MicIcon, MicOff, VideoIcon, VideoOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface videoCallProps {
  roomId: string;
}

export default function VideoCall({ roomId }: videoCallProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const [userId] = useState(() => {
    `user-${Math.random().toString(36).substring(2, 9)}`;
  });

  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Initialize video call
    const init = async () => {
      const stream = await startVideoCall();

      if (stream && localVideoRef.current) {
        setLocalStream(stream);
        localVideoRef.current.srcObject = stream;

        // Join room after getting local stream
        socket?.emit("join-room", roomId, userId);

        //Set up peer connection
        const peer = createPeer(stream, true);

        addPeerListeners(peer, roomId, (incomingStream) => {
          setRemoteStream(incomingStream);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = incomingStream;
          }
        });
      }
    };
    init();

    return () => {
      //clean up
      localStream?.getTracks().forEach((track) => track.stop());
    };
  }, [roomId, userId]);

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };
  return (
    <div className="w-full h-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
        <div className="relative bg-gray-800 rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <button
              onClick={toggleAudio}
              className={`p-3 rounded-full ${
                isAudioMuted ? "bg-red-500" : "bg-gray-700"
              }`}
            >
              {isAudioMuted ? <MicOff /> : <MicIcon />}
            </button>
            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full ${
                isVideoOff ? "bg-red-500" : "bg-gray-700"
              }`}
            >
              {isVideoOff ? <VideoOff /> : <VideoIcon />}
            </button>
          </div>
          <div
            className={`absolute top-2 left-2 text-sm ${isVideoOff ? "text-white": ""} bg-black/40 p-1 rounded`}
          >
            You
          </div>
        </div>
        <div className="relative bg-gray-800 rounded-lg overflow-hidden">
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-gray-400">Waiting for partner to join...</p>
            </div>
          )}
          {remoteStream && (
            <div className="absolute top-2 left-2 text-sm bg-black/40 p-1 rounded">
              Partner
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
