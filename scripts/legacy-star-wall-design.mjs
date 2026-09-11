/** Opt-in content authoring only. Never import from startup or a migration. */
export const LEGACY_WALL_ID = 'board-legacy-stars-photo-1';
export const WALL_ASSETS = {
  wall: 'blue-painted-wall-portrait-v2.png',
  star: 'yellow-painted-wood-star-v2.png',
};
export const localWallAssets = Object.fromEntries(Object.entries(WALL_ASSETS)
  .map(([key, file]) => [key, `/assets/legacy-star-wall-v2/${file}`]));

// Coordinates describe visible art/text, compensating for the standard panel's
// 6px padding + 1px border on the existing 405 × 720 portrait canvas.
function panel(id, type, title, x, y, width, height, options = {}) {
  return { id, type, title, size: 'standard', x: x - 7 / 405 * 100,
    y: y - 7 / 720 * 100, width: width + 14 / 405 * 100,
    height: height + 14 / 720 * 100, ...options };
}
function text(id, title, x, y, width, height, fontSize, options = {}) {
  return panel(id, 'text', title, x, y, width, height, {
    fontFamily: 'DM Sans', fontSize, fontWeight: 'bold', textColor: '#162e4d',
    lineHeight: 1.08, letterSpacing: 0, textAlign: 'center', textFlow: 'wrap',
    textFinish: 'flat', textShadowEnabled: false, ...options,
  });
}

export function buildLegacyWoodWall(source, urls = localWallAssets) {
  if (source.orientation !== 'Portrait') throw new Error('This layout requires portrait.');
  if (source.donorIds.length !== 22 || new Set(source.donorIds).size !== 22)
    throw new Error('The reviewed single-page layout requires exactly 22 distinct donors.');
  const labels = source.donorIds.map(id => {
    const matches = source.panels.filter(p => p.type === 'text' &&
      [id + '-star-text', id + '-wood-label'].includes(p.id));
    if (matches.length !== 1 || !matches[0].title.trim())
      throw new Error(`Missing or ambiguous authored donor label: ${id}`);
    return { id, title: matches[0].title };
  });
  const panels = [
    text(source.id + '-wood-heading', source.heading, 4, 2.4, 92, 4.7, 25,
      { textColor: '#fff6ce', fontFamily: 'Fredoka', fontWeight: 'normal', letterSpacing: .8 }),
    text(source.id + '-wood-subtitle', source.subtitle, 8, 7.1, 84, 2.3, 8.5,
      { textColor: '#f8df85', fontWeight: 'normal', letterSpacing: 1.8 }),
  ];
  // Four generous stars per row; center the last two. Regular rhythm makes the
  // complete historical wall easy to read without pagination or scrolling.
  labels.forEach(({ id, title }, index) => {
    const row = Math.floor(index / 4), column = index % 4;
    const x = 3.6 + (column + (row === 5 ? 1 : 0)) * 23.5;
    const y = 11 + row * 14;
    const width = 22.3, height = width * 405 / 720;
    const groupId = id + '-wood-group';
    panels.push(panel(id + '-wood-art', 'image', 'Painted wooden recognition star', x, y, width, height,
      { imageUrl: urls.star, imageFit: 'contain', imageRotation: 0, groupId }));
    panels.push(text(id + '-wood-label', title,
      x + width * .245, y + height * .355, width * .51, height * .365,
      title.includes('/') || title.length > 28 ? 6.8 : title.length > 20 ? 7.3 : 8.2, { groupId }));
  });
  // The existing footer is retained as metadata; the full canvas goes to names.
  return { ...source, panels, backgroundMode: 'image', backgroundImage: urls.wall,
    backgroundCrop: { x: 50, y: 50, scale: 1, rotation: 0 }, backgroundColor: '#285b96',
    showFrame: false, showMatting: false, donorScrollEnabled: false };
}

/** Deliberately invented data; never use museum state as a mutation-test seed. */
export function syntheticLegacyWall() {
  const names = ['COUNTY LEARNING CENTER COMMUNITY', 'THE 2026 CLUB', 'Bank of Discovery',
    'Cedar and Maple Family', 'Whitestone-Hillside Engineers', 'Mr. Explorer',
    'Willow Family (?)', 'JORDAN MARLOW FAMILY', 'Robin & Morgan Meadow',
    'DALE & ALEX RIVERSTONE', 'ROWAN ASH (?)', 'Brooks/Woods (?)',
    'Community Learning Agency', 'Cedar Family Creative Interiors',
    "Pat Meadow's Annual Reading Club", 'Taylor & Casey Evergreen',
    'The Brook Family', 'Sky & River Families', 'Alexandra Evergreen (?)',
    'THE ORCHARD FAMILY', 'ROBIN FIELD', 'CASEY WOOD'];
  const donorIds = names.map((_, index) => `synthetic-star-${index}`);
  return { id: 'synthetic-legacy-wood-wall', name: 'Synthetic painted-star wall',
    orientation: 'Portrait', heading: 'LEGACY DONORS', subtitle: 'A WALL OF GRATITUDE',
    footer: 'Synthetic fixture', active: true, columns: 1, donorIds,
    panels: names.map((title, index) => ({ id: donorIds[index] + '-star-text', type: 'text', title })) };
}
