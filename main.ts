import express, { Request, Response } from "npm:express@4.18.2";


const app = express();



app.get("/init", (_req: Request, res: Response) => {
  res.send("hello. vischan");

});

await app.listen({ port: 8080 });


