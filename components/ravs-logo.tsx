import type { CSSProperties } from "react";

type RavsLogoProps = {
  className?: string;
  compact?: boolean;
  showSubtitle?: boolean;
  showTagline?: boolean;
  title?: string;
};

const yellow = "#FFD800";
const white = "#FFFFFF";
const black = "#050505";

function Mark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      role="img"
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="15" fill={black} />
      <path d="M10 51 30.5 10h8.5L56 51H43.4L35 31.6 27.2 51Z" fill={yellow} />
      <path d="M28.3 39.2h11.1l-5.6-12.1Z" fill={black} />
      <path d="M24 51h13.3l-4.4-8.6Z" fill={yellow} />
      <rect x="1.2" y="1.2" width="61.6" height="61.6" rx="13.8" fill="none" stroke="#FFD80055" strokeWidth="1.4" />
    </svg>
  );
}

function Wordmark({ className = "" }: { className?: string }) {
  const style = { "--ravs-yellow": yellow } as CSSProperties;
  return (
    <svg
      className={className}
      viewBox="0 0 250 62"
      role="img"
      aria-label="RAVS"
      style={style}
    >
      <path
        d="M3 4h50c15 0 23 7 23 19 0 10-5 16-15 19l20 16H59L41 43H20v15H3Zm17 12v15h31c5 0 8-2 8-7 0-5-3-8-8-8Z"
        fill={white}
      />
      <path d="M83 58 108 4h10l27 54h-18l-4-10H99l-4 10Z" fill={yellow} />
      <path d="M105 36h13l-6.8-15Z" fill={black} />
      <path d="M143 4h18l16 36 16-36h18l-25 54h-18Z" fill={white} />
      <path
        d="M209 4h38v12h-31c-4 0-6 2-6 5 0 3 2 5 6 5h18c12 0 18 5 18 16 0 11-7 16-20 16h-38V46h34c4 0 6-2 6-5 0-3-2-5-6-5h-18c-12 0-18-6-18-16 0-10 6-16 17-16Z"
        fill={white}
      />
    </svg>
  );
}

export function RavsLogo({
  className = "",
  compact = false,
  showSubtitle = false,
  showTagline = false,
  title = "RAVS — Rainy AI Video Studio",
}: RavsLogoProps) {
  if (compact) {
    return (
      <span className={"ravsLogo ravsLogoCompact " + className} title={title}>
        <Mark className="ravsLogoMark" />
      </span>
    );
  }

  return (
    <span className={"ravsLogo " + className} title={title}>
      <span className="ravsLogoDesktop">
        <Wordmark className="ravsLogoWordmark" />
        {showSubtitle && <span className="ravsLogoSubtitle">RAINY AI VIDEO STUDIO</span>}
        {showTagline && <span className="ravsLogoTagline">CREATE IN MOTION.</span>}
      </span>
      <Mark className="ravsLogoMobileMark" />
    </span>
  );
}

export function RavsWordmark({ className = "" }: { className?: string }) {
  return <Wordmark className={"ravsLogoWordmark " + className} />;
}
