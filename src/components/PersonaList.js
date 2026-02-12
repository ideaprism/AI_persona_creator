export class PersonaList {
    constructor(targetId) {
        this.target = document.getElementById(targetId);
    }

    render() {
        this.target.innerHTML = `
  <!-- Header removed, handled by Sidebar -->
  <div class="persona-list-content" style="padding: 1rem;">
    <div class="file-upload-zone flex-center" style="border: 2px dashed var(--glass-border); border-radius: 8px; padding: 2rem; text-align: center; color: var(--text-secondary); cursor: pointer; transition: all 0.3s ease;">
      <input type="file" id="persona-upload" multiple accept=".md, .txt" style="display: none;">
      <div>
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">📂</div>
        <p style="margin-bottom: 0.5rem;">MD or Image files</p>
        <p style="font-size: 0.8rem; opacity: 0.7;">or click to upload</p>
      </div>
    </div>
    <div id="loaded-personas" style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
      <!-- Loaded persona items will appear here -->
    </div>
  </div>
`;

        this.attachEvents();
    }

    attachEvents() {
        const uploadZone = this.target.querySelector('.file-upload-zone');
        const fileInput = this.target.querySelector('#persona-upload');

        uploadZone.addEventListener('click', () => fileInput.click());

        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = 'var(--text-accent)';
            uploadZone.style.background = 'rgba(255,255,255,0.05)';
        });

        uploadZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = 'var(--glass-border)';
            uploadZone.style.background = 'transparent';
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = 'var(--glass-border)';
            uploadZone.style.background = 'transparent';
            const files = e.dataTransfer.files;
            if (files.length > 0) this.handleFiles(files);
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) this.handleFiles(e.target.files);
        });
    }

    handleFiles(files) {
        const listContainer = this.target.querySelector('#loaded-personas');
        Array.from(files).forEach(file => {
            if (file.name.endsWith('.md') || file.name.endsWith('.txt')) {
                const item = document.createElement('div');
                item.className = 'persona-item'; // New class for M3
                item.style.padding = '12px 16px';
                item.style.cursor = 'pointer';
                item.style.display = 'flex';
                item.style.alignItems = 'center';
                item.style.borderBottom = '1px solid var(--md-sys-color-outline-variant)';
                item.style.transition = 'background-color 0.2s';

                // Icon based on type
                const isMd = file.name.endsWith('.md');
                // M3 Icon Colors
                const iconColor = isMd ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline)';

                item.innerHTML = `
      <div style="width: 40px; height: 40px; background: var(--md-sys-color-surface-container-high); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 16px;">
        <span style="font-size: 1.2rem;">${isMd ? '📝' : '📄'}</span>
      </div>
      <div style="display: flex; flex-direction: column;">
        <span style="font-size: 1rem; color: var(--md-sys-color-on-surface); font-weight: 500;">${file.name}</span>
        <span style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">${isMd ? 'Markdown Persona' : 'Plain Text'}</span>
      </div>
    `;
                listContainer.appendChild(item);

                // Hover effect manually or via CSS class if added
                item.addEventListener('mouseenter', () => item.style.backgroundColor = 'var(--md-sys-color-surface-container-high)');
                item.addEventListener('mouseleave', () => {
                    if (item.getAttribute('data-active') !== 'true') item.style.backgroundColor = 'transparent';
                });

                // Read file content logic
                const reader = new FileReader();
                reader.onload = (e) => {
                    console.log(`Zino: Loaded ${file.name}`);

                    // Visual Highlight
                    const allItems = listContainer.querySelectorAll('.persona-item');
                    allItems.forEach(i => {
                        i.style.backgroundColor = 'transparent';
                        i.setAttribute('data-active', 'false');
                    });
                    item.style.backgroundColor = 'var(--md-sys-color-secondary-container)';
                    item.setAttribute('data-active', 'true');

                    // Process Content
                    let content = e.target.result;
                    let name = file.name;

                    // If .txt, we might want to wrap it or Just pass it.
                    // User requested dual save, so Editor should handle "Raw" vs "MD".
                    // For now, just pass content.

                    const event = new CustomEvent('persona-loaded', {
                        detail: { name: name, content: content }
                    });
                    document.dispatchEvent(event);
                };
                reader.readAsText(file);

                // Add click listener to item
                item.addEventListener('click', () => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const allItems = listContainer.querySelectorAll('.persona-item');
                        allItems.forEach(i => {
                            i.style.backgroundColor = 'transparent';
                            i.setAttribute('data-active', 'false');
                        });
                        item.style.backgroundColor = 'var(--md-sys-color-secondary-container)';
                        item.setAttribute('data-active', 'true');

                        document.dispatchEvent(new CustomEvent('persona-loaded', {
                            detail: { name: file.name, content: e.target.result }
                        }));
                    };
                    reader.readAsText(file);
                });
            }
        });
    }
}
