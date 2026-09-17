"use client";

import { useState } from "react";

export default function SampleLesson() {
  const [answer, setAnswer] = useState(null);

  function choose(value) {
    setAnswer(value);
  }

  function reset() {
    setAnswer(null);
  }

  return (
    <div className="sample-lesson" aria-labelledby="sample-title">
      <div className="sample-meta">
        <span>CHAPTER 01 · ASK A BETTER QUESTION</span>
        <span>1 little question</span>
      </div>
      <h3 id="sample-title">
        You’re preparing for a job interview.
        <br />
        Which prompt gets you further?
      </h3>
      <div className="sample-options">
        <button
          data-answer="a"
          aria-pressed={answer === "a"}
          className={answer === "a" ? "selected" : ""}
          onClick={() => choose("a")}
        >
          <span>A</span>
          <span>Give me some interview tips.</span>
        </button>
        <button
          data-answer="b"
          aria-pressed={answer === "b"}
          className={answer === "b" ? "selected" : ""}
          onClick={() => choose("b")}
        >
          <span>B</span>
          <span>
            I have a first-round interview for a junior data analyst role at
            a logistics company. Give me six likely questions and what a
            strong answer covers.
          </span>
        </button>
      </div>
      <div id="sample-feedback" aria-live="polite">
        {answer === null && (
          <span className="sample-prompt">Trust your thinking. Pick a prompt.</span>
        )}
        {answer === "b" && (
          <div className="sample-feedback correct">
            <strong>That’s it. Context makes the difference.</strong>
            <p>
              The role, industry and shape of the answer give AI fewer
              things to guess. A useful prompt gives direction.
            </p>
            <a className="text-link" href="/journey">
              Keep your curiosity going <span aria-hidden="true">→</span>
            </a>
          </div>
        )}
        {answer === "a" && (
          <div className="sample-feedback nudge">
            <strong>A useful starting point. Now make it yours.</strong>
            <p>
              This could return advice for almost any interview. Try B and
              notice what happens when you add a role, an industry and a
              clear request.
            </p>
          </div>
        )}
      </div>
      <div className="sample-bottom">
        <span>No sign-up. Just a little discovery.</span>
        <button id="sample-reset" hidden={answer === null} onClick={reset}>
          Try again ↻
        </button>
      </div>
    </div>
  );
}
