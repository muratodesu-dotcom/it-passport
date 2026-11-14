import type { Question } from "@/lib/types";

export const devQuestionsGitDb: Question[] = [
  // ===== Git and GitHub (3001-3020) =====
  {
    id: 3001,
    category: "technology",
    exams: ["dev"],
    devField: "git",
    question:
      "Which of the following is recorded in the history when you run `git commit`?",
    options: [
      "A snapshot of the contents of the staging area",
      "All changes, including unstaged changes in the working tree",
      "A patch containing only the diff from the previous commit",
      "A list of the changes that will be sent to the remote repository",
    ],
    correctIndex: 0,
    explanation:
      "A commit records a snapshot of what is in the staging area, that is, what you added with `git add`. Changes that are not staged are not included.",
  },
  {
    id: 3002,
    category: "technology",
    exams: ["dev"],
    devField: "git",
    question:
      "What does `git worktree add ../hotfix hotfix-branch` let you do?",
    options: [
      "Check out another branch of the same repository in a separate directory at the same time",
      "Clone the whole repository into a new repository that is independent of the remote",
      "Automatically commit your current working tree changes to another branch",
      "Mirror a remote branch locally as a read-only copy",
    ],
    correctIndex: 0,
    explanation:
      "A worktree lets you check out several branches of one repository (sharing the same `.git` directory) in separate directories at the same time. You can start an urgent fix without stashing your work or cloning again.",
  },
  {
    id: 3003,
    category: "technology",
    exams: ["dev"],
    devField: "git",
    question:
      "You branched `feature` off `main`, and no new commits have been added to `main` since. What happens when you run `git merge feature` on `main`?",
    options: [
      "The `main` pointer moves forward to the tip of `feature`, and no merge commit is created",
      "A new merge commit is always created, leaving the branch in the history",
      "A three-way merge against the common ancestor runs and produces a conflict",
      "The `feature` branch is deleted automatically and its history is squashed into one commit",
    ],
    correctIndex: 0,
    explanation:
      "If `main` is an ancestor of `feature`, Git simply moves the pointer forward (a fast-forward merge). If both branches have new commits since they diverged, Git does a three-way merge and creates a merge commit. With `--no-ff`, a merge commit is created even when a fast-forward is possible.",
  },
  {
    id: 3004,
    category: "technology",
    exams: ["dev"],
    devField: "git",
    question:
      "A bug appeared sometime after last week, when everything still worked. Which command efficiently finds the commit that introduced it among hundreds of commits?",
    options: [
      "`git bisect`",
      "`git blame -L`",
      "`git log --oneline`",
      "`git diff HEAD~100`",
    ],
    correctIndex: 0,
    explanation:
      "`git bisect` takes a known-good commit and a known-bad commit, then binary-searches the history to find the commit that introduced the bug in only a few steps. `blame` shows who last changed each line but cannot narrow down the culprit automatically.",
  },
  {
    id: 3005,
    category: "technology",
    exams: ["dev"],
    devField: "git",
    question:
      "After you opened a PR, `main` moved ahead. Which command, run on your feature branch, brings in the latest `main` while keeping the history linear?",
    options: [
      "`git rebase main`",
      "`git merge main`",
      "`git reset --hard main`",
      "`git revert main`",
    ],
    correctIndex: 0,
    explanation:
      "Rebase replays your commits on top of the latest `main`, which gives a linear history. `git merge main` adds a merge commit, and `git reset --hard main` throws away your own commits.",
  },
  {
    id: 3006,
    category: "technology",
    exams: ["dev"],
    devField: "git",
    question:
      "Which statement describes the golden rule of rebasing?",
    options: [
      "Do not rewrite history that you have already pushed and shared with others",
      "Always run the rebase while you are on the `main` branch",
      "Always stash all of your changes with `git stash` before rebasing",
      "Only rebase when you are sure that no conflicts will occur",
    ],
    correctIndex: 0,
    explanation:
      "Rebase recreates commits (their hashes change), so rewriting shared history leaves other people's copies diverged and causes confusion. It is safe on branches that only you use.",
  },
  {
    id: 3007,
    category: "technology",
    exams: ["dev"],
    devField: "git",
    question:
      "You run `git rebase -i HEAD~3` and mark the second and third commits as `squash`. What happens?",
    options: [
      "The last three commits are combined into one commit",
      "Only the commit three steps back is undone",
      "The last three commits are pushed to the remote",
      "The last three commits are copied to another branch",
    ],
    correctIndex: 0,
    explanation:
      "Interactive rebase lets you reorder, combine (squash or fixup), reword, or drop commits. It is typically used to tidy up \"WIP\" commits before opening a PR.",
  },
  {
    id: 3008,
    category: "technology",
    exams: ["dev"],
    devField: "git",
    question:
      "What happens when you choose \"Squash and merge\" on a GitHub pull request?",
    options: [
      "All commits in the PR are combined into a single commit on the base branch",
      "The PR's commits are kept as they are, and a merge commit is added",
      "The PR's commits are kept individually and replayed on top of the base branch",
      "Only the commits inside the PR branch are cleaned up, and the base branch is unchanged",
    ],
    correctIndex: 0,
    explanation:
      "Squash and merge combines all of the PR's changes into one commit on the base branch, which keeps the history of `main` readable. The second option describes \"Create a merge commit\", and the third describes \"Rebase and merge\".",
  },
  {
    id: 3009,
    category: "technology",
    exams: ["dev"],
    devField: "git",
    question:
      "You want to bring just one specific commit from another branch into your current branch. Which command do you use?",
    options: [
      "`git cherry-pick <commit-hash>`",
      "`git revert <commit-hash>`",
      "`git reset --soft <commit-hash>`",
      "`git checkout <commit-hash>`",
    ],
    correctIndex: 0,
    explanation:
      "Cherry-pick applies the changes of the given commit to the current branch as a new commit. `revert` creates a commit that undoes a change, which is the opposite direction.",
  },
  {
    id: 3010,
    category: "technology",
    exams: ["dev"],
    devField: "git",
    question:
      "A merge produced conflicts. Which is the correct way to resolve them?",
    options: [
      "Edit the conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`), run `git add`, then commit",
      "Run `git commit` with the markers still in place and let Git resolve them automatically",
      "Run `git fetch` again, which resolves the conflicts automatically",
      "Run `git push --force` to overwrite the other person's changes",
    ],
    correctIndex: 0,
    explanation:
      "Edit the conflicting sections by hand, `git add` the resolved files, and commit (or run `git rebase --continue` during a rebase). If you commit with the markers still in the files, they end up in your code.",
  },
  {
    id: 3011,
    category: "technology",
    exams: ["dev"],
    devField: "git",
    question:
      "You are in the middle of some work and need to switch to another branch right away. Which command shelves your uncommitted changes without committing them?",
    options: [
      "`git stash`",
      "`git reset --hard`",
      "`git commit --amend`",
      "`git clean -fd`",
    ],
    correctIndex: 0,
    explanation:
      "`git stash` shelves uncommitted changes and leaves the working tree clean; you can bring them back later with `git stash pop`. `reset --hard` and `clean -fd` discard changes instead.",
  },
  {
    id: 3012,
    category: "technology",
    exams: ["dev"],
    devField: "git",
    question:
      "Which statement correctly describes `git reset --hard HEAD~1`?",
    options: [
      "It moves HEAD back one commit and discards the staged and working tree changes",
      "It moves HEAD back one commit and keeps the changes staged",
      "It moves HEAD back one commit and keeps the changes in the working tree, but unstaged",
      "It adds a new commit that undoes the previous commit",
    ],
    correctIndex: 0,
    explanation:
      "`--hard` rewinds the commit, the index, and the working tree, so uncommitted changes are lost. The second option describes `--soft`, the third describes `--mixed` (the default), and the fourth describes `git revert`.",
  },
  {
    id: 3013,
    category: "technology",
    exams: ["dev"],
    devField: "git",
    question:
      "A bad commit on `main` has already been pushed and other people have pulled it. What is the safe way to undo it?",
    options: [
      "Use `git revert` to add a new commit that undoes it",
      "Use `git reset --hard` to go back, then `git push --force`",
      "Fix it with `git commit --amend`, then `git push --force`",
      "Delete the commit with `git rebase -i`, then `git push --force`",
    ],
    correctIndex: 0,
    explanation:
      "Revert adds a commit that undoes the bad one without rewriting history, so it is safe for shared branches. The other options rewrite history and need a force push, which should be avoided on shared branches.",
  },
  {
    id: 3014,
    category: "technology",
    exams: ["dev"],
    devField: "git",
    question:
      "You check out a commit hash (detached HEAD), make a new commit, and then switch to another branch. What happens to that commit?",
    options: [
      "No branch points to it, so it is easy to lose unless you look it up in the reflog",
      "It is merged into `main` automatically",
      "A new branch is created automatically to keep it",
      "It is permanently deleted the moment you switch",
    ],
    correctIndex: 0,
    explanation:
      "Commits made on a detached HEAD belong to no branch, so they become unreachable once you switch away. They are not deleted immediately and can still be recovered from the reflog. To keep them, first create a branch with `git switch -c <name>`.",
  },
  {
    id: 3015,
    category: "technology",
    exams: ["dev"],
    devField: "git",
    question:
      "Which statement correctly describes the difference between `git fetch` and `git pull`?",
    options: [
      "`fetch` only downloads and leaves your working branch alone; `pull` downloads and then merges (or rebases)",
      "`fetch` downloads and merges; `pull` only downloads",
      "`fetch` gets only tags; `pull` gets only branches",
      "`fetch` sends your changes; `pull` receives changes",
    ],
    correctIndex: 0,
    explanation:
      "`git pull` is `git fetch` followed by integrating the result into the current branch. With `fetch`, you can inspect the remote state first and then decide how to integrate.",
  },
  {
    id: 3016,
    category: "technology",
    exams: ["dev"],
    devField: "git",
    question:
      "After a rebase, `--force-with-lease` is recommended over `--force` when pushing. Why?",
    options: [
      "It refuses to overwrite the remote if someone else pushed after your last fetch",
      "It makes the push much faster",
      "It lets you bypass the rules of a protected branch",
      "It lets you push without rewriting history",
    ],
    correctIndex: 0,
    explanation:
      "`--force-with-lease` overwrites the remote only if it is still in the state you last fetched. This prevents you from silently wiping out someone else's new commits. It does not bypass branch protection rules.",
  },
  {
    id: 3017,
    category: "technology",
    exams: ["dev"],
    devField: "git",
    question:
      "Which is a good practice for pull requests?",
    options: [
      "Keep each PR focused on one purpose and small enough to review easily",
      "Bundle every possibly related change into one big PR and have it reviewed at once",
      "Approve and merge your own PR immediately to avoid waiting for review",
      "Close the PR and open a new one whenever you receive review comments",
    ],
    correctIndex: 0,
    explanation:
      "Small PRs with a single clear purpose are reviewed faster, and they reduce missed issues and rework. Fixes for review comments go in as additional commits on the same branch and show up in the same PR.",
  },
  {
    id: 3018,
    category: "technology",
    exams: ["dev"],
    devField: "git",
    question:
      "What happens when you enable \"Require status checks to pass before merging\" in a GitHub branch protection rule?",
    options: [
      "The PR cannot be merged until the specified CI checks (tests, build) pass",
      "You can no longer run `git commit` locally",
      "Anyone except admins can merge even when CI fails",
      "All checks are skipped automatically on every push",
    ],
    correctIndex: 0,
    explanation:
      "With required status checks, changes that fail the tests or the build cannot be merged into the protected branch. Together with required reviews, this keeps broken code out of production.",
  },
  {
    id: 3019,
    category: "technology",
    exams: ["dev"],
    devField: "git",
    question:
      "You ran `git reset --hard` and lost commits that you had not pushed. What is the right first step to recover them?",
    options: [
      "Use `git reflog` to find the previous HEAD position, then move back to it (or create a branch there)",
      "Look through `git log`, since the commits should still be listed there",
      "Run `git stash pop` to restore the lost commits",
      "Clone the repository again from the remote to get the lost commits back",
    ],
    correctIndex: 0,
    explanation:
      "The reflog records where HEAD has been, so for a while you can still find the hash of the lost commit and return to it. Unpushed commits do not come back by cloning again, and they do not show up in `git log`.",
  },
  {
    id: 3020,
    category: "technology",
    exams: ["dev"],
    devField: "git",
    question:
      "You accidentally committed a `.env` file containing an API key and pushed it to a public repository. What should you do first?",
    options: [
      "Revoke the key and issue a new one (rotate it)",
      "Delete `.env` in the next commit and push",
      "Add `.env` to `.gitignore`, which removes it from the history too",
      "Rewrite the history and force-push, which makes the leak a non-event",
    ],
    correctIndex: 0,
    explanation:
      "A secret that has been made public must be assumed to be copied already, so revoke and rotate it first. `.gitignore` only affects untracked files, and cleaning the history is only an additional measure.",
  },

  // ===== Supabase and databases (3021-3040) =====
  {
    id: 3021,
    category: "technology",
    exams: ["dev"],
    devField: "database",
    question:
      "Which statement correctly describes a primary key in a relational database?",
    options: [
      "A column that uniquely identifies each row and does not allow NULL or duplicates",
      "A column that references rows in another table and prevents inserting values that do not exist there",
      "A helper column that speeds up searches and allows duplicates",
      "A column that automatically records when the row was last updated",
    ],
    correctIndex: 0,
    explanation:
      "A primary key is a column (or set of columns) that uniquely identifies each row. The second option describes a foreign key, which rejects values that do not exist in the referenced table.",
  },
  {
    id: 3022,
    category: "technology",
    exams: ["dev"],
    devField: "database",
    question:
      "In which case is an index most likely to help?",
    options: [
      "Searches on a large table that filter by a column often used in `WHERE` or `JOIN` conditions",
      "A query that fetches every row of a table that has only a few dozen rows",
      "A column that is updated very often but almost never used in search conditions",
      "Adding one to every column of a table just in case",
    ],
    correctIndex: 0,
    explanation:
      "Indexes speed up finding a few rows among many. They add write cost and use storage, so putting them on columns that are not used for lookups is counterproductive.",
  },
  {
    id: 3023,
    category: "technology",
    exams: ["dev"],
    devField: "database",
    question:
      "While a new version is deploying to Vercel, the old version of the code keeps running for a while. What is the safe way to rename a column?",
    options: [
      "Add the new column so old and new code can coexist, then drop the old column after the switch",
      "Run `ALTER TABLE ... RENAME COLUMN` before the deploy and rename it right away",
      "`DROP` the old column after the deploy and deal with any errors as they appear",
      "Run the migration on production first and ignore errors from the old version",
    ],
    correctIndex: 0,
    explanation:
      "If you rename a column while the old code is still running, the old version's queries will fail. Make additive changes first, and remove the old column only after every instance runs the new code.",
  },
  {
    id: 3024,
    category: "technology",
    exams: ["dev"],
    devField: "database",
    question:
      "You want two `UPDATE` statements, one debiting account A and one crediting account B, to either both succeed or both fail. What should you do?",
    options: [
      "Wrap both `UPDATE` statements in a `BEGIN` ... `COMMIT` transaction",
      "Send each `UPDATE` as a separate request and undo it manually on failure",
      "Add an index to both tables",
      "Run `VACUUM` before the updates",
    ],
    correctIndex: 0,
    explanation:
      "A transaction makes several operations atomic: if one fails, everything is rolled back with `ROLLBACK`. To run several statements in one transaction from supabase-js, put them in a Postgres function and call it with `rpc`.",
  },
  {
    id: 3025,
    category: "technology",
    exams: ["dev"],
    devField: "database",
    question:
      "You want to list every user, including users who have no orders at all. Which is the right query?",
    options: [
      "`users LEFT JOIN orders ON ...`",
      "`users INNER JOIN orders ON ...`",
      "`users CROSS JOIN orders`",
      "`orders LEFT JOIN users ON ...`",
    ],
    correctIndex: 0,
    explanation:
      "`LEFT JOIN` keeps every row of the left table (`users`), and users without orders get NULLs on the `orders` side. `INNER JOIN` returns only users who have orders, and `orders LEFT JOIN users` keeps all orders instead, which is a different goal.",
  },
  {
    id: 3026,
    category: "technology",
    exams: ["dev"],
    devField: "database",
    question:
      "You fetch 100 posts, then loop over them and query the comments for each post one at a time. What is this problem, and how do you fix it?",
    options: [
      "The N+1 problem; fetch it in one query with a JOIN or by embedding the related data",
      "A deadlock; raise the transaction isolation level",
      "Too many indexes; drop the unused indexes",
      "A connection leak; close the connection after each query",
    ],
    correctIndex: 0,
    explanation:
      "One list query plus N follow-up queries is the N+1 problem. It multiplies round trips and slows things down. In supabase-js you can embed related tables, for example `select(\"*, comments(*)\")`, to fetch everything in one query.",
  },
  {
    id: 3027,
    category: "technology",
    exams: ["dev"],
    devField: "database",
    question:
      "Which statement correctly describes Row Level Security (RLS) in Postgres?",
    options: [
      "It controls access row by row, so only rows that satisfy a policy can be read or written",
      "It encrypts all of a table's data on disk",
      "It allows connections only from specific IP addresses",
      "It limits the maximum number of rows a single query can return",
    ],
    correctIndex: 0,
    explanation:
      "RLS applies the policies you define on a table (for example, \"only my own rows\") to every query. In Supabase it is the main line of defense when the browser talks to the database directly.",
  },
  {
    id: 3028,
    category: "technology",
    exams: ["dev"],
    devField: "database",
    question:
      "You created a table in the `public` schema with SQL and did not enable RLS. How does Supabase treat this table?",
    options: [
      "Anyone who knows the public (anon) key can read and write it through the Data API",
      "Nobody can access it, not even with the `service_role` key",
      "Only logged-in users can read and write it",
      "It can be accessed only from Edge Functions on the server",
    ],
    correctIndex: 0,
    explanation:
      "Tables in an exposed schema are reachable through the Data API, so without RLS the anon key alone is enough to read and write them. Conversely, if you enable RLS and create no policies, all access is denied.",
  },
  {
    id: 3029,
    category: "technology",
    exams: ["dev"],
    devField: "database",
    question:
      "Which of these Supabase keys can safely be included in browser (client) code?",
    options: [
      "The `anon` (publishable) key",
      "The `service_role` (secret) key",
      "A connection string that contains the `postgres` user's password",
      "The JWT signing secret",
    ],
    correctIndex: 0,
    explanation:
      "The `anon` (publishable) key is subject to RLS, so it is designed to be public. The `service_role` (secret) key bypasses RLS, and connection strings and the JWT secret are just as powerful, so they must stay on the server.",
  },
  {
    id: 3030,
    category: "technology",
    exams: ["dev"],
    devField: "database",
    question:
      "In Next.js, you named an environment variable `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`. What is wrong with that?",
    options: [
      "Values with the `NEXT_PUBLIC_` prefix are embedded in the browser bundle, exposing a key that bypasses RLS",
      "The build fails and the app cannot start",
      "Server-side code can no longer read the key",
      "The key is automatically replaced with the `anon` key",
    ],
    correctIndex: 0,
    explanation:
      "In Next.js, variables that start with `NEXT_PUBLIC_` are exposed to the client. If the `service_role` key leaks, anyone can ignore RLS and manipulate all of your data, so keep it server-only and without that prefix.",
  },
  {
    id: 3031,
    category: "technology",
    exams: ["dev"],
    devField: "database",
    question:
      "What does the RLS policy `using (auth.uid() = user_id)` mean?",
    options: [
      "Only rows whose `user_id` matches the ID of the logged-in user from the request's JWT are covered",
      "Only rows whose `user_id` matches the name of the Postgres role connected to the database are covered",
      "Only rows whose `user_id` matches the `id` of the first row in the table are covered",
      "Only rows whose `user_id` matches the `id` of the most recently inserted row are covered",
    ],
    correctIndex: 0,
    explanation:
      "The JWT issued at login contains the user ID, and `auth.uid()` extracts it. Comparing it with a column expresses \"only my own rows\".",
  },
  {
    id: 3032,
    category: "technology",
    exams: ["dev"],
    devField: "database",
    question:
      "You need to store images of users' identity documents in Supabase Storage. Which setup is appropriate?",
    options: [
      "Use a private bucket, allow only the owner through policies, and show files with signed URLs",
      "Use a public bucket and rely on random file names",
      "Use a public bucket and set a policy only for uploads",
      "Use a public bucket and hide the files from anonymous users in the UI",
    ],
    correctIndex: 0,
    explanation:
      "Files in a public bucket can be fetched without authentication by anyone who knows the URL. Sensitive files belong in a private bucket, with Storage policies and time-limited signed URLs controlling access.",
  },
  {
    id: 3033,
    category: "technology",
    exams: ["dev"],
    devField: "database",
    question:
      "You want to receive webhooks from an external service, or call an external API with a secret API key without exposing the key to the client. Which Supabase feature do you use?",
    options: [
      "Edge Functions",
      "Realtime",
      "A Storage bucket",
      "An RLS policy",
    ],
    correctIndex: 0,
    explanation:
      "Edge Functions run server-side TypeScript on Deno and can keep secrets in environment variables. Realtime is for change notifications and RLS is row-level access control, so they serve different purposes.",
  },
  {
    id: 3034,
    category: "technology",
    exams: ["dev"],
    devField: "database",
    question:
      "You want a chat screen to show new messages in real time without a page reload. Which Supabase feature do you use?",
    options: [
      "Realtime, subscribing to table changes such as INSERT",
      "`pg_cron`, running a SELECT every second",
      "A Storage bucket that holds the messages",
      "An RLS policy that delivers messages automatically",
    ],
    correctIndex: 0,
    explanation:
      "Supabase Realtime lets clients subscribe to table changes over WebSockets. RLS controls who may access data; it does not deliver data.",
  },
  {
    id: 3035,
    category: "technology",
    exams: ["dev"],
    devField: "database",
    question:
      "In a serverless environment like Vercel, where many instances start and stop, which database connection is recommended?",
    options: [
      "Supavisor in transaction mode (port 6543)",
      "Supavisor in session mode (port 5432), one per function",
      "A new direct connection for each instance",
      "Connecting with the `service_role` key as the password",
    ],
    correctIndex: 0,
    explanation:
      "Transaction mode shares connections on a per-query basis, so short-lived serverless instances do not exhaust the connection limit. Session mode suits long-lived servers, and opening many direct connections can hit the limit.",
  },
  {
    id: 3036,
    category: "technology",
    exams: ["dev"],
    devField: "database",
    question:
      "You connected through transaction mode (port 6543) and your ORM now fails with an error like \"prepared statement does not exist\". What is the right fix?",
    options: [
      "Disable prepared statements in the driver or ORM settings (for example, `prepare: false`)",
      "Increase the database's maximum number of connections",
      "Disable RLS on the table",
      "Connect with the `service_role` key",
    ],
    correctIndex: 0,
    explanation:
      "In transaction mode the underlying connection can change between queries, so prepared statements are not supported. Disable them in the client, or use session mode.",
  },
  {
    id: 3037,
    category: "technology",
    exams: ["dev"],
    devField: "database",
    question:
      "You want to store document embedding vectors in Supabase's Postgres and search for semantically similar ones. Which extension do you use?",
    options: [
      "`pgvector`",
      "`pg_cron`",
      "`pg_trgm`",
      "`PostGIS`",
    ],
    correctIndex: 0,
    explanation:
      "`pgvector` provides a `vector` type, distance operators such as cosine distance, and indexes for approximate search. `pg_trgm` measures string (spelling) similarity, not similarity in meaning.",
  },
  {
    id: 3038,
    category: "technology",
    exams: ["dev"],
    devField: "database",
    question:
      "You want to run SQL every night to delete old session rows, from inside the database and without using your app server. What do you use?",
    options: [
      "Register a schedule with the `pg_cron` extension",
      "Keep a Realtime subscription open all the time",
      "Create a `pgvector` index",
      "Put a time condition in an RLS policy",
    ],
    correctIndex: 0,
    explanation:
      "`pg_cron` runs SQL on a cron schedule inside Postgres. It suits periodic cleanup and aggregation jobs.",
  },
  {
    id: 3039,
    category: "technology",
    exams: ["dev"],
    devField: "database",
    question:
      "You accidentally ran a `DELETE` on important data and want to \"go back to the state 10 minutes ago\". Which option can do that?",
    options: [
      "PITR (point-in-time recovery), restoring to any chosen moment",
      "Restore from the daily backup to the point 10 minutes before the deletion",
      "Undo the migration with `git revert`",
      "Regenerate the rows from the Realtime history",
    ],
    correctIndex: 0,
    explanation:
      "PITR continuously archives the WAL and can restore to a chosen moment; it must be enabled beforehand. A daily backup can only return to the time it was taken, and Git does not manage database data.",
  },
  {
    id: 3040,
    category: "technology",
    exams: ["dev"],
    devField: "database",
    question:
      "You want to try schema changes in each PR's Vercel preview without affecting the production database. Which Supabase feature fits?",
    options: [
      "Branching, which creates an isolated preview environment for each PR",
      "Applying migrations directly to production with the `service_role` key",
      "Rolling back the production database with PITR to experiment",
      "Building a test environment that stays in sync with production through Realtime",
    ],
    correctIndex: 0,
    explanation:
      "Supabase Branching ties isolated database environments to Git branches and PRs, so you can apply and test migrations safely. Production data is not copied automatically; branches are built from your migrations and seed data.",
  },
];
