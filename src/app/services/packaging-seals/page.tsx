import { ServicePage, serviceMetadata } from "@/components/service/ServicePage";

export const metadata = serviceMetadata("packaging-seals");

export default function Page() {
  return <ServicePage slug="packaging-seals" />;
}
