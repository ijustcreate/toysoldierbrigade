import { createHostChannel, getLanternDeviceId } from "./lanternHost";
import { formatMediaDeviceError, mediaDeviceManager, type MediaDeviceLease } from "./mediaDeviceManager";
import { iceServers, displayDeviceName } from "./videoBridge";
import type { HostMessage } from "../types";
import type { RoomCameraMessage, RoomCapture, RoomComputer } from "./roomCameraProtocol";

type ChannelFactory = (listener: (message: HostMessage) => void) => { post(message: HostMessage): void; close(): void };
type PeerSession = { id: string; remote: string; peer: RTCPeerConnection; candidates: RTCIceCandidateInit[]; lastSeen: number; lease?: MediaDeviceLease };
const ROOM_TIMEOUT = 20_000;

async function acceptCandidate(session: PeerSession, candidate: RTCIceCandidateInit) {
  if (session.peer.remoteDescription) await session.peer.addIceCandidate(candidate);
  else session.candidates.push(candidate);
}
async function flushCandidates(session: PeerSession) {
  for (const candidate of session.candidates.splice(0)) await session.peer.addIceCandidate(candidate);
}

/** Runs only in the physical display page. The controller never acquires media. */
export class RoomCameraProvider {
  readonly endpointId = crypto.randomUUID();
  private startedAt = Date.now();
  private sessions = new Map<string, PeerSession>();
  private closed = false;
  private channel: ReturnType<ChannelFactory>;
  private timer: ReturnType<typeof setInterval>;
  private deviceChanged = () => { void this.catalog(); };

  constructor(private screenId: string, private status: (detail: string | null) => void,
    private deviceId = getLanternDeviceId(), channelFactory: ChannelFactory = createHostChannel) {
    this.channel = channelFactory((message) => {
      if (message.type === "room-camera") void this.receive(message).catch(() => {
        if (message.sessionId) this.end(message.sessionId, "Room camera connection failed. Try opening it again.");
      });
    });
    navigator.mediaDevices?.addEventListener("devicechange", this.deviceChanged);
    window.addEventListener("pagehide", this.pageHide);
    this.timer = setInterval(() => {
      for (const session of this.sessions.values()) {
        if (Date.now() - session.lastSeen > ROOM_TIMEOUT) this.end(session.id, "The room-camera viewer disconnected.");
      }
    }, 4_000);
  }

