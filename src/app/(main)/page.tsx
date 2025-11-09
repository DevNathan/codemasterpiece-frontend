"use cache";

import { Hero } from "@/features/index/ui/firstSection/Hero";
import { VisitorsBlock } from "@/features/index/ui/secondSection/VisitorBlock";

export default async function Page() {
  return (
    <>
      <Hero />
      <VisitorsBlock />
    </>
  );
}
