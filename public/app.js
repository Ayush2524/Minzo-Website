'use strict';
const feedback = document.querySelector('#sample-feedback');
let sampleAnswer = null;
async function chooseSample(answer) {
  if (!(await window.MinzoAuth.requireUser('/#try-it'))) return {requiresSignIn:true};
  if (!['a', 'b'].includes(answer)) throw new Error('Choose a or b.');
  sampleAnswer = answer;
  document.querySelectorAll('[data-answer]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.answer === answer));
    button.classList.toggle('selected', button.dataset.answer === answer);
  });
  feedback.className = answer === 'b' ? 'sample-feedback correct' : 'sample-feedback nudge';
  feedback.innerHTML = answer === 'b'
    ? '<strong>That’s it. Context makes the difference.</strong><p>The role, industry and shape of the answer give AI fewer things to guess. A useful prompt gives direction.</p><a class="text-link" href="journey/">Keep your curiosity going <span aria-hidden="true">→</span></a>'
    : '<strong>A useful starting point. Now make it yours.</strong><p>This could return advice for almost any interview. Try B and notice what happens when you add a role, an industry and a clear request.</p>';
  document.querySelector('#sample-reset').hidden = false;
  return { answer, correct: answer === 'b' };
}
document.querySelectorAll('[data-answer]').forEach(button => button.addEventListener('click', () => chooseSample(button.dataset.answer).catch(error => { feedback.textContent=error.message; })));
document.querySelector('#sample-reset').addEventListener('click', () => {
  sampleAnswer = null;
  document.querySelectorAll('[data-answer]').forEach(button => {button.classList.remove('selected');button.setAttribute('aria-pressed', 'false');});
  feedback.className = '';
  feedback.innerHTML = '<span class="sample-prompt">Trust your thinking. Pick a prompt.</span>';
  document.querySelector('#sample-reset').hidden = true;
  document.querySelector('[data-answer="a"]').focus();
});
const characterStories = {
  wolf: ['AFTER CHAPTER ONE', 'A little braver, together.', 'Wolf doesn’t need many words. He’s in your corner for the small wins, the second attempts, and every step ahead.'],
  owl: ['WHEN YOU NEED A LITTLE HELP', 'Coffee. Then clarity.', 'Stuck on a question? Owl helps you see it from another angle. Sometimes one little nudge is all it takes.'],
  raccoon: ['AFTER CHAPTER THREE', 'What if we tried… this?', 'Raccoon is an experiment waiting to happen. A tangled idea, an unexpected discovery, and a reminder that trying is how you learn.'],
  fox: ['AFTER CHAPTER FIVE', 'A little friendly rivalry.', 'Wolf cheers you on. Fox raises an eyebrow. Take on a challenge without hints, and discover how much you can do on your own.'],
  dragon: ['BEYOND FOX’S CHALLENGE', 'A big friend. A little puzzle.', 'Bring everything you’ve learned to Dragon’s gate. One final challenge, a little help from Owl if you need it, and a new horizon ahead.']
};
document.querySelectorAll('[data-character]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-character]').forEach(item => {item.classList.toggle('selected', item === button);item.setAttribute('aria-pressed', String(item === button));});
  const [label, title, copy] = characterStories[button.dataset.character];
  document.querySelector('#crew-story').innerHTML = `<span class="story-label">${label}</span><h3>${title}</h3><p>${copy}</p>`;
}));
document.querySelectorAll('.chapter-list details').forEach(detail => detail.addEventListener('toggle', () => {
  if (detail.open) document.querySelectorAll('.chapter-list details').forEach(other => {if (other !== detail) other.open = false;});
}));
if (document.modelContext?.registerTool) {
  const lifecycle = new AbortController();
  const tool = { name: 'answer_sample_lesson', title: 'Answer the sample lesson', description: 'Choose A or B in the homepage sample lesson and reveal its feedback. Does not award or save journey progress.', inputSchema: {type:'object', properties:{answer:{type:'string',enum:['a','b']}},required:['answer'],additionalProperties:false}, annotations:{readOnlyHint:false,untrustedContentHint:false}, execute(input) {if (!input || Object.keys(input).length !== 1 || !['a','b'].includes(input.answer)) throw new Error('Expected only answer: a or b.');return chooseSample(input.answer);} };
  try {Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(() => {});} catch {}
  window.addEventListener('pagehide', () => lifecycle.abort(), {once:true});
}
