function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

type AirtableField = { id: string; name: string; type: string };
type AirtableTable = { id: string; name: string; fields: AirtableField[] };

export async function getFieldIdByName(tableName: string, fieldName: string): Promise<{ tableId: string; fieldId: string } | null> {
  const apiKey = requireEnv("AIRTABLE_API_KEY");
  const baseId = requireEnv("AIRTABLE_BASE_ID");
  const url = `https://api.airtable.com/v0/meta/bases/${baseId}/tables`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    console.error("Failed to fetch Airtable schema", res.status, t);
    return null;
  }
  const json = (await res.json()) as { tables: AirtableTable[] };
  const table = json.tables.find((t) => t.name === tableName);
  if (!table) return null;
  const field = table.fields.find((f) => f.name === fieldName);
  if (!field) return null;
  return { tableId: table.id, fieldId: field.id };
}


