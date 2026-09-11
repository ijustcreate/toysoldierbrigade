import type { Donor } from "./types";

export function donorDisplayName(donor: Donor): string {
  const legacyPeople = !donor.firstName && !donor.lastName ? parseLegacyPeople(donor.name) : [];
  if (!donor.firstName && !donor.lastName && !legacyPeople.length && !donor.people?.length) return donor.name;
  const names = [{ firstName: donor.firstName ?? "", middleName: donor.middleName, lastName: donor.lastName ?? "" }, ...(donor.people ?? legacyPeople)]
    .map((name) => [name.firstName, name.middleName, name.lastName].filter(Boolean).join(" ").trim())
    .filter(Boolean);
  return names.join(` ${donor.multiDonorJoiner ?? "and"} `) || donor.name;
}

function parseLegacyPeople(value: string): Array<{ firstName: string; middleName?: string; lastName: string }> {
  const parts = value.split(/\s*(?:&|\band\b)\s*/i).map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) {
    const compact = value.match(/^([A-Z][a-z]+)and([A-Z][a-z]+)\s+(.+)$/);
    if (compact) return [{ firstName: compact[1], lastName: compact[3] }, { firstName: compact[2], lastName: compact[3] }];
    return [];
  }
  const lastName = parts[parts.length - 1].split(/\s+/).pop() ?? "";
  return parts.map((part) => ({ firstName: part.replace(new RegExp(`\\s+${lastName}$`), "").trim(), lastName }));
}

export function donorSortKey(donor: Donor, sort: "first-name" | "last-name"): string {
  if (sort === "first-name") return (donor.firstName || donor.name).toLocaleLowerCase();
  return (donor.lastName || donor.name).toLocaleLowerCase();
}
