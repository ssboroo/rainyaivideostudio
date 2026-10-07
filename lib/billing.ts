export type CreditPackage={id:string;name:string;priceMnt:number;credits:number;popular?:boolean};
const defaults:CreditPackage[]=[
{id:"starter",name:"Starter",priceMnt:20000,credits:2000},
{id:"creator",name:"Creator",priceMnt:50000,credits:5500,popular:true},
{id:"pro",name:"Pro",priceMnt:100000,credits:12000}
];
export function getCreditPackages():CreditPackage[]{
  const raw=process.env.CREDIT_PACKAGES_JSON;
  if(!raw)return defaults;
  let packages: unknown;
  try { packages = JSON.parse(raw); } catch { throw new Error("CREDIT_PACKAGES_JSON is invalid"); }
  if (!Array.isArray(packages) || !packages.length) throw new Error("Credit packages must be a nonempty array");
  const ids = new Set<string>();
  for (const p of packages) {
    if (!p || typeof p.id !== "string" || !p.id || ids.has(p.id) || typeof p.name !== "string" || !p.name || !Number.isSafeInteger(p.priceMnt) || !Number.isSafeInteger(p.credits) || p.priceMnt <= 0 || p.credits <= 0 || p.priceMnt * 12000 < p.credits * 100000) throw new Error("Credit package violates the minimum 8.333 MNT/credit pricing policy");
    ids.add(p.id);
  }
  return packages as CreditPackage[];
}
export const getCreditPackage=(id:string)=>getCreditPackages().find(p=>p.id===id);
