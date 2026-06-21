import { useEffect } from "react";

interface SEOOptions {
  title: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
}

function setMeta(name: string, content: string, property = false) {
  const attr = property ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function useSEO({ title, description, keywords, ogImage, ogType = "website" }: SEOOptions) {
  useEffect(() => {
    document.title = title;

    if (description) {
      setMeta("description", description);
      setMeta("og:description", description, true);
      setMeta("twitter:description", description);
    }

    if (keywords) {
      setMeta("keywords", keywords);
    }

    setMeta("og:title", title, true);
    setMeta("og:type", ogType, true);
    setMeta("og:site_name", "AN TOONS", true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);

    if (ogImage) {
      setMeta("og:image", ogImage, true);
      setMeta("twitter:image", ogImage);
    }

    return () => {
      document.title = "AN TOONS";
    };
  }, [title, description, keywords, ogImage, ogType]);
}
