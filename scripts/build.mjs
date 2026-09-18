import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
// Fail the build if an essential asset or one of the protected files is missing.
for (const file of ['public/index.html','public/signin.html','public/auth/client.js','public/auth/gate.js','public/auth/signin.js','public/auth/journey-session.js','private/journey/index.html','private/journey/app.js','private/journey/style.css','private/journey/content.json','public/journey/assets/GeistVF.woff']) {
  await access(file,constants.R_OK);
}
JSON.parse(await readFile('private/journey/content.json','utf8'));
for (const file of ['index.html','app.js','style.css','content.json']) {
  try {await access(`public/journey/${file}`);} catch {continue;}
  throw new Error(`Remove public/journey/${file}; the protected copy belongs in private/journey.`);
}
console.log('Minzo website and protected learning files are ready.');
