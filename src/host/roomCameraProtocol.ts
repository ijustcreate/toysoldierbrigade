export type RoomDevice = Pick<MediaDeviceInfo, "deviceId" | "kind" | "label">;
export type RoomComputer = {
  endpointId: string;
  deviceId: string;
  name: string;
  startedAt: number;
  devices: RoomDevice[];
  error?: string;
};
export type RoomCapture = { videoDeviceId?: string; audioDeviceId?: string; audio: boolean };
// A separate namespace and exact endpoint/session addresses keep return cameras
// independent of broadcast offers, including multiple controllers and displays.
export type RoomCameraMessage = {
  type: "room-camera";
  screenId: string;
  from: string;
  to?: string;
  sessionId?: string;
} & (
  | { op: "discover" }
  | { op: "catalog"; computer: RoomComputer }
  | { op: "start"; capture: RoomCapture }
  | { op: "offer" | "answer"; sdp: RTCSessionDescriptionInit }
  | { op: "candidate"; candidate: RTCIceCandidateInit }
  | { op: "keepalive" | "stop" }
  | { op: "status"; detail: string }
);
