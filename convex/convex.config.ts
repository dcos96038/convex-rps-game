import { defineApp } from 'convex/server';
import aggregate from '@convex-dev/aggregate/convex.config';

const app = defineApp();
app.use(aggregate, { name: 'userBalances' });
app.use(aggregate, { name: 'battles' });
export default app;
