import { ServicePage, serviceMetadata } from "@/components/service/ServicePage";

export const metadata = serviceMetadata("holographic-glitter");

export default function Page() {
  return <ServicePage slug="holographic-glitter" />;
}
