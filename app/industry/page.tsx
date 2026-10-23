import UnifiedPortalHub from "@/components/portal/UnifiedPortalHub";

export const metadata = {
  title: "Industry Host Portal | VisitLink",
  description: "Manage facility slots, review incoming student visit requests, and verify attendance.",
};

export default function IndustryDashboardPage() {
  return <UnifiedPortalHub initialTab="industry" />;
}
