/** Pure, opt-in board authoring. Never imported by startup or a data migration. */
export const COLLECTION = "V2 · Museum collection";
export const EDITION = "20260909";
export const ASSETS = {
  navy: "toy-soldier-navy-portrait-v2.png",
  celebration: "toy-soldier-navy-landscape-v2.png",
  ivory: "museum-ivory-petite-landscape-v2.png"
};
export const SOURCE_IDS = [
  "board-toy-soldier-portrait", "board-toy-soldier-landscape",
  "board-toy-explore-portrait", "board-toy-explore-landscape",
  "board-toy-play-portrait", "board-toy-play-landscape",
  "board-toy-about-portrait", "board-toy-about-landscape",
  "board-toy-good-deeds-portrait", "board-toy-good-deeds-landscape",
  "board-supporter-spotlight-portrait", "board-supporter-spotlight-landscape",
  "board-supporter-spotlight-partnership-portrait", "board-supporter-spotlight-partnership-landscape",
  "board-legacy-stars-photo-1", "board-legacy-stars-photo-2",
  "board-legacy-donors-portrait", "board-generous-toy-soldier-portrait",
  "board-generous-legacy-portrait", "board-1788684957307"
];
const INK = "#132d40", WHITE = "#fff8e9", GOLD = "#edcc86", TEAL = "#245f70";
const unique = (items) => [...new Set(items)];

function canvas(source, urls, dark = true, page = 0) {
  const id = `board-v2-${source.id.replace(/^board-/, "")}-${EDITION}${page ? `-page-${page}` : ""}`;
  return {
    id, name: `V2 · ${source.name}${page ? ` · Page ${page}` : ""}`,
    orientation: source.orientation, heading: source.heading ?? "", subtitle: source.subtitle ?? "",
    description: source.description ?? "", footer: source.footer ?? "", columns: 2,
    donorIds: [], active: false, panels: [{ id: `${id}-museum-logo`, type: "image", title: "Children's Museum logo", size: "standard",
      x: source.orientation === "Portrait" ? 33 : 44.75, y: source.orientation === "Portrait" ? 0.8 : 0.7,
      width: source.orientation === "Portrait" ? 34 : 10.5, height: 6,
      imageUrl: "/assets/childrens-museum-stockton.png", imageFit: "contain" }], fontFamily: "DM Sans", nameSize: 18,
    donorScrollEnabled: false, showIcons: false, showSubtext: false,
    backgroundMode: "image", backgroundImage: dark ? source.orientation === "Portrait" ? urls.navy : urls.celebration : urls.ivory,
    // The wide crop of the tall navy artwork intentionally excludes the corner ornaments.
    backgroundCrop: { scale: 1, x: 50, y: 50, rotation: 0 },
    backgroundColor: dark ? "#101e2b" : "#f3e8d5", showFrame: true,
    frameColor: "#a58b51", frameThickness: 2, frameFinish: "simple", showMatting: false,
    givingProgramId: source.givingProgramId, folder: COLLECTION,
    templatePurpose: source.templatePurpose ?? "roster", palette: dark ? "legacy-navy" : "brigade-cream"
  };
}

function text(board, label, value, x, y, width, height, fontSize, options = {}) {
  if (!value) return;
  // Layout coordinates describe the text area. Allow for the existing editor's
  // fixed panel padding without changing its CSS or any previously saved board.
  const portrait = board.orientation === "Portrait";
  const insetX = portrait ? 1.5 : 1.4, insetY = portrait ? .84 : 2.5;
  board.panels.push({
    id: `${board.id}-${label}`, type: "text", title: value, size: "standard",
    x: x - insetX, y: y - insetY, width: width + insetX * 2, height: height + insetY * 2,
    fontSize, fontFamily: "DM Sans", lineHeight: 1.15,
    textColor: WHITE, textAlign: "center", fontWeight: "normal", textFinish: "flat",
    textShadowEnabled: false, ...options
  });
}

function list(board, label, ids, x, y, width, height, columns, fontSize, dark = true) {
  if (!ids.length) return;
  board.donorIds = unique([...board.donorIds, ...ids]);
  board.panels.push({
    id: `${board.id}-${label}`, type: "donors", title: label, size: "standard",
    donorIds: [...ids], columns, rows: Math.ceil(ids.length / columns),
    x, y, width, height, fontSize, fontFamily: "DM Sans", lineHeight: 1.08,
    textColor: dark ? WHITE : INK, textAlign: "center", showIcons: false,
    donorRowGap: 4, donorColumnGap: 5, donorDividerThickness: 0,
    donorDividerColor: dark ? GOLD : TEAL, donorDividerOpacity: 20,
    donorPresentation: { fontFamily: "DM Sans", nameColor: dark ? WHITE : INK,
      accentColor: dark ? GOLD : TEAL, highlight: "none", recognitionIcon: "none", animation: "none" }
  });
}

