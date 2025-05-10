// scenes/chapter1.js

export const chapterOneScenes = {
    'intro': {
      background: "images/backgrounds/workshop-night.jpg",
      speaker: "narrator",
      text: "It's midnight at Charlie's workshop. The faint smell of ozone and pizza hangs in the air. You've been invited to join the Surron Squad on a special mission.",
      choices: [
        { text: "\"What's this mission about?\"", nextScene: "mission-briefing" },
        { text: "\"Why am I here so late?\"", nextScene: "late-night" },
        { text: "\"I'm just here for the pizza.\"", nextScene: "pizza-response", effect: { energy: +10 } }
      ]
    },
    // ... (rest of original scenes will go here, migrated from adventure-engine.js)
  
    // NEW SCENE: Tubbs Hill Trail
    'tubbs-hill-trail': {
      background: "images/backgrounds/tubbs-hill-overlook.jpg",
      speaker: "charlie",
      text: "Tubbs Hill at dawn. Still damp from the morning dew, and perfect for testing grip mods. Let's rip.",
      choices: [
        {
          text: "\"I'm ready—let's push the throttle.\"",
          nextScene: "tubbs-hill-descent",
          effect: { reputation: +3, energy: -10 }
        },
        {
          text: "\"Is this even legal?\"",
          nextScene: "charlie-shrug"
        }
      ],
      rewards: {
        character: "charlie",
        relationship: 1,
        xp: 20
      }
    },
  
    'tubbs-hill-descent': {
      background: "images/backgrounds/tubbs-hill-trail.jpg",
      speaker: "narrator",
      text: "The descent is fast, root-riddled, and glorious. You barely hold traction—but your build holds up. Just barely.",
      choices: [
        { text: "\"Whew. Worth it.\"", nextScene: "mission-complete", effect: { parts: +2 } }
      ],
      rewards: { xp: 40 }
    },
  
    // NEW SCENE: Downtown CDA Encounter
    'downtown-meet': {
      background: "images/backgrounds/downtown-cda.jpg",
      speaker: "billy",
      text: "Charlie said to meet outside Lakers. He better not be starting something again...",
      choices: [
        { text: "\"Let’s find him.\"", nextScene: "lakers-scene" },
        { text: "\"We should split up.\"", nextScene: "split-search", effect: { energy: -5 } }
      ]
    },
  
    'lakers-scene': {
      background: "images/backgrounds/lakers-bar.jpg",
      speaker: "charlie",
      text: "There you are! I may have challenged a guy to a wheelie duel. Don't worry—it’s for pinks."
      ,
      choices: [
        { text: "\"DUDE. Seriously?\"", nextScene: "mission-complete", effect: { reputation: +2 } }
      ],
      rewards: { xp: 50, currency: 100, items: ["controller"] }
    }
  };
  