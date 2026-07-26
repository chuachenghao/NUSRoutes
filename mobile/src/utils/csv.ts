import type { Journey, Profile, SavedPlace } from "../storage/profileStorage";

// csv gets confused by commas, quotes and newlines so wrap the value in quotes
// and double up any quote already inside it
function escapeCell(value: string | null | undefined): string {
  const text = value ?? "";

  if (text.includes(",") || text.includes("\"") || text.includes("\n")) {
    return `"${text.replace(/"/g, "\"\"")}"`;
  }

  return text;
}

function makeRow(cells: (string | null | undefined)[]): string {
  return cells.map(escapeCell).join(",");
}

// everything goes into one file, the first column says what kind of row it is
export function buildExportCsv(
  profile: Profile | null,
  savedPlaces: SavedPlace[],
  journeys: Journey[]
): string {
  const rows: string[] = [];

  rows.push(makeRow(["section", "name", "type", "start", "end", "created_at"]));

  if (profile) {
    rows.push(makeRow(["profile", profile.name, "", "", "", profile.createdAt]));
  }

  for (const place of savedPlaces) {
    rows.push(makeRow(["place", place.name, place.type ?? "", "", "", ""]));
  }

  for (const journey of journeys) {
    rows.push(
      makeRow([
        "journey",
        "",
        "",
        journey.startName,
        journey.endName,
        journey.createdAt,
      ])
    );
  }

  return rows.join("\n");
}
