import {estimatePackContribution, pricingPolicy} from "./api-pricing.ts";

export type CreditPackage={
 id:string;name:string;priceMnt:number;credits:number;popular?:boolean;validityMonths:1;
};
/**
 * Prepaid monthly ACCESS with a fixed credit quota. Not an automatic payment
 * subscription: Wire hosted checkout currently creates one-time payments.
 * No "unlimited", no provider-web subscription credit resale.
 */
const defaults:CreditPackage[]=[
 {id:"starter",name:"Starter Video",priceMnt:29900,credits:3000,validityMonths:1},
 {id:"creator",name:"Creator",priceMnt:69900,credits:7400,validityMonths:1},
 {id:"pro",name:"Pro",priceMnt:179000,credits:19000,popular:true,validityMonths:1},
 {id:"studio",name:"Studio",priceMnt:449000,credits:48000,validityMonths:1},
 {id:"agency",name:"Agency",priceMnt:899000,credits:95000,validityMonths:1},
];
function validatePack(p:unknown,seen:Set<string>):asserts p is CreditPackage{
 if(!p || typeof p!=="object"||Array.isArray(p))throw new Error("Кредитийн багцын формат буруу.");
 const pkg=p as Record<string,unknown>;
 if(typeof pkg.id!=="string"||!(/^[a-z0-9-]{2,35}$/).test(pkg.id)||seen.has(pkg.id)
    ||typeof pkg.name!=="string"||!pkg.name.trim()||pkg.name.length>75
    ||pkg.validityMonths!==1
    ||typeof pkg.priceMnt!=="number"||!Number.isSafeInteger(pkg.priceMnt)
    ||typeof pkg.credits!=="number"||!Number.isSafeInteger(pkg.credits)
    ||pkg.priceMnt<1000||pkg.priceMnt>100_000_000||pkg.credits<1||pkg.credits>5_000_000
    ||(pkg.popular!==undefined&&typeof pkg.popular!=="boolean"))
    throw new Error("Кредитийн багц буруу эсвэл давхардсан.");
 const audit=estimatePackContribution(pkg.priceMnt,pkg.credits);
 if(!audit.guardPassed)
   throw new Error("Ашгийн хамгаалалт: багцын цэвэрлэсэн өртгийн доод нэмэгдэл болон валют/шимтгэлийн стресс тестийг хангахгүй байна.");
 seen.add(pkg.id);
}
export function getCreditPackages():CreditPackage[]{
 const raw=process.env.CREDIT_PACKAGES_JSON;
 let packages:unknown=defaults;
 if(raw) {
  try {packages=JSON.parse(raw);}
  catch {throw new Error("CREDIT_PACKAGES_JSON формат буруу.");}
 }
 if(!Array.isArray(packages)||packages.length<1||packages.length>15)
   throw new Error("Credit packages must contain 1–15 prepaid options");
 const seen=new Set<string>();
 for(const pkg of packages)validatePack(pkg,seen);
 return packages as CreditPackage[];
}
export const getCreditPackage=(id:string)=>getCreditPackages().find(p=>p.id===id);
/** Administrator-facing planning assumptions; not user-account financial profit. */
export function getPricingScenario() {
 return {
  reviewedAt:pricingPolicy.reviewedAt,
  forecastUsdMnt:pricingPolicy.usdMnt,
  apiMarkupMultiplier:1+pricingPolicy.markup,
  estimatedQuoteReductionVsPrior:1-(1+pricingPolicy.markup)/2.15,
  minCreditMnt:pricingPolicy.minimumPackMntPerCredit,
   minimumNetCostMarkup:pricingPolicy.minimumNetCostMarkup,
  scenarioReserves:{
   fxStress:pricingPolicy.fxStress,paymentFee:pricingPolicy.paymentFeeReserve,
   tax:pricingPolicy.taxReserve,infrastructure:pricingPolicy.infrastructureReserve,
  },
  assumptions:"USD/MNT нь дотоод төсвийн ханш; төлбөрийн шимтгэл, татвар, ажиллагааны зардал нь зөвхөн төлөвлөлтийн нөөц бөгөөд баталгаат net profit биш.",
  packages:getCreditPackages().map(p=>({
    id:p.id,name:p.name,priceMnt:p.priceMnt,credits:p.credits,
    ...estimatePackContribution(p.priceMnt,p.credits),
  })),
 };
}
