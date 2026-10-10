import { tickMovieJobs, movieEnabled } from "../lib/movie-producer.ts";
let stopped=false;
process.on("SIGTERM",()=>{stopped=true});
process.on("SIGINT",()=>{stopped=true});
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function main(){
 console.log("[RAINY Movie Producer] started; enabled="+movieEnabled());
 while(!stopped){
  try{
   if(movieEnabled()){
    // No background AI generation happens before explicit user consent in movie project.
    const didWork=await tickMovieJobs();
    await pause(didWork?1500:12000);
   }else await pause(30000);
  }catch(e){
   console.error("[RAINY Movie Producer] tick failed:",e instanceof Error?e.message:"unknown");
   await pause(15000);
  }
 }
}
await main();
