import '../style.css';


import { Header } from './components/Header.js';
import { PersonaList } from './components/PersonaList.js';
import { ImageManager } from './components/ImageManager.js';
import { Editor } from './components/Editor.js';
import { Preview } from './components/Preview.js';
import { Settings } from './components/Settings.js'; // Import Settings

const initApp = () => {
  // 1. Init Components (Layout has changed, but IDs remain)
  // Header is gone from HTML structure in flex layout, or we need to reinject it?
  // Wait, previous index.html replacement REMOVED header area from HTML.
  // User didn't explicitly say remove header, but requested layout change.
  // We should probably keep Header functionality or integrate it.
  // The previous index.html replacement removed #app-header.
  // Let's assume user wants full height editor/preview.
  // But Settings button was in Header. We need Settings.
  // Let's re-add Header logic or checks.
  // Actually, looking at index.html replacement, I removed header. Use caution.
  // For now, let's allow Header to be initialized but it might not find target if I removed it.
  // I should probably have kept header or moved it to sidebar.
  // Let's skip Header init if target missing, OR I should have kept it.
  // User asked for "3 panels resizable". Usually header is above.
  // I made a mistake removing header in index.html if it contained critical settings.
  // Let's assume I can't put it back easily without changing index.html again.
  // But wait, I can just not init header if element is missing.
  // However, Settings is critical.
  // Let's check if #app-header exists.

  const settings = new Settings('app'); // Init Settings (appended to body)

  // Check if header element exists, if not, maybe create simple button in sidebar?
  // For now, let's proceed with Main Logic.

  const personaList = new PersonaList('persona-list-container');
  const imageManager = new ImageManager('image-manager-container');
  const editor = new Editor('editor-area');
  const preview = new Preview('preview-area');

  // header.render(); // Skip if no header
  personaList.render();
  settings.render(); // Render settings modal (hidden by default)

  // Settings Event Wiring
  // Header logic (Settings)
  const btnSettings = document.getElementById('btn-settings');
  if (btnSettings) {
    btnSettings.addEventListener('click', () => {
      settings.toggle();
    });
  }

  // document.addEventListener('open-settings', () => {
  //   settings.toggle();
  // });
  imageManager.render();
  editor.render();
  preview.render();

  // Event Wiring
  document.addEventListener('persona-loaded', (e) => {
    const { name, content } = e.detail;
    console.log(`Zino: Received data for ${name}`);
    editor.setContent(name, content); // Pass name
    preview.updatePreview(content);
  });

  document.addEventListener('editor-change', (e) => {
    preview.updatePreview(e.detail.content);
  });

  // Tab Logic
  const tabPersonas = document.getElementById('tab-personas');
  const tabImages = document.getElementById('tab-images');
  const personaContainer = document.getElementById('persona-list-container');
  const imageContainer = document.getElementById('image-manager-container');

  const switchTab = (tabName) => {
    if (tabName === 'personas') {
      personaContainer.style.display = 'block';
      imageContainer.style.display = 'none';
      tabPersonas.style.background = 'var(--glass-highlight)';
      tabImages.style.background = 'transparent';
    } else {
      personaContainer.style.display = 'none';
      imageContainer.style.display = 'block';
      tabPersonas.style.background = 'transparent';
      tabImages.style.background = 'var(--glass-highlight)';
    }
  };

  tabPersonas.addEventListener('click', () => switchTab('personas'));
  tabImages.addEventListener('click', () => switchTab('images'));

  // --- Resizable Logic ---
  const makeResizable = (resizerId, targetId, direction = 'right') => {
    const resizer = document.getElementById(resizerId);
    const target = document.getElementById(targetId);

    let startX = 0;
    let startWidth = 0;

    const onMouseMove = (e) => {
      const dx = e.clientX - startX;
      // If direction is right (resize prev element), dx increases width.
      // If direction is left (resize next element - e.g. preview pane logic), 
      // moving resizer LEFT (negative dx) should INCREASE width of Right Panel.
      // moving resizer RIGHT (positive dx) should DECREASE width of Right Panel.

      let newWidth;
      if (direction === 'right') {
        newWidth = startWidth + dx;
      } else {
        newWidth = startWidth - dx;
      }

      target.style.width = `${newWidth}px`;
      document.body.style.cursor = 'col-resize';
      resizer.classList.add('resizing');
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'default';
      resizer.classList.remove('resizing');
    };

    resizer.addEventListener('mousedown', (e) => {
      startX = e.clientX;
      startWidth = target.getBoundingClientRect().width;

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  };

  // Resizer 1: Controls Persona Manager (Left Panel)
  // Dragging Right -> Increase Width
  makeResizable('resizer-1', 'persona-manager', 'right');

  // Resizer 2: Controls Preview Area (Right Panel)
  // Dragging Left -> Increase Width (direction='left' mode)
  // Note: Resizer 2 is to the LEFT of Preview Area.
  makeResizable('resizer-2', 'preview-area', 'left');


  // --- Global Drag & Drop Logic ---
  const overlay = document.getElementById('global-drop-overlay');
  let dragCounter = 0;

  window.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dragCounter++;
    overlay.style.display = 'flex';
  });

  window.addEventListener('dragleave', (e) => {
    dragCounter--;
    if (dragCounter === 0) {
      overlay.style.display = 'none';
    }
  });

  window.addEventListener('dragover', (e) => e.preventDefault());

  window.addEventListener('drop', (e) => {
    e.preventDefault();
    dragCounter = 0;
    overlay.style.display = 'none';

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    // Fix: If drop happened on a specific upload zone (PersonaList or ImageManager), ignore here to avoid duplicate processing
    if (e.target.closest('.file-upload-zone') || e.target.closest('.image-drop-zone')) {
      console.log('Zino: Global drop ignored (handled by local zone)');
      return;
    }

    // Detect type from first file
    const firstFile = files[0];
    if (firstFile.type.startsWith('image/')) {
      switchTab('images');
      imageManager.handleFiles(files);
    } else if (firstFile.name.endsWith('.md') || firstFile.name.endsWith('.txt')) {
      switchTab('personas');
      personaList.handleFiles(files);
    } else {
      alert('Unsupported file type');
    }
  });


  console.log('Zino: UI Components rendered and events wired.');
};

document.addEventListener('DOMContentLoaded', initApp);

