import { DrillDef, DrillQuestion } from "@/lib/drills";

// AI Engineer track drills. Correct answer first (index 0); the runner shuffles.

// Git: pick the command for the situation.
export const gitCommandQuestions: DrillQuestion[] = [
  { id: "g1", prompt: "Replay your branch on top of the latest main to keep history linear", options: ["git rebase main", "git merge main", "git reset main", "git cherry-pick main"], correctIndex: 0, explanation: "rebase replays your commits on top of main. merge creates a merge commit, so the history is not linear." },
  { id: "g2", prompt: "Undo an already-published commit without rewriting history", options: ["git revert <commit>", "git reset --hard <commit>", "git rebase -i <commit>", "git commit --amend"], correctIndex: 0, explanation: "revert adds a new commit that undoes the change, so shared history stays intact. reset and rebase rewrite history." },
  { id: "g3", prompt: "Undo the last commit but keep its changes staged", options: ["git reset --soft HEAD~1", "git reset --hard HEAD~1", "git revert HEAD", "git stash"], correctIndex: 0, explanation: "--soft undoes only the commit and leaves the changes staged. --hard discards the changes too." },
  { id: "g4", prompt: "Shelve work in progress temporarily so you can switch branches", options: ["git stash", "git commit --amend", "git reset --hard", "git clean -fd"], correctIndex: 0, explanation: "stash shelves uncommitted changes, and git stash pop brings them back." },
  { id: "g5", prompt: "Bring just one specific commit from another branch into the current branch", options: ["git cherry-pick <commit>", "git merge <branch>", "git rebase <branch>", "git pull <branch>"], correctIndex: 0, explanation: "cherry-pick applies only the changes of the given commit as a new commit." },
  { id: "g6", prompt: "Download the remote's updates without applying them to your branch yet", options: ["git fetch", "git pull", "git push", "git merge"], correctIndex: 0, explanation: "fetch only downloads the remote state. pull does a fetch and then merges (or rebases)." },
  { id: "g7", prompt: "Force-push your rebased branch without wiping out anyone else's updates", options: ["git push --force-with-lease", "git push --force", "git push --all", "git push --tags"], correctIndex: 0, explanation: "--force-with-lease overwrites the remote only if it is still in the state you last saw. --force can erase other people's pushes." },
  { id: "g8", prompt: "Combine several recent commits into one, or fix their messages (not pushed yet)", options: ["git rebase -i HEAD~3", "git revert HEAD~3", "git merge --squash HEAD~3", "git reset --hard HEAD~3"], correctIndex: 0, explanation: "Interactive rebase (rebase -i) lets you squash, reword, drop, and more. Don't use it on history that is already shared." },
  { id: "g9", prompt: "Find and recover commits you lost with reset --hard", options: ["git reflog", "git log --all", "git stash list", "git status"], correctIndex: 0, explanation: "reflog records where HEAD has been, so you can find the hash of the lost commit and go back to it." },
  { id: "g10", prompt: "Find which commit introduced a bug using binary search", options: ["git bisect", "git blame", "git diff", "git show"], correctIndex: 0, explanation: "bisect narrows down the culprit by binary search as you mark commits good or bad. blame shows who last changed each line." },
  { id: "g11", prompt: "Work on another branch in a separate folder at the same time, without switching branches", options: ["git worktree add", "git clone --branch", "git switch -c", "git checkout --orphan"], correctIndex: 0, explanation: "worktree creates several working folders from one repository. The same branch cannot be checked out in two places at once." },
  { id: "g12", prompt: "A merge hit conflicts; abandon the merge and return to where you started", options: ["git merge --abort", "git reset --soft", "git revert --abort", "git stash drop"], correctIndex: 0, explanation: "merge --abort returns to the state before the merge began. For a rebase, use git rebase --abort." },
  { id: "g13", prompt: "Create a new branch and switch to it right away", options: ["git switch -c <name>", "git branch -d <name>", "git checkout <commit>", "git tag <name>"], correctIndex: 0, explanation: "switch -c (or checkout -b) creates the branch and switches to it in one step." },
  { id: "g14", prompt: "Stop tracking an accidentally added .env but keep the local file", options: ["git rm --cached .env", "git rm .env", "git reset --hard", "git clean -f .env"], correctIndex: 0, explanation: "rm --cached untracks the file but keeps it on disk. Add it to .gitignore, and always rotate any leaked keys (they remain in history)." },
  { id: "g15", prompt: "Review the diff of your staged changes", options: ["git diff --staged", "git diff", "git log -p", "git status -s"], correctIndex: 0, explanation: "git diff shows unstaged changes; --staged (--cached) shows staged changes." },
];

export const devDrillList: DrillDef[] = [
  { kind: "gitcmd", title: "Pick the Git command", description: "Which command fits the situation?", icon: "🌿", usesField: false },
  { kind: "acronym", title: "Acronym flash", description: "RLS, RAG, CORS and friends: full names", icon: "🔠", usesField: true },
];

export const devDrillMap: Record<string, DrillDef> = Object.fromEntries(devDrillList.map((d) => [d.kind, d]));

export const devCuratedSets: Record<string, DrillQuestion[]> = {
  gitcmd: gitCommandQuestions,
};
