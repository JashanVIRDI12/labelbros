import { ServicePage, serviceMetadata } from "@/components/service/ServicePage";

export const metadata = serviceMetadata("custom-design");

export default function Page() {
  return <ServicePage slug="custom-design" />;
}
