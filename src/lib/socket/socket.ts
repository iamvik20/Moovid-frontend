"use client";

import { io } from "socket.io-client";
import { SERVER_URL } from "../config";

console.log(process.env.SERVER_URL);

export const socket = typeof window !== "undefined" ? io(SERVER_URL) : null;
