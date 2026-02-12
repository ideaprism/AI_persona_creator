export class Settings {
    constructor(targetId) {
        this.target = document.getElementById(targetId);
        this.isVisible = false;
        this.config = {
            owner: localStorage.getItem('github_owner') || '',
            repo: localStorage.getItem('github_repo') || '',
            branch: localStorage.getItem('github_branch') || 'main',
            pat: localStorage.getItem('github_pat') || ''
        };
    }

    render() {
        // Modal HTML
        if (!document.getElementById('settings-modal')) {
            const modal = document.createElement('div');
            modal.id = 'settings-modal';
            modal.className = 'glass-panel';
            modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 400px;
        padding: 2rem;
        z-index: 1000;
        display: none;
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid var(--glass-border);
        box-shadow: 0 20px 50px rgba(0,0,0,0.5);
      `;

            modal.innerHTML = `
        <h2 style="margin-top: 0; margin-bottom: 1.5rem; font-family: 'Outfit';">GitHub Settings</h2>
        
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--text-secondary);">Owner / Organization</label>
          <input type="text" id="gh-owner" class="glass-input" value="${this.config.owner}" placeholder="e.g. ideaprism">
        </div>

        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--text-secondary);">Repository Name</label>
          <input type="text" id="gh-repo" class="glass-input" value="${this.config.repo}" placeholder="e.g. team_avengers">
        </div>

        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--text-secondary);">Branch</label>
          <input type="text" id="gh-branch" class="glass-input" value="${this.config.branch}" placeholder="e.g. main">
        </div>

        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--text-secondary);">Personal Access Token (PAT)</label>
          <input type="password" id="gh-pat" class="glass-input" value="${this.config.pat}" placeholder="ghp_...">
          <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px;">Stored locally in browser.</p>
        </div>

        <div class="flex-center" style="justify-content: flex-end; gap: 0.5rem;">
          <button id="btn-cancel" class="glass-button" style="background: transparent; border: none;">Cancel</button>
          <button id="btn-save" class="glass-button" style="background: var(--text-accent); color: white; border: none;">Save & Connect</button>
        </div>
      `;

            document.body.appendChild(modal);

            // Backdrop
            const backdrop = document.createElement('div');
            backdrop.id = 'settings-backdrop';
            backdrop.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        backdrop-filter: blur(4px);
        z-index: 999;
        display: none;
      `;
            document.body.appendChild(backdrop);

            this.attachEvents();
        }
    }

    attachEvents() {
        const modal = document.getElementById('settings-modal');
        const backdrop = document.getElementById('settings-backdrop');
        const btnSave = modal.querySelector('#btn-save');
        const btnCancel = modal.querySelector('#btn-cancel');

        btnSave.addEventListener('click', () => this.saveConfig());

        const close = () => {
            modal.style.display = 'none';
            backdrop.style.display = 'none';
            this.isVisible = false;
        };

        btnCancel.addEventListener('click', close);
        backdrop.addEventListener('click', close);
    }

    toggle() {
        const modal = document.getElementById('settings-modal');
        const backdrop = document.getElementById('settings-backdrop');
        this.isVisible = !this.isVisible;

        if (this.isVisible) {
            modal.style.display = 'block';
            backdrop.style.display = 'block';
        } else {
            modal.style.display = 'none';
            backdrop.style.display = 'none';
        }
    }

    saveConfig() {
        const owner = document.getElementById('gh-owner').value;
        const repo = document.getElementById('gh-repo').value;
        const branch = document.getElementById('gh-branch').value;
        const pat = document.getElementById('gh-pat').value;

        this.config = { owner, repo, branch, pat };

        localStorage.setItem('github_owner', owner);
        localStorage.setItem('github_repo', repo);
        localStorage.setItem('github_branch', branch);
        localStorage.setItem('github_pat', pat);

        // Dispatch event for other components to reload config
        document.dispatchEvent(new CustomEvent('config-updated', { detail: this.config }));

        this.toggle();
        console.log('Zino: Settings saved.');
    }

    getConfig() {
        return this.config;
    }
}
