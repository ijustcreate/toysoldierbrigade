import type { CostumeArtPiece, CostumeDefinition } from "./types";

const source = "assets/characters/cute-skeleton/cute-skeleton-parts-v01.png";
function art(id: string, role: CostumeArtPiece["role"], anchor: CostumeArtPiece["anchor"], rect: [number, number, number, number], width: number, zIndex: number, options: Partial<CostumeArtPiece> = {}): CostumeArtPiece {
  return { id, name: id.replace(/-/g, " "), role, anchor, color: "#fff2d7", accentColor: "#44364d", x: 0, y: 0, scale: 1, rotation: 0, zIndex, visible: true,
    sprite: { source, rect, width, height: width * rect[3] / rect[2], pivotX: .5, pivotY: .5 }, ...options };
}

/** Optional new starter; never substitutes for an existing saved costume. */
export const cuteSkeletonStarter: CostumeDefinition = {
  id: "costume-cute-skeleton-v01", name: "Cute Skeleton", starter: "skeleton",
  conceptArt: source,
  description: "Painted toy bones with turquoise eyes, a talking jaw and a lavender heart. Head, torso and hands are tracked; arm segments use shoulder/elbow/wrist estimates. Leg assets are supplied for future full-body support.",
  createdAt: "2026-09-10T00:00:00.000Z", updatedAt: "2026-09-10T00:00:00.000Z",
  bones: [
    { id: "head", name: "Skull", anchor: "nose", joint: "ball", weight: 1, springiness: .18, damping: .84 },
    { id: "jaw", name: "Talking jaw", anchor: "mouth-lower", parentId: "head", joint: "hinge", weight: 1, springiness: .3, damping: .78 }
  ],
  pieces: [
    art("ribcage", "body", "chest", [596,288,208,244], 1.9, 0),
    art("skull", "head-backplate", "nose", [57,43,221,230], 1.65, 2, { boneId: "head", y: -.28 }),
    art("eye-left", "eye", "left-eye", [606,66,189,186], .45, 5, { side: "left" }),
    art("eye-right", "eye", "right-eye", [877,66,190,186], .45, 5, { side: "right" }),
    art("nose", "nose", "nose", [120,367,95,100], .22, 6),
    art("smile", "upper-mouth", "mouth-upper", [350,391,171,61], .62, 8),
    art("jaw", "lower-mouth", "mouth-lower", [333,113,205,140], .84, 7, { boneId: "jaw", y: .15 }),
    art("arm-left", "forearm", "left-shoulder", [662,559,77,230], .22, 1, { side: "left", inferred: true }),
    art("arm-right", "forearm", "right-shoulder", [934,559,77,230], .22, 1, { side: "right", inferred: true }),
    art("hand-left", "hand", "left-hand", [65,833,201,216], .72, 10, { side: "left" }),
    art("hand-right", "hand", "right-hand", [332,833,197,216], .72, 10, { side: "right", sprite: { source, rect: [332,833,197,216], width: .72, height: .72 * 216 / 197, pivotX: .5, pivotY: .5, flipX: true } })
  ]
};
