"use client";

import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/shadcn/breadcrumb";

type Props = {
  decoded: string | null;
  title: string;
};

export default function Header({ decoded, title }: Props) {
  const isRoot = !decoded;

  return (
    <section className="pt-6">
      <Breadcrumb className="pb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />

          <BreadcrumbItem>
            {isRoot ? (
              <BreadcrumbPage>Posts</BreadcrumbPage>
            ) : (
              <BreadcrumbLink asChild>
                <Link href="/posts">Posts</Link>
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>

          {!isRoot && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{decoded}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="mb-10 w-full text-center text-5xl font-semibold">
        {title}
      </h1>
    </section>
  );
}
