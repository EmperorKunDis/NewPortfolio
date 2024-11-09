class WorkspaceElement {
    constructor(type, shape, color) {
        this.type = type;
        this.shape = shape;
        this.color = color;
        this.locked = false;
        this.position = { x: 0, y: 0 };
        this.connections = [];
        this.borderStyle = 'solid'; // Add border style property
        this.element = this.createElement();
        this.setupEventListeners();
    }

    createElement() {
        const element = document.createElement('div');
        element.className = 'draggable-element';
        element.style.left = '0px';
        element.style.top = '0px';

        // Create shape element
        const shapeElement = document.createElement('div');
        shapeElement.className = `element-shape shape-${this.shape}`;
        shapeElement.style.setProperty('--element-color', this.color);
        element.appendChild(shapeElement);

        // Add corner icons
        const icons = document.createElement('div');
        icons.className = 'element-icons';
        
        const iconTypes = [
            { name: 'lock', svg: '<svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z"/></svg>' },
            { name: 'edit', svg: '<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>' },
            { name: 'copy', svg: '<svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>' },
            { name: 'move', svg: '<svg viewBox="0 0 24 24"><path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"/></svg>' },
            { name: 'connect', svg: '<svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>' }
        ];

        iconTypes.forEach(icon => {
            const iconElement = document.createElement('div');
            iconElement.className = `element-icon ${icon.name}-icon`;
            iconElement.innerHTML = icon.svg;
            icons.appendChild(iconElement);
        });

        element.appendChild(icons);
        return element;
    }

    setupEventListeners() {
        let isDragging = false;
        let startX, startY, initialX, initialY;
        let isConnecting = false;

        const onMouseDown = (e) => {
            if (this.locked) return;
            
            const target = e.target;
            if (target.closest('.element-icon')) {
                const iconType = Array.from(target.closest('.element-icon').classList)
                    .find(cls => cls.endsWith('-icon'))
                    ?.replace('-icon', '');
                
                switch (iconType) {
                    case 'lock':
                        this.toggleLock();
                        break;
                    case 'edit':
                        this.enableEditing();
                        break;
                    case 'copy':
                        this.duplicate();
                        break;
                    case 'move':
                        isDragging = true;
                        break;
                    case 'connect':
                        isConnecting = true;
                        this.startConnection();
                        break;
                }
                return;
            }

            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialX = this.position.x;
            initialY = this.position.y;
        };

        const onMouseMove = (e) => {
            if (!isDragging && !isConnecting || this.locked) return;

            if (isDragging) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                this.position.x = initialX + dx;
                this.position.y = initialY + dy;

                this.element.style.left = `${this.position.x}px`;
                this.element.style.top = `${this.position.y}px`;

                this.updateConnections();
            }

            if (isConnecting) {
                this.updateTempConnection(e.clientX, e.clientY);
            }
        };

        const onMouseUp = (e) => {
            isDragging = false;
            if (isConnecting) {
                const targetElement = this.findTargetElement(e.clientX, e.clientY);
                if (targetElement && targetElement !== this) {
                    this.createConnection(targetElement);
                }
                this.removeTempConnection();
                isConnecting = false;
            }
        };

        this.element.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        if (this.type === 'tooltip') {
            this.setupTooltip();
        } else if (this.type === 'modal') {
            this.setupModal();
        }
    }

    startConnection() {
        const tempLine = document.createElement('div');
        tempLine.className = 'connection-line temp-connection';
        document.body.appendChild(tempLine);
        this.tempConnection = tempLine;
    }

    updateTempConnection(mouseX, mouseY) {
        if (!this.tempConnection) return;

        const rect = this.element.getBoundingClientRect();
        const startX = rect.left + rect.width / 2;
        const startY = rect.top + rect.height / 2;

        const angle = Math.atan2(mouseY - startY, mouseX - startX) * 180 / Math.PI;
        const length = Math.sqrt(Math.pow(mouseX - startX, 2) + Math.pow(mouseY - startY, 2));

        this.tempConnection.style.width = `${length}px`;
        this.tempConnection.style.left = `${startX}px`;
        this.tempConnection.style.top = `${startY}px`;
        this.tempConnection.style.transform = `rotate(${angle}deg)`;
    }

    removeTempConnection() {
        if (this.tempConnection) {
            this.tempConnection.remove();
            this.tempConnection = null;
        }
    }

    findTargetElement(x, y) {
        const elements = document.elementsFromPoint(x, y);
        for (const element of elements) {
            const workspaceElement = element.closest('.draggable-element');
            if (workspaceElement && workspaceElement !== this.element) {
                return workspaceElement.__workspaceElement;
            }
        }
        return null;
    }

    createConnection(target) {
        const line = document.createElement('div');
        line.className = `connection-line ${this.workspace.selectedLineStyle || 'solid'}`;
        document.body.appendChild(line);

        this.connections.push({ line, target });
        target.connections.push({ line, target: this });

        this.updateConnectionLine(line, this, target);
    }

    toggleLock() {
        this.locked = !this.locked;
        const lockIcon = this.element.querySelector('.lock-icon');
        lockIcon.classList.toggle('locked', this.locked);
    }

    enableEditing() {
        if (this.locked) return;
        
        const textElement = document.createElement('div');
        textElement.contentEditable = true;
        textElement.className = 'editable-text';
        textElement.style.minWidth = '100px';
        textElement.style.minHeight = '20px';
        textElement.style.padding = '5px';
        
        this.element.appendChild(textElement);
        textElement.focus();
    }

    duplicate() {
        if (this.locked) return;
        
        const clone = new WorkspaceElement(this.type, this.shape, this.color);
        clone.position = {
            x: this.position.x + 20,
            y: this.position.y + 20
        };
        clone.element.style.left = `${clone.position.x}px`;
        clone.element.style.top = `${clone.position.y}px`;
        
        this.element.parentNode.appendChild(clone.element);
    }

    setupTooltip() {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip-content';
        tooltip.textContent = 'Double click to edit tooltip content';
        
        this.element.addEventListener('mouseover', () => {
            if (!this.locked) {
                tooltip.style.display = 'block';
                tooltip.style.left = `${this.position.x + 100}px`;
                tooltip.style.top = `${this.position.y}px`;
            }
        });

        this.element.addEventListener('mouseout', () => {
            tooltip.style.display = 'none';
        });

        document.body.appendChild(tooltip);
    }

    setupModal() {
        this.element.addEventListener('click', () => {
            if (this.locked) return;
            
            const modal = document.createElement('div');
            modal.className = 'modal-window';
            modal.innerHTML = `
                <div class="modal-content">
                    <h3>Modal Window</h3>
                    <div class="modal-workspace"></div>
                    <button class="close-modal">Close</button>
                </div>
            `;

            modal.querySelector('.close-modal').addEventListener('click', () => {
                modal.remove();
            });

            document.body.appendChild(modal);
            modal.style.display = 'block';

            // Create a new workspace inside the modal
            new Workspace(modal.querySelector('.modal-workspace'));
        });
    }

    updateConnections() {
        this.connections.forEach(connection => {
            const { line, target } = connection;
            this.updateConnectionLine(line, this, target);
        });
    }

    updateConnectionLine(line, source, target) {
        const sourceRect = source.element.getBoundingClientRect();
        const targetRect = target.element.getBoundingClientRect();

        const sourceX = sourceRect.left + sourceRect.width / 2;
        const sourceY = sourceRect.top + sourceRect.height / 2;
        const targetX = targetRect.left + targetRect.width / 2;
        const targetY = targetRect.top + targetRect.height / 2;

        const angle = Math.atan2(targetY - sourceY, targetX - sourceX) * 180 / Math.PI;
        const length = Math.sqrt(Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2));

        line.style.width = `${length}px`;
        line.style.left = `${sourceX}px`;
        line.style.top = `${sourceY}px`;
        line.style.transform = `rotate(${angle}deg)`;
    }

    setBorderStyle(style) {
        this.borderStyle = style;
        this.element.querySelector('.element-shape').style.borderStyle = style;
    }
}

