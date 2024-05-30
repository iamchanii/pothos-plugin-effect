import './base.js';
import './drizzle.js';
import './error.js';
import './prisma.js';
import './stream.js';
import './withInput.js';

import { builder } from './builder.js';

builder.queryType({});
builder.mutationType({});
builder.subscriptionType({});

export const schema = builder.toSchema();
