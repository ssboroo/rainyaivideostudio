import test from "node:test";
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {mkdtempSync,rmSync,statSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";

const available=spawnSync("ffmpeg",["-version"],{encoding:"utf8"}).status===0
 &&spawnSync("ffprobe",["-version"],{encoding:"utf8"}).status===0;
function cli(cmd,args){
 const done=spawnSync(cmd,args,{encoding:"utf8",timeout:45000});
 assert.equal(done.status,0,cmd+" failed: "+String(done.stderr||"").slice(-700));
 return done.stdout;
}
test("real video + audio transcodes into actual playable clipped MP4 for download and Genjutsu", {skip:!available},()=>{
 const dir=mkdtempSync(join(tmpdir(),"ravs-ffmpeg-qa-"));
 try{
  const raw=join(dir,"iphone.mov"),audioClip=join(dir,"export.mp4"),silentClip=join(dir,"genjutsu.mp4");
  cli("ffmpeg",["-hide_banner","-loglevel","error",
   "-f","lavfi","-i","testsrc2=size=640x360:rate=30",
   "-f","lavfi","-i","sine=frequency=440:sample_rate=44100",
   "-t","3","-c:v","libx264","-pix_fmt","yuv420p","-c:a","aac","-y",raw]);
  cli("ffmpeg",["-hide_banner","-loglevel","error","-nostdin","-protocol_whitelist","file,pipe",
   "-ss","0.3","-i",raw,"-t","2","-map","0:v:0","-map","0:a:0?",
   "-vf","scale=1280:-2:force_original_aspect_ratio=decrease:force_divisible_by=2,fps=30",
   "-c:v","libx264","-preset","veryfast","-crf","25","-pix_fmt","yuv420p",
   "-c:a","aac","-b:a","128k","-movflags","+faststart","-y",audioClip]);
  cli("ffmpeg",["-hide_banner","-loglevel","error","-nostdin","-protocol_whitelist","file,pipe",
   "-ss","0.3","-i",raw,"-t","2","-map","0:v:0",
   "-vf","scale=trunc(min(1280\\,iw)/2)*2:-2,fps=30",
   "-an","-c:v","libx264","-preset","veryfast","-crf","25","-pix_fmt","yuv420p",
   "-movflags","+faststart","-y",silentClip]);
  for(const [file,withAudio] of [[audioClip,true],[silentClip,false]]){
    assert.ok(statSync(file).size>1000);
    const details=JSON.parse(cli("ffprobe",["-v","error","-show_entries","format=duration:stream=codec_type,codec_name,width,height",
     "-of","json",file]));
    assert.ok(Number(details.format.duration)>=1.8&&Number(details.format.duration)<=2.2);
    assert.ok(details.streams.some(s=>s.codec_type==="video"&&s.codec_name==="h264"));
    assert.equal(details.streams.some(s=>s.codec_type==="audio"),withAudio);
  }
 }finally{rmSync(dir,{recursive:true,force:true});}
});
