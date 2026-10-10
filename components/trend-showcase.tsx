import {CreativeDemoGallery} from "@/components/creative-demo-gallery";

/** One shared playable library powers both the home highlights and /trends. */
export function TrendShowcase({compact=false}:{compact?:boolean}) {
 return <CreativeDemoGallery surface={compact?"home":"trends"} compact={compact}/>;
}
