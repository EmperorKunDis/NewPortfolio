import React from 'react';
import { createRoot } from 'react-dom/client';
import TldrawWorkspace from '../components/TldrawWorkspace';

// Initialize the workspace when the section becomes active
function initializeWorkspace() {
    const container = document.getElementById('tldraw-container');
    if (container && !container._reactRoot) {
        const root = createRoot(container);
        root.render(React.createElement(TldrawWorkspace));
        container._reactRoot = true;
    }
}

// Add listener for workspace section activation
document.addEventListener('DOMContentLoaded', () => {
    const workspaceButton = document.querySelector('[data-id="workspace"]');
    if (workspaceButton) {
        workspaceButton.addEventListener('click', initializeWorkspace);
    }
});