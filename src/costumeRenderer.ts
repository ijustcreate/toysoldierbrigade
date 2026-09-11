import type { TrackingRenderFrame } from "./trackingRuntime";
import type {
  CostumeArtPiece,
  CostumeDefinition,
  TrackingAnchorPoint,
  TrackingCalibrationProfile
} from "./types";

type Point = { x: number; y: number };

const FACE_LANDMARK_INDEX: Partial<Record<TrackingAnchorPoint, number>> = {
  "left-eye": 33,
  "right-eye": 263,
  nose: 1,
  "mouth-upper": 13,
  "mouth-lower": 14,
  "left-ear": 234,
  "right-ear": 454,
  "head-left": 127,
  "head-right": 356,
  "head-top": 10,
  chin: 152
};

function pointInCanvas(point: { x: number; y: number } | undefined, width: number, height: number): Point | undefined {
  if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return undefined;
  const normalized = Math.abs(point.x) <= 1.5 && Math.abs(point.y) <= 1.5;
  return normalized ? { x: point.x * width, y: point.y * height } : { x: point.x, y: point.y };
}

function distance(a: Point | undefined, b: Point | undefined) {
  return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
}

function extensionPoint(frame: TrackingRenderFrame, anchor: TrackingAnchorPoint): { x: number; y: number } | undefined {
  const extensions = frame.extensionAnchors;
  switch (anchor) {
    case "left-ear": return extensions.leftEar;
    case "right-ear": return extensions.rightEar;
    case "head-left": return extensions.headLeft;
    case "head-right": return extensions.headRight;
    case "head-top": return extensions.headTop;
    case "chin": return extensions.chin;
    case "neck": return extensions.neck ?? frame.body?.neck;
    case "left-shoulder": return frame.body?.leftShoulder;
    case "right-shoulder": return frame.body?.rightShoulder;
    case "left-hand": return frame.hands.find((hand) => hand.side === "left")?.palm;
    case "right-hand": return frame.hands.find((hand) => hand.side === "right")?.palm;
    case "chest": {
      const neck = extensions.neck ?? frame.body?.neck;
      const left = frame.body?.leftShoulder;
      const right = frame.body?.rightShoulder;
      if (left && right) return { x: (left.x + right.x) / 2, y: (left.y + right.y) / 2 + Math.hypot(left.x - right.x, left.y - right.y) * .4 };
      return neck;
    }
    default: return undefined;
  }
}

function resolveAnchor(
  frame: TrackingRenderFrame,
  anchor: TrackingAnchorPoint,
  calibration?: TrackingCalibrationProfile
): Point | undefined {
  const raw = extensionPoint(frame, anchor)
    ?? (frame.face && FACE_LANDMARK_INDEX[anchor] !== undefined ? frame.face.landmarks[FACE_LANDMARK_INDEX[anchor]!] : undefined);
  const point = pointInCanvas(raw, frame.width, frame.height);
  if (!point) return undefined;
  const offset = calibration?.landmarkOffsets[anchor];
  return offset ? { x: point.x + offset.x * frame.width, y: point.y + offset.y * frame.height } : point;
}

function ellipse(context: CanvasRenderingContext2D, x: number, y: number, radiusX: number, radiusY: number, fill: string, stroke?: string, lineWidth = 2) {
  context.beginPath();
  context.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
  context.fillStyle = fill;
  context.fill();
  if (stroke) {
    context.strokeStyle = stroke;
    context.lineWidth = lineWidth;
    context.stroke();
  }
}

function roundedLine(context: CanvasRenderingContext2D, a: Point, b: Point, width: number, color: string, outline?: string) {
  context.lineCap = "round";
  if (outline) {
    context.beginPath();
    context.moveTo(a.x, a.y);
    context.lineTo(b.x, b.y);
    context.lineWidth = width + Math.max(2, width * .22);
    context.strokeStyle = outline;
    context.stroke();
  }
  context.beginPath();
  context.moveTo(a.x, a.y);
  context.lineTo(b.x, b.y);
  context.lineWidth = width;
  context.strokeStyle = color;
  context.stroke();
}

