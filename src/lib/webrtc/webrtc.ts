"use client";

import Peer from "simple-peer";
import { socket } from "../socket/socket";

export const createPeer = (
  stream: MediaStream,
  initiator: boolean = false
): Peer.Instance => {
  return new Peer({
    config: {
      iceServers: [
        {
          urls: "stun:stun.1.google.com:19302",
        },
        {
          urls: "stun1:stun.1.google.com:19302",
        },
        {
          urls: "stun:stun2.1.google.com:19302",
        },
      ],
    },
    initiator,
    trickle: false,
    stream,
  });
};

export const addPeerListeners = (
  peer: Peer.Instance,
  roomId: string,
  onStream: (stream: MediaStream) => void
) => {
  peer.on("signal", (signal) => {
    socket?.emit("send-signal", roomId, signal);
  });

  peer.on("stream", (signal) => {
    onStream(signal);
  });

  socket?.on("receive-signal", (signal, senderId) => {
    peer.signal(signal);
  });

  peer.on("error", (error) => {
    console.error("Peer error:", error);
  });
};

const isBrowser =
  typeof window !== "undefined" &&
  typeof navigator !== "undefined" &&
  navigator.mediaDevices;
export const startScreenShare = async (): Promise<MediaStream | null> => {
  try {
    if (!isBrowser) return null;

    return await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: "monitor",
      },
      audio: true,
    });
  } catch (error) {
    console.error("Error starting screen share:", error);
    return null;
  }
};

export const startVideoCall = async (): Promise<MediaStream | null> => {
  try {
    if (!isBrowser) return null;

    return await navigator.mediaDevices.getUserMedia({
      video: {
        width: 120,
        height: 120,
      },
      audio: true,
    });
  } catch (error) {
    console.error("Error starting video call:", error);
    return null;
  }
};
