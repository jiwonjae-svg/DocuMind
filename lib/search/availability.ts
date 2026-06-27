export type SearchableChunkAvailabilityRow = {
  exists: boolean | number | string | null;
};

export function hasSearchableChunk(
  rows: SearchableChunkAvailabilityRow[],
) {
  return rows.some((row) => {
    if (row.exists === true || row.exists === 1) {
      return true;
    }

    return typeof row.exists === "string" && row.exists.toLowerCase() === "true";
  });
}
