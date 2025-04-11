"use client";

import Peer from "simple-peer";
import { socket } from "../socket/socket";

export const createPeer = (
  stream: MediaStream,
  initiator: boolean = false
): Peer.Instance => {
  return new Peer({
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
    if (socket) {
      socket.emit("send-signal", { roomId, signal });
    } else {
      console.error("Socket is null. Unable to send signal.");
    }
  });

  peer.on("stream", (signal) => {
    onStream(signal);
  });

  socket?.on("receive-signal", ({ signal, senderId }) => {
    peer.signal(signal);
  });

  peer.on("error", (error) => {
    console.error("Peer error:", error);
  });
};

export const startScreenShare = async (): Promise<MediaStream | null> => {
  try {
    return await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: "monitor",
        height: 1080,
        width: 1920,
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
    return await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
  } catch (error) {
    console.error("Error starting video call:", error);
    return null;
  }
};
