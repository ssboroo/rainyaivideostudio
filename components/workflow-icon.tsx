import {Clapperboard,Image,Film,WandSparkles,Megaphone,ScanFace,Sparkles,Wind,Camera,Video,Palette,Type,Scissors,Paintbrush,Replace} from "lucide-react";
export function WorkflowIcon({id,size=28}:{id:string;size?:number}){
 const Icon=/camera/.test(id)?Camera:/product/.test(id)?Megaphone:/portrait/.test(id)?ScanFace:/genjutsu-object/.test(id)?Replace:/restyle/.test(id)?Paintbrush:/seedance-edit/.test(id)?Scissors:/genjutsu|motion/.test(id)?WandSparkles:/cinema/.test(id)?Film:/marketing/.test(id)?Megaphone:/influencer|soul/.test(id)?ScanFace:/ideogram|poster/.test(id)?Type:/recraft|brand/.test(id)?Palette:/image/.test(id)?Image:/wan/.test(id)?Wind:/kling/.test(id)?Camera:/seedance/.test(id)?Video:/apps|effects/.test(id)?Sparkles:Clapperboard;
 return <Icon size={size} strokeWidth={1.7} aria-hidden="true"/>;
}
