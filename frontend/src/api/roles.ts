export type Role = {
  id: number;
  name: string;
};

export async function getRoles(): Promise<Role[]> {
  const res = await fetch("/api/roles");
  if (!res.ok) {
    throw new Error("Failed to load roles");
  }
  return res.json();
}
