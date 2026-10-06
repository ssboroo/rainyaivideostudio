import {AuthForm} from "@/components/auth-form";
import {getSessionUser} from "@/lib/session";
import {signConsent,validateAuthorization,OAuthError} from "@/lib/mcp-oauth";
import Link from "next/link";
export const dynamic="force-dynamic";
export const metadata={title:"MCP холболтын зөвшөөрөл",referrer:"no-referrer"};
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const values=await searchParams;const p=new URLSearchParams();for(const [key,value]of Object.entries(values)){if(typeof value==="string")p.set(key,value);else if(Array.isArray(value))return <main className="authPage"><p>Холболтын хүсэлт буруу байна.</p></main>;}
 let request;try{request=await validateAuthorization(p);}catch(error){
  const code=error instanceof OAuthError?error.error:"server_error";
  const messages:Record<string,string>={invalid_client:'Claude-ийн OAuth клиент RAVS-д бүртгэлгүй эсвэл буцах хаяг нь таарахгүй байна. Connector-оо дахин нэмэхдээ OAuth client → Register automatically сонго.',invalid_target:'Claude-ээс ирсэн OAuth resource нь RAVS MCP холбоостой таарахгүй эсвэл resource параметр ирээгүй байна.',invalid_scope:'Claude-ийн хүссэн эрхүүд RAVS-ийн дэмждэг эрхүүдтэй таарахгүй байна.',invalid_request:'OAuth хүсэлтэд response_type=code болон S256 PKCE хамгаалалт шаардлагатай. Зөвшөөрлийн хуудсыг шууд нээхгүй; Claude-ийн Connect үйлдлээс эхлүүл.',server_error:'Холболтын үйлчилгээ түр алдаа гаргалаа. Түр хүлээгээд дахин холбоно уу.'};
  // Safe diagnostics only: never log URL, state, client IDs, auth codes or tokens.
  console.warn('[ravs_oauth_authorize]',{code,hasClient:p.has('client_id'),hasRedirect:p.has('redirect_uri'),hasResource:p.has('resource'),hasChallenge:p.has('code_challenge'),s256:p.get('code_challenge_method')==='S256',metadataClient:(p.get('client_id')||'').startsWith('https://')});
  return <main className="authPage"><div className="authCard"><h1>Холболтын хүсэлт буруу байна</h1><p>{messages[code]||messages.server_error}</p><p>Алдааны код: <strong>{code}</strong></p><p>Серверийн холбоос: <code>/mcp</code>. Нууц түлхүүр эсвэл токеноо чат руу илгээх шаардлагагүй.</p><Link href="/integrations" className="primary wide">Холболтын Монгол заавар</Link></div></main>;
 }
 const user=await getSessionUser();if(!user)return <div className="authPage"><AuthForm mode="login" returnTo={`/oauth/authorize?${p.toString()}`}/></div>;
 return <main className="authPage"><form className="authCard" method="POST" action="/oauth/consent"><h1>{request.clientName} холбох</h1><p>{user.email} бүртгэлийн зөвшөөрөл</p><p>Энэ клиент таны RAVS бүртгэлд дараах эрхээр ажиллана:</p><ul><li>Загвар, заавар, кредит болон таны бүтээлийн түүхийг унших.</li>{request.scope.includes("ravs:generate")&&<li>Таны баталгаажуулсан хүсэлтээр кредит зарцуулж бүтээл үүсгэх, хүлээгдэж буй хүсэлтийг цуцлах.</li>}{request.scope.includes("offline_access")&&<li>Дахин нэвтрэхгүйгээр холболтоо үргэлжлүүлэх. Та хүссэн үедээ салгаж болно.</li>}</ul><p>Клиентийн нэрийг бүртгүүлэгч өгсөн. Буцах хаягийг шалгана уу: <strong>{new URL(request.redirectUri).origin}</strong></p><p>Higgsfield API түлхүүр болон таны нууц үгийг клиентэд дамжуулахгүй.</p><input type="hidden" name="consent" value={signConsent(user.id,request)}/><button className="primary wide" name="decision" value="allow" type="submit">Эрхийг зөвшөөрч холбох</button><button className="secondary wide" name="decision" value="deny" type="submit">Татгалзах</button><p>Холболтыг /integrations хэсэгт цуцалж болно.</p></form></main>;
}
