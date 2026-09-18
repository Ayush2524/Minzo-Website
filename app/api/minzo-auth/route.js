import handler from '../../../server/minzo/auth-handler.js';
import { asNextRoute } from '../../../server/minzo/next-adapter.js';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const GET = asNextRoute(handler);
export const POST = asNextRoute(handler);
