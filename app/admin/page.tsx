import { Suspense } from "react";
import { requireSession } from "@/lib/session";

async function Protegido() {
  await requireSession();
  return null;
}

export default function AdminPage() {
  return (
    <main>
      <Suspense fallback={null}>
        <Protegido />
      </Suspense>
    </main>
  );
}
