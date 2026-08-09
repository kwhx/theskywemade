const SKY = {
  COPY: {
    intro: "",
    hint: "Drag to explore · Tap a star",
    introHint: "Tap the sky to step closer",
    audioOn: "sound on",
    audioOff: "sound off",
    taurusDate: "02 · 05",
    taurusLine: "The day we chose each other.",
    bridgeLabel: "OUR CONSTELLATION",
    ending: [
      "Some stars were already there.",
      "We just gave them a reason to belong together.",
      "— Khwahish"
    ],
    fallbackTitle: "The sky is still here.",
    fallbackBody: "Your browser just couldn’t unfold it.",
    fallbackClose: "Even without it, this much is true:"
  },


  CONSTELLATIONS: {
    aquarius: {
      id: "aquarius",
      label: "AQUARIUS",
      subtitle: "Khwahish",
      color: "#8fb9e9",
      starColor: "#d7e6fb",
      anchor: [-13.5, 5.0, -5.5],
      scale: 0.70,
      stars: [
        { id:"aqr-alpha", name:"Sadalmelik", ra:22.0965, dec:-0.3198, mag:2.95, message:"I notice more about you than I ever tell you.", bridge:true },
        { id:"aqr-beta", name:"Sadalsuud", ra:21.5262, dec:-5.5712, mag:2.90, message:"You became home before I had a word for it.", bridge:true },
        { id:"aqr-gamma", name:"Sadachbia", ra:22.3609, dec:-1.3873, mag:3.86, message:"The smallest things about you stay with me." },
        { id:"aqr-delta", name:"Skat", ra:22.9108, dec:-15.8208, mag:3.27, message:"You slipped into my ordinary days and stayed.", bridge:true },
        { id:"aqr-theta", name:"Ancha", ra:22.2033, dec:-7.7833, mag:4.17, message:"Steady." },
        { id:"aqr-epsilon", name:"Albali", ra:20.7946, dec:-9.4958, mag:3.78, message:"Even my silences got softer." },
        { id:"aqr-zeta", name:"Zeta Aquarii", ra:22.4806, dec:-0.0200, mag:3.65, message:"I catch myself smiling for no visible reason." },
        { id:"aqr-eta", name:"Eta Aquarii", ra:22.5894, dec:-0.1178, mag:4.04, message:"Familiar, somehow, from the very first day." },
        { id:"aqr-pi", name:"Pi Aquarii", ra:22.4211, dec:1.3775, mag:4.66, message:"Quiet certainty." },
        { id:"aqr-lambda", name:"Hydor", ra:22.8769, dec:-7.5797, mag:3.74, message:"Some things I never say out loud, this is one." }
      ],
      lines: [
        ["aqr-epsilon","aqr-beta"],
        ["aqr-beta","aqr-alpha"],
        ["aqr-alpha","aqr-gamma"],
        ["aqr-gamma","aqr-zeta"],
        ["aqr-zeta","aqr-eta"],
        ["aqr-zeta","aqr-pi"],
        ["aqr-beta","aqr-theta"],
        ["aqr-theta","aqr-delta"],
        ["aqr-theta","aqr-lambda"],
        ["aqr-alpha","aqr-pi"]
      ]
    },

    libra: {
      id: "libra",
      label: "LIBRA",
      subtitle: "Palak",
      color: "#e7d7b9",
      starColor: "#fff3d9",
      anchor: [13.5, 5.0, 5.0],
      scale: 0.86,
      stars: [
        { id:"lib-alpha", name:"Zubenelgenubi", ra:14.84798, dec:-16.0418, mag:2.75, message:"That expression you make when you're happy.", bridge:true },
        { id:"lib-beta", name:"Zubeneschamali", ra:15.28345, dec:-9.3829, mag:2.61, message:"The way you talk when you're passionate about something.", bridge:true },
        { id:"lib-gamma", name:"Zubenelhakrabi", ra:15.5922, dec:-14.7894, mag:3.91, message:"You make ordinary things feel memorable." },
        { id:"lib-sigma", name:"Brachium", ra:15.0678, dec:-25.2819, mag:3.29, message:"The little things you probably don't know I notice.", bridge:true },
        { id:"lib-tau", name:"Zuben Elakribi", ra:15.6440, dec:-16.7308, mag:3.66, message:"The way you laugh before the joke even lands." },
        { id:"lib-iota", name:"Iota Librae", ra:15.0677, dec:-19.7917, mag:4.54, message:"Quietly, endlessly specific." }
      ],
      lines: [
        ["lib-alpha","lib-beta"],
        ["lib-beta","lib-gamma"],
        ["lib-gamma","lib-tau"],
        ["lib-tau","lib-alpha"],
        ["lib-alpha","lib-iota"],
        ["lib-iota","lib-sigma"],
        ["lib-sigma","lib-alpha"]
      ]
    },

    taurus: {
      id: "taurus",
      label: "TAURUS",
      subtitle: "02 MAY · THE DAY WE CHOSE EACH OTHER",
      color: "#d5a45d",
      starColor: "#f4d29a",
      anchor: [0, -10.0, 1.5],
      scale: 0.72,
      stars: [
        { id:"tau-gamma", name:"Prima Hyadum", ra:4.3300, dec:15.6275, mag:3.65, message:"Before." },
        { id:"tau-delta1", name:"Delta Tauri", ra:4.3822, dec:17.5425, mag:3.76, message:"Then." },
        { id:"tau-epsilon", name:"Ain", ra:4.4769, dec:19.1804, mag:3.53, message:"Chosen." },
        { id:"tau-alpha", name:"Aldebaran", ra:4.5987, dec:16.5093, mag:0.87, dateKey:true, bridge:true, message:"02 · 05" },
        { id:"tau-beta", name:"Elnath", ra:5.4382, dec:28.6075, mag:1.65, bridge:true, message:"Since." },
        { id:"tau-zeta", name:"Zeta Tauri", ra:5.6283, dec:21.1425, mag:3.03, bridge:true, message:"Onward." },
        { id:"tau-theta2", name:"Theta 2 Tauri", ra:4.4760, dec:15.8700, mag:3.40, message:"Quietly certain." },
        { id:"tau-electra", name:"Electra", ra:3.7479, dec:24.1133, mag:3.72, message:"One of many small yeses." },
        { id:"tau-maia", name:"Maia", ra:3.7638, dec:24.3678, mag:3.87, message:"A small yes." },
        { id:"tau-alcyone", name:"Alcyone", ra:3.7914, dec:24.1051, mag:2.85, message:"Another small yes." },
        { id:"tau-merope", name:"Merope", ra:3.7721, dec:23.9483, mag:4.14, message:"And another." },
        { id:"tau-pleione", name:"Pleione", ra:3.8198, dec:24.1367, mag:5.05, message:"Still counting." },
        { id:"tau-atlas", name:"Atlas", ra:3.8194, dec:24.0534, mag:3.62, message:"Steadying." },
        { id:"tau-taygeta", name:"Taygeta", ra:3.7535, dec:24.4673, mag:4.30, message:"Holding still." }
      ],
      lines: [
        ["tau-gamma","tau-delta1"],
        ["tau-delta1","tau-epsilon"],
        ["tau-epsilon","tau-alpha"],
        ["tau-alpha","tau-zeta"],
        ["tau-alpha","tau-beta"],
        ["tau-gamma","tau-theta2"],
        ["tau-theta2","tau-alpha"],
        ["tau-electra","tau-maia"],
        ["tau-maia","tau-taygeta"],
        ["tau-taygeta","tau-alcyone"],
        ["tau-alcyone","tau-pleione"],
        ["tau-pleione","tau-atlas"],
        ["tau-atlas","tau-electra"]
      ]
    }
  },


  BRIDGE_LINES: [
    ["aqr-beta","tau-alpha"],
    ["tau-alpha","lib-beta"],
    ["lib-beta","aqr-alpha"],
    ["aqr-alpha","tau-beta"],
    ["tau-beta","lib-alpha"],
    ["lib-alpha","aqr-beta"]
  ],

  SPIKE_MAG_THRESHOLD: 2.0,

  CUSTOM_COLOR: "#d9c38f",
  CUSTOM_COLOR_BRIGHT: "#fff1c7",

  BACKGROUND: {
    milkyWayTintA: "#4a5a82",
    milkyWayTintB: "#6b5a80",
    milkyWayTintC: "#8c7a5f",
    nebulaPatches: [
      { x:0.15, y:0.78, color:"#5f7dff", size:210, alpha:0.13 },
      { x:0.84, y:0.18, color:"#e6935a", size:230, alpha:0.11 },
      { x:0.66, y:0.85, color:"#c4519b", size:190, alpha:0.10 },
      { x:0.05, y:0.30, color:"#3fc9b8", size:180, alpha:0.08 },
      { x:0.36, y:0.10, color:"#7a5fe0", size:160, alpha:0.08 },
      { x:0.94, y:0.62, color:"#e0577a", size:150, alpha:0.07 },
      { x:0.48, y:0.94, color:"#4f8fe0", size:200, alpha:0.07 },
      { x:0.24, y:0.52, color:"#c98fe0", size:110, alpha:0.05 }
    ],
    starDensity: 4600,
    planets: [
      { color:"#c9704a", size:1.8, ring:false, position:[-72, 20, -46] },
      { color:"#7fb8c9", size:1.15, ring:false, position:[58, -26, -62] },
      { color:"#d8c193", size:2.3, ring:true,  position:[14, 44, -92] },
      { color:"#8f6fd6", size:0.95, ring:false, position:[-40, -34, -70] },
      { color:"#c95f5f", size:1.3, ring:true,  position:[85, -10, -80] }
    ],
    brightStar: { color:"#fff2d0", size:1.8, position:[92, 12, 34] },

    blackHole: {
      position: [46, 30, -128],
      size: 6.4,
      hot: "#fff7e6",
      cool: "#c9622c",
      bias: 0.6
    },

    nebulaClouds: [
      { position:[-95, 40, -60],  color:"#5f7dff", size:58, alpha:0.10, stretch:0.7 },
      { position:[110, -30, -40], color:"#e0935a", size:50, alpha:0.09, stretch:0.6 },
      { position:[-40, -70, 60],  color:"#c4519b", size:44, alpha:0.08, stretch:0.8 },
      { position:[70, 60, 90],    color:"#3fc9b8", size:52, alpha:0.07, stretch:0.65 },
      { position:[-120, -10, 80], color:"#7a5fe0", size:62, alpha:0.08, stretch:0.75 },
      { position:[30, -55, -115], color:"#e0577a", size:48, alpha:0.07, stretch:0.7 },
      { position:[-30, 90, -70],  color:"#4f8fe0", size:56, alpha:0.07, stretch:0.6 },
      { position:[95, -80, 30],   color:"#c98fe0", size:46, alpha:0.06, stretch:0.72 }
    ],


    distantGalaxies: [
      { position:[-150, 60, -30],  color:"#cfd8ff", size:2.6, stretch:0.32, rotation:0.4 },
      { position:[140, 80, 20],    color:"#ffe4c9", size:2.1, stretch:0.28, rotation:1.1 },
      { position:[-100, -90, -50], color:"#d6c9ff", size:1.9, stretch:0.4,  rotation:2.0 },
      { position:[160, -50, -70],  color:"#c9f0e6", size:2.3, stretch:0.3,  rotation:0.7 },
      { position:[-160, 10, 60],   color:"#ffd9d0", size:1.7, stretch:0.36, rotation:2.6 },
      { position:[60, 120, -40],   color:"#dce4ff", size:2.0, stretch:0.3,  rotation:1.7 },
      { position:[-60, -120, 40],  color:"#ffeccf", size:1.8, stretch:0.34, rotation:0.2 },
      { position:[130, 20, 100],   color:"#e3d0ff", size:2.4, stretch:0.28, rotation:2.3 },
      { position:[40, -140, -60],  color:"#cfe8ff", size:2.1, stretch:0.32, rotation:1.4 },
      { position:[-130, -40, -100],color:"#ffe0e0", size:1.9, stretch:0.3,  rotation:0.9 }
    ]
  }
};

window.SKY = SKY;