function rigRotation(
  costume: CostumeDefinition,
  boneId: string | undefined,
  nowMs: number,
  mouthOpen: number,
  visited = new Set<string>()
): number {
  if (!boneId || visited.has(boneId)) return 0;
  const bone = costume.bones.find((item) => item.id === boneId);
  if (!bone) return 0;
  visited.add(bone.id);
  const parentRotation = rigRotation(costume, bone.parentId, nowMs, mouthOpen, visited) * .42;
  const springMotion = bone.joint === "spring"
    ? Math.sin(nowMs / Math.max(180, 650 - bone.springiness * 360) + bone.id.length) * 12 * bone.springiness * (1 - bone.damping)
    : 0;
  const hingeMotion = bone.joint === "hinge" ? mouthOpen * 11 * bone.weight : 0;
  return parentRotation + (springMotion + hingeMotion) * bone.weight;
}

const spriteImages = new Map<string, HTMLImageElement>();
const sortedPieces = new WeakMap<CostumeDefinition, CostumeArtPiece[]>();

function spriteImage(source: string) {
  let image = spriteImages.get(source);
  if (!image && typeof Image !== "undefined" && /^assets\/[\w./-]+\.png$/.test(source) && !source.includes("..")) {
    if (spriteImages.size >= 32) spriteImages.delete(spriteImages.keys().next().value!);
    image = new Image();
    image.decoding = "async";
    image.src = `${import.meta.env.BASE_URL}${source}`;
    spriteImages.set(source, image);
  }
  return image?.complete && image.naturalWidth > 0 ? image : undefined;
}

function drawSprite(context: CanvasRenderingContext2D, image: HTMLImageElement, sprite: NonNullable<CostumeArtPiece["sprite"]>, width: number, height: number) {
  context.save();
  if (sprite.flipX) context.scale(-1, 1);
  context.drawImage(image, ...sprite.rect, -width * sprite.pivotX, -height * sprite.pivotY, width, height);
  context.restore();
}

