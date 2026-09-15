export interface DonorRosterDonor {
  id: string;
  name: string;
  tier?: string;
  tags?: string[];
  donationType?: string;
  givingProgramId?: string;
  givingLevelId?: string;
}

/** Explicit checkbox selections take precedence over automatic roster filters. */
export function resolvePanelDonors<T extends DonorRosterDonor & { active: boolean }>(
  donors: T[], programIds: string[], panel: { donorIds?: string[]; donorTierFilter?: string[] }
) {
  const byId = new Map(donors.map((donor) => [donor.id, donor]));
  return [...new Set(panel.donorIds ?? programIds)]
    .map((id) => byId.get(id))
    .filter((donor): donor is T => Boolean(donor))
    .filter((donor) => panel.donorIds !== undefined || (donor.active
      && (!panel.donorTierFilter?.length || panel.donorTierFilter.includes(donor.tier ?? ""))));
}

export function donorListRowCount(count: number, columns: number, requestedRows?: number) {
  return Math.max(1, requestedRows ?? 1, Math.ceil(count / Math.max(1, columns)));
}

export interface DonorRosterGivingProgram {
  id: string;
  levels: Array<{ id: string; name: string }>;
}

function normalized(value: string) {
  return value.trim().toLocaleLowerCase();
}

export function donorRosterFacets<TDonor extends DonorRosterDonor>(donor: TDonor, givingPrograms: DonorRosterGivingProgram[]) {
  const givingLevel = givingPrograms
    .find((program) => program.id === donor.givingProgramId)
    ?.levels.find((level) => level.id === donor.givingLevelId)?.name;
  return [...new Set([donor.tier, givingLevel, ...(donor.tags ?? [])].filter((value): value is string => Boolean(value?.trim())))];
}

export function donorRosterFacetOptions<TDonor extends DonorRosterDonor>(donors: TDonor[], givingPrograms: DonorRosterGivingProgram[]) {
  return [...new Set(donors.flatMap((donor) => donorRosterFacets(donor, givingPrograms)))]
    .sort((a, b) => a.localeCompare(b));
}

export function filterDonorRoster<TDonor extends DonorRosterDonor>(
  donors: TDonor[],
  givingPrograms: DonorRosterGivingProgram[],
  filters: { query: string; facet: string; donationType: string }
) {
  const query = normalized(filters.query);
  const facet = normalized(filters.facet);
  return donors.filter((donor) =>
    (!query || normalized(donor.name).includes(query))
    && (filters.facet === "all" || donorRosterFacets(donor, givingPrograms).some((value) => normalized(value) === facet))
    && (filters.donationType === "all" || donor.donationType === filters.donationType)
  );
}

export function updateDonorRosterMembership(currentIds: string[], donorIds: string[], action: "add" | "remove") {
  const targets = new Set(donorIds);
  return action === "add"
    ? [...new Set([...currentIds, ...donorIds])]
    : currentIds.filter((id) => !targets.has(id));
}

export function materializeDonorPanelMembership<
  TPanel extends { id: string; type: string; donorIds?: string[]; donorTierFilter?: string[] }
>(panels: TPanel[] | undefined, selectedPanelId: string, previousProgramDonorIds: string[], selectedDonorIds: string[], donors: Array<DonorRosterDonor & { active: boolean }>) {
  return panels?.map((panel) => {
    if (panel.type !== "donors") return panel;
    if (panel.id === selectedPanelId) return { ...panel, donorIds: [...selectedDonorIds] };
    return panel.donorIds === undefined ? { ...panel, donorIds: resolvePanelDonors(donors, previousProgramDonorIds, panel).map((donor) => donor.id) } : panel;
  });
}
