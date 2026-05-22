"use client"

import { useParams } from "next/navigation"

import { PublicFormPage } from "@/components/form/public-form-page"

export default function FormBySlugPage() {
  const params = useParams()
  const slug = typeof params.formslug === "string" ? params.formslug : ""

  if (!slug) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-sm text-muted-foreground">
        Invalid form link.
      </div>
    )
  }

  return <PublicFormPage slug={slug} />
}
