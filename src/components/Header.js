export class Header {
  constructor(targetId) {
    this.target = document.getElementById(targetId);
  }

  render() {
    this.target.innerHTML = `
      <div class="header-content flex-center" style="justify-content: space-between; height: 100%; padding: 0 1.5rem;">
        <div class="brand flex-center">
          <div class="logo-icon flex-center" style="width: 32px; height: 32px; background: var(--text-accent); border-radius: 8px; margin-right: 12px; font-weight: bold; color: white;">
            P
          </div>
          <h1 style="font-family: 'Outfit'; font-size: 1.25rem; margin: 0;">AI Persona Suite</h1>
        </div>
        
        <div class="controls flex-center" style="gap: 1rem;">
          <button id="btn-settings" class="glass-button" style="border-color: var(--text-accent); color: var(--text-accent);">Settings</button>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const btnSettings = this.target.querySelector('#btn-settings');
    btnSettings.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('open-settings'));
    });
  }
}
