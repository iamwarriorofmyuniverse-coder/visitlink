import UnifiedPortalHub from "@/components/portal/UnifiedPortalHub";

export const metadata = {
  title: "VisitLink Operations Portal | Schools, Industry & Logistics",
  description: "Unified interface for School Coordinators, Industry Hosts, and Visit Logistics telemetry.",
};

export default function PortalPage() {
  return <UnifiedPortalHub initialTab="coordinator" />;
}
