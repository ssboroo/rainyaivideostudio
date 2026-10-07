export type CreditPackage={id:string;name:string;priceMnt:number;credits:number;popular?:boolean;validityMonths:1};
const defaults:CreditPackage[]=[
{id:"starter",name:"Starter",priceMnt:60000,credits:7000,validityMonths:1},
{id:"creator",name:"Creator",priceMnt:90000,credits:10000,validityMonths:1},
{id:"pro",name:"Pro",priceMnt:180000,credits:21000,popular:true,validityMonths:1},
{id:"studio",name:"Studio",priceMnt:450000,credits:54000,validityMonths:1}
];
export function getCreditPackages():CreditPackage[]{
  const raw=process.env.CREDIT_PACKAGES_JSON;
  if(!raw)return defaults;
  let packages: unknown;
  try { packages = JSON.parse(raw); } catch { throw new Error("CREDIT_PACKAGES_JSON is invalid"); }
  if (!Array.isArray(packages) || !packages.length) throw new Error("Credit packages must be a nonempty array");
  const ids = new Set<string>();
  for (const p of packages) {
    if (!p || typeof p.id !== "string" || !p.id || ids.has(p.id) || p.validityMonths !== 1 || typeof p.name !== "string" || !p.name || !Number.isSafeInteger(p.priceMnt) || !Number.isSafeInteger(p.credits) || p.priceMnt <= 0 || p.credits <= 0 || p.priceMnt * 12000 < p.credits * 100000) throw new Error("Credit package violates the minimum 8.333 MNT/credit pricing policy");
    ids.add(p.id);
  }
  return packages as CreditPackage[];
}
export const getCreditPackage=(id:string)=>getCreditPackages().find(p=>p.id===id);
