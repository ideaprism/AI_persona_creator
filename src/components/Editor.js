import { githubService } from '../services/GitHubService.js';

export class Editor {
  constructor(targetId) {
    this.target = document.getElementById(targetId);
    this.currentFile = null;
  }

  render() {
    this.target.innerHTML = `
      <div class="panel-header" style="padding: 1rem; border-bottom: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center; height: 60px; box-sizing: border-box;">
        <h2 style="font-size: 1rem; margin: 0; font-family: 'Outfit';">Editor</h2>
        <div class="actions flex-center" style="gap: 8px;">
          <button id="btn-copy-prompt" class="glass-button" disabled>Copy</button>
          <button id="btn-download" class="glass-button" disabled>Download</button>
          <button id="btn-save-github" class="glass-button" style="background-color: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary);" disabled>Save</button>
        </div>
      </div>
      <div class="editor-content" style="padding: 0; height: calc(100% - 60px);">
        <textarea class="glass-input" style="width: 100%; height: 100%; border: none; background: transparent; border-radius: 0; resize: none; font-family: 'JetBrains Mono', monospace; line-height: 1.6;" placeholder="# Select a persona to edit..."></textarea>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const btnSave = this.target.querySelector('#btn-save-github');
    const btnCopy = this.target.querySelector('#btn-copy-prompt');
    const textarea = this.target.querySelector('textarea');

    // Live Preview Update
    textarea.addEventListener('input', (e) => {
      // Dispatch simple event for local preview update if needed, 
      // but main Preview component listens to 'persona-loaded'.
      // We might need a 'content-changed' event for real-time preview.
      // For now, let's keep it simple or dispatch event.
      // Actually, Preview update on typing is good UX.
      // But Preview component logic is stuck on 'persona-loaded' event from main.js?
      // Let's add a direct update call if possible or strictly event based.
      // For loose coupling, dispatch event.
      if (this.currentFile) {
        document.dispatchEvent(new CustomEvent('editor-change', {
          detail: { content: e.target.value }
        }));
      }
    });

    btnSave.addEventListener('click', async () => {
      if (!this.currentFile) return;
      const content = textarea.value;

      // Determine Base Name
      // currentFile might be "terry.md" or "terry.txt"
      const baseName = this.currentFile.replace(/\.(md|txt)$/, '');

      if (!confirm(`Commit changes to persona/${baseName}.md AND .txt?`)) return;

      btnSave.textContent = 'Committing...';
      btnSave.disabled = true;

      try {
        // 1. Save MD
        const mdPath = `persona/${baseName}.md`;
        await githubService.uploadFile(mdPath, content, `Update ${baseName}.md via AI Persona Suite`);

        // 2. Save TXT (Strip Markdown if needed, but per request implies same content or raw)
        // User said: "txt 업로드해서 편집하고 저장해도 자동으로 md, txt 모두 저장"
        // Usually TXT is just the Prompt.
        // Let's assume content IS the prompt mixed with metadata if MD.
        // If content has Frontmatter, TXT might want it stripped? 
        // For now, let's save SAME content to TXT for simplicity/safety unless parsed.
        // Or if simple stripper:
        // const txtContent = content.replace(/^---[\s\S]*?---\n/, ''); // Strip frontmatter?
        // Let's keep it exact clone for now to avoid data loss.

        const txtPath = `persona/${baseName}.txt`;
        await githubService.uploadFile(txtPath, content, `Update ${baseName}.txt via AI Persona Suite`);

        btnSave.textContent = 'Saved Both!';
        setTimeout(() => {
          btnSave.textContent = 'Save to GitHub';
          btnSave.disabled = false;
        }, 2000);
      } catch (err) {
        console.error(err);
        btnSave.textContent = 'Failed';
        alert('Commit failed. Check console.');
        btnSave.disabled = false;
      }
    });

    // Download Button Logic (New)
    const btnDownload = this.target.querySelector('#btn-download'); // Need to add this to render()
    if (btnDownload) {
      btnDownload.addEventListener('click', () => {
        if (!this.currentFile) return;
        const content = textarea.value;
        const baseName = this.currentFile.replace(/\.(md|txt)$/, '');

        const downloadFile = (filename, text) => {
          const element = document.createElement('a');
          element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
          element.setAttribute('download', filename);
          element.style.display = 'none';
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
        };

        downloadFile(`${baseName}.md`, content);
        setTimeout(() => downloadFile(`${baseName}.txt`, content), 500); // Small delay to ensure both trigger
      });
    }

    btnCopy.addEventListener('click', () => {
      const content = textarea.value;
      const plainText = content.replace(/[#*`]/g, ''); // Simple markdown stripper
      navigator.clipboard.writeText(plainText);

      const originalText = btnCopy.textContent;
      btnCopy.textContent = 'Copied!';
      setTimeout(() => btnCopy.textContent = originalText, 2000);
    });
  }

  setContent(name, content) {
    this.currentFile = name;
    const textarea = this.target.querySelector('textarea');
    const btnSave = this.target.querySelector('#btn-save-github');
    const btnCopy = this.target.querySelector('#btn-copy-prompt');

    if (textarea) {
      textarea.value = content;
      btnSave.disabled = false;
      btnCopy.disabled = false;
      const btnDownload = this.target.querySelector('#btn-download');
      if (btnDownload) btnDownload.disabled = false;
    }
  }
}
