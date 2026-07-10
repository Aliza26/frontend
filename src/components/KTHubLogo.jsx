import React from "react";
 
/**

* KTHubLogo — animated logo component

* Matches the dark GIF: slow 24s orbit, counter-rotating dashed hub ring,

* travelling pulses along connectors, breathing node glows, small "KT".

*

* Usage:

*   <KTHubLogo />                              // 480px, dark bg

*   <KTHubLogo size={64} />                    // header size

*   <KTHubLogo size={120} transparent />       // no background rect

*   <KTHubLogo variant="light" />              // light-surface colors

*   <KTHubLogo animate={false} />              // static (e.g. after loading ends)

*

* Drop-in idea for KTChat: animate while the LLM is thinking,

* flip animate={false} when the answer arrives.

*/

export default function KTHubLogo({

  size = 480,

  variant = "dark",          // "dark" | "light"

  transparent = false,

  animate = true,

}) {

  const dark = variant === "dark";
 
  const c = {

    bg:        dark ? "#0D1620" : "#F4F8FB",

    connector: dark ? "#3C4C5E" : "#C6D5E1",

    sky:       dark ? "#38BDF8" : "#0EA5E9",

    pink:      dark ? "#FB6BA6" : "#F43F8E",

    green:     dark ? "#34D89F" : "#10B981",

    peri:      dark ? "#818CF8" : "#6366F1",

    ringFace:  dark ? "#EAF1F6" : "#FFFFFF",

    hubFace:   dark ? "#0D1620" : "#FFFFFF",

    kt:        dark ? "#EAF1F6" : "#16232E",

  };
 
  // node geometry: hub at (240,240), orbit radius 150, angles -90/30/150

  const nodes = [

    { x: 240, y: 90,  color: c.sky,   glow: "kthub-glow-sky",   begin: "0s"    },

    { x: 370, y: 315, color: c.pink,  glow: "kthub-glow-pink",  begin: "1.67s" },

    { x: 110, y: 315, color: c.green, glow: "kthub-glow-green", begin: "3.33s" },

  ];

  const pulseBegins = ["0s", "1.33s", "2.66s"];
 
  return (
<svg

      viewBox="0 0 480 480"

      width={size}

      height={size}

      role="img"

      aria-label="KTHub logo"
>
<defs>

        {[

          ["kthub-glow-sky", c.sky],

          ["kthub-glow-pink", c.pink],

          ["kthub-glow-green", c.green],

        ].map(([id, color]) => (
<radialGradient key={id} id={id} cx="50%" cy="50%" r="50%">
<stop offset="0%" stopColor={color} stopOpacity="0.45" />
<stop offset="60%" stopColor={color} stopOpacity="0.15" />
<stop offset="100%" stopColor={color} stopOpacity="0" />
</radialGradient>

        ))}
</defs>
 
      {!transparent && <rect width="480" height="480" fill={c.bg} rx="0" />}
 
      {/* ── orbiting system ── */}
<g>

        {animate && (
<animateTransform

            attributeName="transform"

            type="rotate"

            from="0 240 240"

            to="360 240 240"

            dur="24s"

            repeatCount="indefinite"

          />

        )}
 
        {/* connectors */}
<g stroke={c.connector} strokeWidth="17" strokeLinecap="round">

          {nodes.map((n, i) => (
<line key={i} x1="240" y1="240" x2={n.x} y2={n.y} />

          ))}
</g>
 
        {/* travelling pulses */}

        {animate &&

          nodes.map((n, i) => (
<circle key={`p${i}`} r="8" fill={n.color}>
<animateMotion

                dur="4s"

                begin={pulseBegins[i]}

                repeatCount="indefinite"

                path={`M240,240 L${n.x},${n.y}`}

              />
<animate

                attributeName="opacity"

                values="0;1;0"

                dur="4s"

                begin={pulseBegins[i]}

                repeatCount="indefinite"

              />
</circle>

          ))}
 
        {/* glows + nodes (breathing) */}

        {nodes.map((n, i) => (
<g key={`n${i}`}>
<circle cx={n.x} cy={n.y} r="85" fill={`url(#${n.glow})`}>

              {animate && (
<animate

                  attributeName="r"

                  values="85;92;85"

                  dur="5s"

                  begin={n.begin}

                  repeatCount="indefinite"

                />

              )}
</circle>
<circle cx={n.x} cy={n.y} r="46" fill={n.color}>

              {animate && (
<animate

                  attributeName="r"

                  values="46;49;46"

                  dur="5s"

                  begin={n.begin}

                  repeatCount="indefinite"

                />

              )}
</circle>
</g>

        ))}
</g>
 
      {/* ── fixed hub ── */}
<circle cx="240" cy="240" r="78" fill={c.ringFace} />
<circle

        cx="240"

        cy="240"

        r="70"

        fill="none"

        stroke={c.peri}

        strokeWidth="11"

        strokeDasharray="46 27"

        strokeLinecap="round"
>

        {animate && (
<animateTransform

            attributeName="transform"

            type="rotate"

            from="360 240 240"

            to="0 240 240"

            dur="14s"

            repeatCount="indefinite"

          />

        )}
</circle>
<circle cx="240" cy="240" r="62" fill={c.hubFace} />
 
      {/* KT — small */}
<text

        x="240"

        y="240"

        textAnchor="middle"

        dominantBaseline="central"

        fontFamily="Arial, Helvetica, sans-serif"

        fontWeight="bold"

        fontSize="56"

        letterSpacing="2"

        fill={c.kt}
>

        KT
</text>
</svg>

  );

}
 