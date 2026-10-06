type RavsLogoProps = {
  className?: string;
  compact?: boolean;
  showSubtitle?: boolean;
  showTagline?: boolean;
  title?: string;
};

const yellow = "#FFE600";
const black = "#050505";

function Mark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" role="img" aria-hidden="true">
      <defs>
        <filter id="ravs-mark-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect width="64" height="64" rx="15" fill={black} />
      <path
        d="M11 51 28.7 13.2C30.2 10 32 8.5 34.2 8.5c2 0 3.8 1.3 5.3 3.7L56 51H43.4L35.1 32.2 28.6 47.1 22.9 51Z"
        fill={yellow}
        filter="url(#ravs-mark-glow)"
      />
      <path d="M27.1 40.8 34 25.6l7.1 15.2-7-4.8Z" fill={black} />
      <rect x="1.2" y="1.2" width="61.6" height="61.6" rx="13.8" fill="none" stroke="#FFE60066" strokeWidth="1.4" />
    </svg>
  );
}

function Wordmark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 320 76" role="img" aria-label="RAVS">
      <defs>
        <linearGradient id="ravs-white" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.54" stopColor="#f6f6f4" />
          <stop offset="1" stopColor="#e9e9e6" />
        </linearGradient>
        <linearGradient id="ravs-yellow" x1="0" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#fff900" />
          <stop offset="0.58" stopColor="#ffe600" />
          <stop offset="1" stopColor="#f1d400" />
        </linearGradient>
        <filter id="ravs-a-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.1" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <path
        d="M5 10h55c19 0 29 8.5 29 24 0 11.6-6.2 19.2-18.5 22.6L92 69H67L49 57H27v12H5V37h56c4.4 0 6.8-2.2 6.8-6.5S65.4 24 61 24H5Z"
        fill="url(#ravs-white)"
      />

      <path
        d="M94 69 122.5 11.5c2.3-4.7 5.2-7 8.8-7 3.6 0 6.4 2.1 8.6 6.4L169 69h-22.5l-7-15.2h-27.4L105 69Z"
        fill="url(#ravs-yellow)"
        filter="url(#ravs-a-glow)"
      />
      <path d="m119.2 43.5 12-24.7 11.2 24.7-11.3-7.4Z" fill={black} />

      <path d="M164 10h23.5l22.5 42 22.7-42H256l-33 59h-26Z" fill="url(#ravs-white)" />

      <path
        d="M258 10h57v14h-47.5c-4.5 0-6.8 2-6.8 5.8 0 3.7 2.4 5.6 7.1 5.6h27.7c13.8 0 21.5 5.8 21.5 16.8C317 63.5 309.1 69 293.4 69H253V55h39.6c4.6 0 7-1.9 7-5.7s-2.3-5.7-7-5.7h-28c-14 0-21.4-5.6-21.4-16.4C243.2 15.9 250.4 10 258 10Z"
        fill="url(#ravs-white)"
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
