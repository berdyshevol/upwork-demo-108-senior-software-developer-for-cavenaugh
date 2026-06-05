import { LeadsExplorer } from "@/components/LeadsExplorer";
import { loadPortalData } from "@/lib/attribution";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const { leads } = await loadPortalData();
  const dates = leads.map((l) => l.createdAt).sort();
  const minDate = dates[0] ?? "";
  const maxDate = dates[dates.length - 1] ?? "";

  return <LeadsExplorer leads={leads} minDate={minDate} maxDate={maxDate} />;
}
