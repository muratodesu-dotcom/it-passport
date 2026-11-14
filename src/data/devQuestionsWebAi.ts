import type { Question } from "@/lib/types";

// AI Engineer track: Web and deployment (3041-3060) and AI and LLM (3061-3080).
export const devQuestionsWebAi: Question[] = [
  // ===== Web and deployment (web) =====
  {
    id: 3041,
    category: "technology",
    exams: ["dev"],
    devField: "web",
    question:
      "Which HTTP method is NOT guaranteed by the specification to be idempotent?",
    options: [
      "POST",
      "PUT",
      "DELETE",
      "GET",
    ],
    correctIndex: 0,
    explanation:
      "Idempotency means that sending the same request many times leaves the server in the same state as sending it once. GET, PUT, and DELETE are idempotent, but POST is not guaranteed to be, since each call may create something new, such as another order. To make retries safe, combine POST with a mechanism such as an Idempotency-Key.",
  },
  {
    id: 3042,
    category: "technology",
    exams: ["dev"],
    devField: "web",
    question:
      "Which statement correctly describes the relationship between a Docker image and a container?",
    options: [
      "An image is a read-only template, and a container is a running instance started from it",
      "An image is the running process itself, and a container is a file that stores it",
      "An image is a copy of the host OS kernel, and a container is a virtual machine disk",
      "An image exists only on Docker Hub, and a container exists only locally",
    ],
    correctIndex: 0,
    explanation:
      "An image is a read-only template that bundles the app and its dependencies, and many containers can be started from a single image. A container is a running (or stopped) instance of it, and it shares the host kernel, which is what distinguishes it from a virtual machine.",
  },
  {
    id: 3043,
    category: "technology",
    exams: ["dev"],
    devField: "web",
    question:
      "You changed your site's domain and want to permanently redirect requests for the old URL to the new URL. Which status code should you return?",
    options: [
      "301 Moved Permanently",
      "302 Found",
      "304 Not Modified",
      "307 Temporary Redirect",
    ],
    correctIndex: 0,
    explanation:
      "301 means the resource has moved permanently, so search engines and browsers treat the new URL as the canonical one. 302 and 307 are temporary redirects, and 304 tells a conditional request that nothing has changed; it is not a redirect. 308 is also available when you want a permanent redirect that preserves the request method.",
  },
  {
    id: 3044,
    category: "technology",
    exams: ["dev"],
    devField: "web",
    question:
      "A logged-in regular user calls an admin-only API. Which status code is the most appropriate for the server to return?",
    options: [
      "403 Forbidden",
      "401 Unauthorized",
      "404 Not Found",
      "400 Bad Request",
    ],
    correctIndex: 0,
    explanation:
      "403 is for when the server knows who you are but you lack permission for that action. 401 is for when you are not authenticated, or your credentials are missing, invalid, or expired. A handy rule: 401 is an authentication problem, and 403 is an authorization problem.",
  },
  {
    id: 3045,
    category: "technology",
    exams: ["dev"],
    devField: "web",
    question:
      "The server cannot handle requests for the time being because of maintenance or overload. Which status code is the most appropriate?",
    options: [
      "503 Service Unavailable",
      "500 Internal Server Error",
      "502 Bad Gateway",
      "404 Not Found",
    ],
    correctIndex: 0,
    explanation:
      "503 signals a temporary outage from which the service may recover, and the `Retry-After` header can hint when to try again. 500 is an unexpected server error such as a bug, and 502 means a gateway received an invalid response from an upstream server.",
  },
  {
    id: 3046,
    category: "technology",
    exams: ["dev"],
    devField: "web",
    question:
      "A frontend at `http://localhost:3000` calls `fetch` on an API at a different origin, and the browser shows a CORS error. What is the correct fix?",
    options: [
      "Have the API server add an `Access-Control-Allow-Origin` header naming the allowed origin to its response",
      "Add an `Access-Control-Allow-Origin` header to the frontend's request",
      "Set the `fetch` mode to `no-cors` so JavaScript can read the response",
      "Clear the browser cache and cookies and send the request again",
    ],
    correctIndex: 0,
    explanation:
      "The server declares permission for cross-origin access through response headers (and by answering the preflight `OPTIONS` request when needed). `Access-Control-Allow-Origin` is a response header, so adding it to the request does nothing. `no-cors` can silence the error, but it only makes the response opaque and unreadable.",
  },
  {
    id: 3047,
    category: "technology",
    exams: ["dev"],
    devField: "web",
    question:
      "Which of the following is affected by CORS (cross-origin restrictions)?",
    options: [
      "A `fetch` from JavaScript in the browser to an API on a different origin",
      "A request to the same API sent from the terminal with `curl`",
      "A `fetch` to an external API from a Next.js Route Handler (server side)",
      "A nightly batch script that calls the same API",
    ],
    correctIndex: 0,
    explanation:
      "CORS is a restriction enforced by the browser under the same-origin policy: it reads the headers the server returns and decides whether to hand the response to JavaScript. `curl` and server-side code are not subject to it, which is why calls made through a server often work. That does not mean the API needs no authentication.",
  },
  {
    id: 3048,
    category: "technology",
    exams: ["dev"],
    devField: "web",
    question:
      "What is the main purpose of adding the `HttpOnly` attribute to a cookie that stores the session ID?",
    options: [
      "It stops JavaScript from reading the cookie via `document.cookie`, protecting it from theft through XSS",
      "It makes the browser send the cookie only over HTTPS connections",
      "It keeps the cookie from being attached to requests that originate from other sites",
      "It makes the browser delete the cookie automatically when it is closed",
    ],
    correctIndex: 0,
    explanation:
      "With `HttpOnly`, scripts on the page cannot read the cookie, so a session ID is harder to steal even if an XSS flaw exists. Sending a cookie only over HTTPS is the job of the `Secure` attribute, and limiting cross-site sending is the job of `SameSite`; these are separate protections.",
  },
  {
    id: 3049,
    category: "technology",
    exams: ["dev"],
    devField: "web",
    question:
      "What is the main purpose of the `SameSite=Lax` (or `Strict`) cookie attribute?",
    options: [
      "It restricts sending the cookie on cross-site requests, which mitigates CSRF",
      "It sets the cookie's lifetime and automatically deletes expired cookies",
      "It encrypts the cookie's contents before the browser stores them",
      "It raises the limit on how much data a cookie can hold",
    ],
    correctIndex: 0,
    explanation:
      "`SameSite` controls whether a cookie is attached to requests that originate from other sites (form posts, embedded images, and so on), which mitigates CSRF attacks that abuse an existing login. `Lax` still sends it on ordinary link navigations, while `Strict` is stricter. It has nothing to do with encryption or expiry.",
  },
  {
    id: 3050,
    category: "technology",
    exams: ["dev"],
    devField: "web",
    question:
      "In Next.js, which environment variable can be read from browser (client) code?",
    options: [
      "`NEXT_PUBLIC_API_BASE_URL`",
      "`API_BASE_URL`",
      "`SUPABASE_SERVICE_ROLE_KEY`",
      "`DATABASE_URL`",
    ],
    correctIndex: 0,
    explanation:
      "In Next.js, only environment variables that start with `NEXT_PUBLIC_` are inlined into the client-side JavaScript at build time. Variables without the prefix can be read only on the server and are `undefined` in the browser. Because the value is embedded at build time, changing it requires a rebuild (redeploy).",
  },
  {
    id: 3051,
    category: "technology",
    exams: ["dev"],
    devField: "web",
    question:
      "You put your Supabase `service_role` key into an environment variable with the `NEXT_PUBLIC_` prefix and deployed. What is the most serious risk?",
    options: [
      "The key is shipped to the browser where anyone can obtain it, so all data could be manipulated by bypassing RLS",
      "The build fails, and nothing at all gets deployed to production",
      "The key is encrypted automatically, so even the server can no longer use it",
      "The value is empty on the client, so only login stops working",
    ],
    correctIndex: 0,
    explanation:
      "`NEXT_PUBLIC_` variables are embedded in publicly served JavaScript, so anyone can see them in the browser dev tools. The `service_role` key bypasses RLS (row level security), so a leak lets an attacker read and write every table. Keep secret keys only in server-side environment variables, and rotate the key if one leaks.",
  },
  {
    id: 3052,
    category: "technology",
    exams: ["dev"],
    devField: "web",
    question:
      "You want to keep the speed of statically served pages but update the content periodically (or on an event) without a full rebuild. Which approach fits?",
    options: [
      "ISR (Incremental Static Regeneration)",
      "SSG (static generation at build time only)",
      "CSR (rendering only in the browser)",
      "SSR (server rendering on every request)",
    ],
    correctIndex: 0,
    explanation:
      "ISR serves a statically generated page like a cache while regenerating it in the background after a set interval or on a revalidation signal. SSG only updates at build time, and SSR generates the page on every request, so it loses the speed of static delivery. In Next.js you use the `revalidate` setting or `revalidatePath` / `revalidateTag`.",
  },
  {
    id: 3053,
    category: "technology",
    exams: ["dev"],
    devField: "web",
    question:
      "What is a typical cause of a \"hydration mismatch\" warning in Next.js (React)?",
    options: [
      "The HTML generated on the server differs from the client's first render (for example, using `Date.now()` or `Math.random()` while rendering)",
      "A required environment variable is missing, so an API call fails",
      "A `fetch` to another origin is blocked by CORS, so the data cannot be loaded",
      "A CSS file is too large, so the styles do not load in time",
    ],
    correctIndex: 0,
    explanation:
      "Hydration attaches event handling on the client to the HTML that the server produced. If the first client render does not match that HTML, a warning appears. Do not use time, randomness, or `window` / `localStorage`-dependent values during rendering; handle them in `useEffect` or otherwise make the server and client output identical.",
  },
  {
    id: 3054,
    category: "technology",
    exams: ["dev"],
    devField: "web",
    question:
      "A serverless function that had received no traffic for a while responds slowly on the first request and quickly afterwards. What is this phenomenon?",
    options: [
      "A cold start (waiting for a new execution environment to boot)",
      "A CORS preflight (an `OPTIONS` request)",
      "The N+1 problem (an increasing number of queries)",
      "A hydration mismatch",
    ],
    correctIndex: 0,
    explanation:
      "When a serverless function sits idle, its execution environment is torn down, so the next request must start a new one and load the code, which makes that first call slow. Mitigations include keeping initialization light, trimming dependencies, and using features that keep instances warm.",
  },
  {
    id: 3055,
    category: "technology",
    exams: ["dev"],
    devField: "web",
    question:
      "Which `Cache-Control` value suits static assets such as JavaScript and CSS files whose filenames include a content hash?",
    options: [
      "`public, max-age=31536000, immutable`",
      "`no-store`",
      "`no-cache`",
      "`max-age=0, must-revalidate`",
    ],
    correctIndex: 0,
    explanation:
      "An asset whose filename changes whenever its content changes can be cached for a very long time without ever serving a stale copy, so a one-year `max-age` with `immutable` is appropriate for CDNs and browsers. `no-store` forbids storing, while `no-cache` and `max-age=0` force revalidation, which suits HTML or data that can change.",
  },
  {
    id: 3056,
    category: "technology",
    exams: ["dev"],
    devField: "web",
    question:
      "Which practice is appropriate for the preview deployments that are created automatically for each pull request?",
    options: [
      "Configure a separate database and test keys, so previews never touch production data",
      "Share the production database and production secret keys so you can verify behavior",
      "Register the preview URLs with search engines to check how they look after launch",
      "Reuse the production build output in previews and skip the build",
    ],
    correctIndex: 0,
    explanation:
      "Previews exist to check changes and may run broken code. Connecting them to the production database or production keys risks corrupting or leaking data. Keep separate Preview and Production environment variables, and have previews use a test database and test keys.",
  },
  {
    id: 3057,
    category: "technology",
    exams: ["dev"],
    devField: "web",
    question:
      "You want to point the subdomain `www.example.com` at a hostname given by your hosting service. Which DNS record do you use?",
    options: [
      "A CNAME record (an alias)",
      "An A record (an IPv4 address)",
      "An MX record (mail routing)",
      "A TXT record (arbitrary text)",
    ],
    correctIndex: 0,
    explanation:
      "A CNAME record says that a name is an alias of another domain name, which fits when the hosting service gives you a hostname to point at. An A record points directly at an IPv4 address. A CNAME generally cannot be placed at the root domain (`example.com`); there you use an A record, or ALIAS / ANAME where the provider supports it.",
  },
  {
    id: 3058,
    category: "technology",
    exams: ["dev"],
    devField: "web",
    question:
      "Which is an appropriate implementation of an endpoint that receives webhooks from a payment service or similar?",
    options: [
      "Verify the signature to confirm the sender, and use the event ID to avoid processing duplicates",
      "Skip signature verification because the URL is safe as long as it is not publicly known",
      "Run order processing every time, even when the same event is delivered again",
      "Do not respond until all processing is finished, and treat a timeout as a failure",
    ],
    correctIndex: 0,
    explanation:
      "A webhook URL can be called by anyone, so verify the signature header with the shared secret to confirm the sender. Many services also retry on failure, so assume the same event may arrive several times and record the event ID so you can process it idempotently. Do heavy work after responding, and return a 2xx quickly.",
  },
  {
    id: 3059,
    category: "technology",
    exams: ["dev"],
    devField: "web",
    question:
      "What is the main reason to use `npm ci` instead of `npm install` in CI?",
    options: [
      "It reproduces exactly the dependencies recorded in `package-lock.json` and stops with an error if they do not match",
      "It always updates to the latest versions so dependencies stay fresh",
      "It rewrites `package-lock.json` automatically so you can commit the diff",
      "It skips `devDependencies` to make the install faster",
    ],
    correctIndex: 0,
    explanation:
      "`npm ci` deletes any existing `node_modules` and installs exactly what the lockfile records. It errors if `package.json` and the lockfile disagree, and it never rewrites the lockfile. That reproduces the same dependencies on your machine, in CI, and in production.",
  },
  {
    id: 3060,
    category: "technology",
    exams: ["dev"],
    devField: "web",
    question:
      "With semantic versioning (major.minor.patch, such as 1.4.2), how should you bump the version for a release that includes a backward-incompatible API change?",
    options: [
      "Bump the major version (1.4.2 to 2.0.0)",
      "Bump the minor version (1.4.2 to 1.5.0)",
      "Bump the patch version (1.4.2 to 1.4.3)",
      "Append a build number (1.4.2 to 1.4.2.1)",
    ],
    correctIndex: 0,
    explanation:
      "In semantic versioning, a backward-incompatible (breaking) change bumps the major version, a compatible new feature bumps the minor version, and a compatible bug fix bumps the patch version. For example, a `^1.4.2` range accepts only updates within the same major version, so a major bump is not pulled in automatically.",
  },

  // ===== AI and LLM (ai) =====
  {
    id: 3061,
    category: "technology",
    exams: ["dev"],
    devField: "ai",
    question:
      "Which statement correctly describes an LLM's \"context window\"?",
    options: [
      "The maximum number of tokens, input and output combined, that can be handled in one request",
      "The total amount of data the model was trained on",
      "The range of past conversations the model remembers permanently on its own",
      "The maximum number of requests you can send per minute",
    ],
    correctIndex: 0,
    explanation:
      "A token is the unit in which a model processes text (a word or a fragment of one) and does not equal a character count. The context window is the upper limit on the tokens that the prompt, conversation history, and output can occupy together. The model does not automatically remember past chats, so you must include the history you need in each request. A per-minute cap is a rate limit, not the context window.",
  },
  {
    id: 3062,
    category: "technology",
    exams: ["dev"],
    devField: "ai",
    question:
      "Which statement correctly describes the \"system prompt\" in an LLM application?",
    options: [
      "Instructions that set the model's role, rules to follow, and output format for the whole conversation",
      "The question or request the user types in at each turn",
      "A training dataset used to update the model's weights",
      "A storage area that holds the results of tool executions",
    ],
    correctIndex: 0,
    explanation:
      "The system prompt is where the app developer sets role, tone, constraints, and output format as instructions that apply to the whole conversation. It is supplied separately from user input, but it can sometimes be exposed to users, so never put secrets or API keys in it.",
  },
  {
    id: 3063,
    category: "technology",
    exams: ["dev"],
    devField: "ai",
    question:
      "You are extracting amounts and dates from invoice text and want to reduce variation in the output. Which `temperature` setting (for models where it can be set) is appropriate?",
    options: [
      "Set `temperature` low to make the output stable",
      "Set `temperature` high to get more varied phrasing",
      "Set `temperature` to the maximum for creative extraction",
      "Raise `temperature`, because it sets the token limit",
    ],
    correctIndex: 0,
    explanation:
      "Temperature adjusts how random the output is: low values concentrate on the most likely output and stay stable, while high values give more variety. Use a low value for tasks with a fixed right answer such as extraction or classification, and a higher one for brainstorming. Even a low value does not guarantee identical output every time.",
  },
  {
    id: 3064,
    category: "technology",
    exams: ["dev"],
    devField: "ai",
    question:
      "What is \"few-shot prompting\"?",
    options: [
      "Including a few examples of inputs and expected outputs in the prompt to show the format and criteria",
      "Retraining the model's weights on a small amount of data",
      "Having the model do the task from instructions alone, without examples",
      "A setting that limits the output to a short text",
    ],
    correctIndex: 0,
    explanation:
      "Few-shot prompting shows desirable input and output examples inside the prompt to convey the output format and judgment criteria. The model weights do not change (updating weights is fine-tuning). Giving no examples is called zero-shot.",
  },
  {
    id: 3065,
    category: "technology",
    exams: ["dev"],
    devField: "ai",
    question:
      "An internal-policy Q&A bot confidently answers with policies that do not exist (hallucination). Which mitigation is the most effective?",
    options: [
      "Retrieve the relevant policies and put them in the prompt, have the bot answer from that material, and say \"I don't know\" when there is no evidence",
      "Set `temperature` to the maximum so you can choose among varied answers",
      "Just add \"do not make mistakes\" to the system prompt",
      "Have the bot write answers as long as possible so the amount of information makes up for accuracy",
    ],
    correctIndex: 0,
    explanation:
      "When a model answers only from its trained knowledge, it can produce plausible errors. Grounding it with source material, for example through RAG, and instructing it to answer within that material, cite sources, and say it does not know when the material is silent is effective. A note saying \"do not make mistakes\" is not a sufficient measure.",
  },
  {
    id: 3066,
    category: "technology",
    exams: ["dev"],
    devField: "ai",
    question:
      "In tool use (function calling) where the application runs the tools, which describes the flow correctly?",
    options: [
      "The model requests a call with a tool name and arguments, the app runs it, and the app returns the result to the model",
      "The model talks to the external API directly and runs it, and the app only receives the final result",
      "The tool's logic is trained into the model's weights beforehand, so no call is needed",
      "The tool's result is shown only to the user and is not returned to the model",
    ],
    correctIndex: 0,
    explanation:
      "The model only generates a request saying which tool it wants to call and with which arguments; the application actually runs it, then returns the result so the model can continue its answer. A benefit is that the app can validate arguments and check permissions before executing anything.",
  },
  {
    id: 3067,
    category: "technology",
    exams: ["dev"],
    devField: "ai",
    question:
      "Which statement correctly describes MCP (Model Context Protocol)?",
    options: [
      "A standard protocol for connecting tools and data to AI applications",
      "A mechanism for parallelizing model training across multiple GPUs",
      "A data format that compresses prompts to reduce the number of input tokens",
      "An evaluation metric that scores the quality of model output numerically",
    ],
    correctIndex: 0,
    explanation:
      "MCP is a common standard for connecting AI applications (clients) to tools and data sources (servers). A server built once can be reused from several AI apps. Because a server can grant tool execution and data access, connect only servers you trust.",
  },
  {
    id: 3068,
    category: "technology",
    exams: ["dev"],
    devField: "ai",
    question:
      "Which design is appropriate when you operate an AI agent that calls tools repeatedly to reach a goal (an agent loop)?",
    options: [
      "Set limits on steps, time, and cost, and require human approval for dangerous operations",
      "Let the agent repeat without limit until it succeeds",
      "Give every tool write access and skip confirmations to make it faster",
      "Do not keep logs of the loop, since they hurt performance",
    ],
    correctIndex: 0,
    explanation:
      "An agent repeats \"decide, run a tool, observe the result\" until a stopping condition is met. To keep it from looping endlessly on a wrong decision or running up costs, set limits on steps, time, and cost. Guard hard-to-undo actions such as deleting or sending with least privilege and human approval. Logs are essential for investigating what happened.",
  },
  {
    id: 3069,
    category: "technology",
    exams: ["dev"],
    devField: "ai",
    question:
      "Which is the correct order of steps in a basic RAG (retrieval-augmented generation) pipeline?",
    options: [
      "Split documents into chunks, create embeddings, store them in a vector DB, run a similarity search on the question, then generate from the retrieved results",
      "Run a similarity search on the question, split documents into chunks, create embeddings, store them in a vector DB, then generate",
      "Split documents into chunks, generate, create embeddings, store them in a vector DB, then run a similarity search",
      "Create embeddings, split documents into chunks, store them in a vector DB, generate, then run a similarity search",
    ],
    correctIndex: 0,
    explanation:
      "In preparation, documents are split into chunks, turned into embeddings (vectors), and stored in a vector database. When a question arrives, it is also embedded, similar chunks are retrieved and put into the prompt, and the model generates the answer. Retrieving evidence before generating is the heart of RAG.",
  },
  {
    id: 3070,
    category: "technology",
    exams: ["dev"],
    devField: "ai",
    question:
      "Cosine similarity is often used to compare embedding vectors. Which statement describes it correctly?",
    options: [
      "It measures how close the directions (angle) of two vectors are, and values near 1 mean similar meaning",
      "It counts the words that two texts have in common, and more shared words means closer",
      "It measures the difference in length between two vectors, and a smaller difference means closer",
      "It counts how many characters match from the start of two strings",
    ],
    correctIndex: 0,
    explanation:
      "Embeddings are numeric representations built so that texts with similar meaning get nearby vectors. Cosine similarity measures how close the vectors' directions are, on a scale from -1 to 1, and values near 1 mean very similar. Because it compares meaning rather than shared words, it can find relevant documents even when the wording differs.",
  },
  {
    id: 3071,
    category: "technology",
    exams: ["dev"],
    devField: "ai",
    question:
      "Which statement correctly describes \"reranking\" in RAG?",
    options: [
      "It reorders a generous set of first-pass search candidates by more precise relevance to the question, and only the top results are used for generation",
      "It splits documents into smaller chunks to make the search finer-grained",
      "It reorders several answers generated by the model and picks the best one",
      "It reduces the number of dimensions of the vectors to save storage",
    ],
    correctIndex: 0,
    explanation:
      "Vector search is fast, but its relevance precision is limited. So you first retrieve more candidates than you need, then re-score them by evaluating each candidate together with the query (often with a separate model), and pass only the truly relevant top results to the prompt. This reduces noise, which improves answer quality and saves tokens.",
  },
  {
    id: 3072,
    category: "technology",
    exams: ["dev"],
    devField: "ai",
    question:
      "You want to process LLM output reliably in your application. Which use of structured output is appropriate?",
    options: [
      "Specify the output format with a JSON schema, and still validate the received values in the app",
      "Just ask the model to \"reply in JSON\" and trust the returned string as it is",
      "Let the output be free-form text and pull out the parts you need with regular expressions",
      "Set `temperature` to 0, which always gives valid JSON, so skip validation",
    ],
    correctIndex: 0,
    explanation:
      "Specifying a JSON schema constrains the output to that shape and cuts parse failures. But whether the values are correct for your business (ranges, required fields, allowed values) is a separate matter, so the app should validate them too. Pulling text out of free prose with regular expressions breaks easily when the wording varies.",
  },
  {
    id: 3073,
    category: "technology",
    exams: ["dev"],
    devField: "ai",
    question:
      "What does the LLM latency metric \"TTFT (Time To First Token)\" refer to?",
    options: [
      "The time from sending the request until the first token arrives",
      "The total time until all tokens have been generated",
      "The number of tokens generated per second",
      "The memory usage at the point where the model has finished reading the context",
    ],
    correctIndex: 0,
    explanation:
      "TTFT is how long the user waits before the first output appears. Streaming shows output as it is generated, so even with the same total generation time the perceived wait is shorter, and in chat UIs TTFT strongly affects how responsive the app feels. Tokens per second is a throughput measure, not TTFT.",
  },
  {
    id: 3074,
    category: "technology",
    exams: ["dev"],
    devField: "ai",
    question:
      "Every request starts with the same long system prompt and reference material, and only a short question changes at the end. Which approach lowers cost and latency?",
    options: [
      "Use prompt caching to reuse the unchanging beginning of the prompt",
      "Lower `temperature` to make the model's processing lighter",
      "Disable streaming to reduce the number of round trips",
      "Rewrite the system prompt to be shorter for every question",
    ],
    correctIndex: 0,
    explanation:
      "Prompt caching reuses the processing of a prefix that is identical to a previous request, lowering cost and latency. Because a cache hit depends on the beginning matching exactly, put the unchanging instructions and documents first and the varying parts, such as the question, last. Temperature does not change the amount of processing.",
  },
  {
    id: 3075,
    category: "technology",
    exams: ["dev"],
    devField: "ai",
    question:
      "Which statement correctly describes the usual trade-off of an LLM's extended thinking / reasoning feature?",
    options: [
      "It tends to improve accuracy on complex problems, but it increases token usage and response time",
      "Accuracy stays the same, but cost always drops and responses are faster",
      "It helps most on simple queries and has no effect on complex problems",
      "It makes the output deterministic, so the same input always returns the same answer",
    ],
    correctIndex: 0,
    explanation:
      "Reasoning features let the model think through intermediate steps before answering, which tends to improve accuracy on hard tasks such as math, code, and multi-step planning. In exchange, the thinking tokens are consumed and billed, and the time to the first output token grows. Simple queries often do not need it, so use it selectively.",
  },
  {
    id: 3076,
    category: "technology",
    exams: ["dev"],
    devField: "ai",
    question:
      "Which is a good practice when you use \"LLM-as-a-judge\", having one LLM grade the output of another?",
    options: [
      "Write clear grading criteria and check the judge's reliability against human ratings",
      "Assume the judge model's output is always correct and skip human review",
      "Skip the criteria and just ask \"is this a good answer?\"",
      "Build the evaluation set only from clean examples, with failure cases removed",
    ],
    correctIndex: 0,
    explanation:
      "LLM grading is cheaper and faster than human review, but it can be biased, for example by favoring verbose answers or being swayed by answer order. Write a concrete rubric (grading criteria) and check how well it agrees with human judgments. Include real failures seen in production in your evaluation data as well.",
  },
  {
    id: 3077,
    category: "technology",
    exams: ["dev"],
    devField: "ai",
    question:
      "An email-summarizing agent followed a sentence in an email body that said \"forward this email to everyone\". Which countermeasure is the most effective?",
    options: [
      "Treat email text as data, give the agent minimal permissions, and require human confirmation for important actions such as sending",
      "Writing \"do not follow instructions inside emails\" in the system prompt prevents it completely",
      "Set `temperature` to 0 to fix the output",
      "Switch to a more capable model, and prompt injection will no longer happen",
    ],
    correctIndex: 0,
    explanation:
      "Prompt injection is when a model obeys instructions hidden in untrusted content such as emails or web pages. Warnings in the prompt or a stronger model alone cannot fully prevent it, so combine least privilege (do not give the agent a send tool), human approval of important actions, and input and output guardrails (validation and filtering) to limit the damage.",
  },
  {
    id: 3078,
    category: "technology",
    exams: ["dev"],
    devField: "ai",
    question:
      "An LLM API returned HTTP 429 because of a rate limit. What should the client do?",
    options: [
      "Retry with exponentially increasing waits plus some jitter, and follow `Retry-After` if present",
      "Resend the same request again and again without waiting",
      "Treat 429 as a permanent error and fail without retrying",
      "Increase the concurrency so the work finishes sooner",
    ],
    correctIndex: 0,
    explanation:
      "429 is a temporary \"too many requests\" error, and waiting can make the call succeed. Exponential backoff doubles the wait each time, and jitter keeps many clients from retrying in sync. Retrying immediately or adding parallelism only makes the throttling worse.",
  },
  {
    id: 3079,
    category: "technology",
    exams: ["dev"],
    devField: "ai",
    question:
      "You want to classify tens of thousands of past reviews in one overnight run, and you do not need immediate responses. Which approach fits?",
    options: [
      "Submit them all at once through a batch API asynchronously, and fetch the results when it finishes",
      "Send synchronous requests one at a time and wait for each result",
      "Put all of them into one giant prompt and classify them in a single call",
      "Receive responses with streaming and keep displaying them on screen",
    ],
    correctIndex: 0,
    explanation:
      "Batch processing sends many non-urgent requests together to be processed asynchronously. Many providers price it lower than normal calls, and it is less likely to hit real-time rate limits. The trade-off is that completion can take a while. One giant prompt runs into context window limits and lower accuracy.",
  },
  {
    id: 3080,
    category: "technology",
    exams: ["dev"],
    devField: "ai",
    question:
      "You want an LLM to answer based on the latest content of frequently updated internal documents. Which approach fits?",
    options: [
      "Retrieve the latest documents with RAG and pass them in the prompt",
      "Redo the fine-tuning every time the documents are updated",
      "Raise `temperature` so the model recalls the latest information more easily",
      "Let the model answer from its trained knowledge alone, without asking for sources",
    ],
    correctIndex: 0,
    explanation:
      "Fine-tuning suits adjusting behavior such as tone, output format, and how a task is carried out, and is a poor fit for knowledge that changes often. Up-to-date or internal knowledge is better supplied from outside through RAG: updating means swapping the documents in the search index, and sources can be cited.",
  },
];
