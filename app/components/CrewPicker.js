"use client";

import { useState } from "react";

const characters = [
  { key: "wolf", img: "/journey/assets/mascot/wolf/happy.png", name: "Wolf", tag: "Your loyal companion" },
  { key: "owl", img: "/journey/assets/mascot/owl/hint.png", name: "Owl", tag: "A little perspective" },
  { key: "raccoon", img: "/journey/assets/mascot/raccoon/experiment.png", name: "Raccoon", tag: "Curiosity, unleashed" },
  { key: "fox", img: "/journey/assets/mascot/fox/ready.png", name: "Fox", tag: "Your friendly rival" },
  { key: "dragon", img: "/journey/assets/mascot/dragon/entrance.png", name: "Dragon", tag: "A bigger little challenge" },
];

const characterStories = {
  wolf: [
    "AFTER CHAPTER ONE",
    "A little braver, together.",
    "Wolf doesn’t need many words. He’s in your corner for the small wins, the second attempts, and every step ahead.",
  ],
  owl: [
    "WHEN YOU NEED A LITTLE HELP",
    "Coffee. Then clarity.",
    "Stuck on a question? Owl helps you see it from another angle. Sometimes one little nudge is all it takes.",
  ],
  raccoon: [
    "AFTER CHAPTER THREE",
    "What if we tried… this?",
    "Raccoon is an experiment waiting to happen. A tangled idea, an unexpected discovery, and a reminder that trying is how you learn.",
  ],
  fox: [
    "AFTER CHAPTER FIVE",
    "A little friendly rivalry.",
    "Wolf cheers you on. Fox raises an eyebrow. Take on a challenge without hints, and discover how much you can do on your own.",
  ],
  dragon: [
    "BEYOND FOX’S CHALLENGE",
    "A big friend. A little puzzle.",
    "Bring everything you’ve learned to Dragon’s gate. One final challenge, a little help from Owl if you need it, and a new horizon ahead.",
  ],
};

export default function CrewPicker() {
  const [selected, setSelected] = useState("wolf");
  const [label, title, copy] = characterStories[selected];

  return (
    <>
      <div className="crew-picker" role="group" aria-label="Meet your companions">
        {characters.map((c) => (
          <button
            key={c.key}
            className={`crew-choice${selected === c.key ? " selected" : ""}`}
            data-character={c.key}
            aria-pressed={selected === c.key}
            onClick={() => setSelected(c.key)}
          >
            <img src={c.img} alt="" width="135" height="142" loading="lazy" />
            <strong>{c.name}</strong>
            <span>{c.tag}</span>
          </button>
        ))}
      </div>
      <div className="crew-story" id="crew-story" aria-live="polite">
        <span className="story-label">{label}</span>
        <h3>{title}</h3>
        <p>{copy}</p>
      </div>
    </>
  );
}
