import { trendDemos } from "@/lib/trend-demos";
export type CommunityFeedTab = "higgsfield" | "trending" | "new";

export type CommunityFeedItem = {
  id: string;
  tab: CommunityFeedTab;
  title: string;
  creator: string;
  sourceHref: string;
  model: string;
  prompt: string;
  aspect: string;
  duration: number;
  ratio: string;
  badge: string;
  views?: string;
  previewSrc?: string;
  poster?: string;
};

export const communityFeed: CommunityFeedItem[] = [
  {
    id:"earth-zoom-out", tab:"higgsfield", title:"Earth Zoom Out", creator:"Higgsfield Viral",
    sourceHref:"https://higgsfield.ai/motion/70e490b9-26b7-4572-8d9c-2ac8dcc9adc0",
    model:"seedance-2-5-image",
    prompt:"A dramatic earth zoom-out transition starting close on the subject, accelerating backward through the street, city, clouds and atmosphere until the full planet is visible, seamless cinematic scale change, realistic lighting.",
    aspect:"9:16", duration:8, ratio:"9 / 15", badge:"TOP CHOICE"
  },
  {
    id:"eyes-in", tab:"higgsfield", title:"Eyes In", creator:"Higgsfield Viral",
    sourceHref:"https://higgsfield.ai/motion/0ab33462-481e-4c78-8ffc-086bebd84187",
    model:"seedance-2-5-image",
    prompt:"Fast cinematic push-in toward the subject's eyes, macro detail, intense emotional focus, smooth accelerating camera motion, realistic skin texture and controlled depth of field.",
    aspect:"9:16", duration:6, ratio:"4 / 5", badge:"TOP CHOICE"
  },
  {
    id:"building-explosion", tab:"higgsfield", title:"Building Explosion", creator:"Higgsfield Viral",
    sourceHref:"https://higgsfield.ai/motion/e974bca9-c9eb-4cc8-9318-5676cc110f17",
    model:"seedance-2-5-image",
    prompt:"Large cinematic building explosion behind the subject, realistic debris and pressure wave, dramatic camera shake, high-speed particles, believable lighting interaction, action-film finish.",
    aspect:"9:16", duration:7, ratio:"9 / 16", badge:"VFX"
  },
  {
    id:"disintegration", tab:"higgsfield", title:"Disintegration", creator:"Higgsfield Viral",
    sourceHref:"https://higgsfield.ai/motion/4e981984-1cdc-4b96-a2b1-1a7c1ecb822d",
    model:"seedance-2-5-image",
    prompt:"The subject gradually disintegrates into thousands of tiny particles carried by the wind, realistic edge breakup, cinematic backlight, slow emotional timing, physically coherent particle motion.",
    aspect:"9:16", duration:7, ratio:"4 / 6", badge:"VFX"
  },
  {
    id:"face-punch", tab:"higgsfield", title:"Face Punch", creator:"Higgsfield Viral",
    sourceHref:"https://higgsfield.ai/motion/cd5bfd11-5a1a-46e0-9294-b22b0b733b1e",
    model:"seedance-2-5-image",
    prompt:"Exaggerated action-comedy impact moment, sudden punch reaction, fast camera hit, brief speed ramp, realistic body motion and facial reaction, viral short-form pacing.",
    aspect:"9:16", duration:5, ratio:"9 / 12", badge:"TREND"
  },
  {
    id:"turning-metal", tab:"higgsfield", title:"Turning Metal + Melting", creator:"Higgsfield Viral",
    sourceHref:"https://higgsfield.ai/motion/017ae2b7-bcff-42ef-863e-6e198f96c3ec",
    model:"seedance-2-5-image",
    prompt:"The subject transforms into reflective liquid metal and slowly begins to melt while preserving recognizable form, premium surreal fashion lighting, smooth material transition and cinematic macro detail.",
    aspect:"9:16", duration:7, ratio:"4 / 5", badge:"MIXED"
  },

  {
    id:"grandma-wasp", tab:"trending", title:"GRANDMA vs WASP", creator:"@mrabujoe",
    sourceHref:"https://higgsfield.ai/contests/make-your-action-scene/submissions/4132edf8-f419-4e26-92c3-b2ce344b9592",
    model:"kling-3-standard",
    prompt:"Original comedic micro-epic: a peaceful summer breakfast suddenly becomes an over-the-top battle between a fearless elderly heroine and one extremely disrespectful insect, playful action blocking, cinematic closeups and escalating physical comedy.",
    aspect:"16:9", duration:10, ratio:"16 / 10", badge:"TRENDING", views:"175K+"
  },
  {
    id:"hardwired", tab:"trending", title:"HARDWIRED", creator:"@wizard_from_another_dimension",
    sourceHref:"https://higgsfield.ai/contests/make-your-action-scene/submissions/acc84915-0e12-48bc-af3c-3ae19bb71df3",
    model:"cinema-studio-4",
    prompt:"Original cyberpunk action scene in a dense futuristic Asian megacity, layered signage, weathered architecture, grounded cinematic blocking, practical neon lighting, graphic-novel composition and a lived-in world.",
    aspect:"16:9", duration:12, ratio:"9 / 14", badge:"TRENDING", views:"16K+"
  },
  {
    id:"code-crimson", tab:"trending", title:"CODE CRIMSON", creator:"@aidirector",
    sourceHref:"https://higgsfield.ai/contests/make-your-action-scene/submissions/7b6e1940-0dd8-4780-af43-77f35635cd7d",
    model:"cinema-studio-4",
    prompt:"Original high-octane heist action sequence with a supercar racing between tall buildings, precise dynamic camera angles, photorealistic lighting, rapid but readable cuts, blockbuster tension and an original setting.",
    aspect:"16:9", duration:10, ratio:"16 / 9", badge:"TRENDING", views:"5.7K+"
  },
  {
    id:"aterna", tab:"trending", title:"ATERNA", creator:"@meditating_hedgehog_the_mighty",
    sourceHref:"https://higgsfield.ai/contests/make-your-action-scene/submissions/6ac259ca-571a-4991-929a-9921fd9a1ffd",
    model:"cinema-studio-4",
    prompt:"Original near-future techno-thriller: a woman wearing a memory visor sees the city flicker between a polished subscription reality and a burning dead timeline, cinematic glitches, emotional closeups and escalating psychological danger.",
    aspect:"16:9", duration:12, ratio:"4 / 5", badge:"TRENDING", views:"552"
  },
  {
    id:"welcome-home", tab:"trending", title:"Welcome Home", creator:"@agaprod",
    sourceHref:"https://higgsfield.ai/contests/make-your-action-scene/submissions/724e5239-22ea-4fa7-a877-8db9addd52af",
    model:"cinema-studio-4",
    prompt:"Original grief-driven forest thriller: a couple relocates to an isolated house and a mysterious presence begins watching from the trees, restrained performances, misty natural light, slow dread and emotionally grounded horror.",
    aspect:"16:9", duration:12, ratio:"9 / 13", badge:"TRENDING", views:"11K+"
  },
  {
    id:"inu-brawler", tab:"trending", title:"The INU Brawler", creator:"@commercialspider1235",
    sourceHref:"https://higgsfield.ai/contests/make-your-action-scene/submissions/98413c81-c6fe-437e-9e2a-2adba7316960",
    model:"kling-3-standard",
    prompt:"Original high-energy comedic martial-arts scene with a masked young brawler cornered by a ridiculous street gang, fast parkour, exaggerated anime-style impacts, surprising animal chaos and playful cinematic timing.",
    aspect:"9:16", duration:9, ratio:"9 / 16", badge:"COMMUNITY", views:"246"
  },

  {
    id:"requiem-red", tab:"new", title:"REQUIEM IN RED", creator:"@burakvrsl",
    sourceHref:"https://higgsfield.ai/contests/make-your-action-scene/submissions/0e9568ad-cefb-4a83-bac7-1e113360bb2a",
    model:"cinema-studio-4",
    prompt:"Original sword-duel sequence on black sand beneath a cold grey sky, two warriors in a restrained crimson visual language, elegant choreography, strong silhouettes, slow tension and cinematic wind.",
    aspect:"16:9", duration:10, ratio:"3 / 4", badge:"NEW", views:"507"
  },
  {
    id:"ballerina", tab:"new", title:"Ballerina", creator:"@fein",
    sourceHref:"https://higgsfield.ai/contests/make-your-action-scene/submissions/ba9886b5-d1ca-4bdf-b38b-9f03bde45ee4",
    model:"kling-3-standard",
    prompt:"Original action-ballet scene: a disciplined white-costumed ballerina assassin crosses a dangerous underworld with elegant precision, graceful choreography colliding with close-quarters action, premium theatrical lighting.",
    aspect:"9:16", duration:9, ratio:"9 / 15", badge:"NEW", views:"401"
  },
  {
    id:"drink", tab:"new", title:"DRINK", creator:"@famemonstas",
    sourceHref:"https://higgsfield.ai/contests/make-your-action-scene/submissions/2c7dfa2f-6187-4103-bc9d-aa47a42a85df",
    model:"seedance-2-5",
    prompt:"Original musical thriller montage in a glamorous night-time entertainment district where spectacle gradually decays into something unsettling, flashing cameras, hypnotic performance, surreal transitions and cinematic rhythm.",
    aspect:"9:16", duration:10, ratio:"4 / 5", badge:"NEW", views:"441"
  },
  {
    id:"rotting-banana", tab:"new", title:"THE ROTTING BANANA", creator:"@armo-ava",
    sourceHref:"https://higgsfield.ai/contests/make-your-action-scene/submissions/32dbafd5-7853-4fd0-90f9-65dde45112e7",
    model:"seedance-2-5",
    prompt:"Original absurd post-apocalyptic short: the last human walks through a decayed city carrying a single perfect banana that becomes a strange symbol of hope and corruption, deadpan framing, surreal decay and dark humour.",
    aspect:"16:9", duration:10, ratio:"16 / 10", badge:"NEW", views:"328"
  },
  {
    id:"ground-zero", tab:"new", title:"Ground Zero Glow", creator:"@darkplanet",
    sourceHref:"https://higgsfield.ai/contests/make-your-action-scene/submissions/aa5efb85-fe4b-46e6-98d8-b31e6628bf46",
    model:"cinema-studio-4",
    prompt:"Original post-catastrophe cinematic sequence focused on an abandoned city after an unspecified disaster, silent streets, ash in the air, distant orange glow, restrained human perspective and haunting environmental storytelling.",
    aspect:"16:9", duration:10, ratio:"9 / 14", badge:"NEW", views:"244"
  },
  ...trendDemos.map((t):CommunityFeedItem=>({id:"library-"+t.id,tab:"higgsfield",title:t.title,creator:"Higgsfield · эффектийн жишээ",sourceHref:t.official,model:t.category==="genjutsu"?(t.id.startsWith("motion")?"genjutsu-motion":"genjutsu-object"):"seedance-2-5-image",prompt:t.description+" "+t.use+". Эх материалын гол дүр, объектын хэлбэрийг хадгал. Камерын хөдөлгөөн жигд, гэрэл байгалийн.",aspect:"9:16",duration:5,ratio:"9 / 16",badge:t.badge,previewSrc:t.previewSrc,poster:t.poster})),
];

export function communityFeedHref(item: CommunityFeedItem) {
  const query = new URLSearchParams({
    model: item.model,
    prompt: item.prompt,
    aspect: item.aspect,
    duration: String(item.duration),
    source: item.title,
  });
  return "/studio?" + query.toString();
}
