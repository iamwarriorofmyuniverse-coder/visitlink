import UnifiedPortalHub from "@/components/portal/UnifiedPortalHub";

export const metadata = {
  title: "Coordinator Portal | VisitLink",
  description: "Manage school and college industrial visits, compliance rosters, and schedules.",
};

export default function CoordinatorDashboardPage() {
  return <UnifiedPortalHub initialTab="coordinator" />;
}
