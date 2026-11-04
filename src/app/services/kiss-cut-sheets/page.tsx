import { ServicePage, serviceMetadata } from "@/components/service/ServicePage";

export const metadata = serviceMetadata("kiss-cut-sheets");

export default function Page() {
  return <ServicePage slug="kiss-cut-sheets" />;
}
