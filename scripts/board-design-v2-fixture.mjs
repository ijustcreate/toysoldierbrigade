import { SOURCE_IDS, ASSETS, buildBoardVersions } from "./board-design-v2.mjs";

/** Invented test content only. No production snapshot is ever seeded into tests. */
export function designFixture() {
  const donors = Array.from({ length: 73 }, (_, index) => ({
    id: `fixture-donor-${index}`, name: index % 3 === 0 ? `Alexandra ${index}\nand\nChristopher Example` : `Museum Supporter ${index}`,
    active: true, tier: index < 6 ? "Explore" : index < 31 ? "Play" : "Legacy donor",
    givingProgramId: index < 31 ? "toy-soldier-brigade" : undefined,
    givingLevelId: index < 6 ? "explore" : index < 31 ? "play" : undefined,
    category: "Fixture", since: "2026", note: "Synthetic layout test"
  }));
  const givingPrograms = [{ id: "toy-soldier-brigade", classLabel: "Class of 2026", levels: [
    { id: "explore", name: "Explore", description: "$5,000 each year for five years" },
    { id: "play", name: "Play", description: "$1,000 each year for five years" }
  ] }];
  const boardPrograms = SOURCE_IDS.map((id) => {
    const legacy = id.includes("legacy"), spotlight = id.includes("spotlight");
    const story = /about|good-deeds/.test(id);
    const members = spotlight ? donors.slice(4, 5) : legacy ? donors.slice(31) : id.includes("explore") ? donors.slice(0, 6) : id.includes("play-") ? donors.slice(6, 31) : donors.slice(0, 31);
    const board = { id, name: id, orientation: id.endsWith("landscape") || id.endsWith("photo-2") ? "Landscape" : "Portrait",
      heading: story ? "A lifetime of imagination" : spotlight ? "Supporter spotlight" : "Our generous donors",
      subtitle: spotlight ? "ALEXANDRA EXAMPLE" : "CLASS OF 2026", description: "A museum made possible by our community.",
      footer: "With gratitude to every member of the Class of 2026.", donorIds: story ? [] : members.map((donor) => donor.id), active: true,
      panels: [] };
    if (id.includes("legacy-stars")) {
      board.donorIds = members.slice(0, id.endsWith("1") ? 22 : 20).map((donor) => donor.id);
      board.panels = board.donorIds.flatMap((donorId, index) => [
        { id: `${donorId}-star-image`, type: "image", title: "Recognition star", imageUrl: "/assets/donor-icons/legacy-star-flat.svg" },
        { id: `${donorId}-star-text`, type: "text", title: `A very generous community foundation ${index}` }
      ]);
    } else if (story || spotlight) {
      board.panels = Array.from({ length: spotlight ? 1 : id.includes("good-deeds") ? 4 : 3 }, (_, index) => ({
        id: `message-${index}`, type: "message", eyebrow: index ? "MAKE ROOM" : "PHILANTHROPY WITH PURPOSE",
        title: index ? "Invite someone to play" : "Steady support. More room to imagine.",
        body: spotlight ? "Our generous supporter helps the museum as a financial donor, including gifts in memory of friends; a museum tour ambassador; and a host for our community events. Their support makes a lasting difference for children and families throughout our city." : index ? "Curiosity grows when everyone gets a turn. Small acts of care make every space more welcoming." : "A multi-year giving society of pledged support of $1,000+ per year for five years in unrestricted funds."
      }));
    } else board.panels = [{ id: "list", type: "donors", title: "Donors" }];
    return board;
  });
  return { donors, givingPrograms, boardPrograms, schedules: [{ id: "untouched" }], screens: { unchanged: true } };
}

export function fixtureVersions() {
  const state = designFixture();
  return { ...state, boardPrograms: buildBoardVersions(state, Object.fromEntries(Object.entries(ASSETS).map(([key, file]) => [key, `/assets/boards-v2/${file}`]))) };
}
