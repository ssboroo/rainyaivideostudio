// Independent long-running process. All actual work takes place in the
// Next.js internal endpoint behind a strong MOVIE_WORKER_SECRET.
const enabled=process.env.MOVIE_SCHEDULER_ENABLED==="true";
const secret=process.env.MOVIE_WORKER_SECRET||"";
if(!enabled||secret.length<32){console.log("Movie scheduler safely disabled; configure feature flag and worker secret.");process.exit(0)}
const port=Number(process.env.PORT||3000);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
let stopping=false;
for(const signal of ["SIGTERM","SIGINT"])process.on(signal,()=>{stopping=true});
const endpoint=`http://127.0.0.1:${port}/api/internal/movie/tick`;
console.log("Movie scheduler started (persistent Postgres state).");
while(!stopping){
  try{
    const response=await fetch(endpoint,{method:"POST",headers:{"Authorization":`Bearer ${secret}`},signal:AbortSignal.timeout(60000)});
    const body=await response.json().catch(()=>({status:"invalid_response"}));
    if(!response.ok)console.warn("Movie scheduler tick failed",response.status,body.status||"error");
    // Fixed cadence avoids provider request bursts; 429 calls have separate 65s backoff.
  }catch(e){console.warn("Movie scheduler will retry",e instanceof Error?e.name:"unknown");}
  await wait(12000);
}
console.log("Movie scheduler stopped gracefully.");