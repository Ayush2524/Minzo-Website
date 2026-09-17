import "./home.css";
import SampleLesson from "./components/SampleLesson";
import CrewPicker from "./components/CrewPicker";
import ChapterList from "./components/ChapterList";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header wrap">
        <a className="brand" href="/" aria-label="Minzo AI home">
          <img
            src="/journey/assets/mascot/happy.png"
            alt=""
            width="45"
            height="49"
          />
          <span>
            minzo<span className="brand-ai">AI</span>
          </span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#journey">The journey</a>
          <a href="#companions">Meet the crew</a>
        </nav>
        <a className="button button-small" href="/journey">
          Start learning <span aria-hidden="true">↗</span>
        </a>
      </header>
      <main id="main">
        <section className="hero wrap" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="little-star" aria-hidden="true">
                ✦
              </span>{" "}
              BIG IDEAS. LITTLE STEPS.
            </div>
            <h1 id="hero-title">
              A little curiosity.
              <br />
              A whole new
              <br />
              <span>superpower.</span>
            </h1>
            <p>
              Get good at AI. One small adventure at a time.
              <br className="desktop-break" /> Real skills, playful
              challenges, and a few friends
              <br className="desktop-break" /> to help you find your way.
            </p>
            <div className="hero-actions">
              <a className="button" href="/journey">
                Let’s take the first step <span aria-hidden="true">→</span>
              </a>
              <a className="text-link" href="#try-it">
                <span className="play-small" aria-hidden="true">
                  ▷
                </span>{" "}
                Try a little lesson
              </a>
            </div>
            <div className="hero-note">
              <span className="check-icon" aria-hidden="true">
                ✓
              </span>{" "}
              No AI experience needed. Just bring your curiosity.
            </div>
          </div>
          <div className="hero-art">
            <div
              className="world-image"
              role="img"
              aria-label="A sunlit learning path winds through a peaceful village toward a new horizon."
            ></div>
            <div className="chapter-pill">
              <span className="chapter-symbol" aria-hidden="true">
                ✦
              </span>
              <span>
                <small>YOUR NEXT CHAPTER</small>
                <strong>A more capable you.</strong>
              </span>
            </div>
            <div className="hero-path" aria-hidden="true">
              <span className="path-step step-three">✦</span>
              <span className="path-step step-two">✓</span>
              <span className="path-step step-one">✓</span>
            </div>
            <img
              className="hero-ninja"
              src="/journey/assets/mascot/motivated.png"
              alt="Minzo’s determined little ninja"
              width="420"
              height="468"
            />
            <img
              className="hero-wolf"
              src="/journey/assets/mascot/wolf/happy.png"
              alt="Wolf, your loyal learning companion"
              width="195"
              height="210"
            />
            <div className="hello-note">
              You’ve got this.<span aria-hidden="true">♡</span>
            </div>
            <div className="lesson-pill">
              <span className="lesson-check" aria-hidden="true">
                ✓
              </span>
              <span>
                <strong>Small lesson. Real progress.</strong>
                <small>One step closer to “I can do this.”</small>
              </span>
            </div>
          </div>
        </section>
        <div className="benefit-strip">
          <div className="wrap">
            <span>
              <b aria-hidden="true">◷</b> Bite-sized lessons
            </span>
            <span>
              <b aria-hidden="true">✦</b> Skills you’ll actually use
            </span>
            <span>
              <b aria-hidden="true">♧</b> A story worth following
            </span>
            <span>
              <b aria-hidden="true">↗</b> Progress you can feel
            </span>
          </div>
        </div>
        <section className="section wrap" id="how-it-works">
          <div className="section-heading">
            <span className="eyebrow">LEARNING, WITH A LITTLE MORE LIFE</span>
            <h2>
              Less “where do I start?”
              <br />
              More “look what I can do.”
            </h2>
            <p>
              You don’t need to figure everything out at once.
              <br />
              Just take the next small step.
            </p>
          </div>
          <div className="how-grid">
            <article className="how-card">
              <div className="how-top">
                <span className="step-number">01</span>
                <span className="tiny-label">GET THE IDEA</span>
              </div>
              <h3>A little lightbulb moment.</h3>
              <p>
                Understand one useful idea about AI, in plain language that
                actually makes sense.
              </p>
              <div className="mini-example">
                <span className="example-label">A GOOD PROMPT HAS A PLAN</span>
                <div className="prompt-parts">
                  <span>Task</span>
                  <i>+</i>
                  <span>Context</span>
                  <i>+</i>
                  <span>Format</span>
                </div>
              </div>
            </article>
            <article className="how-card peach">
              <div className="how-top">
                <span className="step-number">02</span>
                <span className="tiny-label">GIVE IT A GO</span>
              </div>
              <h3>Less watching. More doing.</h3>
              <p>
                Make a choice, try a prompt, spot what’s off. Get a helpful
                nudge when you need one.
              </p>
              <div className="mini-example answer-example">
                <span className="example-choice">A vague ask</span>
                <span className="example-choice good">
                  A clear direction <b>✓</b>
                </span>
              </div>
            </article>
            <article className="how-card lavender">
              <div className="how-top">
                <span className="step-number">03</span>
                <span className="tiny-label">SEE YOURSELF GROW</span>
              </div>
              <h3>Your next chapter is waiting.</h3>
              <p>
                Put your skills to the test, meet a new companion, and find
                out what’s around the bend.
              </p>
              <div className="mini-example mini-progress">
                <span>✓</span>
                <i></i>
                <span>✓</span>
                <i></i>
                <span className="next">✦</span>
                <small>A little further than yesterday.</small>
              </div>
            </article>
          </div>
        </section>
        <section className="try-section" id="try-it">
          <div className="wrap try-grid">
            <div className="try-copy">
              <span className="eyebrow">A TINY TASTE OF MINZO</span>
              <h2>
                Your first “aha!”
                <br />
                starts right here.
              </h2>
              <p>
                Better answers begin with better questions.
                <br />
                See the difference a little context makes.
              </p>
              <div className="owl-aside">
                <img
                  src="/journey/assets/mascot/owl/hint.png"
                  alt="Owl holding a coffee"
                  width="95"
                  height="110"
                  loading="lazy"
                />
                <div>
                  <strong>“Give AI a little direction.”</strong>
                  <span>Owl · your guide when things get tricky</span>
                </div>
              </div>
            </div>
            <SampleLesson />
          </div>
        </section>
        <section className="section wrap journey-section" id="journey">
          <div className="journey-copy">
            <span className="eyebrow">ONE PATH. YOUR PACE.</span>
            <h2>
              Find your footing.
              <br />
              Then find your flow.
            </h2>
            <p>
              Start with the everyday things you want AI to help with. Every
              chapter builds on the last, so you always know where to go
              next.
            </p>
            <div className="journey-facts">
              <div>
                <strong>5</strong>
                <span>practical chapters</span>
              </div>
              <div>
                <strong>20</strong>
                <span>little checkpoints</span>
              </div>
              <div>
                <strong>You</strong>
                <span>setting the pace</span>
              </div>
            </div>
            <a className="text-link" href="/journey">
              Explore your learning path <span aria-hidden="true">→</span>
            </a>
            <div className="journey-note">
              <img
                src="/journey/assets/mascot/wolf/happy.png"
                alt="Wolf"
                loading="lazy"
                width="85"
                height="95"
              />
              <p>
                Finish your first chapter.
                <br />
                <strong>A new friend is waiting.</strong>
              </p>
            </div>
          </div>
          <ChapterList />
        </section>
        <section className="crew-section" id="companions">
          <div className="wrap">
            <div className="section-heading">
              <span className="eyebrow">
                GOOD COMPANY. GREAT LITTLE ADVENTURES.
              </span>
              <h2>You’ll grow. So will your story.</h2>
              <p>
                A loyal friend. A helpful nudge. A little friendly rivalry.
                <br />
                Meet the characters who make the journey yours.
              </p>
            </div>
            <CrewPicker />
            <p className="crew-footnote">
              Every encounter belongs to your path. New friends arrive as you
              learn.
            </p>
          </div>
        </section>
        <section className="closing-section wrap">
          <img
            src="/journey/assets/mascot/victory.png"
            alt="The Minzo ninja celebrates a little win"
            width="145"
            height="168"
            loading="lazy"
          />
          <span className="eyebrow">YOU DON’T HAVE TO KNOW IT ALL.</span>
          <h2>You just have to begin.</h2>
          <p>A little curiosity today. A little more confidence tomorrow.</p>
          <a className="button" href="/journey">
            Let’s take the first step <span aria-hidden="true">→</span>
          </a>
          <span className="closing-note">
            Your first lesson is ready. Come as you are.
          </span>
        </section>
      </main>
      <footer className="wrap footer">
        <a className="brand" href="/">
          <span>
            minzo<span className="brand-ai">AI</span>
          </span>
        </a>
        <p>A little better, every day.</p>
        <span>minzoai.com</span>
      </footer>
    </>
  );
}