function header(board, title, subtitle, dark = true, dense = false) {
  const portrait = board.orientation === "Portrait";
  text(board, "museum", "CHILDREN’S MUSEUM OF STOCKTON", 6, 3, 88, 5, portrait ? 9 : 12,
    { textColor: dark ? GOLD : TEAL, letterSpacing: portrait ? 1 : 2 });
  text(board, "heading", title, 5, portrait && dense ? 7 : 8, 90, portrait ? dense ? 8 : 10 : 12, portrait ? 29 : 40,
    { fontFamily: "Cormorant Garamond", textColor: dark ? WHITE : INK, lineHeight: 1.02 });
  text(board, "subtitle", subtitle, 6, portrait ? dense ? 15 : 18 : 20, 88, portrait && dense ? 4 : 5, portrait ? 11 : 15,
    { textColor: dark ? GOLD : TEAL, letterSpacing: .5 });
}

function footer(board, value, dark = true) {
  text(board, "footer", value, 20, 91, 60, 6, board.orientation === "Portrait" ? 9 : 12,
    { textColor: dark ? GOLD : TEAL, fontFamily: "Lora", lineHeight: 1.15 });
}

function roster(source, state, urls) {
  const board = canvas(source, urls);
  const portrait = source.orientation === "Portrait";
  const complete = /toy-soldier|generous-toy/.test(source.id) || source.id === "board-1788684957307";
  const society = state.givingPrograms.find((program) => program.id === "toy-soldier-brigade");
  const donors = complete
    ? state.donors.filter((donor) => donor.givingProgramId === society?.id)
    : source.donorIds.map((id) => state.donors.find((donor) => donor.id === id)).filter(Boolean);
  if (complete && !society) throw new Error("Toy Soldier Brigade membership is unavailable; refusing an incomplete honor roll.");
  header(board, complete ? "Toy Soldier Brigade" : source.heading, complete ? society.classLabel : source.subtitle, true, complete);
  if (complete) {
    const groups = society.levels.map((level) => ({ level, donors: donors.filter((donor) => donor.givingLevelId === level.id) })).filter((group) => group.donors.length);
    const covered = new Set(groups.flatMap((group) => group.donors.map((donor) => donor.id)));
    if (groups.length !== 2 || donors.some((donor) => !covered.has(donor.id))) throw new Error("Review new giving levels before laying out the full roster.");
    groups.forEach(({ level, donors: members }, index) => {
      const x = portrait ? 5 : index === 0 ? 4 : 35;
      const width = portrait ? 90 : index === 0 ? 30 : 61;
      const y = portrait ? index === 0 ? 20 : 42 : 27;
      text(board, `level-${index}`, `${level.name.toUpperCase()} LEVEL`, x, y, width, 5, portrait ? 14 : 19, { textColor: GOLD, letterSpacing: 1 });
      text(board, `pledge-${index}`, level.description, x, y + 4, width, 5, portrait ? 10 : 13, { textColor: GOLD });
      list(board, `${level.name} donors`, members.map((donor) => donor.id), x, y + 9, width,
        portrait ? index === 0 ? 13 : 38 : 51, portrait ? index === 0 ? 2 : 3 : index === 0 ? 1 : 3, portrait ? 15 : 23);
    });
    footer(board, source.footer || `With gratitude to every member of the ${society.classLabel}.`);
  } else {
    const columns = portrait ? donors.length > 9 ? 2 : 1 : donors.length > 15 ? 3 : 2;
    if (donors.length <= 6 && !portrait) board.backgroundImage = urls.celebration;
    list(board, "Honor roll", donors.map((donor) => donor.id), portrait ? 6 : donors.length <= 6 ? 22 : 5,
      28, portrait ? 88 : donors.length <= 6 ? 56 : 90, portrait ? 60 : 59, columns,
      portrait ? donors.length > 30 ? 16 : 22 : 26);
    footer(board, source.footer || "With gratitude from the Children’s Museum of Stockton.");
  }
  return [board];
}

function story(source, urls) {
  const board = canvas(source, urls, false);
  const portrait = source.orientation === "Portrait";
  const groups = (source.panels ?? []).filter((panel) => ["message", "story"].includes(panel.type));
  header(board, source.heading, source.subtitle, false);
  // Each legacy three-part panel becomes independent, ordinary editable text boxes.
  groups.forEach((group, index) => {
    const lead = index === 0;
    const remaining = Math.max(1, groups.length - 1);
    const x = portrait || lead ? 7 : 6 + (index - 1) * (88 / remaining);
    const y = lead ? 27 : portrait ? 48 + (index - 1) * (38 / remaining) : 55;
    const width = portrait || lead ? 86 : 88 / remaining - 3;
    const blockHeight = lead ? 20 : portrait ? 38 / remaining : 28;
    text(board, `eyebrow-${index}`, group.eyebrow, x, y, width, 4, portrait ? 9 : 11, { textColor: TEAL, letterSpacing: 1 });
    text(board, `title-${index}`, group.title, x, y + 3.5, width, blockHeight * .39, portrait ? lead ? 23 : 19 : lead ? 30 : 24,
      { textColor: INK, fontFamily: "Cormorant Garamond", fontWeight: "bold" });
    text(board, `body-${index}`, group.body, x, y + 3.5 + blockHeight * .39, width, blockHeight * .48,
      portrait ? 13 : !lead && remaining >= 3 ? 13 : 17, { textColor: INK, lineHeight: 1.28 });
  });
  footer(board, source.footer, false);
  return [board];
}

