# Legacy Star Wall — painted wood edition

Generated with the built-in OpenAI image generation tool on 2026-09-10 UTC.
These are project-owned copies; original generated files are retained.

- blue-painted-wall-portrait-v2.png: 940 × 1672 RGB background texture.
- yellow-painted-wood-star-v2.png: 1254 × 1254 RGBA, genuine transparent cutout.

The wall texture is scaled to the screen; it is not a native 4K bitmap. The repeated
star source exceeds each star's displayed pixel dimensions at 2160 × 3840, and all
donor names remain native editable text, rendered at the display resolution.

## Exact prompts

### Wall

Use case: photorealistic-natural. Asset type: portrait 9:16 background texture for a large 4K museum donor recognition display. Generate only a beautiful freshly painted blue wall, photographed perfectly straight on, filling the entire frame, no perspective tilt. Rich welcoming medium cobalt blue acrylic wall paint, extremely subtle roller stipple and fine matte plaster texture, tactile but quiet, clean and well maintained. Soft diffuse gallery lighting from upper left, almost even color with a very subtle natural light falloff. No vignette, no hotspots, no dark border. No objects, no stars, no lettering, no frame, no floor, no watermarks. This is a compositing background: wooden yellow stars and live editable names will be overlaid separately. Maximum available image detail, portrait 2160 by 3840 composition.

### Star

Use case: product-mockup. Asset type: transparent PNG cutout for a museum donor recognition wall. One single chunky five-point wooden star, viewed perfectly straight on, one point exactly upright, symmetrical broad friendly star with a generously wide flat center for donor lettering to be added later. Entire star visible centered, filling 94 percent of a square frame. Real hand-cut solid plywood about 12 mm thick, face painted warm bright buttercup yellow with very fine subtle visible wood grain and tiny brush marks beneath satin-matte paint. Neatly sanded slightly softened edges, subtle darker golden yellow wooden side edge visible toward lower right for real depth. Soft upper-left gallery lighting, delicate short soft cast shadow immediately behind the lower-right edge. Front face flat and evenly yellow so dark text will read clearly. Photorealistic tactile craft material, not a flat vector icon, not shiny plastic, not a beveled metal star, no face, no text, no other objects, no watermark. Genuinely transparent alpha background, never a checkerboard painted into the image, no colored or white background. Maximum available detail, square composition.

## Use

Authoring-only helper: scripts/legacy-star-wall-design.mjs. Never run as a migration
or deployment seed. Preserve exact donor labels and the existing board identity.
Each star and label is a group of ordinary image/text panels; no legacy star renderer.