class Workspace {
    constructor(container) {
        this.container = container;
        this.elements = [];
        this.selectedLineStyle = 'solid';
        this.init();
    }

    init() {
        this.createToolbar();
        this.setupEventListeners();
    }

    createToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = 'element-toolbar';

        const shapes = ['square', 'circle', 'triangle', 'pentagon'];
        const colors = ['#FF0000', '#FFA500', '#FFFF00', '#9ACD32', '#008000', 
                       '#00CED1', '#0000FF', '#4B0082', '#800080', '#FF00FF'];
        const borderStyles = ['solid', 'dashed', 'dotted', 'double'];
        const lineStyles = ['solid', 'dashed', 'dotted', 'arrow'];

        // Add shape options
        shapes.forEach(shape => {
            const shapeElement = document.createElement('div');
            shapeElement.className = `element-shape shape-${shape}`;
            shapeElement.dataset.shape = shape;
            toolbar.appendChild(shapeElement);
        });

        // Add color picker
        const colorPicker = document.createElement('div');
        colorPicker.className = 'color-picker';
        colors.forEach(color => {
            const colorOption = document.createElement('div');
            colorOption.className = 'color-option';
            colorOption.style.backgroundColor = color;
            colorOption.dataset.color = color;
            colorPicker.appendChild(colorOption);
        });
        toolbar.appendChild(colorPicker);

