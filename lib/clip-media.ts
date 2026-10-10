/** Supported on iPhone, Android, and desktop. The actual media is verified with ffprobe. */
export function validClipSourceType(name: string, mime: string): boolean {
 const extension=/\.(mp4|mov|m4v)$/i.test(name.trim());
 const type=mime.trim().toLowerCase();
 return extension && ["video/mp4","video/quicktime","video/x-m4v","application/octet-stream",""].includes(type);
}
/** Strictly bounded by the clip generator's limits and source duration. */
export function validClipWindow(start: unknown, end: unknown): boolean {
 if(typeof start!=="number"||typeof end!=="number")return false;
 return Number.isFinite(start)&&Number.isFinite(end)&&start>=0&&end<=3600&&end-start>=1&&end-start<=30;
}
