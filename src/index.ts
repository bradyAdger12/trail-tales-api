import 'dotenv/config'
import _ from 'lodash'
import buildServer from "./server";
import { postMatchupCron } from './cron/post_matchup';
const server = buildServer()
// Start Fastify server
const main = async () => {
  try {
    const port = (process.env.PORT || 3000) as number
    await server.listen({ port });
    // job.start()
    postMatchupCron.start()
    console.log(`Server listening on port ${port}`)
  } catch (err) {
    console.error(err)
    process.exit(1);
  }
};

main()