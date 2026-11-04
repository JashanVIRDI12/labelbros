import { ServicePage, serviceMetadata } from "@/components/service/ServicePage";

export const metadata = serviceMetadata("roll-labels");

export default function Page() {
  return <ServicePage slug="roll-labels" />;
}
