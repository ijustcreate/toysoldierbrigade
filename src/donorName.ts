import type { Donor } from "./types";

export function donorDisplayName(donor: Donor): string {
  if (!donor.firstName && !donor.lastName && !donor.additionalNames?.length) return donor.name;
  const names = [{ firstName: donor.firstName ?? "", middleName: donor.middleName, lastName: donor.lastName ?? "" }, ...(donor.additionalNames ?? [])]
    .map((name) => [name.firstName, name.middleName, name.lastName].filter(Boolean).join(" ").trim())
    .filter(Boolean);
  return names.join(` ${donor.multiDonorJoiner ?? "and"} `) || donor.name;
}

export function donorSortKey(donor: Donor, sort: "first-name" | "last-name"): string {
  if (sort === "first-name") return (donor.firstName || donor.name).toLocaleLowerCase();
  return (donor.lastName || donor.name).toLocaleLowerCase();
}
