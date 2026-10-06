export type CreditPackage={id:string;name:string;priceMnt:number;credits:number;popular?:boolean};
const defaults:CreditPackage[]=[
{id:"starter",name:"Starter",priceMnt:20000,credits:2000},
{id:"creator",name:"Creator",priceMnt:50000,credits:5500,popular:true},
{id:"pro",name:"Pro",priceMnt:100000,credits:12000}
];
export function getCreditPackages():CreditPackage[]{
  const raw=process.env.CREDIT_PACKAGES_JSON;
  if(!raw)return defaults;
  try{const p=JSON.parse(raw);return Array.isArray(p)?p.filter(x=>x&&typeof x.id==="string"&&Number(x.priceMnt)>0&&Number(x.credits)>0):defaults;}catch{return defaults;}
}
export const getCreditPackage=(id:string)=>getCreditPackages().find(p=>p.id===id);
