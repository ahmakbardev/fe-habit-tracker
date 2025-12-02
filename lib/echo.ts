import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

let echoInstance: Echo<'pusher'> | null = null;

export function getEcho(): Echo<'pusher'> | null {
  if (typeof window === "undefined") return null;

  if (!echoInstance) {
    window.Pusher = Pusher;

    echoInstance = new Echo({
      broadcaster: "pusher",
      key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || "local",
      wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || "localhost",
      wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 8080,
      wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 8080,
      forceTLS: process.env.NEXT_PUBLIC_REVERB_SCHEME === "https",
      enabledTransports: ["ws", "wss"],
      disableStats: true,
    });
  }

  return echoInstance;
}
