import { githubService } from '../services/GitHubService.js';

export class ImageManager {
    constructor(targetId) {
        this.target = document.getElementById(targetId);
        this.images = [];
    }

    render() {
        this.target.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%;">
        
        <!-- Options Area (Fixed at top) -->
        <div style="padding: 16px; border-bottom: 1px solid var(--md-sys-color-outline-variant); background: var(--md-sys-color-surface-container);">
            
            <!-- Bulk Actions -->
            <div class="bulk-actions" style="display: flex; gap: 8px; margin-bottom: 12px; justify-content: flex-end;">
                <button id="btn-clear-all" class="glass-button" style="height: 32px; font-size: 0.75rem; background: rgba(239, 68, 68, 0.1); color: #ef4444;">Clear</button>
                <button id="btn-upload-all" class="glass-button" style="height: 32px; font-size: 0.75rem; background: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container);">Upload All</button>
            </div>

            <!-- Options Row 1 -->
            <div class="options-row" style="display: flex; gap: 12px; margin-bottom: 12px;">
                <div style="flex: 1;">
                    <label style="display: block; font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant); margin-bottom: 4px;">Ratio</label>
                    <select id="option-ratio" class="glass-input" style="width: 100%; font-size: 0.8rem; padding: 8px;">
                        <option value="original">Original</option>
                        <option value="1:1">1:1 Square</option>
                    </select>
                </div>
                <div style="flex: 1;">
                    <label style="display: block; font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant); margin-bottom: 4px;">Resolution</label>
                    <select id="option-size" class="glass-input" style="width: 100%; font-size: 0.8rem; padding: 8px;">
                        <option value="512">512px</option>
                        <option value="256">256px</option>
                    </select>
                </div>
            </div>

            <!-- Row 2: ID & Apply -->
            <div style="display: flex; gap: 8px; align-items: flex-end;">
                <div style="flex: 1;">
                   <label style="display: block; font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant); margin-bottom: 4px;">Target Persona ID</label>
                   <input type="text" id="persona-id-input" class="glass-input" style="width: 100%; font-size: 0.8rem; padding: 8px;" placeholder="e.g. zino" value="${localStorage.getItem('last_persona_id') || ''}">
                </div>
                <button id="btn-apply-settings" class="glass-button" style="height: 38px; background: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary);">Apply</button>
            </div>
        </div>

        <!-- Scrollable Grid Area -->
        <div class="image-manager-content" style="flex: 1; overflow-y: auto; padding: 16px;">
            
            <!-- Upload Zone -->
            <div class="image-upload-zone flex-center" style="border: 2px dashed var(--md-sys-color-outline-variant); border-radius: 12px; padding: 2rem 1rem; text-align: center; color: var(--md-sys-color-on-surface-variant); cursor: pointer; transition: all 0.2s ease; margin-bottom: 24px; background: var(--md-sys-color-surface-container-high);">
                <input type="file" id="image-upload" multiple accept="image/png,image/jpeg" style="display: none;">
                <div>
                    <div style="font-size: 2rem; margin-bottom: 8px;">🖼️</div>
                    <p style="margin: 0; font-family: 'Outfit'; font-size: 1rem; color: var(--md-sys-color-on-surface);">Drop Images Here</p>
                    <p style="font-size: 0.75rem; opacity: 0.7; margin-top: 4px;">or click to upload</p>
                </div>
            </div>

            <!-- Image Grid -->
            <div id="image-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px;">
                <!-- Image items will be injected here -->
            </div>
        </div>
      </div>
    `;

        this.attachEvents();
    }

    attachEvents() {
        const uploadZone = this.target.querySelector('.image-upload-zone');
        const fileInput = this.target.querySelector('#image-upload');
        const btnUploadAll = this.target.querySelector('#btn-upload-all');
        const btnClearAll = this.target.querySelector('#btn-clear-all');

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

        // Bulk Upload
        btnUploadAll.addEventListener('click', async () => {
            const validImages = this.images.filter(img => img.isValid && !img.uploaded);
            if (validImages.length === 0) {
                alert('No valid and un-uploaded images to upload.');
                return;
            }

            if (!confirm(`Upload all ${validImages.length} images to GitHub?`)) return;

            btnUploadAll.textContent = 'Uploading...';
            btnUploadAll.disabled = true;

            for (const img of validImages) {
                try {
                    await this.uploadSingleImage(img);
                } catch (err) {
                    console.error(`Bulk upload failed for ${img.name}`, err);
                }
            }

            btnUploadAll.textContent = 'Upload All';
            btnUploadAll.disabled = false;
            alert('Bulk upload complete.');
        });

        // Clear All
        btnClearAll.addEventListener('click', () => {
            if (confirm('Clear all images from the list?')) {
                this.images = [];
                this.target.querySelector('#image-grid').innerHTML = '';
            }
        });

        // Apply Settings to All
        const btnApply = this.target.querySelector('#btn-apply-settings');
        btnApply.addEventListener('click', () => this.applySettingsToList());
    }

    async applySettingsToList() {
        if (this.images.length === 0) return;

        const btnApply = this.target.querySelector('#btn-apply-settings');
        btnApply.textContent = 'Processing...';
        btnApply.disabled = true;

        const personaId = this.target.querySelector('#persona-id-input').value.trim();
        const ratio = this.target.querySelector('#option-ratio').value;
        const targetSize = parseInt(this.target.querySelector('#option-size').value);

        if (personaId) localStorage.setItem('last_persona_id', personaId);

        // Clear the grid and re-handle each original file
        const originalFiles = this.images.map(img => img.originalFile);
        this.images = [];
        this.target.querySelector('#image-grid').innerHTML = '';

        await this.handleFiles(originalFiles);

        btnApply.textContent = 'Apply to List';
        btnApply.disabled = false;
    }

    async uploadSingleImage(processed) {
        // Find the button for this image in the DOM
        const cards = this.target.querySelectorAll('.glass-panel');
        let btnUpload;
        for (const card of cards) {
            const input = card.querySelector('.img-name-input');
            if (input && input.value === processed.name) {
                btnUpload = card.querySelector('.btn-upload');
                break;
            }
        }

        if (btnUpload) {
            btnUpload.textContent = 'Uploading...';
            btnUpload.disabled = true;
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    const base64data = reader.result.split(',')[1];

                    // Logic to determine folder path based on personaId
                    // Extract personaId from filename: e.g. "01_terry_coding.png" -> "terry"
                    // Pattern: NN_ID_ACTION.ext

                    let folderPath = 'images'; // Default
                    const parts = processed.name.split('_');
                    if (parts.length >= 2) {
                        // Assuming 2nd part is ID, or try to get ID from Input if matched?
                        // Let's rely on file name structure which we standardized.
                        // Format: XX_ID_ACTION.ext
                        // parts[1] is ID.
                        const potentialId = parts[1];
                        if (potentialId && /^[a-zA-Z0-9]+$/.test(potentialId)) {
                            folderPath = `images/${potentialId}`;
                        }
                    }

                    const path = `${folderPath}/${processed.name}`;

                    await githubService.uploadFile(path, base64data, `Add ${processed.name}`, true);

                    processed.uploaded = true;
                    if (btnUpload) {
                        btnUpload.textContent = 'Uploaded!';
                        btnUpload.style.borderColor = 'var(--text-accent)';
                        btnUpload.style.color = 'var(--text-accent)';
                    }
                    resolve();
                } catch (err) {
                    if (btnUpload) {
                        btnUpload.textContent = 'Failed';
                        btnUpload.disabled = false;
                    }
                    reject(err);
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(processed.blob);
        });
    }

    async handleFiles(files) {
        const grid = this.target.querySelector('#image-grid');
        const personaId = this.target.querySelector('#persona-id-input').value.trim();
        const ratio = this.target.querySelector('#option-ratio').value;
        const targetSize = parseInt(this.target.querySelector('#option-size').value);

        if (personaId) {
            localStorage.setItem('last_persona_id', personaId);
        }

        for (const file of files) {
            if (!file.type.startsWith('image/')) continue;

            // Auto-standardize name logic
            let targetName = file.name;
            if (personaId) {
                const parts = file.name.split('_');
                const ext = file.name.split('.').pop();
                const nameNoExt = file.name.substring(0, file.name.lastIndexOf('.'));

                if (parts.length === 2 && /^\d{2}$/.test(parts[0])) {
                    targetName = `${parts[0]}_${personaId}_${parts[1]}`;
                } else if (/^\d{2}/.test(nameNoExt)) {
                    const num = nameNoExt.substring(0, 2);
                    const action = nameNoExt.substring(2).replace(/[^a-zA-Z0-9]/g, '');
                    targetName = `${num}_${personaId}_${action}.${ext}`;
                }
            }

            // Create UI placeholder (M3 Card Style)
            const card = document.createElement('div');
            card.className = 'image-card';
            card.style.background = 'var(--md-sys-color-surface-container)';
            card.style.borderRadius = '12px';
            card.style.overflow = 'hidden';
            card.style.border = '1px solid var(--md-sys-color-outline-variant)';
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.padding = '8px';

            card.innerHTML = `
        <div class="img-preview" style="width: 100%; aspect-ratio: 1/1; background: #000; border-radius: 8px; overflow: hidden; margin-bottom: 8px; position: relative;">
          <div class="loader flex-center" style="position: absolute; inset: 0; color: white; font-size: 0.8rem;">Processing...</div>
          <img src="" style="width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 0.3s;">
          <div class="status-badge" style="position: absolute; top: 4px; right: 4px; padding: 2px 6px; border-radius: 4px; font-size: 0.6rem; font-weight: bold; display: none;"></div>
        </div>
        <div class="img-info" style="font-size: 0.7rem;">
          <input type="text" class="img-name-input glass-input" style="width: 100%; font-size: 0.75rem; padding: 4px; margin-bottom: 4px; background: var(--md-sys-color-surface-container-high); border: none; border-bottom: 1px solid var(--md-sys-color-outline);" value="${targetName}">
          <div class="img-meta" style="color: var(--md-sys-color-on-surface-variant); margin-bottom: 8px;"></div>
        </div>
      `;
            grid.insertBefore(card, grid.firstChild); // Newest first

            // Process Image
            try {
                const processed = await this.processImage(file, targetName, ratio, targetSize);
                const img = card.querySelector('img');
                const loader = card.querySelector('.loader');
                const badge = card.querySelector('.status-badge');
                const nameInput = card.querySelector('.img-name-input');

                img.src = processed.url;
                img.onload = () => {
                    img.style.opacity = 1;
                    loader.style.display = 'none';
                };

                const updateUI = (isValid) => {
                    if (isValid) {
                        badge.style.display = 'block';
                        badge.style.background = 'rgba(16, 185, 129, 0.8)';
                        badge.textContent = 'VALID';
                        card.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                    } else {
                        badge.style.display = 'block';
                        badge.style.background = 'rgba(239, 68, 68, 0.8)';
                        badge.textContent = 'INVALID';
                        card.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                    }
                };

                updateUI(processed.isValid);

                nameInput.addEventListener('input', (e) => {
                    processed.name = e.target.value;
                    processed.isValid = this.validateFilename(processed.name);
                    updateUI(processed.isValid);
                });

                card.querySelector('.img-meta').innerHTML = `
          <div style="margin-bottom: 4px;">${processed.width}x${processed.height} • ${(processed.size / 1024).toFixed(1)}KB</div>
          <div style="display: flex; gap: 4px;">
            <button class="btn-convert glass-button" style="font-size: 0.7rem; padding: 4px 8px; flex: 1; border-color: var(--text-secondary);">Convert</button>
            <button class="btn-upload glass-button" style="font-size: 0.7rem; padding: 4px 8px; flex: 1; border-color: var(--text-secondary);">Upload</button>
          </div>
        `;

                const btnConvert = card.querySelector('.btn-convert');
                btnConvert.addEventListener('click', async () => {
                    const newPersonaId = this.target.querySelector('#persona-id-input').value.trim();
                    const newRatio = this.target.querySelector('#option-ratio').value;
                    const newSize = parseInt(this.target.querySelector('#option-size').value);

                    // Update name based on current ID input
                    let newTargetName = processed.name;
                    if (newPersonaId) {
                        const parts = processed.name.split('_');
                        const ext = processed.name.split('.').pop();
                        const nameNoExt = processed.name.substring(0, processed.name.lastIndexOf('.'));

                        // Try to find the number part from either the original name or current name
                        const numMatch = nameNoExt.match(/^\d{2}/);
                        const num = numMatch ? numMatch[0] : '00';

                        // Get action part (last part)
                        const action = parts[parts.length - 1].replace(/[^a-zA-Z0-9]/g, '');
                        newTargetName = `${num}_${newPersonaId}_${action}`;
                        if (!newTargetName.endsWith(ext)) newTargetName += `.${ext}`;
                    }

                    btnConvert.textContent = '...';
                    const updated = await this.processImage(processed.originalFile, newTargetName, newRatio, newSize);

                    // Update the object in this.images
                    const idx = this.images.findIndex(img => img === processed);
                    if (idx !== -1) this.images[idx] = updated;

                    // Refresh card (For simplicity, just use handleFiles pattern or update manually)
                    // Let's update manually for better UX
                    img.src = updated.url;
                    nameInput.value = updated.name;
                    updateUI(updated.isValid);
                    card.querySelector('.img-meta div').textContent = `${updated.width}x${updated.height} • ${(updated.size / 1024).toFixed(1)}KB`;

                    // Refresh references
                    Object.assign(processed, updated);
                    btnConvert.textContent = 'Convert';
                });

                const btnUpload = card.querySelector('.btn-upload');
                btnUpload.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    if (!processed.isValid) {
                        alert('Invalid filename.'); return;
                    }
                    try {
                        await this.uploadSingleImage(processed);
                        const rawUrl = githubService.getRawUrl(`images/${processed.name}`); // Note: this might need adjustment if service doesn't know about subdirs, but service uses standard raw url structure
                        // Actually raw url needs to include subdir
                        // Let's calculate it here properly
                        let folderPath = 'images';
                        const parts = processed.name.split('_');
                        if (parts.length >= 2) {
                            const potentialId = parts[1];
                            if (potentialId && /^[a-zA-Z0-9]+$/.test(potentialId)) {
                                folderPath = `images/${potentialId}`;
                            }
                        }
                        const fullPath = `${folderPath}/${processed.name}`;
                        const realRawUrl = githubService.getRawUrl(fullPath);

                        navigator.clipboard.writeText(realRawUrl);
                        alert('Uploaded & Raw URL copied!');
                    } catch (err) {
                        alert('Upload failed.');
                    }
                });

                this.images.push(processed);

            } catch (err) {
                console.error('Image processing failed:', err);
                card.remove();
            }
        }
    }

    validateFilename(filename) {
        const regex = /^\d{2}_[a-zA-Z0-9]+_[a-zA-Z0-9]+\.(png|jpg|jpeg)$/i;
        return regex.test(filename);
    }

    processImage(file, customName, ratio, targetSize) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const isValid = this.validateFilename(customName);

                let width, height, sx = 0, sy = 0, sw = img.width, sh = img.height;

                if (ratio === '1:1') {
                    const minDim = Math.min(img.width, img.height);
                    sx = (img.width - minDim) / 2;
                    sy = (img.height - minDim) / 2;
                    sw = sh = minDim;
                    width = height = targetSize;
                } else {
                    // Original Ratio: Resize Longest edge to targetSize
                    if (img.width > img.height) {
                        width = targetSize;
                        height = (img.height / img.width) * targetSize;
                    } else {
                        height = targetSize;
                        width = (img.width / img.height) * targetSize;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');

                // Use smoother resizing
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    resolve({
                        name: customName,
                        url: url,
                        width: Math.round(width),
                        height: Math.round(height),
                        size: blob.size,
                        blob: blob,
                        isValid: isValid,
                        uploaded: false,
                        originalFile: file // Keep original for re-processing
                    });
                }, 'image/png');
            };

            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    }
}