function drawPiece(
  context: CanvasRenderingContext2D,
  frame: TrackingRenderFrame,
  costume: CostumeDefinition,
  piece: CostumeArtPiece,
  calibration: TrackingCalibrationProfile | undefined,
  faceScale: number,
  mouthOpen: number
) {
  const anchor = resolveAnchor(frame, piece.anchor, calibration);
  if (!anchor) return;
  const unit = Math.max(8, faceScale * piece.scale);
  const x = anchor.x + piece.x * faceScale;
  const y = anchor.y + piece.y * faceScale;
  const skeleton = costume.starter === "skeleton";
  const eyeOpen = piece.side === "left" ? frame.face?.leftEyeOpen ?? 1 : frame.face?.rightEyeOpen ?? 1;
  const bone = costume.bones.find((item) => item.id === piece.boneId);
  context.save();
  context.translate(x, y);
  context.rotate((piece.rotation + rigRotation(costume, piece.boneId, frame.nowMs, mouthOpen)) * Math.PI / 180);
  if (bone) context.globalAlpha = .5 + bone.weight * .5;
  context.lineJoin = "round";

  const image = piece.sprite && spriteImage(piece.sprite.source);
  if (image && piece.sprite) {
    if (piece.role === "forearm") {
      const arm = piece.side === "left" ? frame.body?.leftArm : frame.body?.rightArm;
      const elbow = pointInCanvas(arm?.elbow, frame.width, frame.height);
      const wrist = pointInCanvas(arm?.hand, frame.width, frame.height);
      context.restore();
      // Hide unobserved limbs instead of leaving a floating bone at the shoulder.
      if (!wrist) return;
      const joints = elbow ? [{ x, y }, elbow, wrist] : [{ x, y }, wrist];
      for (let i = 1; i < joints.length; i++) {
        const a = joints[i - 1], b = joints[i];
        context.save();
        context.translate((a.x + b.x) / 2, (a.y + b.y) / 2);
        context.rotate(Math.atan2(b.y - a.y, b.x - a.x) - Math.PI / 2);
        drawSprite(context, image, piece.sprite, unit * piece.sprite.width, Math.hypot(b.x - a.x, b.y - a.y));
        context.restore();
      }
      return;
    }
    // Face art turns with the eye line; jaw motion still follows its own anchor.
    if (frame.face && !["hand", "body"].includes(piece.role)) {
      const left = pointInCanvas(frame.face.landmarks[33], frame.width, frame.height);
      const right = pointInCanvas(frame.face.landmarks[263], frame.width, frame.height);
      if (left && right) context.rotate(Math.atan2(right.y - left.y, right.x - left.x));
    }
    const eyeScale = piece.role === "eye" ? Math.max(.08, eyeOpen) : 1;
    drawSprite(context, image, piece.sprite, unit * piece.sprite.width, unit * piece.sprite.height * eyeScale);
    context.restore();
    return;
  }

  switch (piece.role) {
    case "head-backplate":
      ellipse(context, 0, faceScale * .02, unit * 1.03, unit * 1.16, piece.color, piece.accentColor, Math.max(2, unit * .055));
      if (skeleton) {
        context.fillStyle = piece.accentColor ?? "#9fb6b7";
        context.beginPath();
        context.moveTo(-unit * .7, unit * .6);
        context.lineTo(-unit * .45, unit * 1.12);
        context.lineTo(unit * .45, unit * 1.12);
        context.lineTo(unit * .7, unit * .6);
        context.fill();
      }
      break;
    case "ear":
      ellipse(context, 0, 0, unit * .42, unit * .5, piece.color, piece.accentColor, Math.max(2, unit * .08));
      ellipse(context, 0, unit * .03, unit * .22, unit * .27, piece.accentColor ?? piece.color);
      break;
    case "cheek":
      ellipse(context, 0, 0, unit * .27, unit * .18, piece.color);
      break;
    case "muzzle":
      ellipse(context, 0, 0, unit * .56, unit * .42, piece.color, piece.accentColor, Math.max(1.5, unit * .04));
      break;
    case "nose":
      context.beginPath();
      context.moveTo(-unit * .18, -unit * .08);
      context.quadraticCurveTo(0, -unit * .2, unit * .18, -unit * .08);
      context.quadraticCurveTo(unit * .12, unit * .18, 0, unit * .22);
      context.quadraticCurveTo(-unit * .12, unit * .18, -unit * .18, -unit * .08);
      context.fillStyle = piece.color;
      context.fill();
      break;
    case "eye": {
      const open = Math.max(.08, Math.min(1, eyeOpen));
      ellipse(context, 0, 0, unit * .24, unit * (.06 + .21 * open), piece.color, piece.accentColor, Math.max(1.5, unit * .04));
      if (!skeleton) {
        ellipse(context, 0, unit * .02, unit * .09, unit * (.03 + .09 * open), piece.accentColor ?? "#26323a");
        ellipse(context, unit * .025, -unit * .025, unit * .025, unit * .025, "#ffffff");
      }
      break;
    }
    case "upper-eyelid":
      if (eyeOpen < .92) {
        context.beginPath();
        context.arc(0, 0, unit * .24, Math.PI, Math.PI * 2);
        context.lineWidth = Math.max(2, unit * .11 * (1 - eyeOpen));
        context.strokeStyle = piece.color;
        context.stroke();
      }
      break;
    case "lower-eyelid":
      if (eyeOpen < .55) {
        context.beginPath();
        context.arc(0, 0, unit * .22, 0, Math.PI);
        context.lineWidth = Math.max(2, unit * .07 * (1 - eyeOpen));
        context.strokeStyle = piece.color;
        context.stroke();
      }
      break;
    case "eyebrow":
      context.beginPath();
      context.moveTo(-unit * .22, unit * .04);
      context.quadraticCurveTo(0, -unit * .13, unit * .24, -unit * .01);
      context.strokeStyle = piece.color;
      context.lineWidth = Math.max(2, unit * .075);
      context.lineCap = "round";
      context.stroke();
      break;
    case "upper-mouth":
      context.beginPath();
      context.moveTo(-unit * .28, 0);
      context.quadraticCurveTo(-unit * .12, unit * .16, 0, unit * .02);
      context.quadraticCurveTo(unit * .12, unit * .16, unit * .28, 0);
      context.strokeStyle = piece.accentColor ?? piece.color;
      context.lineWidth = Math.max(2, unit * .07);
      context.lineCap = "round";
      context.stroke();
      if (skeleton) {
        for (let tooth = -2; tooth <= 2; tooth += 1) {
          context.fillStyle = piece.color;
          context.fillRect(tooth * unit * .1 - unit * .035, unit * .02, unit * .07, unit * .13);
        }
      }
      break;
    case "lower-mouth": {
      const openness = Math.max(.08, Math.min(1, mouthOpen));
      ellipse(context, 0, unit * openness * .18, unit * .31, unit * (.08 + openness * .3), piece.color, piece.accentColor, Math.max(1.5, unit * .05));
      if (!skeleton && openness > .3) ellipse(context, 0, unit * (.16 + openness * .19), unit * .19, unit * .08, piece.accentColor ?? "#e78376");
      break;
    }
    case "chin":
      context.beginPath();
      context.arc(0, 0, unit * .28, 0, Math.PI);
      context.strokeStyle = piece.color;
      context.lineWidth = Math.max(3, unit * .16);
      context.stroke();
      break;
    case "hand":
      if (skeleton) {
        ellipse(context, 0, 0, unit * .2, unit * .25, piece.color, piece.accentColor, Math.max(1.5, unit * .04));
        for (let finger = -2; finger <= 2; finger += 1) {
          const angle = (-Math.PI / 2) + finger * .19;
          roundedLine(context, { x: Math.cos(angle) * unit * .12, y: Math.sin(angle) * unit * .12 }, { x: Math.cos(angle) * unit * .58, y: Math.sin(angle) * unit * .58 }, Math.max(3, unit * .07), piece.color, piece.accentColor);
        }
      } else {
        ellipse(context, 0, 0, unit * .43, unit * .48, piece.color, piece.accentColor, Math.max(2, unit * .06));
        const hand = frame.hands.find((candidate) => candidate.side === piece.side);
        if (hand?.fingertips.length) {
          hand.fingertips.forEach((tip) => {
            const point = pointInCanvas(tip, frame.width, frame.height);
            if (!point) return;
            const target = { x: point.x - x, y: point.y - y };
            roundedLine(context, { x: target.x * .42, y: target.y * .42 }, { x: target.x * .74, y: target.y * .74 }, Math.max(2, unit * .085), piece.color, piece.accentColor);
            ellipse(context, target.x * .78, target.y * .78, unit * .09, unit * .12, piece.color, piece.accentColor, Math.max(1, unit * .025));
          });
        } else {
          for (let toe = -2; toe <= 2; toe += 1) ellipse(context, toe * unit * .14, -unit * .35, unit * .1, unit * .15, piece.color);
        }
      }
      break;
    case "palm":
      ellipse(context, 0, unit * .06, unit * .23, unit * .26, piece.color, piece.accentColor, Math.max(1, unit * .035));
      break;
    case "forearm": {
      const handAnchor = resolveAnchor(frame, piece.side === "left" ? "left-hand" : "right-hand", calibration);
      if (handAnchor) {
        context.restore();
        roundedLine(context, { x, y }, handAnchor, Math.max(4, faceScale * .12), piece.color, piece.accentColor);
        return;
      }
      break;
    }
    case "body":
      ellipse(context, 0, 0, unit * .92, unit * 1.16, piece.color, piece.accentColor, Math.max(3, unit * .06));
      ellipse(context, 0, unit * .08, unit * .52, unit * .7, piece.accentColor ?? piece.color);
      break;
    default:
      ellipse(context, 0, 0, unit * .25, unit * .25, piece.color, piece.accentColor);
  }
  context.restore();
}

