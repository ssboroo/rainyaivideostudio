import {spawn} from "node:child_process";
const children=[];
let stopping=false;
function launch(args,label){
  const child=spawn(process.execPath,args,{env:process.env,stdio:"inherit"});
  children.push(child);
  child.on("exit",(code,signal)=>{
    if(stopping) return;
    if(label==="scheduler" && process.env.MOVIE_SCHEDULER_ENABLED!=="true" && code===0) return;
    console.error(label,"exited",code,signal);
    shutdown(code||1);
  });
}
function shutdown(code=0){
  if(stopping)return;
  stopping=true;
  for(const child of children)if(child.exitCode===null)child.kill("SIGTERM");
  const killer=setTimeout(()=>{for(const c of children)if(c.exitCode===null)c.kill("SIGKILL");},8000);
  killer.unref();
  setTimeout(()=>process.exit(code),8500).unref();
}
process.on("SIGTERM",()=>shutdown(0));process.on("SIGINT",()=>shutdown(0));
launch(["server.js"],"web");
if(process.env.MOVIE_SCHEDULER_ENABLED==="true")launch(["scripts/movie-scheduler.mjs"],"scheduler");