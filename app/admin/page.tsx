import { requireSession } from "@/lib/session";

export default async function AdminPage() {
  await requireSession();

  return <main />;
}