function spotlight(source, urls) {
  const board = canvas(source, urls, false);
  const portrait = source.orientation === "Portrait";
  const partnership = source.id.includes("partnership");
  header(board, source.heading, partnership ? source.description : "WEALTH · WISDOM · WORK", false);
  const photo = source.panels?.find((panel) => panel.type === "image" && !/accent|placeholder/.test(`${panel.title} ${panel.imageUrl}`));
  if (photo) board.panels.push({ ...photo, id: `${board.id}-portrait`, x: portrait ? 25 : 7, y: 28, width: portrait ? 50 : 28, height: portrait ? 25 : 49, imageFit: "contain" });
  const x = !portrait && photo ? 39 : 9, width = !portrait && photo ? 54 : 82;
  const start = portrait && photo ? 55 : 30;
  if (partnership) list(board, "Recognized supporters", source.donorIds, x, start, width, 15, 1, portrait ? 29 : 45, false);
  else text(board, "name", source.subtitle, x, start, width, 14, portrait ? 34 : 49, { fontFamily: "Cormorant Garamond", textColor: INK });
  const messages = source.panels?.filter((panel) => panel.type === "message") ?? [];
  const longMessage = [...messages].sort((a, b) => (b.body?.length ?? 0) - (a.body?.length ?? 0))[0];
  text(board, "story-heading", partnership ? longMessage?.title : "A champion for the power of play", x, start + 15, width, 8, portrait ? 22 : 29, { fontFamily: "Cormorant Garamond", textColor: TEAL });
  text(board, "story-body", longMessage?.body || source.description, x, start + 24, width, portrait && photo ? 8 : 27,
    portrait ? 17 : 23, { textColor: INK, lineHeight: 1.35 });
  board.donorIds = [...source.donorIds];
  footer(board, source.panels?.find((panel) => panel.type === "footer")?.title || source.footer, false);
  return [board];
}

function stars(source, urls) {
  const pairs = (source.panels ?? []).filter((panel) => panel.type === "text");
  const pageSize = 12, pageCount = Math.ceil(pairs.length / pageSize);
  return Array.from({ length: pageCount }, (_, pageIndex) => {
    const board = canvas(source, urls, true, pageIndex + 1);
    const portrait = source.orientation === "Portrait";
    const columns = portrait ? 3 : 4, rows = portrait ? 4 : 3;
    header(board, "Our Legacy Stars", `A lasting place in our story · ${pageIndex + 1} / ${pageCount}`);
    pairs.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize).forEach((label, index) => {
      const x = 6 + index % columns * 88 / columns, y = 27 + Math.floor(index / columns) * 61 / rows;
      const width = 88 / columns - 2, cellHeight = 61 / rows;
      const image = source.panels.find((panel) => panel.type === "image" && panel.id === label.id.replace(/-text$/, "-image"));
      if (image) board.panels.push({ ...image, id: `${board.id}-image-${index}`, x: x + width * .3, y, width: width * .4, height: cellHeight * .43, imageFit: "contain" });
      text(board, `label-${index}`, label.title, x, y + cellHeight * .4, width, cellHeight * .56, portrait ? 11 : 17, { textColor: WHITE });
    });
    board.donorIds = source.donorIds.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
    footer(board, "Honoring the generosity that helped build our museum.");
    return board;
  });
}

export function buildBoardVersions(state, urls, sourceIds = SOURCE_IDS) {
  const existing = new Set(state.boardPrograms.map((board) => board.id));
  return state.boardPrograms.filter((board) => sourceIds.includes(board.id)).flatMap((source) => {
    if (source.id.includes("legacy-stars")) return stars(source, urls);
    if (source.id.includes("spotlight")) return spotlight(source, urls);
    if (source.panels?.some((panel) => panel.type === "donors")) return roster(source, state, urls);
    return story(source, urls);
  }).filter((board) => !existing.has(board.id));
}

/** The sole approved change is appending boards. No normalization of live data. */
export function appendBoardVersions(state, boards) {
  const ids = new Set(state.boardPrograms.map((board) => board.id));
  if (boards.some((board) => ids.has(board.id)) || new Set(boards.map((board) => board.id)).size !== boards.length) throw new Error("Duplicate board ID; refusing to overwrite a board.");
  return { ...state, boardPrograms: [...state.boardPrograms, ...boards] };
}
