import { Suspense } from "react";import { BillingClient } from "@/components/billing-client";
export const metadata={title:"Credit"};export const dynamic="force-dynamic";
export default function Page(){return <Suspense fallback={<div className="pageLoading">Төлбөрийн хэсэг ачаалж байна…</div>}><BillingClient/></Suspense>}
