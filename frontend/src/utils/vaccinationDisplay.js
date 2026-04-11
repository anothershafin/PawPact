/** Maps stored vaccinationStatus to short Yes / No / Partial labels. */
export function vaccinationShortLabel(status) {
  if (status === "Vaccinated") return "Yes";
  if (status === "Not Vaccinated") return "No";
  if (status === "Partially Vaccinated") return "Partial";
  return status || "—";
}