        // Add border style picker
        const borderPicker = document.createElement('div');
        borderPicker.className = 'border-style-picker';
        borderStyles.forEach(style => {
            const borderOption = document.createElement('div');
            borderOption.className = 'border-option';
            borderOption.textContent = style;
            borderOption.dataset.borderStyle = style;
            borderPicker.appendChild(borderOption);
        });
        toolbar.appendChild(borderPicker);

        // Add line style picker
        const linePicker = document.createElement('div');
        linePicker.className = 'line-style-picker';
        lineStyles.forEach(style => {
            const lineOption = document.createElement('div');
            lineOption.className = 'line-option';
            lineOption.textContent = style;
            lineOption.dataset.lineStyle = style;
            linePicker.appendChild(lineOption);
        });
        toolbar.appendChild(linePicker);

        this.container.appendChild(toolbar);
    }

    setupEventListeners() {
        this.container.addEventListener('click', (e) => {
            const shape = e.target.closest('.element-shape');
            const colorOption = e.target.closest('.color-option');
            const borderOption = e.target.closest('.border-option');
            const lineOption = e.target.closest('.line-option');

            if (shape) {
                const selectedColor = this.container.querySelector('.color-option.selected')?.dataset.color || '#FF0000';
                this.createNewElement('tooltip', shape.dataset.shape, selectedColor);
            } else if (colorOption) {
                this.container.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
                colorOption.classList.add('selected');
            } else if (borderOption) {
                this.container.querySelectorAll('.border-option').forEach(opt => opt.classList.remove('selected'));
                borderOption.classList.add('selected');
                this.selectedBorderStyle = borderOption.dataset.borderStyle;
            } else if (lineOption) {
                this.container.querySelectorAll('.line-option').forEach(opt => opt.classList.remove('selected'));
                lineOption.classList.add('selected');
                this.selectedLineStyle = lineOption.dataset.lineStyle;
            }
        });
    }

    createNewElement(type, shape, color) {
        const element = new WorkspaceElement(type, shape, color);
        element.workspace = this;
        element.element.__workspaceElement = element;
        if (this.selectedBorderStyle) {
            element.setBorderStyle(this.selectedBorderStyle);
        }
        this.elements.push(element);
        this.container.appendChild(element.element);
    }
}

// Initialize the workspace when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const workspaceContainer = document.querySelector('.workspace-container');
    if (workspaceContainer) {
        new Workspace(workspaceContainer);
    }
});