/**
 * Renderer used by the tracking runtime after it has produced stabilized face,
 * hand, and body anchors. It intentionally owns no camera or MediaPipe state.
 */
export function renderCostumeOverlay(
  context: CanvasRenderingContext2D,
  frame: TrackingRenderFrame,
  costume: CostumeDefinition | undefined,
  calibration?: TrackingCalibrationProfile
) {
  if (!costume || !frame.face) return;
  const leftEye = resolveAnchor(frame, "left-eye", calibration);
  const rightEye = resolveAnchor(frame, "right-eye", calibration);
  const faceScale = Math.max(30, distance(leftEye, rightEye) * 1.38 || frame.width * .12);
  const upperMouth = resolveAnchor(frame, "mouth-upper", calibration);
  const lowerMouth = resolveAnchor(frame, "mouth-lower", calibration);
  const mouthOpen = Math.min(1, Math.max(0, distance(upperMouth, lowerMouth) / Math.max(1, faceScale * .48)));
  let pieces = sortedPieces.get(costume);
  if (!pieces) {
    pieces = costume.pieces.filter(piece => piece.visible).slice().sort((a, b) => a.zIndex - b.zIndex);
    sortedPieces.set(costume, pieces);
  }
  pieces.forEach((piece) => drawPiece(context, frame, costume, piece, calibration, faceScale, mouthOpen));
}
