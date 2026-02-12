import { marked } from 'marked';

export class Preview {
  constructor(targetId) {
    this.target = document.getElementById(targetId);
  }

  render() {
    this.target.innerHTML = `
      <div class="panel-header" style="padding: 1rem; border-bottom: 1px solid var(--glass-border); height: 60px; box-sizing: border-box; display: flex; align-items: center;">
        <h2 style="font-size: 1rem; margin: 0; font-family: 'Outfit';">Preview</h2>
      </div>
      <div class="preview-content glass-scroll" style="padding: 1rem; height: calc(100% - 60px); overflow-y: auto; color: var(--text-primary);">
        <div id="preview-placeholder" style="text-align: center; color: var(--text-secondary); margin-top: 2rem;">
          Select a persona to see the preview.
        </div>
        <div id="markdown-output" style="display: none; line-height: 1.6;"></div>
      </div>
    `;
  }

  updatePreview(content) {
    const placeholder = this.target.querySelector('#preview-placeholder');
    const output = this.target.querySelector('#markdown-output');

    if (content) {
      placeholder.style.display = 'none';
      output.style.display = 'block';
      // Configure marked for security if needed, keeping simple for now
      output.innerHTML = marked.parse(content);
    } else {
      placeholder.style.display = 'block';
      output.style.display = 'none';
    }
  }
}
