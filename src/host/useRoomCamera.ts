import { useEffect, useRef, useState } from "react";
import type { DisplayProfile } from "../types";
import { RoomCameraClient, type RoomCameraSnapshot } from "./remoteRoomCamera";

export function useRoomCamera(screenId: string | undefined) {
  const ref = useRef<RoomCameraClient | null>(null);
  const [snapshot, setSnapshot] = useState<RoomCameraSnapshot>({ computers: [], stream: null, error: null });
  useEffect(() => {
    setSnapshot({ computers: [], stream: null, error: null });
    if (!screenId) return;
    const client = new RoomCameraClient(screenId, setSnapshot);
    ref.current = client;
    return () => { ref.current = null; client.close(); };
  }, [screenId]);
  return {
    ...snapshot,
    start: (screen: DisplayProfile, audio = screen.roomAudioEnabled !== false) => ref.current?.start({
      videoDeviceId: screen.roomVideoDeviceId, audioDeviceId: screen.roomAudioDeviceId, audio
    }, screen.roomComputerId),
    stop: () => ref.current?.stop(),
    refresh: () => ref.current?.refresh()
  };
}
