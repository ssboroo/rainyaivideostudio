export type HfParameter = {name:string;type:string;required:boolean;default?:unknown;options?:string[];minimum?:number;maximum?:number;minLength?:number;maxLength?:number};
export type HfModelSpec = {id:string;name:string;source:string;parameters:HfParameter[];verified:boolean;reason:string};
// Model-specific official references inspected 2026-10-06. No credentials or account access claims.
export const hfModelSpecs:HfModelSpec[] = [
  {
    "id": "bytedance/seedance-2.5/text-to-video",
    "name": "Seedance 2.5",
    "source": "https://open.higgsfield.ai/models/bytedance/seedance-2.5/text-to-video/api-reference",
    "parameters": [
      {
        "name": "prompt",
        "type": "string",
        "required": true,
        "minLength": 1
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "minimum": 4,
        "maximum": 30
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "720p",
        "options": [
          "480p",
          "720p",
          "1080p"
        ]
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "default": "16:9",
        "options": [
          "16:9",
          "4:3",
          "1:1",
          "3:4",
          "9:16",
          "21:9"
        ]
      },
      {
        "name": "output_format",
        "type": "string",
        "required": false,
        "default": "mp4",
        "options": [
          "mp4",
          "mov"
        ]
      },
      {
        "name": "generate_audio",
        "type": "boolean",
        "required": false,
        "default": true
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "bytedance/seedance-2.5/image-to-video",
    "name": "Seedance 2.5",
    "source": "https://open.higgsfield.ai/models/bytedance/seedance-2.5/image-to-video/api-reference",
    "parameters": [
      {
        "name": "prompt",
        "type": "string",
        "required": false,
        "minLength": 1
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "minimum": 4,
        "maximum": 30
      },
      {
        "name": "image_url",
        "type": "string",
        "required": true
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "720p",
        "options": [
          "480p",
          "720p",
          "1080p"
        ]
      },
      {
        "name": "end_image_url",
        "type": "string",
        "required": false
      },
      {
        "name": "output_format",
        "type": "string",
        "required": false,
        "default": "mp4",
        "options": [
          "mp4",
          "mov"
        ]
      },
      {
        "name": "generate_audio",
        "type": "boolean",
        "required": false,
        "default": true
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "bytedance/seedance-2.5/reference-to-video",
    "name": "Seedance 2.5",
    "source": "https://open.higgsfield.ai/models/bytedance/seedance-2.5/reference-to-video/api-reference",
    "parameters": [
      {
        "name": "prompt",
        "type": "string",
        "required": false,
        "minLength": 1
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "minimum": 4,
        "maximum": 30
      },
      {
        "name": "audio_urls",
        "type": "array[string]",
        "required": false
      },
      {
        "name": "image_urls",
        "type": "array[string]",
        "required": false
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "720p",
        "options": [
          "480p",
          "720p",
          "1080p"
        ]
      },
      {
        "name": "video_urls",
        "type": "array[string]",
        "required": false
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "default": "16:9",
        "options": [
          "16:9",
          "4:3",
          "1:1",
          "3:4",
          "9:16",
          "21:9"
        ]
      },
      {
        "name": "output_format",
        "type": "string",
        "required": false,
        "default": "mp4",
        "options": [
          "mp4",
          "mov"
        ]
      },
      {
        "name": "generate_audio",
        "type": "boolean",
        "required": false,
        "default": true
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "kling-video/v3.0/std/text-to-video",
    "name": "Kling 3.0 Standard",
    "source": "https://open.higgsfield.ai/models/kling-video/v3.0/std/text-to-video/api-reference",
    "parameters": [
      {
        "name": "sound",
        "type": "string",
        "required": false,
        "default": "on",
        "options": [
          "on",
          "off"
        ]
      },
      {
        "name": "prompt",
        "type": "string",
        "required": false
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "minimum": 3,
        "maximum": 15
      },
      {
        "name": "elements",
        "type": "array[string]",
        "required": false
      },
      {
        "name": "cfg_scale",
        "type": "number",
        "required": false,
        "default": 0.5,
        "minimum": 0,
        "maximum": 1
      },
      {
        "name": "multi_shots",
        "type": "boolean",
        "required": false,
        "default": false
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "default": "16:9",
        "options": [
          "16:9",
          "9:16",
          "1:1"
        ]
      },
      {
        "name": "multi_prompt",
        "type": "array[object]",
        "required": false
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "kling-video/v3.0-turbo/text-to-video",
    "name": "kling-3-turbo",
    "source": "https://open.higgsfield.ai/models/kling-video/v3.0-turbo/text-to-video/api-reference",
    "parameters": [],
    "verified": false,
    "reason": "Загварын API баримт одоогоор баталгаажаагүй."
  },
  {
    "id": "kling-video/v3.0/pro/image-to-video",
    "name": "Kling 3.0 Pro",
    "source": "https://open.higgsfield.ai/models/kling-video/v3.0/pro/image-to-video/api-reference",
    "parameters": [
      {
        "name": "sound",
        "type": "string",
        "required": false,
        "default": "on",
        "options": [
          "on",
          "off"
        ]
      },
      {
        "name": "prompt",
        "type": "string",
        "required": false
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "minimum": 3,
        "maximum": 15
      },
      {
        "name": "elements",
        "type": "array[string]",
        "required": false
      },
      {
        "name": "cfg_scale",
        "type": "number",
        "required": false,
        "default": 0.5,
        "minimum": 0,
        "maximum": 1
      },
      {
        "name": "image_url",
        "type": "string",
        "required": true
      },
      {
        "name": "multi_shots",
        "type": "boolean",
        "required": false,
        "default": false
      },
      {
        "name": "multi_prompt",
        "type": "array[object]",
        "required": false
      },
      {
        "name": "last_image_url",
        "type": "string",
        "required": false
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "alibaba/wan-3.0-prime/text-to-video",
    "name": "Wan 3.0 Prime Text to Video",
    "source": "https://open.higgsfield.ai/models/alibaba/wan-3.0-prime/text-to-video/api-reference",
    "parameters": [
      {
        "name": "seed",
        "type": "integer",
        "required": false,
        "minimum": 0,
        "maximum": 2147483647
      },
      {
        "name": "prompt",
        "type": "string",
        "required": true
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "minimum": 2,
        "maximum": 30
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "1080p",
        "options": [
          "480p",
          "720p",
          "1080p"
        ]
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "default": "adaptive",
        "options": [
          "16:9",
          "4:3",
          "1:1",
          "3:4",
          "9:16",
          "adaptive"
        ]
      },
      {
        "name": "generate_audio",
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "enable_thinking",
        "type": "boolean",
        "required": false,
        "default": false
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "alibaba/wan-3.0-prime/image-to-video",
    "name": "Wan 3.0 Prime Image to Video",
    "source": "https://open.higgsfield.ai/models/alibaba/wan-3.0-prime/image-to-video/api-reference",
    "parameters": [
      {
        "name": "seed",
        "type": "integer",
        "required": false,
        "minimum": 0,
        "maximum": 2147483647
      },
      {
        "name": "prompt",
        "type": "string",
        "required": true
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "minimum": 2,
        "maximum": 30
      },
      {
        "name": "image_url",
        "type": "string",
        "required": true
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "1080p",
        "options": [
          "480p",
          "720p",
          "1080p"
        ]
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "default": "adaptive",
        "options": [
          "16:9",
          "4:3",
          "1:1",
          "3:4",
          "9:16",
          "adaptive"
        ]
      },
      {
        "name": "end_image_url",
        "type": "string",
        "required": false
      },
      {
        "name": "generate_audio",
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "enable_thinking",
        "type": "boolean",
        "required": false,
        "default": false
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "higgsfield/cinema-studio/4.0",
    "name": "Cinema Studio 4.0",
    "source": "https://open.higgsfield.ai/models/higgsfield/cinema-studio/4.0/api-reference",
    "parameters": [],
    "verified": false,
    "reason": "Тусгай холболтын нөхцөлийг баталгаажуулж байна."
  },
  {
    "id": "kling-video/v3/motion-control/std",
    "name": "Kling 3.0",
    "source": "https://open.higgsfield.ai/models/kling-video/v3/motion-control/std/api-reference",
    "parameters": [
      {
        "name": "prompt",
        "type": "string",
        "required": false,
        "default": ""
      },
      {
        "name": "image_url",
        "type": "string",
        "required": true
      },
      {
        "name": "video_url",
        "type": "string",
        "required": true
      },
      {
        "name": "keep_original_sound",
        "type": "string",
        "required": false,
        "default": "yes",
        "options": [
          "yes",
          "no"
        ]
      },
      {
        "name": "character_orientation",
        "type": "string",
        "required": false,
        "default": "video",
        "options": [
          "image",
          "video"
        ]
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "higgsfield/genjutsu/motion-transfer/v1.0",
    "name": "Genjutsu",
    "source": "https://open.higgsfield.ai/models/higgsfield/genjutsu/motion-transfer/v1.0/api-reference",
    "parameters": [
      {
        "name": "prompt",
        "type": "string",
        "required": false,
        "default": "",
        "maxLength": 10000
      },
      {
        "name": "video_url",
        "type": "string",
        "required": true,
        "minLength": 1,
        "maxLength": 2083
      },
      {
        "name": "image_urls",
        "type": "array[string]",
        "required": true
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "720p",
        "options": [
          "720p",
          "480p",
          "1080p"
        ]
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "higgsfield/genjutsu/object-swap/v1.0",
    "name": "Genjutsu Object Swap",
    "source": "https://open.higgsfield.ai/models/higgsfield/genjutsu/object-swap/v1.0/api-reference",
    "parameters": [
      {"name":"prompt","type":"string","required":false,"default":"","maxLength":10000},
      {"name":"video_url","type":"string (URL)","required":true,"minLength":1,"maxLength":2083},
      {"name":"image_urls","type":"array[string]","required":true},
      {"name":"resolution","type":"string","required":false,"default":"720p","options":["480p","720p","1080p"]}
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "higgsfield/genjutsu/restyle/v1.0",
    "name": "Genjutsu",
    "source": "https://open.higgsfield.ai/models/higgsfield/genjutsu/restyle/v1.0/api-reference",
    "parameters": [
      {
        "name": "video_url",
        "type": "string (URL)",
        "required": true
      },
      {
        "name": "preset_id",
        "type": "string (UUID)",
        "required": true
      },
      {
        "name": "image_urls",
        "type": "array of URL strings",
        "required": false,
        "default": []
      },
      {
        "name": "prompt",
        "type": "string",
        "required": false,
        "default": ""
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "720p",
        "options": [
          "720p",
          "480p",
          "1080p"
        ]
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "bytedance/seedance-2.5/video-edit",
    "name": "Seedance 2.5",
    "source": "https://open.higgsfield.ai/models/bytedance/seedance-2.5/video-edit/api-reference",
    "parameters": [
      {
        "name": "prompt",
        "type": "string",
        "required": true,
        "minLength": 1
      },
      {
        "name": "video_url",
        "type": "string",
        "required": true
      },
      {
        "name": "audio_urls",
        "type": "array[string]",
        "required": false
      },
      {
        "name": "image_urls",
        "type": "array[string]",
        "required": false
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "720p",
        "options": [
          "480p",
          "720p",
          "1080p"
        ]
      },
      {
        "name": "video_urls",
        "type": "array[string]",
        "required": false
      },
      {
        "name": "output_format",
        "type": "string",
        "required": false,
        "default": "mp4",
        "options": [
          "mp4",
          "mov"
        ]
      },
      {
        "name": "generate_audio",
        "type": "boolean",
        "required": false,
        "default": true
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "marketing-studio/image",
    "name": "Marketing Studio Image",
    "source": "https://open.higgsfield.ai/models/marketing-studio/image/api-reference",
    "parameters": [
      {
        "name": "prompt",
        "type": "string",
        "required": true,
        "minLength": 1
      },
      {
        "name": "image_urls",
        "type": "array[string]",
        "required": false
      },
      {
        "name": "preset_id",
        "type": "string",
        "required": false
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "2k",
        "options": [
          "1k",
          "2k",
          "4k"
        ]
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "default": "auto",
        "options": [
          "auto",
          "1:1",
          "3:2",
          "2:3",
          "4:3",
          "3:4",
          "16:9",
          "9:16",
          "21:9"
        ]
      },
      {
        "name": "quality",
        "type": "string",
        "required": false,
        "default": "high",
        "options": [
          "low",
          "medium",
          "high"
        ]
      },
      {
        "name": "moderation",
        "type": "string",
        "required": false,
        "default": "auto",
        "options": [
          "auto"
        ]
      },
      {
        "name": "enhance_prompt",
        "type": "boolean",
        "required": false,
        "default": false
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "higgsfield/ai-influencer",
    "name": "ai-influencer",
    "source": "https://open.higgsfield.ai/models/higgsfield/ai-influencer/api-reference",
    "parameters": [],
    "verified": false,
    "reason": "Загварын API баримт одоогоор баталгаажаагүй."
  },
  {
    "id": "higgsfield-ai/soul/v2/standard",
    "name": "Soul 2",
    "source": "https://open.higgsfield.ai/models/higgsfield-ai/soul/v2/standard/api-reference",
    "parameters": [
      {
        "name": "seed",
        "type": "integer",
        "required": false,
        "default": null,
        "minimum": 1,
        "maximum": 1000000
      },
      {
        "name": "prompt",
        "type": "string",
        "required": true
      },
      {
        "name": "style_id",
        "type": "string",
        "required": false
      },
      {
        "name": "custom_reference_id",
        "type": "string (UUID) or null",
        "required": false,
        "default": null
      },
      {
        "name": "custom_reference_strength",
        "type": "number",
        "required": false,
        "default": 1
      },
      {
        "name": "batch_size",
        "type": "integer",
        "required": false,
        "default": 1,
        "options": [
          "1",
          "4"
        ]
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "720p",
        "options": [
          "720p",
          "1080p"
        ]
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "default": "4:3",
        "options": [
          "9:16",
          "16:9",
          "4:3",
          "3:4",
          "1:1",
          "2:3",
          "3:2"
        ]
      },
      {
        "name": "enhance_prompt",
        "type": "boolean",
        "required": false,
        "default": true
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "higgsfield-ai/soul/v2/image-to-image",
    "name": "Soul 2",
    "source": "https://open.higgsfield.ai/models/higgsfield-ai/soul/v2/image-to-image/api-reference",
    "parameters": [
      {
        "name": "seed",
        "type": "integer",
        "required": false,
        "default": null,
        "minimum": 1,
        "maximum": 1000000
      },
      {
        "name": "image_url",
        "type": "string (URL)",
        "required": true
      },
      {
        "name": "prompt",
        "type": "string",
        "required": true
      },
      {
        "name": "style_id",
        "type": "string",
        "required": false
      },
      {
        "name": "custom_reference_id",
        "type": "string (UUID) or null",
        "required": false,
        "default": null
      },
      {
        "name": "custom_reference_strength",
        "type": "number",
        "required": false,
        "default": 1
      },
      {
        "name": "batch_size",
        "type": "integer",
        "required": false,
        "default": 1,
        "options": [
          "1",
          "4"
        ]
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "720p",
        "options": [
          "720p",
          "1080p"
        ]
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "default": "4:3",
        "options": [
          "9:16",
          "16:9",
          "4:3",
          "3:4",
          "1:1",
          "2:3",
          "3:2"
        ]
      },
      {
        "name": "enhance_prompt",
        "type": "boolean",
        "required": false,
        "default": true
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "ideogram/v4.0",
    "name": "Ideogram 4.0",
    "source": "https://open.higgsfield.ai/models/ideogram/v4.0/api-reference",
    "parameters": [
      {
        "name": "prompt",
        "type": "string",
        "required": true,
        "minLength": 2,
        "maxLength": 2048
      },
      {
        "name": "image_url",
        "type": "string",
        "required": false
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "default": "1:1",
        "options": [
          "1:1",
          "1:2",
          "2:1",
          "2:3",
          "3:2",
          "4:5",
          "5:4",
          "9:16",
          "16:9",
          "5:8",
          "8:5",
          "3:4",
          "4:3",
          "9:22",
          "22:9",
          "9:23",
          "23:9",
          "3:8",
          "8:3",
          "5:12",
          "12:5",
          "1:3",
          "3:1"
        ]
      },
      {
        "name": "image_weight",
        "type": "integer",
        "required": false,
        "minimum": 1,
        "maximum": 100
      },
      {
        "name": "rendering_speed",
        "type": "string",
        "required": false,
        "default": "DEFAULT",
        "options": [
          "TURBO",
          "DEFAULT",
          "QUALITY"
        ]
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "recraft/v4.1/text-to-image",
    "name": "Recraft V4.1",
    "source": "https://open.higgsfield.ai/models/recraft/v4.1/text-to-image/api-reference",
    "parameters": [
      {
        "name": "colors",
        "type": "array[object]",
        "required": false
      },
      {
        "name": "prompt",
        "type": "string",
        "required": true,
        "minLength": 1,
        "maxLength": 10000
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "1k",
        "options": [
          "1k"
        ]
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "default": "1:1",
        "options": [
          "1:1",
          "2:1",
          "1:2",
          "3:2",
          "2:3",
          "4:3",
          "3:4",
          "5:4",
          "4:5",
          "6:10",
          "14:10",
          "10:14",
          "16:9",
          "9:16"
        ]
      },
      {
        "name": "output_format",
        "type": "string",
        "required": false,
        "default": "jpg",
        "options": [
          "jpg",
          "png",
          "webp"
        ]
      },
      {
        "name": "background_color",
        "type": "object",
        "required": false
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "alibaba/qwen-image-3/text-to-image",
    "name": "Qwen Image 3",
    "source": "https://open.higgsfield.ai/models/alibaba/qwen-image-3/text-to-image/api-reference",
    "parameters": [
      {
        "name": "seed",
        "type": "integer",
        "required": false,
        "minimum": 0,
        "maximum": 2147483647
      },
      {
        "name": "prompt",
        "type": "string",
        "required": true,
        "minLength": 1
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "1k",
        "options": [
          "1k",
          "2k"
        ]
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "default": "1:1",
        "options": [
          "1:1",
          "2:3",
          "3:2",
          "3:4",
          "4:3",
          "7:9",
          "9:7",
          "9:16",
          "16:9",
          "21:9"
        ]
      },
      {
        "name": "prompt_extend",
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "enable_thinking",
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "negative_prompt",
        "type": "string",
        "required": false
      },
      {
        "name": "prompt_extend_mode",
        "type": "string",
        "required": false,
        "default": "direct",
        "options": [
          "direct",
          "agent"
        ]
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "alibaba/qwen-image-3/edit",
    "name": "Qwen Image 3",
    "source": "https://open.higgsfield.ai/models/alibaba/qwen-image-3/edit/api-reference",
    "parameters": [
      {
        "name": "seed",
        "type": "integer",
        "required": false,
        "minimum": 0,
        "maximum": 2147483647
      },
      {
        "name": "prompt",
        "type": "string",
        "required": true,
        "minLength": 1
      },
      {
        "name": "image_urls",
        "type": "array[string]",
        "required": true
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "1k",
        "options": [
          "1k",
          "2k"
        ]
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "default": "1:1",
        "options": [
          "1:1",
          "2:3",
          "3:2",
          "3:4",
          "4:3",
          "7:9",
          "9:7",
          "9:16",
          "16:9",
          "21:9"
        ]
      },
      {
        "name": "prompt_extend",
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "enable_thinking",
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "negative_prompt",
        "type": "string",
        "required": false
      },
      {
        "name": "prompt_extend_mode",
        "type": "string",
        "required": false,
        "default": "direct",
        "options": [
          "direct"
        ]
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "xai/grok-imagine-image-2.0",
    "name": "Grok Imagine 2.0",
    "source": "https://open.higgsfield.ai/models/xai/grok-imagine-image-2.0/api-reference",
    "parameters": [
      {
        "name": "prompt",
        "type": "string",
        "required": true
      },
      {
        "name": "quality",
        "type": "string",
        "required": false,
        "default": "medium",
        "options": [
          "low",
          "medium"
        ]
      },
      {
        "name": "image_urls",
        "type": "array[string]",
        "required": false
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "1k",
        "options": [
          "1k",
          "2k"
        ]
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "default": "auto",
        "options": [
          "auto",
          "1:1",
          "1:2",
          "2:1",
          "3:2",
          "2:3",
          "4:3",
          "3:4",
          "16:9",
          "9:16"
        ]
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "bytedance/seedance-2.0/text-to-video",
    "name": "Seedance 2.0",
    "source": "https://open.higgsfield.ai/models/bytedance/seedance-2.0/text-to-video/api-reference",
    "parameters": [
      {
        "name": "prompt",
        "type": "string",
        "required": true,
        "minLength": 1
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "minimum": 4,
        "maximum": 15
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "720p",
        "options": [
          "480p",
          "720p",
          "1080p",
          "4k"
        ]
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "default": "16:9",
        "options": [
          "16:9",
          "4:3",
          "1:1",
          "3:4",
          "9:16",
          "21:9"
        ]
      },
      {
        "name": "generate_audio",
        "type": "boolean",
        "required": false,
        "default": true
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "higgsfield-ai/soul/standard",
    "name": "Soul Standard",
    "source": "https://open.higgsfield.ai/models/higgsfield-ai/soul/standard/api-reference",
    "parameters": [
      {
        "name": "seed",
        "type": "integer",
        "required": false,
        "default": null,
        "minimum": 1,
        "maximum": 1000000
      },
      {
        "name": "prompt",
        "type": "string",
        "required": true
      },
      {
        "name": "style_id",
        "type": "string",
        "required": false,
        "default": null
      },
      {
        "name": "batch_size",
        "type": "integer",
        "required": false,
        "default": 1,
        "options": [
          "1",
          "4"
        ]
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "720p",
        "options": [
          "720p",
          "1080p"
        ]
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "default": "4:3",
        "options": [
          "9:16",
          "16:9",
          "4:3",
          "3:4",
          "1:1",
          "2:3",
          "3:2"
        ]
      },
      {
        "name": "enhance_prompt",
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "style_strength",
        "type": "number",
        "required": false,
        "default": 1,
        "minimum": 0,
        "maximum": 1
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "z-image/turbo",
    "name": "Z-Image Turbo",
    "source": "https://open.higgsfield.ai/models/z-image/turbo/api-reference",
    "parameters": [
      {
        "name": "seed",
        "type": "integer",
        "required": false,
        "minimum": 0,
        "maximum": 2147483647
      },
      {
        "name": "prompt",
        "type": "string",
        "required": true,
        "minLength": 1,
        "maxLength": 800
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "1k",
        "options": [
          "1k",
          "2k"
        ]
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "default": "1:1",
        "options": [
          "1:1",
          "2:3",
          "3:2",
          "3:4",
          "4:3",
          "7:9",
          "9:7",
          "9:16",
          "16:9",
          "21:9"
        ]
      },
      {
        "name": "prompt_extend",
        "type": "boolean",
        "required": false,
        "default": false
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "alibaba/wan-3.0/text-to-video",
    "name": "Wan 3.0 Text to Video",
    "source": "https://open.higgsfield.ai/models/alibaba/wan-3.0/text-to-video/api-reference",
    "parameters": [
      {
        "name": "seed",
        "type": "integer",
        "required": false,
        "minimum": 0,
        "maximum": 2147483647
      },
      {
        "name": "prompt",
        "type": "string",
        "required": true
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "minimum": 2,
        "maximum": 30
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "1080p",
        "options": [
          "480p",
          "720p",
          "1080p"
        ]
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "default": "adaptive",
        "options": [
          "16:9",
          "4:3",
          "1:1",
          "3:4",
          "9:16",
          "adaptive"
        ]
      },
      {
        "name": "generate_audio",
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "enable_thinking",
        "type": "boolean",
        "required": false,
        "default": false
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "lightricks/ltx-2.5/text-to-video/fast",
    "name": "LTX-2.5 Fast",
    "source": "https://open.higgsfield.ai/models/lightricks/ltx-2.5/text-to-video/fast/api-reference",
    "parameters": [
      {
        "name": "fps",
        "type": "integer",
        "required": false,
        "default": 25,
        "options": [
          "24",
          "25",
          "48",
          "50"
        ]
      },
      {
        "name": "prompt",
        "type": "string",
        "required": true,
        "minLength": 2,
        "maxLength": 5000
      },
      {
        "name": "duration",
        "type": "integer",
        "required": true,
        "default": 6,
        "options": [
          "6",
          "8",
          "10"
        ]
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "720p",
        "options": [
          "720p",
          "1080p",
          "2k",
          "4k"
        ]
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "default": "16:9",
        "options": [
          "16:9",
          "9:16"
        ]
      },
      {
        "name": "generate_audio",
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "camera_movement",
        "type": "string",
        "required": false,
        "options": [
          "dolly_in",
          "dolly_out",
          "dolly_left",
          "dolly_right",
          "jib_up",
          "jib_down",
          "static",
          "focus_shift"
        ]
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "lightricks/ltx-2.5/text-to-video/pro",
    "name": "LTX-2.5 Pro",
    "source": "https://open.higgsfield.ai/models/lightricks/ltx-2.5/text-to-video/pro/api-reference",
    "parameters": [
      {
        "name": "fps",
        "type": "integer",
        "required": false,
        "default": 25,
        "options": [
          "24",
          "25",
          "50"
        ]
      },
      {
        "name": "prompt",
        "type": "string",
        "required": true,
        "minLength": 2,
        "maxLength": 5000
      },
      {
        "name": "duration",
        "type": "integer",
        "required": true,
        "default": 6,
        "options": [
          "6",
          "8",
          "10"
        ]
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "720p",
        "options": [
          "720p",
          "1080p"
        ]
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "default": "16:9",
        "options": [
          "16:9",
          "9:16"
        ]
      },
      {
        "name": "generate_audio",
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "camera_movement",
        "type": "string",
        "required": false,
        "options": [
          "dolly_in",
          "dolly_out",
          "dolly_left",
          "dolly_right",
          "jib_up",
          "jib_down",
          "static",
          "focus_shift"
        ]
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "xai/grok-imagine-video/v1.5/reference-to-video",
    "name": "Grok Imagine Video 1.5",
    "source": "https://open.higgsfield.ai/models/xai/grok-imagine-video/v1.5/reference-to-video/api-reference",
    "parameters": [
      {
        "name": "prompt",
        "type": "string",
        "required": true
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "minimum": 1,
        "maximum": 15
      },
      {
        "name": "audio_url",
        "type": "string",
        "required": false
      },
      {
        "name": "image_url",
        "type": "string",
        "required": false
      },
      {
        "name": "image_urls",
        "type": "array[string]",
        "required": false
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "480p",
        "options": [
          "480p",
          "720p",
          "1080p"
        ]
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "default": "auto",
        "options": [
          "auto",
          "1:1",
          "16:9",
          "9:16",
          "4:3",
          "3:4",
          "3:2",
          "2:3"
        ]
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "wan/v2.7/text-to-video",
    "name": "Wan 2.7",
    "source": "https://open.higgsfield.ai/models/wan/v2.7/text-to-video/api-reference",
    "parameters": [
      {
        "name": "seed",
        "type": "integer",
        "required": false,
        "minimum": 1,
        "maximum": 2147483646
      },
      {
        "name": "prompt",
        "type": "string",
        "required": true
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "minimum": 2,
        "maximum": 15
      },
      {
        "name": "audio_url",
        "type": "string",
        "required": false
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "720p",
        "options": [
          "720p",
          "1080p"
        ]
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "default": "16:9",
        "options": [
          "16:9",
          "9:16",
          "1:1",
          "4:3",
          "3:4"
        ]
      },
      {
        "name": "prompt_extend",
        "type": "boolean",
        "required": false,
        "default": false
      },
      {
        "name": "negative_prompt",
        "type": "string",
        "required": false,
        "default": ""
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "alibaba/happy-horse/v1.1/text-to-video",
    "name": "HappyHorse 1.1",
    "source": "https://open.higgsfield.ai/models/alibaba/happy-horse/v1.1/text-to-video/api-reference",
    "parameters": [
      {
        "name": "seed",
        "type": "integer",
        "required": false,
        "minimum": 1,
        "maximum": 2147483646
      },
      {
        "name": "prompt",
        "type": "string",
        "required": true
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "minimum": 3,
        "maximum": 15
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "1080p",
        "options": [
          "720p",
          "1080p"
        ]
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "default": "16:9",
        "options": [
          "16:9",
          "9:16",
          "1:1",
          "4:3",
          "3:4"
        ]
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "alibaba/happy-horse/text-to-video",
    "name": "Happy Horse 1.0",
    "source": "https://open.higgsfield.ai/models/alibaba/happy-horse/text-to-video/api-reference",
    "parameters": [
      {
        "name": "seed",
        "type": "integer",
        "required": false,
        "minimum": 1,
        "maximum": 2147483646
      },
      {
        "name": "prompt",
        "type": "string",
        "required": true
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "minimum": 3,
        "maximum": 15
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "720p",
        "options": [
          "720p",
          "1080p"
        ]
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "default": "16:9",
        "options": [
          "16:9",
          "9:16",
          "1:1",
          "4:3",
          "3:4"
        ]
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "minimax/h3/text-to-video",
    "name": "MiniMax H3",
    "source": "https://open.higgsfield.ai/models/minimax/h3/text-to-video/api-reference",
    "parameters": [
      {
        "name": "prompt",
        "type": "string",
        "required": true,
        "minLength": 1
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "minimum": 5,
        "maximum": 15
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "2K",
        "options": [
          "2K"
        ]
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "default": "auto",
        "options": [
          "auto",
          "adaptive",
          "21:9",
          "16:9",
          "4:3",
          "1:1",
          "3:4",
          "9:16"
        ]
      },
      {
        "name": "aigc_watermark",
        "type": "boolean",
        "required": false,
        "default": false
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "bytedance/seedance-2.5/video-extend",
    "name": "Seedance 2.5 Video Extend",
    "source": "https://open.higgsfield.ai/models/bytedance/seedance-2.5/video-extend/api-reference",
    "parameters": [
      {
        "name": "prompt",
        "type": "string",
        "required": true,
        "minLength": 1
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "minimum": 4,
        "maximum": 30
      },
      {
        "name": "video_url",
        "type": "string",
        "required": true
      },
      {
        "name": "audio_urls",
        "type": "array[string]",
        "required": false
      },
      {
        "name": "image_urls",
        "type": "array[string]",
        "required": false
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "720p",
        "options": [
          "480p",
          "720p",
          "1080p"
        ]
      },
      {
        "name": "video_urls",
        "type": "array[string]",
        "required": false
      },
      {
        "name": "output_format",
        "type": "string",
        "required": false,
        "default": "mp4",
        "options": [
          "mp4",
          "mov"
        ]
      },
      {
        "name": "generate_audio",
        "type": "boolean",
        "required": false,
        "default": true
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "bytedance/seedance-2.0/image-to-video",
    "name": "Seedance 2.0 Image to Video",
    "source": "https://open.higgsfield.ai/models/bytedance/seedance-2.0/image-to-video/api-reference",
    "parameters": [
      {
        "name": "prompt",
        "type": "string",
        "required": false,
        "minLength": 1
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "minimum": 4,
        "maximum": 15
      },
      {
        "name": "image_url",
        "type": "string",
        "required": true
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "720p",
        "options": [
          "480p",
          "720p",
          "1080p",
          "4k"
        ]
      },
      {
        "name": "end_image_url",
        "type": "string",
        "required": false
      },
      {
        "name": "generate_audio",
        "type": "boolean",
        "required": false,
        "default": true
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "bytedance/seedance-2.0/reference-to-video",
    "name": "Seedance 2.0 Reference to Video (with video reference)",
    "source": "https://open.higgsfield.ai/models/bytedance/seedance-2.0/reference-to-video/api-reference",
    "parameters": [
      {
        "name": "prompt",
        "type": "string",
        "required": false,
        "minLength": 1
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "minimum": 4,
        "maximum": 15
      },
      {
        "name": "audio_urls",
        "type": "array[string]",
        "required": false
      },
      {
        "name": "image_urls",
        "type": "array[string]",
        "required": false
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "720p",
        "options": [
          "480p",
          "720p",
          "1080p",
          "4k"
        ]
      },
      {
        "name": "video_urls",
        "type": "array[string]",
        "required": false
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "default": "16:9",
        "options": [
          "16:9",
          "4:3",
          "1:1",
          "3:4",
          "9:16",
          "21:9"
        ]
      },
      {
        "name": "generate_audio",
        "type": "boolean",
        "required": false,
        "default": true
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "marketing-studio/image/flare",
    "name": "Marketing Studio Image 2.5 Flare",
    "source": "https://open.higgsfield.ai/models/marketing-studio/image/flare/api-reference",
    "parameters": [
      {
        "name": "prompt",
        "type": "string",
        "required": true,
        "minLength": 1
      },
      {
        "name": "image_urls",
        "type": "array[string]",
        "required": false
      },
      {
        "name": "preset_id",
        "type": "string",
        "required": false
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "2k",
        "options": [
          "1k",
          "2k",
          "4k"
        ]
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "default": "auto",
        "options": [
          "auto",
          "1:1",
          "3:2",
          "2:3",
          "4:3",
          "3:4",
          "16:9",
          "9:16",
          "21:9"
        ]
      },
      {
        "name": "quality",
        "type": "string",
        "required": false,
        "default": "high",
        "options": [
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "name": "moderation",
        "type": "string",
        "required": false,
        "default": "auto",
        "options": [
          "auto"
        ]
      },
      {
        "name": "enhance_prompt",
        "type": "boolean",
        "required": false,
        "default": false
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "marketing-studio/image/sunburst",
    "name": "Marketing Studio Image 2.5 Sunburst",
    "source": "https://open.higgsfield.ai/models/marketing-studio/image/sunburst/api-reference",
    "parameters": [
      {
        "name": "prompt",
        "type": "string",
        "required": true,
        "minLength": 1
      },
      {
        "name": "image_urls",
        "type": "array[string]",
        "required": false
      },
      {
        "name": "preset_id",
        "type": "string",
        "required": false
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "2k",
        "options": [
          "1k",
          "2k",
          "4k"
        ]
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "default": "auto",
        "options": [
          "auto",
          "1:1",
          "3:2",
          "2:3",
          "4:3",
          "3:4",
          "16:9",
          "9:16",
          "21:9"
        ]
      },
      {
        "name": "quality",
        "type": "string",
        "required": false,
        "default": "high",
        "options": [
          "low",
          "medium",
          "high",
          "xhigh",
          "max"
        ]
      },
      {
        "name": "moderation",
        "type": "string",
        "required": false,
        "default": "auto",
        "options": [
          "auto"
        ]
      },
      {
        "name": "enhance_prompt",
        "type": "boolean",
        "required": false,
        "default": false
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "alibaba/wan-3.0-prime/reference-to-video",
    "name": "Wan 3.0 Prime Reference to Video",
    "source": "https://open.higgsfield.ai/models/alibaba/wan-3.0-prime/reference-to-video/api-reference",
    "parameters": [],
    "verified": false,
    "reason": "Загварын API баримт одоогоор баталгаажаагүй."
  },
  {
    "id": "alibaba/wan-3.0/image-to-video",
    "name": "Wan 3.0 Image to Video",
    "source": "https://open.higgsfield.ai/models/alibaba/wan-3.0/image-to-video/api-reference",
    "parameters": [],
    "verified": false,
    "reason": "Загварын API баримт одоогоор баталгаажаагүй."
  },
  {
    "id": "alibaba/wan-3.0/reference-to-video",
    "name": "Wan 3.0 Reference to Video",
    "source": "https://open.higgsfield.ai/models/alibaba/wan-3.0/reference-to-video/api-reference",
    "parameters": [
      {
        "name": "seed",
        "type": "integer",
        "required": false,
        "minimum": 0,
        "maximum": 2147483647
      },
      {
        "name": "prompt",
        "type": "string",
        "required": true
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "minimum": 2,
        "maximum": 30
      },
      {
        "name": "file_url",
        "type": "string",
        "required": false
      },
      {
        "name": "link_url",
        "type": "string",
        "required": false
      },
      {
        "name": "audio_urls",
        "type": "array[string]",
        "required": false
      },
      {
        "name": "image_urls",
        "type": "array[string]",
        "required": false
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "1080p",
        "options": [
          "480p",
          "720p",
          "1080p"
        ]
      },
      {
        "name": "video_urls",
        "type": "array[string]",
        "required": false
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "default": "adaptive",
        "options": [
          "16:9",
          "4:3",
          "1:1",
          "3:4",
          "9:16",
          "adaptive"
        ]
      },
      {
        "name": "generate_audio",
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "enable_thinking",
        "type": "boolean",
        "required": false,
        "default": false
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "wan/v2.7/image-to-video",
    "name": "Wan 2.7 Image to Video",
    "source": "https://open.higgsfield.ai/models/wan/v2.7/image-to-video/api-reference",
    "parameters": [
      {
        "name": "seed",
        "type": "integer",
        "required": false,
        "minimum": 1,
        "maximum": 2147483646
      },
      {
        "name": "prompt",
        "type": "string",
        "required": false
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "minimum": 2,
        "maximum": 15
      },
      {
        "name": "audio_url",
        "type": "string",
        "required": false
      },
      {
        "name": "image_url",
        "type": "string",
        "required": true
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "720p",
        "options": [
          "720p",
          "1080p"
        ]
      },
      {
        "name": "end_image_url",
        "type": "string",
        "required": false
      },
      {
        "name": "prompt_extend",
        "type": "boolean",
        "required": false,
        "default": "false  |"
      },
      {
        "name": "negative_prompt",
        "type": "string",
        "required": false,
        "default": ""
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "wan/v2.7/reference-to-video",
    "name": "Wan 2.7 Reference to Video",
    "source": "https://open.higgsfield.ai/models/wan/v2.7/reference-to-video/api-reference",
    "parameters": [],
    "verified": false,
    "reason": "Загварын API баримт одоогоор баталгаажаагүй."
  },
  {
    "id": "alibaba/happy-horse/v1.1/image-to-video",
    "name": "HappyHorse 1.1 Image to Video",
    "source": "https://open.higgsfield.ai/models/alibaba/happy-horse/v1.1/image-to-video/api-reference",
    "parameters": [],
    "verified": false,
    "reason": "Загварын API баримт одоогоор баталгаажаагүй."
  },
  {
    "id": "alibaba/happy-horse/v1.1/reference-to-video",
    "name": "HappyHorse 1.1 Reference to Video",
    "source": "https://open.higgsfield.ai/models/alibaba/happy-horse/v1.1/reference-to-video/api-reference",
    "parameters": [
      {
        "name": "seed",
        "type": "integer",
        "required": false,
        "minimum": 1,
        "maximum": 2147483646
      },
      {
        "name": "prompt",
        "type": "string",
        "required": true
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "minimum": 2,
        "maximum": 15
      },
      {
        "name": "image_urls",
        "type": "array[string]",
        "required": true
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "1080p",
        "options": [
          "720p",
          "1080p"
        ]
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "alibaba/happy-horse/image-to-video",
    "name": "Happy Horse 1.0 Image to Video",
    "source": "https://open.higgsfield.ai/models/alibaba/happy-horse/image-to-video/api-reference",
    "parameters": [
      {
        "name": "seed",
        "type": "integer",
        "required": false,
        "minimum": 1,
        "maximum": 2147483646
      },
      {
        "name": "prompt",
        "type": "string",
        "required": false
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "minimum": 2,
        "maximum": 15
      },
      {
        "name": "image_url",
        "type": "string",
        "required": true
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "720p",
        "options": [
          "720p",
          "1080p"
        ]
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "alibaba/happy-horse/reference-to-video",
    "name": "Happy Horse 1.0 Reference to Video",
    "source": "https://open.higgsfield.ai/models/alibaba/happy-horse/reference-to-video/api-reference",
    "parameters": [
      {
        "name": "seed",
        "type": "integer",
        "required": false,
        "minimum": 1,
        "maximum": 2147483646
      },
      {
        "name": "prompt",
        "type": "string",
        "required": true
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "minimum": 2,
        "maximum": 15
      },
      {
        "name": "image_urls",
        "type": "array[string]",
        "required": true
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "720p",
        "options": [
          "720p",
          "1080p"
        ]
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "wan/v2.6/image-to-video",
    "name": "Wan 2.6 Image to Video",
    "source": "https://open.higgsfield.ai/models/wan/v2.6/image-to-video/api-reference",
    "parameters": [],
    "verified": false,
    "reason": "Загварын API баримт одоогоор баталгаажаагүй."
  },
  {
    "id": "wan/v2.6/reference-to-video",
    "name": "Wan 2.6 Reference to Video",
    "source": "https://open.higgsfield.ai/models/wan/v2.6/reference-to-video/api-reference",
    "parameters": [
      {
        "name": "prompt",
        "type": "string",
        "required": true
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "options": [
          "5",
          "10"
        ]
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "720p",
        "options": [
          "720p",
          "1080p"
        ]
      },
      {
        "name": "video_urls",
        "type": "array[string]",
        "required": true
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "default": "16:9",
        "options": [
          "16:9",
          "9:16",
          "1:1",
          "4:3",
          "3:4"
        ]
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "wan/v2.6/text-to-video",
    "name": "Wan 2.6 Text to Video",
    "source": "https://open.higgsfield.ai/models/wan/v2.6/text-to-video/api-reference",
    "parameters": [
      {
        "name": "seed",
        "type": "integer",
        "required": false,
        "maximum": 10000000
      },
      {
        "name": "prompt",
        "type": "string",
        "required": true
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "options": [
          "5",
          "10",
          "15"
        ]
      },
      {
        "name": "audio_url",
        "type": "string",
        "required": false
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "720p",
        "options": [
          "720p",
          "1080p"
        ]
      },
      {
        "name": "multi_shots",
        "type": "boolean",
        "required": false,
        "default": false
      },
      {
        "name": "prompt_extend",
        "type": "boolean",
        "required": false,
        "default": false
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "lightricks/ltx-2.5/image-to-video/fast",
    "name": "LTX-2.5 Fast Image to Video",
    "source": "https://open.higgsfield.ai/models/lightricks/ltx-2.5/image-to-video/fast/api-reference",
    "parameters": [
      {
        "name": "fps",
        "type": "integer",
        "required": false,
        "default": 25,
        "options": [
          "24",
          "25",
          "48",
          "50"
        ]
      },
      {
        "name": "prompt",
        "type": "string",
        "required": true,
        "minLength": 2,
        "maxLength": 5000
      },
      {
        "name": "duration",
        "type": "integer",
        "required": true,
        "default": 6,
        "options": [
          "6",
          "8",
          "10"
        ]
      },
      {
        "name": "image_url",
        "type": "string",
        "required": true
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "720p",
        "options": [
          "720p",
          "1080p",
          "2k",
          "4k"
        ]
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "default": "16:9",
        "options": [
          "16:9",
          "9:16"
        ]
      },
      {
        "name": "end_image_url",
        "type": "string",
        "required": false
      },
      {
        "name": "generate_audio",
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "camera_movement",
        "type": "string",
        "required": false,
        "options": [
          "dolly_in",
          "dolly_out",
          "dolly_left",
          "dolly_right",
          "jib_up",
          "jib_down",
          "static",
          "focus_shift"
        ]
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "lightricks/ltx-2.5/image-to-video/pro",
    "name": "LTX-2.5 Pro Image to Video",
    "source": "https://open.higgsfield.ai/models/lightricks/ltx-2.5/image-to-video/pro/api-reference",
    "parameters": [
      {
        "name": "fps",
        "type": "integer",
        "required": false,
        "default": 25,
        "options": [
          "24",
          "25",
          "50"
        ]
      },
      {
        "name": "prompt",
        "type": "string",
        "required": true,
        "minLength": 2,
        "maxLength": 5000
      },
      {
        "name": "duration",
        "type": "integer",
        "required": true,
        "default": 6,
        "options": [
          "6",
          "8",
          "10"
        ]
      },
      {
        "name": "image_url",
        "type": "string",
        "required": true
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "720p",
        "options": [
          "720p",
          "1080p"
        ]
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "default": "16:9",
        "options": [
          "16:9",
          "9:16"
        ]
      },
      {
        "name": "end_image_url",
        "type": "string",
        "required": false
      },
      {
        "name": "generate_audio",
        "type": "boolean",
        "required": false,
        "default": true
      },
      {
        "name": "camera_movement",
        "type": "string",
        "required": false,
        "options": [
          "dolly_in",
          "dolly_out",
          "dolly_left",
          "dolly_right",
          "jib_up",
          "jib_down",
          "static",
          "focus_shift"
        ]
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "kling-video/v3.0/4k/text-to-video",
    "name": "Kling 3.0 Text to Video (4K)",
    "source": "https://open.higgsfield.ai/models/kling-video/v3.0/4k/text-to-video/api-reference",
    "parameters": [
      {
        "name": "sound",
        "type": "string",
        "required": false,
        "default": "on",
        "options": [
          "on",
          "off"
        ]
      },
      {
        "name": "prompt",
        "type": "string",
        "required": false
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "minimum": 3,
        "maximum": 15
      },
      {
        "name": "elements",
        "type": "array[string]",
        "required": false
      },
      {
        "name": "cfg_scale",
        "type": "number",
        "required": false,
        "default": 0.5,
        "minimum": 0,
        "maximum": 1
      },
      {
        "name": "multi_shots",
        "type": "boolean",
        "required": false,
        "default": false
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "default": "16:9",
        "options": [
          "16:9",
          "9:16",
          "1:1"
        ]
      },
      {
        "name": "multi_prompt",
        "type": "array[object]",
        "required": false
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "kling-video/v3/motion-control/pro",
    "name": "Kling 3.0 Motion Control (Pro)",
    "source": "https://open.higgsfield.ai/models/kling-video/v3/motion-control/pro/api-reference",
    "parameters": [
      {
        "name": "prompt",
        "type": "string",
        "required": false,
        "default": ""
      },
      {
        "name": "image_url",
        "type": "string",
        "required": true
      },
      {
        "name": "video_url",
        "type": "string",
        "required": true
      },
      {
        "name": "keep_original_sound",
        "type": "string",
        "required": false,
        "default": "yes",
        "options": [
          "yes",
          "no"
        ]
      },
      {
        "name": "character_orientation",
        "type": "string",
        "required": false,
        "default": "video",
        "options": [
          "image",
          "video"
        ]
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "kling-video/v3.0/4k/image-to-video",
    "name": "Kling 3.0 4k Image to Video (4K)",
    "source": "https://open.higgsfield.ai/models/kling-video/v3.0/4k/image-to-video/api-reference",
    "parameters": [
      {
        "name": "sound",
        "type": "string",
        "required": false,
        "default": "on",
        "options": [
          "on",
          "off"
        ]
      },
      {
        "name": "prompt",
        "type": "string",
        "required": false
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "minimum": 3,
        "maximum": 15
      },
      {
        "name": "elements",
        "type": "array[string]",
        "required": false,
        "default": "—  |"
      },
      {
        "name": "cfg_scale",
        "type": "number",
        "required": false,
        "default": 0.5,
        "minimum": 0,
        "maximum": 1
      },
      {
        "name": "image_url",
        "type": "string",
        "required": true
      },
      {
        "name": "multi_shots",
        "type": "boolean",
        "required": false,
        "default": "false  |"
      },
      {
        "name": "multi_prompt",
        "type": "array[object]",
        "required": false,
        "default": "—  |"
      },
      {
        "name": "last_image_url",
        "type": "string",
        "required": false
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "kling-video/v3.0/pro/text-to-video",
    "name": "Kling 3.0 Pro Text to Video (Pro)",
    "source": "https://open.higgsfield.ai/models/kling-video/v3.0/pro/text-to-video/api-reference",
    "parameters": [
      {
        "name": "sound",
        "type": "string",
        "required": false,
        "default": "on",
        "options": [
          "on",
          "off"
        ]
      },
      {
        "name": "prompt",
        "type": "string",
        "required": false
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "minimum": 3,
        "maximum": 15
      },
      {
        "name": "elements",
        "type": "array[string]",
        "required": false
      },
      {
        "name": "cfg_scale",
        "type": "number",
        "required": false,
        "default": 0.5,
        "minimum": 0,
        "maximum": 1
      },
      {
        "name": "multi_shots",
        "type": "boolean",
        "required": false,
        "default": false
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "default": "16:9",
        "options": [
          "16:9",
          "9:16",
          "1:1"
        ]
      },
      {
        "name": "multi_prompt",
        "type": "array[object]",
        "required": false
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "kling-video/v3.0/std/image-to-video",
    "name": "Kling 3.0 Standard Image to Video (Standard)",
    "source": "https://open.higgsfield.ai/models/kling-video/v3.0/std/image-to-video/api-reference",
    "parameters": [
      {
        "name": "sound",
        "type": "string",
        "required": false,
        "default": "on",
        "options": [
          "on",
          "off"
        ]
      },
      {
        "name": "prompt",
        "type": "string",
        "required": false
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "minimum": 3,
        "maximum": 15
      },
      {
        "name": "elements",
        "type": "array[string]",
        "required": false
      },
      {
        "name": "cfg_scale",
        "type": "number",
        "required": false,
        "default": 0.5,
        "minimum": 0,
        "maximum": 1
      },
      {
        "name": "image_url",
        "type": "string",
        "required": true
      },
      {
        "name": "multi_shots",
        "type": "boolean",
        "required": false,
        "default": false
      },
      {
        "name": "multi_prompt",
        "type": "array[object]",
        "required": false
      },
      {
        "name": "last_image_url",
        "type": "string",
        "required": false
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "kling-video/v3.0-turbo/image-to-video",
    "name": "Kling 3.0 Turbo Image to Video (Turbo)",
    "source": "https://open.higgsfield.ai/models/kling-video/v3.0-turbo/image-to-video/api-reference",
    "parameters": [
      {
        "name": "prompt",
        "type": "string",
        "required": true
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "minimum": 3,
        "maximum": 15
      },
      {
        "name": "image_url",
        "type": "string",
        "required": true
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "720p",
        "options": [
          "720p",
          "1080p"
        ]
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "kling-video/o3/first-last-frame",
    "name": "Kling O3 First/Last Frame",
    "source": "https://open.higgsfield.ai/models/kling-video/o3/first-last-frame/api-reference",
    "parameters": [
      {
        "name": "mode",
        "type": "string",
        "required": false,
        "default": "pro",
        "options": [
          "std",
          "pro",
          "4k"
        ]
      },
      {
        "name": "sound",
        "type": "string",
        "required": false,
        "default": "off",
        "options": [
          "on",
          "off"
        ]
      },
      {
        "name": "prompt",
        "type": "string",
        "required": false
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "minimum": 3,
        "maximum": 15
      },
      {
        "name": "multi_shots",
        "type": "boolean",
        "required": false,
        "default": false
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "options": [
          "16:9",
          "9:16",
          "1:1"
        ]
      },
      {
        "name": "multi_prompt",
        "type": "array[object]",
        "required": false
      },
      {
        "name": "last_frame_url",
        "type": "string",
        "required": false
      },
      {
        "name": "first_frame_url",
        "type": "string",
        "required": false
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "kling-video/o3/image-reference",
    "name": "Kling O3 Image Reference",
    "source": "https://open.higgsfield.ai/models/kling-video/o3/image-reference/api-reference",
    "parameters": [
      {
        "name": "mode",
        "type": "string",
        "required": false,
        "default": "std",
        "options": [
          "std",
          "pro",
          "4k"
        ]
      },
      {
        "name": "sound",
        "type": "string",
        "required": false,
        "default": "off",
        "options": [
          "on",
          "off"
        ]
      },
      {
        "name": "prompt",
        "type": "string",
        "required": false
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "minimum": 3,
        "maximum": 15
      },
      {
        "name": "elements",
        "type": "array[string]",
        "required": false,
        "default": "—  |"
      },
      {
        "name": "shot_type",
        "type": "string",
        "required": false,
        "default": "customize",
        "options": [
          "customize",
          "intelligent"
        ]
      },
      {
        "name": "image_urls",
        "type": "array[string]",
        "required": false,
        "default": "—  |"
      },
      {
        "name": "multi_shots",
        "type": "boolean",
        "required": false,
        "default": "false  |"
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "options": [
          "16:9",
          "9:16",
          "1:1"
        ]
      },
      {
        "name": "multi_prompt",
        "type": "array[object]",
        "required": false,
        "default": "—  |"
      },
      {
        "name": "last_frame_url",
        "type": "string",
        "required": false
      },
      {
        "name": "first_frame_url",
        "type": "string",
        "required": false
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "kling-video/o3/video-edit",
    "name": "Kling O3 Video Edit",
    "source": "https://open.higgsfield.ai/models/kling-video/o3/video-edit/api-reference",
    "parameters": [
      {
        "name": "mode",
        "type": "string",
        "required": false,
        "default": "pro",
        "options": [
          "std",
          "pro",
          "4k"
        ]
      },
      {
        "name": "prompt",
        "type": "string",
        "required": true
      },
      {
        "name": "elements",
        "type": "array[string]",
        "required": false
      },
      {
        "name": "image_urls",
        "type": "array[string]",
        "required": false
      },
      {
        "name": "video_urls",
        "type": "array[string]",
        "required": true
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "kling-video/o3/video-reference",
    "name": "Kling O3 Video Reference",
    "source": "https://open.higgsfield.ai/models/kling-video/o3/video-reference/api-reference",
    "parameters": [
      {
        "name": "mode",
        "type": "string",
        "required": false,
        "default": "pro",
        "options": [
          "std",
          "pro"
        ]
      },
      {
        "name": "prompt",
        "type": "string",
        "required": true
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "minimum": 3,
        "maximum": 10
      },
      {
        "name": "elements",
        "type": "array[string]",
        "required": false,
        "default": "—  |"
      },
      {
        "name": "image_urls",
        "type": "array[string]",
        "required": false,
        "default": "—  |"
      },
      {
        "name": "video_urls",
        "type": "array[string]",
        "required": true,
        "default": "—  |"
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "options": [
          "16:9",
          "9:16",
          "1:1"
        ]
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "kling-video/motion-control/pro",
    "name": "Kling 2.6 Motion Control (Pro)",
    "source": "https://open.higgsfield.ai/models/kling-video/motion-control/pro/api-reference",
    "parameters": [
      {
        "name": "prompt",
        "type": "string",
        "required": false,
        "default": ""
      },
      {
        "name": "image_url",
        "type": "string",
        "required": true
      },
      {
        "name": "video_url",
        "type": "string",
        "required": true
      },
      {
        "name": "keep_original_sound",
        "type": "string",
        "required": false,
        "default": "yes",
        "options": [
          "yes",
          "no"
        ]
      },
      {
        "name": "character_orientation",
        "type": "string",
        "required": false,
        "default": "video",
        "options": [
          "image",
          "video"
        ]
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "kling-video/motion-control/std",
    "name": "Kling 2.6 Motion Control (Standard)",
    "source": "https://open.higgsfield.ai/models/kling-video/motion-control/std/api-reference",
    "parameters": [
      {
        "name": "prompt",
        "type": "string",
        "required": false,
        "default": ""
      },
      {
        "name": "image_url",
        "type": "string",
        "required": true
      },
      {
        "name": "video_url",
        "type": "string",
        "required": true
      },
      {
        "name": "keep_original_sound",
        "type": "string",
        "required": false,
        "default": "yes",
        "options": [
          "yes",
          "no"
        ]
      },
      {
        "name": "character_orientation",
        "type": "string",
        "required": false,
        "default": "video",
        "options": [
          "image",
          "video"
        ]
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "kling-video/v2.6/pro/image-to-video",
    "name": "Kling 2.6 Pro Image to Video (Pro)",
    "source": "https://open.higgsfield.ai/models/kling-video/v2.6/pro/image-to-video/api-reference",
    "parameters": [
      {
        "name": "sound",
        "type": "string",
        "required": false,
        "default": "on",
        "options": [
          "on",
          "off"
        ]
      },
      {
        "name": "prompt",
        "type": "string",
        "required": true
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "options": [
          "5",
          "10"
        ]
      },
      {
        "name": "cfg_scale",
        "type": "number",
        "required": false,
        "default": 0.5,
        "minimum": 0,
        "maximum": 1
      },
      {
        "name": "image_url",
        "type": "string",
        "required": true
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "options": [
          "16:9",
          "9:16",
          "1:1"
        ]
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "kling-video/v2.6/pro/text-to-video",
    "name": "Kling 2.6 Pro Text to Video (Pro)",
    "source": "https://open.higgsfield.ai/models/kling-video/v2.6/pro/text-to-video/api-reference",
    "parameters": [],
    "verified": false,
    "reason": "Загварын API баримт одоогоор баталгаажаагүй."
  },
  {
    "id": "kling-video/omni/first-last-frame",
    "name": "Kling Omni First/Last Frame",
    "source": "https://open.higgsfield.ai/models/kling-video/omni/first-last-frame/api-reference",
    "parameters": [],
    "verified": false,
    "reason": "Загварын API баримт одоогоор баталгаажаагүй."
  },
  {
    "id": "kling-video/omni/image-reference",
    "name": "Kling Omni Image Reference",
    "source": "https://open.higgsfield.ai/models/kling-video/omni/image-reference/api-reference",
    "parameters": [
      {
        "name": "mode",
        "type": "string",
        "required": false,
        "default": "pro",
        "options": [
          "std",
          "pro"
        ]
      },
      {
        "name": "prompt",
        "type": "string",
        "required": true
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "minimum": 3,
        "maximum": 10
      },
      {
        "name": "elements",
        "type": "array[string]",
        "required": false
      },
      {
        "name": "image_urls",
        "type": "array[string]",
        "required": false
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "default": "16:9",
        "options": [
          "16:9",
          "9:16",
          "1:1"
        ]
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "kling-video/omni/video-edit",
    "name": "Kling Omni Video Edit",
    "source": "https://open.higgsfield.ai/models/kling-video/omni/video-edit/api-reference",
    "parameters": [
      {
        "name": "mode",
        "type": "string",
        "required": false,
        "default": "pro",
        "options": [
          "std",
          "pro"
        ]
      },
      {
        "name": "prompt",
        "type": "string",
        "required": true
      },
      {
        "name": "elements",
        "type": "array[string]",
        "required": false
      },
      {
        "name": "image_urls",
        "type": "array[string]",
        "required": false
      },
      {
        "name": "video_urls",
        "type": "array[string]",
        "required": true
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "kling-video/omni/video-reference",
    "name": "Kling Omni Video Reference",
    "source": "https://open.higgsfield.ai/models/kling-video/omni/video-reference/api-reference",
    "parameters": [
      {
        "name": "mode",
        "type": "string",
        "required": false,
        "default": "pro",
        "options": [
          "std",
          "pro"
        ]
      },
      {
        "name": "prompt",
        "type": "string",
        "required": true
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "minimum": 3,
        "maximum": 10
      },
      {
        "name": "elements",
        "type": "array[string]",
        "required": false
      },
      {
        "name": "image_urls",
        "type": "array[string]",
        "required": false
      },
      {
        "name": "video_urls",
        "type": "array[string]",
        "required": true
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "default": "16:9",
        "options": [
          "16:9",
          "9:16",
          "1:1"
        ]
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "kling-video/v2.5-turbo/pro/image-to-video",
    "name": "Kling 2.5 Turbo Pro Image to Video (Pro)",
    "source": "https://open.higgsfield.ai/models/kling-video/v2.5-turbo/pro/image-to-video/api-reference",
    "parameters": [
      {
        "name": "prompt",
        "type": "string",
        "required": true
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "options": [
          "5",
          "10"
        ]
      },
      {
        "name": "cfg_scale",
        "type": "number",
        "required": false,
        "default": 0.5,
        "minimum": 0,
        "maximum": 1
      },
      {
        "name": "image_url",
        "type": "string",
        "required": true
      },
      {
        "name": "negative_prompt",
        "type": "string",
        "required": false,
        "default": ""
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "kling-video/v2.5-turbo/pro/text-to-video",
    "name": "Kling 2.5 Turbo Pro Text to Video (Pro)",
    "source": "https://open.higgsfield.ai/models/kling-video/v2.5-turbo/pro/text-to-video/api-reference",
    "parameters": [
      {
        "name": "prompt",
        "type": "string",
        "required": true
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "options": [
          "5",
          "10"
        ]
      },
      {
        "name": "cfg_scale",
        "type": "number",
        "required": false,
        "default": 0.5,
        "minimum": 0,
        "maximum": 1
      },
      {
        "name": "negative_prompt",
        "type": "string",
        "required": false,
        "default": ""
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "kling-video/v2.5-turbo/standard/image-to-video",
    "name": "Kling 2.5 Turbo Standard Image to Video (Standard)",
    "source": "https://open.higgsfield.ai/models/kling-video/v2.5-turbo/standard/image-to-video/api-reference",
    "parameters": [],
    "verified": false,
    "reason": "Загварын API баримт одоогоор баталгаажаагүй."
  },
  {
    "id": "minimax/h3/image-to-video",
    "name": "MiniMax H3 Image to Video",
    "source": "https://open.higgsfield.ai/models/minimax/h3/image-to-video/api-reference",
    "parameters": [
      {
        "name": "prompt",
        "type": "string",
        "required": true,
        "minLength": 1
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "minimum": 5,
        "maximum": 15
      },
      {
        "name": "image_url",
        "type": "string",
        "required": true
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "2K",
        "options": [
          "2K"
        ]
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "default": "auto",
        "options": [
          "auto",
          "adaptive",
          "21:9",
          "16:9",
          "4:3",
          "1:1",
          "3:4",
          "9:16"
        ]
      },
      {
        "name": "end_image_url",
        "type": "string",
        "required": false
      },
      {
        "name": "aigc_watermark",
        "type": "boolean",
        "required": false,
        "default": false
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "minimax/h3/reference-to-video",
    "name": "MiniMax H3 Reference to Video",
    "source": "https://open.higgsfield.ai/models/minimax/h3/reference-to-video/api-reference",
    "parameters": [
      {
        "name": "prompt",
        "type": "string",
        "required": true,
        "minLength": 1
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 5,
        "minimum": 5,
        "maximum": 15
      },
      {
        "name": "audio_urls",
        "type": "array[string]",
        "required": false
      },
      {
        "name": "image_urls",
        "type": "array[string]",
        "required": false
      },
      {
        "name": "resolution",
        "type": "string",
        "required": false,
        "default": "2K",
        "options": [
          "2K"
        ]
      },
      {
        "name": "video_urls",
        "type": "array[string]",
        "required": false
      },
      {
        "name": "aspect_ratio",
        "type": "string",
        "required": false,
        "default": "auto",
        "options": [
          "auto",
          "adaptive",
          "21:9",
          "16:9",
          "4:3",
          "1:1",
          "3:4",
          "9:16"
        ]
      },
      {
        "name": "aigc_watermark",
        "type": "boolean",
        "required": false,
        "default": false
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "minimax/hailuo-2.3/standard/image-to-video",
    "name": "MiniMax Hailuo 2.3 Standard Image to Video (Standard)",
    "source": "https://open.higgsfield.ai/models/minimax/hailuo-2.3/standard/image-to-video/api-reference",
    "parameters": [
      {
        "name": "prompt",
        "type": "string",
        "required": true
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 6,
        "options": [
          "6",
          "10"
        ]
      },
      {
        "name": "image_url",
        "type": "string",
        "required": true
      },
      {
        "name": "prompt_optimizer",
        "type": "boolean",
        "required": false,
        "default": true
      }
    ],
    "verified": true,
    "reason": ""
  },
  {
    "id": "minimax/hailuo-2.3/standard/text-to-video",
    "name": "MiniMax Hailuo 2.3 Standard Text to Video (Standard)",
    "source": "https://open.higgsfield.ai/models/minimax/hailuo-2.3/standard/text-to-video/api-reference",
    "parameters": [
      {
        "name": "prompt",
        "type": "string",
        "required": true
      },
      {
        "name": "duration",
        "type": "integer",
        "required": false,
        "default": 6,
        "options": [
          "6",
          "10"
        ]
      },
      {
        "name": "prompt_optimizer",
        "type": "boolean",
        "required": false,
        "default": true
      }
    ],
    "verified": true,
    "reason": ""
  }
];
