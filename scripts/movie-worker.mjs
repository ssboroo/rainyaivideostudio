import { tickMovieJobs, movieEnabled } from "../lib/movie-producer.ts";
import { tickMovieProducer } from "../lib/movie-producer-v2.ts";
let stopped=false;
for(const signal of ["SIGTERM","SIGINT"]) process.on(signal,()=>{stopped=true});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function main(){
 console.log("[RAINY Movie Worker] legacy="+movieEnabled()+", v2="+(process.env.MOVIE_SCHEDULER_ENABLED==="true"));
 while(!stopped){
  let worked=false;
  try{
   if(movieEnabled()){const result=await tickMovieJobs();worked=!!result}
   if(process.env.MOVIE_SCHEDULER_ENABLED==="true"){
    // Durable Postgres lease + idempotent per-scene provider requests.
    const result=await tickMovieProducer();
    worked=worked || !["idle","busy","disabled"].includes(result.status);
   }
   await sleep(worked?3000:12000);
  }catch(e){
   console.error("[RAINY Movie Worker] tick error:",e instanceof Error?e.name:"unknown");
   await sleep(15000);
  }
 }
}
await main();