  private pageHide = () => this.close();
  private send(message: Omit<RoomCameraMessage, "type" | "screenId" | "from">) {
    if (!this.closed) this.channel.post({ ...message, type: "room-camera", screenId: this.screenId, from: this.endpointId } as RoomCameraMessage);
  }
  private async catalog(to?: string) {
    let devices: RoomComputer["devices"] = [];
    let error: string | undefined;
    try {
      if (!navigator.mediaDevices) throw new Error("Open the board using HTTPS and allow camera access on this display computer.");
      devices = (await navigator.mediaDevices.enumerateDevices())
        .filter((device) => device.kind === "videoinput" || device.kind === "audioinput")
        .map(({ deviceId, kind, label }) => ({ deviceId, kind, label }));
    } catch (cause) { error = cause instanceof Error ? cause.message : "Unable to list devices on this display computer."; }
    this.send({ op: "catalog", to, computer: { endpointId: this.endpointId, deviceId: this.deviceId, name: `${displayDeviceName()} · ${this.deviceId.slice(0, 8)}`, startedAt: this.startedAt, devices, error } } as Omit<RoomCameraMessage, "type" | "screenId" | "from">);
  }
  private async receive(message: RoomCameraMessage) {
    if (this.closed || message.screenId !== this.screenId) return;
    if (message.op === "discover") { await this.catalog(message.from); return; }
    if (message.to !== this.endpointId || !message.sessionId) return;
    if (message.op === "start") {
      if (this.sessions.has(message.sessionId)) return;
      // A new selection from one viewer replaces only that viewer's capture.
      for (const previous of this.sessions.values()) if (previous.remote === message.from) this.end(previous.id);
      const peer = new RTCPeerConnection({ iceServers });
      const session: PeerSession = { id: message.sessionId, remote: message.from, peer, candidates: [], lastSeen: Date.now() };
      this.sessions.set(session.id, session);
      this.status("Room camera requested — allow camera and microphone access on this computer.");
      peer.onicecandidate = ({ candidate }) => {
        if (candidate) this.send({ op: "candidate", to: session.remote, sessionId: session.id, candidate: candidate.toJSON() } as Omit<RoomCameraMessage, "type" | "screenId" | "from">);
      };
      peer.onconnectionstatechange = () => {
        if (peer.connectionState === "failed") this.end(session.id, "The room-camera connection failed. Check both computers' network connection.");
      };
      try {
        const lease = await mediaDeviceManager.acquire(`remote-room:${session.id}`, {
          video: { deviceId: message.capture.videoDeviceId, fallbackToDefault: false, required: true,
            constraints: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30, max: 30 } } },
          audio: message.capture.audio ? { deviceId: message.capture.audioDeviceId, fallbackToDefault: false, required: false } : false
        });
        if (this.closed || this.sessions.get(session.id) !== session) { lease.release(); return; }
        session.lease = lease;
        this.updateStatus();
        for (const track of lease.stream.getTracks()) {
          peer.addTrack(track, lease.stream);
          track.addEventListener("ended", () => this.end(session.id, "A room camera or microphone was disconnected at the display."), { once: true });
        }
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        if (this.sessions.get(session.id) !== session) return;
        this.send({ op: "offer", to: session.remote, sessionId: session.id, sdp: offer } as Omit<RoomCameraMessage, "type" | "screenId" | "from">);
        if (lease.issues.length) this.send({ op: "status", to: session.remote, sessionId: session.id, detail: lease.issues.map((issue) => formatMediaDeviceError(issue.error, { kind: issue.kind })).join(" ") } as Omit<RoomCameraMessage, "type" | "screenId" | "from">);
        await this.catalog();
      } catch (error) {
        this.end(session.id, `At the display computer: ${formatMediaDeviceError(error)} Select a connected device or allow access there, then retry.`);
      }
      return;
    }
    const session = this.sessions.get(message.sessionId);
    if (!session || message.from !== session.remote) return;
    if (message.op === "stop") { this.end(session.id); return; }
    if (message.op === "keepalive") { session.lastSeen = Date.now(); return; }
    if (message.op === "answer") { await session.peer.setRemoteDescription(message.sdp); await flushCandidates(session); }
    if (message.op === "candidate") await acceptCandidate(session, message.candidate);
  }
  private updateStatus() {
    const active = [...this.sessions.values()].filter((session) => session.lease);
    this.status(active.length ? `Room camera sharing${active.some((session) => session.lease!.stream.getAudioTracks().length) ? " · microphone on" : " · microphone off"}` : this.sessions.size ? "Waiting for camera permission on this computer…" : null);
  }
  private end(id: string, detail?: string) {
    const session = this.sessions.get(id);
    if (!session) return;
    this.sessions.delete(id);
    if (detail) this.send({ op: "status", to: session.remote, sessionId: id, detail } as Omit<RoomCameraMessage, "type" | "screenId" | "from">);
    this.send({ op: "stop", to: session.remote, sessionId: id });
    session.peer.close();
    session.lease?.release();
    this.updateStatus();
  }
  stopSharing = () => { for (const id of this.sessions.keys()) this.end(id, "Room camera sharing was stopped at the display computer."); };
  close() {
    if (this.closed) return;
    this.stopSharing();
    this.closed = true;
    clearInterval(this.timer);
    navigator.mediaDevices?.removeEventListener("devicechange", this.deviceChanged);
    window.removeEventListener("pagehide", this.pageHide);
    this.channel.close();
  }
}

