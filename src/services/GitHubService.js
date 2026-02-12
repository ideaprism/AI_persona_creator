import { Octokit } from "@octokit/rest";

export class GitHubService {
    constructor() {
        this.octokit = null;
        this.config = {
            owner: localStorage.getItem('github_owner'),
            repo: localStorage.getItem('github_repo'),
            branch: localStorage.getItem('github_branch'),
            pat: localStorage.getItem('github_pat')
        };

        if (this.config.pat) {
            this.initOctokit();
        }

        document.addEventListener('config-updated', (e) => {
            this.config = e.detail;
            this.initOctokit();
        });
    }

    initOctokit() {
        try {
            this.octokit = new Octokit({
                auth: this.config.pat
            });
            console.log('Zino: Octokit initialized.');
            this.checkConnection();
        } catch (err) {
            console.error('Zino: Failed to initialize Octokit', err);
        }
    }

    async checkConnection() {
        if (!this.octokit) return false;
        try {
            const { data } = await this.octokit.rest.users.getAuthenticated();
            console.log(`Zino: Connected to GitHub as ${data.login}`);
            return true;
        } catch (err) {
            console.error('Zino: GitHub connection failed', err);
            return false;
        }
    }

    async uploadFile(path, content, message, isBinary = false) {
        if (!this.octokit) throw new Error("GitHub not connected");

        try {
            // Check if file exists to get SHA
            let sha;
            try {
                const { data } = await this.octokit.rest.repos.getContent({
                    owner: this.config.owner,
                    repo: this.config.repo,
                    path: path,
                    ref: this.config.branch
                });
                sha = data.sha;
            } catch (err) {
                // File doesn't exist, proceed with creation
            }

            // Encode content
            // For images (binary), content should be base64 string already or handled
            // For text, encode to base64
            let contentBase64 = content;
            if (!isBinary) {
                // UTF-8 to Base64 (browser compatible)
                contentBase64 = btoa(unescape(encodeURIComponent(content)));
            }

            const { data } = await this.octokit.rest.repos.createOrUpdateFileContents({
                owner: this.config.owner,
                repo: this.config.repo,
                path: path,
                message: message,
                content: contentBase64,
                sha: sha,
                branch: this.config.branch
            });

            console.log(`Zino: File uploaded to ${path}`);
            return data;
        } catch (err) {
            console.error('Zino: Upload failed', err);
            throw err;
        }
    }

    getRawUrl(path) {
        return `https://raw.githubusercontent.com/${this.config.owner}/${this.config.repo}/${this.config.branch}/${path}`;
    }
}

export const githubService = new GitHubService();
