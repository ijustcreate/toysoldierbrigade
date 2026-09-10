# Museum collection V2 artwork

Generated with Codex's built-in OpenAI image-generation tool, September 9, 2026. These are background assets, not flattened donor boards. Typography, donor names, headings, and recognition levels remain native editable board elements and render at the TV's resolution.

The returned PNGs are approximately 1672 × 941 (landscape) and 940 × 1672 (portrait), **not native 4K bitmaps**. Their intentionally quiet textures scale behind live text. Review on the physical TVs before choosing final viewing distances.

## Prompt set

### toy-soldier-navy-landscape-v2.png

Stylized-concept; flat 16:9 background for large 4K museum signage, not a mockup. Midnight navy bookcloth with fine fibres, restrained antique brass edge, soft lighting. Miniature painted wooden toy soldiers and play blocks in museum red, blue, yellow at bottom corners. Quiet central 88% and upper 86%. No weapons, military realism, text, letters, numbers, logos, or watermark. Generated artwork contains larger corner ornaments than requested; reserve those areas in layouts.

### toy-soldier-navy-portrait-v2.png

Matching 9:16 portrait composition using the landscape artwork as a style reference. Same midnight navy material and brass detailing. Tiny painted wooden toy soldiers and blocks at the bottom corners; quiet central 90% and upper 88%. No typography, names, logos, watermarks, weapons, or realistic military imagery. Wide honor rolls intentionally use the central crop of this background, omitting the ornaments to maximize readable space.

### museum-ivory-landscape-v2.png

Use case: stylized-concept. Asset type: a finished flat 16:9 background artwork for editable children's museum information boards, not a mockup or a picture of a television. Create a quietly beautiful warm ivory handmade paper surface, delicate natural cotton fibres, soft ambient light, exquisitely subtle embossed arcs suggesting play and discovery. A tiny arrangement of tactile painted wooden play blocks in museum red, soft blue and golden yellow at the extreme bottom right corner ONLY, confined to the bottom 12 percent and rightmost 15 percent. Extremely restrained, premium museum exhibition graphic, not a party invitation. The entire upper 85 percent and central 85 percent must be nearly uniform light cream and free of objects to support dark editable text. Fine warm gold hairline around outermost edge. No text, numbers, letters, logos, people, watermark or typography. Landscape 3840 by 2160 intent; highest available detail.

## Use and safety

Final story-board asset: **museum-ivory-petite-landscape-v2.png**, a non-destructive refinement of the ivory background. Edit prompt: Keep the ivory paper, texture, warm light, gold hairline border, full landscape canvas, and blank space unchanged. Reduce the colored wooden blocks together to one third of their current width and height, anchored at the extreme bottom-right; all colored objects below 90% of image height and right of 90% of image width. Fill the former large area with matching clean ivory paper. Keep embossed arcs faint. No letters, words, numbers, logos, or watermark. The earlier ivory variant is retained, but is not used behind body text.

- `scripts/board-design-v2.mjs` authors separate V2 boards; it never runs automatically.
- All new boards are review drafts in **V2 · Museum collection**, with no TV assignment or schedule changes.
- `scripts/publish-board-design-v2.mjs` defaults to read-only preparation. Publishing requires the explicit `--publish-new-boards` flag and the verified service endpoint.
- The publication path backs up raw current state, appends only new boards, uses the state-version precondition, and rejects collisions. It does not restore defaults or update original boards.
- Private backups, upload receipts, and publication receipts stay in ignored `output/board-design-v2/`.
- Independent Pingfusi review was unavailable; the user explicitly chose locally checked previews for their own approval.
