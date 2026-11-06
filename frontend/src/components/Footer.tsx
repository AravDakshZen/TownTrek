import React from 'react';
import StickerSlapFooter from './ui/sticker-slap-footer';
import { useTheme } from '../context/ThemeContext';

export const Footer: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="w-full relative z-10 transition-colors duration-300">
      <StickerSlapFooter
        wordmark="towntrek"
        homeHref="/"
        navLabel="explore"
        navHref="/"
        chatHref="/emergency"
        chatLabel="district helpline 112"
        jobsLabel="venues & careers"
        jobs={[
          { title: "cinema projectionist", href: "/movies" },
          { title: "concert stage crew", href: "/entertainment" },
          { title: "district guide", href: "/attractions" }
        ]}
        officeLabel="metro headquarters"
        address={[
          "101 district hub avenue",
          "central metropolitan zone, mz 400"
        ]}
        mapLabel="district interactive map"
        mapHref="/attractions"
        contactLabel="help & desk"
        email="support@towntrek.com"
        copiedLabel="copied, talk soon!"
        note="*call 112 for national emergency services. online ticketing open 24/7."
        height="85vh"
        wordmarkMaxHeight="45vh"
        paper={isDark ? "#000000" : "#ffffff"}
        panel={isDark ? "#0284c7" : "#0369a1"}
        ink={isDark ? "#f8fafc" : "#141414"}
        cream={isDark ? "#ffffff" : "#fbf9f5"}
        accent={isDark ? "#38bdf8" : "#ff6a2b"}
        socials={[
          { kind: "instagram", href: "https://instagram.com" },
          { kind: "x", href: "https://x.com" },
          { kind: "youtube", href: "https://youtube.com" }
        ]}
        credits={[
          { role: "concept & design", name: "towntrek liquid glass" },
          { role: "components", name: "hextaui & sticker slap" },
          { role: "district runtime", name: "react + tailwind + typescript" }
        ]}
      />
    </div>
  );
};

export default Footer;
