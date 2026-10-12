import {redirect} from "next/navigation";
/** Legacy Movie Producer URL: one canonical page prevents duplicate beta messaging.
 * Preserve deep links shared before the menu cleanup.
 */
export default function MovieLegacyRedirect(){redirect("/movie-producer");}