export type RoomCameraSnapshot = { computers: RoomComputer[]; stream: MediaStream | null; error: string | null };
export class RoomCameraClient {
  private id = crypto.randomUUID();
  private computers = new Map<string, RoomComputer & { seenAt: number }>();
  private session: PeerSession | null = null;
  private snapshot: RoomCameraSnapshot = { computers: [], stream: null, error: null };
  private closed = false;
  private channel: ReturnType<ChannelFactory>;
  private timer: ReturnType<typeof setInterval>;
  private pending: { capture: RoomCapture; computerId?: string; requestedAt: number } | null = null;
  constructor(private screenId: string, private changed: (snapshot: RoomCameraSnapshot) => void, channelFactory: ChannelFactory = createHostChannel) {
    this.channel = channelFactory((message) => {
      if (message.type === "room-camera") void this.receive(message).catch(() => this.fail("Room camera connection failed. Refresh devices and try again."));
    });
    this.refresh();
    this.timer = setInterval(() => {
      this.refresh();
      for (const [id, computer] of this.computers) if (Date.now() - computer.seenAt > 12_000) this.computers.delete(id);
      this.publishComputers();
      if (this.session) {
        this.send({ op: "keepalive", to: this.session.remote, sessionId: this.session.id });
        if (Date.now() - this.session.lastSeen > 45_000 && !this.snapshot.stream) this.fail("The display did not connect. Allow camera access on its computer, then retry. If permission is already allowed, check the network connection.");
        else if (!this.computers.has(this.session.remote)) this.fail("The display computer disconnected. Reopen its board and try again.");
      }
      this.tryPending();
    }, 4_000);
    window.addEventListener("pagehide", this.pageHide);
  }
  private pageHide = () => this.close();
  private send(message: Omit<RoomCameraMessage, "type" | "screenId" | "from">) {
    if (!this.closed) this.channel.post({ ...message, type: "room-camera", screenId: this.screenId, from: this.id } as RoomCameraMessage);
  }
  private emit(patch: Partial<RoomCameraSnapshot>) {
    this.snapshot = { ...this.snapshot, ...patch };
    if (!this.closed) this.changed(this.snapshot);
  }
  private publishComputers() { this.emit({ computers: [...this.computers.values()].sort((a, b) => b.startedAt - a.startedAt) }); }
  refresh = () => this.send({ op: "discover" });
  start(capture: RoomCapture, computerId?: string) {
    this.stop();
    this.emit({ error: "Connecting to the display computer…" });
    this.pending = { capture, computerId, requestedAt: Date.now() };
    this.refresh();
    // Allow discovery replies from every open computer before choosing one.
    setTimeout(() => { if (!this.closed) this.tryPending(); }, 1_000);
  }
  private tryPending() {
    const pending = this.pending;
    if (!pending || Date.now() - pending.requestedAt < 900) return;
    const computers = [...this.computers.values()].sort((a, b) => b.startedAt - a.startedAt);
    const deviceIds = new Set(computers.map((computer) => computer.deviceId));
    if (!pending.computerId && deviceIds.size > 1) { this.fail("More than one computer has this board open. Choose the display computer in Room camera settings."); return; }
    const computer = computers.find((item) => !pending.computerId || item.deviceId === pending.computerId);
    if (!computer) {
      if (Date.now() - pending.requestedAt > 8_000) this.fail(pending.computerId ? "The assigned display computer is offline. Open this board there, or select its replacement in Room camera settings." : "No display computer is connected. Open this board on the computer attached to the screen, then refresh devices.");
      return;
    }
    this.pending = null;
    const peer = new RTCPeerConnection({ iceServers });
    const session: PeerSession = { id: crypto.randomUUID(), remote: computer.endpointId, peer, candidates: [], lastSeen: Date.now() };
    this.session = session;
    const stream = new MediaStream();
    peer.ontrack = ({ track }) => {
      if (this.session !== session) return;
      stream.addTrack(track);
      this.emit({ stream });
    };
    peer.onconnectionstatechange = () => {
      if (this.session !== session) return;
      if (peer.connectionState === "connected") this.emit({ error: this.snapshot.error === "Connecting to the display computer…" ? null : this.snapshot.error });
      if (peer.connectionState === "failed" || peer.connectionState === "disconnected") this.fail("The room-camera connection was interrupted. Check the display computer and retry.");
    };
    peer.onicecandidate = ({ candidate }) => {
      if (candidate && this.session === session) this.send({ op: "candidate", to: session.remote, sessionId: session.id, candidate: candidate.toJSON() } as Omit<RoomCameraMessage, "type" | "screenId" | "from">);
    };
    this.send({ op: "start", to: session.remote, sessionId: session.id, capture: pending.capture } as Omit<RoomCameraMessage, "type" | "screenId" | "from">);
  }
  private async receive(message: RoomCameraMessage) {
    if (this.closed || message.screenId !== this.screenId || (message.to && message.to !== this.id)) return;
    if (message.op === "catalog") {
      if (message.computer.endpointId !== message.from) return;
      this.computers.set(message.from, { ...message.computer, seenAt: Date.now() });
      this.publishComputers();
      return;
    }
    const session = this.session;
    if (!session || message.from !== session.remote || message.sessionId !== session.id) return;
    if (message.op === "status") { this.emit({ error: message.detail }); return; }
    if (message.op === "stop") { this.fail(this.snapshot.error && this.snapshot.error !== "Connecting to the display computer…" ? this.snapshot.error : "Room camera sharing stopped at the display."); return; }
    if (message.op === "offer") {
      await session.peer.setRemoteDescription(message.sdp);
      await flushCandidates(session);
      const answer = await session.peer.createAnswer();
      await session.peer.setLocalDescription(answer);
      if (this.session === session) this.send({ op: "answer", to: session.remote, sessionId: session.id, sdp: answer } as Omit<RoomCameraMessage, "type" | "screenId" | "from">);
    }
    if (message.op === "candidate") await acceptCandidate(session, message.candidate);
  }
  private fail(error: string) { this.stop(); this.emit({ error }); }
  stop = () => {
    this.pending = null;
    const session = this.session;
    this.session = null;
    if (session) {
      this.send({ op: "stop", to: session.remote, sessionId: session.id });
      session.peer.close();
    }
    this.snapshot.stream?.getTracks().forEach((track) => track.stop());
    this.emit({ stream: null, error: null });
  };
  close() {
    if (this.closed) return;
    this.stop();
    this.closed = true;
    clearInterval(this.timer);
    window.removeEventListener("pagehide", this.pageHide);
    this.channel.close();
  }
}
