const pages=new Set(['/','/create','/login','/register','/forgot-password','/reset-password','/verify-email','/request-verification']);
export function createSiteAllowed(path:string){return pages.has(path)||path.startsWith('/_next/')||path.startsWith('/brand/')||path==='/icon.svg'||path==='/favicon.ico'||path.startsWith('/api/auth/')||path==='/api/health'||path.startsWith('/api/campaigns')||path==='/api/billing/wire/webhook';}
/** Retain the existing custom-domain ingress and forward only its host to the
 * separately deployed Create app. No domain or existing service is removed. */
export function createSiteTarget(host:string|null,path:string,search:string,standalone:boolean,publicOrigin:string,upstream?:string){
 if(standalone||!upstream||host!==new URL(publicOrigin).host)return null;
 const target=new URL(upstream);
 if(target.protocol!=='https:'||!target.hostname.endsWith('.up.railway.app')||target.username||target.password||target.pathname!=='/'||target.search||target.hash)throw new Error('Create upstream тохиргоо буруу.');
 target.pathname=path;target.search=search;return target;
}
