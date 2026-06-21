import { useEffect, useRef } from "react";
import { getAdsConfig } from "@/lib/storage";

type AdPlacement = "top-banner" | "below-player" | "pop-under";

interface AdSlotProps {
  placement: AdPlacement;
  className?: string;
}

function injectAdCode(container: HTMLElement, code: string) {
  container.innerHTML = "";
  const temp = document.createElement("div");
  temp.innerHTML = code;

  const scripts = Array.from(temp.querySelectorAll("script"));
  scripts.forEach(oldScript => {
    const newScript = document.createElement("script");
    Array.from(oldScript.attributes).forEach(attr =>
      newScript.setAttribute(attr.name, attr.value)
    );
    if (oldScript.textContent) newScript.textContent = oldScript.textContent;
    document.head.appendChild(newScript);
    oldScript.remove();
  });

  container.innerHTML = temp.innerHTML;
}

export function AdSlot({ placement, className = "" }: AdSlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const config = getAdsConfig();
    let code = "";
    let enabled = false;

    if (placement === "top-banner") {
      code = config.topBannerCode;
      enabled = config.topBannerEnabled;
    } else if (placement === "below-player") {
      code = config.belowPlayerCode;
      enabled = config.belowPlayerEnabled;
    } else if (placement === "pop-under") {
      code = config.popUnderCode;
      enabled = config.popUnderEnabled;
    }

    if (enabled && code.trim() && containerRef.current) {
      injectAdCode(containerRef.current, code);
    }
  }, [placement]);

  const config = getAdsConfig();
  let enabled = false;
  if (placement === "top-banner") enabled = config.topBannerEnabled && !!config.topBannerCode.trim();
  else if (placement === "below-player") enabled = config.belowPlayerEnabled && !!config.belowPlayerCode.trim();
  else if (placement === "pop-under") enabled = config.popUnderEnabled && !!config.popUnderCode.trim();

  if (!enabled) return null;

  if (placement === "pop-under") {
    return <div ref={containerRef} className="hidden" data-testid="ad-pop-under" />;
  }

  return (
    <div
      ref={containerRef}
      className={`w-full overflow-hidden flex items-center justify-center min-h-[50px] ${className}`}
      data-testid={`ad-slot-${placement}`}
    />
  );
}
