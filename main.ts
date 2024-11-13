import express, { Request, Response, } from "npm:express@4.18.2";


console.log("starting")


type cachedThread = {
  lastUpdate: number,
  lastVisit: number,
  threadURL: string,
  threadBody: object,
}

let cache: cachedThread[] = []

function generateUrl({ board_id, thread_id }: { board_id: string, thread_id: number }): string {
  console.log({ board_id, thread_id })
  return `https://a.4cdn.org/${board_id}/thread/${thread_id}.json`
}
const TEN_MINUTES = 10 * 60 * 1000;

async function getThread(threadURL: string) {
  const now = Date.now()

  for (const cached of cache) {
    if (cached.threadURL == threadURL) {
      if ((now - cached.lastUpdate) > TEN_MINUTES) {

        console.log("found cached thread: expired!", { ...cached, threadBody: "[removed]" })
        break

      } else {

        console.log("found cached thread", { ...cached, threadBody: "[removed]" })
        cached.lastVisit = now
        return cached.threadBody

      }
    }
  }
  const res: Response = await fetch(threadURL)
  if (res.ok) {

    const threadBody: object = await res.json()
    const newCachedThread: cachedThread = {
      lastUpdate: Date.now(),
      lastVisit: Date.now(),
      threadURL,
      threadBody,
    }
    console.log("generating new cache object", { ...newCachedThread, threadBody: "[removed]" })

    console.log("removing", threadURL, "from cache")
    cache = cache.filter(thread => thread.threadURL != threadURL)
    console.log("adding new cache object to cache")
    cache.unshift(newCachedThread)
    console.log("sending result")

    return newCachedThread.threadBody
  } else {
    console.error("failed to get data", threadURL)
  }

}

const app = express();

app.get("/:board_id/thread/:thread_id", async (req: Request, res: Response) => {

  const threadURL = generateUrl(req.params)
  const threadBody = await getThread(threadURL)

  res.json(threadBody);

});

app.use((_req: Request, res: Response) => {

  res.sendStatus(404)

})

await app.listen({ port: 8080 });

// console.log("listening: http://127.0.0.1:8080")



