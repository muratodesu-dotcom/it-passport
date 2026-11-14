import type { Question } from "@/lib/types";

export const devQuestionsVercel: Question[] = [
  // ===== Vercel (3081-3100) =====
  {
    id: 3081,
    category: "technology",
    exams: ["dev"],
    devField: "vercel",
    question:
      "You add `STRIPE_SECRET_KEY` in the Vercel dashboard and enable it only for the Production environment. A teammate opens a preview deployment of a pull request. What happens to that variable?",
    options: [
      "It is not available in the preview deployment, so the code reads `undefined`",
      "It is available in every deployment because the project shares one variable set",
      "It is available in the preview, but its value is masked in the build logs",
      "It is available only if the pull request branch is named `production`",
    ],
    correctIndex: 0,
    explanation:
      "Each variable is scoped to one or more environments (Production, Preview, Development), and a preview deployment only receives variables assigned to Preview. Enabling a variable for Production alone does not leak it into previews.",
  },
  {
    id: 3082,
    category: "technology",
    exams: ["dev"],
    devField: "vercel",
    question:
      "You change the value of an environment variable in the Vercel dashboard, but the live site still behaves as before. What is the most likely reason?",
    options: [
      "Existing deployments keep the values they were built with, so you must redeploy",
      "Vercel applies new values only after a 24-hour propagation delay",
      "The browser cache holds the old value and must be cleared by users",
      "Variables can only be changed by deleting and re-creating the project",
    ],
    correctIndex: 0,
    explanation:
      "Environment variables are captured per deployment, so a change affects only new deployments. Trigger a redeploy (or push a commit) for the new value to take effect; there is no propagation delay involved.",
  },
  {
    id: 3083,
    category: "technology",
    exams: ["dev"],
    devField: "vercel",
    question:
      "You clone a Next.js repo and want your local `next dev` to use the same Development-environment variables that the Vercel project defines. Which workflow fits?",
    options: [
      "Run `vercel link`, then `vercel env pull .env.local`",
      "Run `vercel deploy --prod` and copy the values from the deployment URL",
      "Run `vercel env rm` for each variable, then re-add them in `.env.local`",
      "Run `vercel build` and commit the generated `.vercel/output` folder",
    ],
    correctIndex: 0,
    explanation:
      "`vercel link` connects the local folder to the project, and `vercel env pull` writes its Development variables into a local file. Keep that file out of Git, because it contains secrets.",
  },
  {
    id: 3084,
    category: "technology",
    exams: ["dev"],
    devField: "vercel",
    question:
      "A deploy to production introduces a serious bug at 2 a.m. You need the previous working version live again as fast as possible. What is the best first action?",
    options: [
      "Use Instant Rollback to point production at the previous deployment",
      "Revert the commit locally, then wait for a full rebuild before checking",
      "Delete the broken deployment so Vercel falls back to the last one",
      "Disable the production domain until a fix has been written and tested",
    ],
    correctIndex: 0,
    explanation:
      "Instant Rollback re-assigns the production domains to an earlier, already-built deployment, so no new build is needed. Deleting a deployment does not guarantee a sensible fallback, and a revert plus rebuild is slower.",
  },
  {
    id: 3085,
    category: "technology",
    exams: ["dev"],
    devField: "vercel",
    question:
      "A Next.js route handler uses a Node.js library and still has `export const runtime = 'edge'`. In current Vercel guidance, what should you do?",
    options: [
      "Remove the line and use the default Node.js runtime on Fluid Compute",
      "Keep it, because the Edge runtime is the recommended default for all routes",
      "Replace it with `runtime = 'edge-v2'` to get full Node.js APIs",
      "Move the route to a separate project, since Node.js is unsupported on Vercel",
    ],
    correctIndex: 0,
    explanation:
      "The Edge runtime is deprecated; the default Node.js runtime on Fluid Compute supports full Node.js APIs and longer durations. There is no `edge-v2` runtime value.",
  },
  {
    id: 3086,
    category: "technology",
    exams: ["dev"],
    devField: "vercel",
    question:
      "Your chat route streams LLM tokens to the browser. A colleague says it must use the Edge runtime for streaming to work. What is the accurate response?",
    options: [
      "Streaming works on the default Node.js runtime with no extra configuration",
      "They are right, because Node.js functions always buffer the full response",
      "Streaming works only if you add a `streaming: true` flag to `vercel.json`",
      "Streaming is possible on Node.js only with a separate WebSocket server",
    ],
    correctIndex: 0,
    explanation:
      "Streamed responses (`ReadableStream`, SSE, AI token streaming) work on the Node.js runtime out of the box. Believing streaming is Edge-only is an outdated misconception.",
  },
  {
    id: 3087,
    category: "technology",
    exams: ["dev"],
    devField: "vercel",
    question:
      "Your Supabase project runs in Frankfurt, but API routes on Vercel respond slowly because each request makes several sequential queries. What is the most effective fix?",
    options: [
      "Set the function region to one close to the database, such as `fra1`",
      "Leave the default region and add more indexes to every table",
      "Switch the routes to the Edge runtime so they run near each visitor",
      "Increase the function timeout so slow queries are not cut off",
    ],
    correctIndex: 0,
    explanation:
      "Each query pays the network round trip between the function and the database, and the default function region is `iad1` (US East). Placing functions near the database cuts that per-query latency, whereas running near the user would make the function-to-database trips longer.",
  },
  {
    id: 3088,
    category: "technology",
    exams: ["dev"],
    devField: "vercel",
    question:
      "Which statement best describes how Fluid Compute reduces the impact of cold starts compared with classic one-request-per-instance serverless?",
    options: [
      "A function instance can be reused to handle multiple concurrent requests",
      "Every function is kept running permanently on a dedicated server",
      "Code is compiled to WebAssembly so that start-up is always instant",
      "Requests are queued until an idle instance finishes the previous one",
    ],
    correctIndex: 0,
    explanation:
      "Fluid Compute reuses instances across concurrent requests, so fewer new instances (and fewer cold starts) are needed. Functions are not permanently dedicated, and requests are not serialized behind one another.",
  },
  {
    id: 3089,
    category: "technology",
    exams: ["dev"],
    devField: "vercel",
    question:
      "A Next.js blog page is statically generated with ISR. An editor updates a post in the database, but visitors still see the old text. What is the best way to show the change right away?",
    options: [
      "Trigger on-demand revalidation, for example with `revalidateTag` or `revalidatePath`",
      "Redeploy the whole project every time a post changes",
      "Set `Cache-Control: no-store` on the page and disable ISR permanently",
      "Ask visitors to hard-refresh so that their browser fetches new HTML",
    ],
    correctIndex: 0,
    explanation:
      "On-demand revalidation refreshes only the affected cached pages when the data changes. A redeploy works but is heavy and unnecessary, and a hard refresh does not clear the server-side cache.",
  },
  {
    id: 3090,
    category: "technology",
    exams: ["dev"],
    devField: "vercel",
    question:
      "You configure an Ignored Build Step so that docs-only commits skip the build. In the deployments list, how does a skipped build appear?",
    options: [
      "As Canceled, with a message that the Ignored Build Step stopped it",
      "As Ready, because nothing changed and the old build is reused",
      "As Error, because the build command exited with a failure code",
      "As Queued, until someone approves the build manually",
    ],
    correctIndex: 0,
    explanation:
      "When the Ignored Build Step decides to skip, the deployment is marked Canceled, not Ready or Error. Remember this when a required status check looks failed or missing: nothing is actually broken.",
  },
  {
    id: 3091,
    category: "technology",
    exams: ["dev"],
    devField: "vercel",
    question:
      "Your team does not want unreleased features on preview URLs to be visible to the public. Which Vercel feature addresses this directly?",
    options: [
      "Deployment Protection, such as Vercel Authentication on preview deployments",
      "Setting `noindex` in `robots.txt` for every preview domain",
      "Using longer, randomly generated branch names for each pull request",
      "Disabling Git integration and uploading previews by hand",
    ],
    correctIndex: 0,
    explanation:
      "Deployment Protection requires a signed-in team member (or a bypass) to open a preview. `robots.txt` only asks crawlers not to index and does not stop anyone who has the URL.",
  },
  {
    id: 3092,
    category: "technology",
    exams: ["dev"],
    devField: "vercel",
    question:
      "Just after a deploy, some users who still have the old page open get errors because their client calls Server Actions or API routes that changed. Which feature is meant to prevent this?",
    options: [
      "Skew Protection, which routes requests to the deployment that served the client",
      "Instant Rollback, which hides the new deployment from all users",
      "Image Optimization, which rewrites outdated client bundles at the CDN",
      "Deployment Protection, which logs out users on every new deployment",
    ],
    correctIndex: 0,
    explanation:
      "Version skew happens when an old client talks to a new server. Skew Protection pins those requests to the matching deployment, whereas rollback changes what everyone gets rather than keeping old clients consistent.",
  },
  {
    id: 3093,
    category: "technology",
    exams: ["dev"],
    devField: "vercel",
    question:
      "An aggressive AI crawler is hammering your site and ignoring `robots.txt`. What is the right way to stop it on Vercel?",
    options: [
      "Add a Vercel Firewall rule that blocks or challenges the bot's traffic",
      "Add more `Disallow` lines to `robots.txt`, since crawlers must obey them",
      "Raise the function timeout so the crawler's requests can finish",
      "Rename the affected routes each week so the bot loses track of them",
    ],
    correctIndex: 0,
    explanation:
      "`robots.txt` is only a request that well-behaved bots honor; it enforces nothing. A Firewall rule blocks or challenges matching traffic before it reaches your functions.",
  },
  {
    id: 3094,
    category: "technology",
    exams: ["dev"],
    devField: "vercel",
    question:
      "You expose `/api/cleanup` and register it as a Vercel Cron Job. What should you do so that random visitors cannot trigger it by opening the URL?",
    options: [
      "Set a `CRON_SECRET` variable and verify the `Authorization: Bearer` header in the route",
      "Hide the path by giving it an unusual name that nobody would guess",
      "Rely on the cron schedule, since the route only runs at the set time",
      "Return `404` for all `GET` requests and accept only `POST` requests",
    ],
    correctIndex: 0,
    explanation:
      "Vercel sends the `CRON_SECRET` value as a bearer token on cron invocations, so the handler can reject calls without it. A hidden path is not authentication, and the route remains publicly reachable outside its schedule.",
  },
  {
    id: 3095,
    category: "technology",
    exams: ["dev"],
    devField: "vercel",
    question:
      "Users upload videos of up to 200 MB in your app. A route handler receives the file and forwards it to storage, but large uploads fail. What is the better design?",
    options: [
      "Upload directly from the browser to Vercel Blob using a client upload token",
      "Raise the route's body size by adding a larger `maxBodySize` setting",
      "Encode the file as Base64 and send it in several JSON requests",
      "Bundle the user's files into the deployment at build time",
    ],
    correctIndex: 0,
    explanation:
      "Request and response bodies on Vercel Functions are limited to 4.5 MB, so large files must bypass the function. Client uploads to Blob send the file straight from the browser; Base64 only makes the payload bigger.",
  },
  {
    id: 3096,
    category: "technology",
    exams: ["dev"],
    devField: "vercel",
    question:
      "A tutorial tells you to create a database with Vercel Postgres, but you cannot find it. How do you add a Postgres database to a Vercel project today?",
    options: [
      "Provision one through the Vercel Marketplace, for example Supabase or Neon",
      "Install the `@vercel/postgres` package, which creates a database automatically",
      "Enable the Postgres toggle in the project's function settings",
      "Run `vercel deploy --db` to attach a managed database to the deployment",
    ],
    correctIndex: 0,
    explanation:
      "Vercel Postgres and KV are no longer offered; databases come from Marketplace providers, which can inject connection variables into the project. A client package alone cannot create a database, and the other options are not real settings.",
  },
  {
    id: 3097,
    category: "technology",
    exams: ["dev"],
    devField: "vercel",
    question:
      "A project gives Preview and Production the same `DATABASE_URL`. What is the main risk of this setup?",
    options: [
      "Testing a pull request can modify or delete real production data",
      "Preview builds will fail because two environments cannot share a value",
      "Production queries will run slower while a preview is deployed",
      "Vercel will automatically merge the preview's schema into production",
    ],
    correctIndex: 0,
    explanation:
      "Preview deployments run unreviewed code, so pointing them at production data risks accidental writes, deletions and leaks. Use a separate database or branch for previews; sharing a value is technically allowed, which is why this mistake is common.",
  },
  {
    id: 3098,
    category: "technology",
    exams: ["dev"],
    devField: "vercel",
    question:
      "Your production site returns HTTP 500 on `/api/chat`, while the build succeeded. Where do you look first to find the cause?",
    options: [
      "The deployment's runtime logs, filtered by the failing route and status code",
      "The build logs, since a successful build can still hide a compile error",
      "The browser's Network tab, which shows the server-side stack trace",
      "The `Settings > Domains` page, where function errors are listed",
    ],
    correctIndex: 0,
    explanation:
      "Runtime logs capture what the function printed and threw when handling a request, so they usually show the exception behind a 500. Build logs cover compilation only, and the browser sees just the status and response body.",
  },
  {
    id: 3099,
    category: "technology",
    exams: ["dev"],
    devField: "vercel",
    question:
      "You display many user-uploaded photos on a Vercel-hosted site and want to control image optimization usage. Which practice helps most?",
    options: [
      "Use `next/image` with accurate `sizes` and limited formats and widths",
      "Use plain `<img>` tags pointing to the full-size originals",
      "Disable the browser cache so each image is always re-optimized",
      "Request every image at 4000 px wide and let CSS shrink it",
    ],
    correctIndex: 0,
    explanation:
      "`next/image` serves resized, modern-format variants, and tight `sizes` and a small set of widths keep the number of transformations down. Oversized requests multiply variants, and disabling caching would add work rather than save it.",
  },
  {
    id: 3100,
    category: "technology",
    exams: ["dev"],
    devField: "vercel",
    question:
      "Your app calls models from several providers and you want one API, usage observability and fallback if a provider fails. Which Vercel feature fits?",
    options: [
      "AI Gateway, using plain `provider/model` strings through the AI SDK",
      "Routing Middleware, which converts provider responses to one format",
      "Vercel Blob, which stores each provider's responses for later reuse",
      "Skew Protection, which keeps requests on one provider per deployment",
    ],
    correctIndex: 0,
    explanation:
      "AI Gateway is a unified API to many model providers with observability and model fallbacks, and the AI SDK can reach it with `provider/model` strings. Middleware and Blob do not handle provider routing.",
  },
];
