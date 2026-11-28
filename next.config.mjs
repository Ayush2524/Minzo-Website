import {withMinzoAuth} from './minzo-auth.config.mjs';
import { createRequire } from 'module';

var require = createRequire(import.meta.url);
var module = { exports: {} };

export default withMinzoAuth({}); 
