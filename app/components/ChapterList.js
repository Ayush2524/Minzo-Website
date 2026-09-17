"use client";

import { useState } from "react";

const chapters = [
  {
    index: "01",
    small: "YOUR FIRST STEP",
    title: "Ask a better question",
    body: "Understand what AI is doing, give it the context it needs, and turn a vague ask into a useful prompt.",
    start: true,
  },
  {
    index: "02",
    title: "Summarize long things",
    body: "Find the important parts, understand what the model can see, and keep the meaning intact.",
  },
  {
    index: "03",
    title: "Research without being lied to",
    body: "Spot confident mistakes, check the source, and learn when an answer needs a second look.",
  },
  {
    index: "04",
    title: "Translate and localise",
    body: "Go beyond word-for-word translation. Make language work for its context and audience.",
  },
  {
    index: "05",
    title: "Use AI as a sparring partner",
    body: "Ask for another perspective, challenge your assumptions, and make your own thinking stronger.",
  },
];

export default function ChapterList() {
  const [open, setOpen] = useState("01");

  return (
    <div className="chapter-list">
      {chapters.map((c) => {
        const isOpen = open === c.index;
        return (
          <details
            key={c.index}
            open={isOpen}
            onToggle={(e) => {
              if (e.currentTarget.open) setOpen(c.index);
              else if (isOpen) setOpen(null);
            }}
          >
            <summary>
              <span className="chapter-index">{c.index}</span>
              <span>
                {c.small && <small>{c.small}</small>}
                {c.title}
              </span>
              <b aria-hidden="true">+</b>
            </summary>
            <p>{c.body}</p>
            {c.start && (
              <a href="/journey" className="chapter-start">
                Begin chapter one <span aria-hidden="true">→</span>
              </a>
            )}
          </details>
        );
      })}
    </div>
  );
}
