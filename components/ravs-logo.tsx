type RavsLogoProps = {
  className?: string;
  compact?: boolean;
  showSubtitle?: boolean;
  showTagline?: boolean;
  title?: string;
};

function Mark({ className = "" }: { className?: string }) {
  return <img className={className} src="/brand/icon-profile.svg" width={64} height={64} alt="" aria-hidden="true" />;
}

function Wordmark({ className = "" }: { className?: string }) {
  return <img className={className} src="/brand/logo-refined.webp" width={1898} height={829} alt="RAVS" />;
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
        
        {showTagline && <span className="ravsLogoTagline">CREATE IN MOTION.</span>}
      </span>
      <Mark className="ravsLogoMobileMark" />
    </span>
  );
}

export function RavsWordmark({ className = "" }: { className?: string }) {
  return <Wordmark className={"ravsLogoWordmark " + className} />;
}
