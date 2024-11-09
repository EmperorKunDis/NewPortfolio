class WorkspaceElement {
    constructor(type, shape, color) {
        this.type = type;
        this.shape = shape;
        this.color = color;
        this.locked = false;
        this.position = { x: 0, y: 0 };
        this.connections = [];
        this.borderStyle = 'solid';
        this.element = this.createElement();
        this.setupEventListeners();
    }

    createElement() {
        const element = document.createElement('div');
        element.className = 'draggable-element';
        element.style.cssText = `
            position: absolute;
            cursor: move;
            -webkit-user-select: none;
            user-select: none;
            min-width: 80px;
            min-height: 80px;
            background-color: var(--color-grey-5);
            border-radius: var(--br-sm-2);
            box-shadow: var(--box-shadow-1);
            color: var(--color-grey-2);
            transition: all .4s ease-in-out;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const shapeElement = document.createElement('div');
        shapeElement.className = `element-shape shape-${this.shape}`;
        shapeElement.style.setProperty('--element-color', this.color);
        element.appendChild(shapeElement);

        const icons = document.createElement('div');
        icons.className = 'element-icons';
        icons.style.cssText = `
            position: absolute;
            top: 5px;
            right: 5px;
            display: flex;
            gap: 5px;
            z-index: 2;
        `;
        
        const iconTypes = [
            { name: 'lock', icon: 'fa-lock', title: 'Lock/Unlock' },
            { name: 'edit', icon: 'fa-edit', title: 'Edit Text' },
            { name: 'copy', icon: 'fa-copy', title: 'Duplicate' },
            { name: 'move', icon: 'fa-arrows-alt', title: 'Move' },
            { name: 'connect', icon: 'fa-link', title: 'Connect' }
        ];

        iconTypes.forEach(({name, icon, title}) => {
            const iconElement = document.createElement('div');
            iconElement.className = `element-icon ${name}-icon`;
            iconElement.title = title;
            iconElement.innerHTML = `<i class="fas ${icon}"></i>`;
            iconElement.style.cssText = `
                width: 25px;
                height: 25px;
                border-radius: 50%;
                background: var(--color-grey-4);
                color: var(--color-grey-2);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all .4s ease-in-out;
            `;
            icons.appendChild(iconElement);
        });

        element.appendChild(icons);
        return element;
    }

    setupEventListeners() {
        let isDragging = false;
        let startX, startY, initialX, initialY;
        let isConnecting = false;

        this.element.addEventListener('mouseenter', () => {
            if (!this.locked) {
                this.element.style.transform = 'translateY(-5px)';
                this.element.style.boxShadow = '1px 4px 15px rgba(0,0,0,0.32)';
            }
        });

        this.element.addEventListener('mouseleave', () => {
            if (!this.locked) {
                this.element.style.transform = 'translateY(0)';
                this.element.style.boxShadow = 'var(--box-shadow-1)';
            }
        });

        const onMouseDown = (e) => {
            if (this.locked) return;
            
            const target = e.target.closest('.element-icon');
            if (target) {
                const iconType = Array.from(target.classList)
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

        const onMouseUp = () => {
            isDragging = false;
            if (isConnecting) {
                this.removeTempConnection();
                isConnecting = false;
            }
        };

        this.element.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    toggleLock() {
        this.locked = !this.locked;
        const lockIcon = this.element.querySelector('.lock-icon');
        lockIcon.style.color = this.locked ? 'var(--color-secondary)' : 'var(--color-grey-2)';
    }

    enableEditing() {
        if (this.locked) return;
        
        const textElement = document.createElement('div');
        textElement.contentEditable = true;
        textElement.className = 'editable-text';
        textElement.style.cssText = `
            min-width: 100px;
            min-height: 20px;
            padding: 0.5rem;
            color: var(--color-grey-2);
            background: var(--color-grey-5);
            border-radius: var(--br-sm-2);
            margin-top: 0.5rem;
            outline: none;
            border: 1px solid var(--color-grey-4);
        `;
        
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

    startConnection() {
        const line = document.createElement('div');
        line.className = 'connection-line';
        line.style.cssText = `
            position: absolute;
            height: 2px;
            background: var(--color-secondary);
            transform-origin: left center;
            pointer-events: none;
            z-index: 1;
        `;
        document.body.appendChild(line);
        this.tempConnection = line;
    }

    updateTempConnection(mouseX, mouseY) {
        if (!this.tempConnection) return;
        
        const rect = this.element.getBoundingClientRect();
        const startX = rect.left + rect.width / 2;
        const startY = rect.top + rect.height / 2;
        
        const angle = Math.atan2(mouseY - startY, mouseX - startX);
        const length = Math.sqrt(Math.pow(mouseX - startX, 2) + Math.pow(mouseY - startY, 2));
        
        this.tempConnection.style.width = `${length}px`;
        this.tempConnection.style.left = `${startX}px`;
        this.tempConnection.style.top = `${startY}px`;
        this.tempConnection.style.transform = `rotate(${angle}rad)`;
    }

    removeTempConnection() {
        if (this.tempConnection) {
            this.tempConnection.remove();
            this.tempConnection = null;
        }
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
}

class Workspace {
    constructor(container) {
        this.container = container;
        this.elements = [];
        this.selectedLineStyle = 'solid';
        this.selectedColor = '#FF0000';
        this.selectedShape = 'square';
        this.init();
    }

    init() {
        this.setupStyles();
        this.createToolbar();
        this.setupEventListeners();
        this.setupThemeListener();
    }

    setupStyles() {
        const styleSheet = document.createElement("style");
        styleSheet.textContent = `
            .workspace-container {
                padding-top: 3.5rem;
                padding-bottom: 3.5rem;
                width: calc(100% - 10%);
                margin: 0 auto;
                min-height: calc(100vh - 7rem);
            }

            .workspace-panel {
                width: 100%;
                height: calc(100vh - 200px);
                background: var(--color-primary);
                border: 1px solid var(--color-grey-4);
                border-radius: var(--br-sm-2);
                box-shadow: var(--box-shadow-1);
                position: relative;
                overflow: hidden;
                transition: all .4s ease-in-out;
            }

            .element-toolbar {
                position: absolute;
                top: 0;
                left: 0;
                width: 200px;
                height: 100%;
                background: var(--color-grey-5);
                border-right: 1px solid var(--color-grey-4);
                padding: 1rem;
                z-index: 10;
                transition: all .4s ease-in-out;
            }

            .toolbar-section {
                margin-bottom: 2rem;
            }

            .section-title {
                color: var(--color-grey-2);
                font-size: 1rem;
                margin-bottom: 1rem;
                text-transform: uppercase;
            }

            .shape-items, .color-items, .border-items {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 0.5rem;
            }

            .color-items {
                grid-template-columns: repeat(5, 1fr);
            }

            .element-shape {
                width: 60px;
                height: 60px;
                margin: 10px;
                transition: all .4s ease-in-out;
                border: 2px solid var(--color-grey-4);
            }

            .shape-square { }
            
            .shape-circle {
                border-radius: 50%;
            }
            
            .shape-triangle {
                clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
            }
            
            .shape-pentagon {
                clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
            }

            .connection-line {
                position: absolute;
                height: 2px;
                background: var(--color-secondary);
                z-index: 1;
            }
        `;
        document.head.appendChild(styleSheet);
    }

    setupThemeListener() {
        const themeBtn = document.querySelector('.theme-btn');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                requestAnimationFrame(() => {
                    Array.from(document.querySelectorAll('.draggable-element')).forEach(element => {
                        element.style.backgroundColor = 'var(--color-grey-5)';
                        element.style.color = 'var(--color-grey-2)';
                    });
                });
            });
        }
    }

    createToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = 'element-toolbar';

        const sections = [
            {
                title: 'Shapes',
                items: ['square', 'circle', 'triangle', 'pentagon'],
                type: 'shape'
            },
            {
                title: 'Colors',
                items: ['#FF0000', '#FFA500', '#FFFF00', '#9ACD32', '#008000', 
                       '#00CED1', '#0000FF', '#4B0082', '#800080', '#FF00FF'],
                type: 'color'
            },
            {
                title: 'Border Styles',
                items: ['solid', 'dashed', 'dotted', 'double'],
                type: 'border'
            }
        ];

        sections.forEach(section => {
            const sectionEl = this.createToolbarSection(section);
            toolbar.appendChild(sectionEl);
        });

        this.container.appendChild(toolbar);
    }

    createToolbarSection({ title, items, type }) {
        const section = document.createElement('div');
        section.className = 'toolbar-section';
        
        const titleEl = document.createElement('h4');
        titleEl.className = 'section-title';
        titleEl.textContent = title;
        section.appendChild(titleEl);

        const itemsContainer = document.createElement('div');
        itemsContainer.className = `${type}-items`;

        items.forEach(item => {
            const button = this.createToolbarButton(item, type);
            itemsContainer.appendChild(button);
        });

        section.appendChild(itemsContainer);
        return section;
    }

    createToolbarButton(item, type) {
        const button = document.createElement('button');
        button.className = 'main-btn';
        button.style.cssText = `
            padding: 0.5rem;
            border: 1px solid var(--color-grey-4);
            border-radius: var(--br-sm-2);
            background: var(--color-grey-5);
            color: var(--color-grey-2);
            cursor: pointer;
            transition: all .4s ease-in-out;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        if (type === 'color') {
            button.style.backgroundColor = item;
            button.style.width = '30px';
            button.style.height = '30px';
            button.style.borderRadius = '50%';
            button.style.padding = '0';
        } else {
            button.textContent = item;
        }

        button.addEventListener('click', () => {
            if (type === 'shape') {
                this.selectedShape = item;
                this.createNewElement('tooltip', item, this.selectedColor);
            } else if (type === 'color') {
                this.selectedColor = item;
                button.style.border = '2px solid var(--color-secondary)';
                // Reset other color buttons
                const otherButtons = button.parentElement.querySelectorAll('button');
                otherButtons.forEach(btn => {
                    if (btn !== button) {
                        btn.style.border = '1px solid var(--color-grey-4)';
                    }
                });
            } else if (type === 'border') {
                this.selectedBorderStyle = item;
                button.style.backgroundColor = 'var(--color-secondary)';
                button.style.color = 'var(--color-primary)';
                // Reset other border style buttons
                const otherButtons = button.parentElement.querySelectorAll('button');
                otherButtons.forEach(btn => {
                    if (btn !== button) {
                        btn.style.backgroundColor = 'var(--color-grey-5)';
                        btn.style.color = 'var(--color-grey-2)';
                    }
                });
            }
        });

        button.addEventListener('mouseenter', () => {
            if (type !== 'color' || this.selectedColor !== item) {
                button.style.transform = 'translateY(-3px)';
                button.style.boxShadow = 'var(--box-shadow-1)';
            }
        });

        button.addEventListener('mouseleave', () => {
            if (type !== 'color' || this.selectedColor !== item) {
                button.style.transform = 'translateY(0)';
                button.style.boxShadow = 'none';
            }
        });

        return button;
    }

    createNewElement(type, shape, color) {
        const element = new WorkspaceElement(type, shape, color);
        element.workspace = this;
        element.element.__workspaceElement = element;

        // Position new element in view
        const toolbar = this.container.querySelector('.element-toolbar');
        const toolbarWidth = toolbar.offsetWidth;
        element.position.x = toolbarWidth + 50;
        element.position.y = 50;
        element.element.style.left = `${element.position.x}px`;
        element.element.style.top = `${element.position.y}px`;

        if (this.selectedBorderStyle) {
            element.element.querySelector('.element-shape').style.borderStyle = this.selectedBorderStyle;
        }

        this.elements.push(element);
        this.container.appendChild(element.element);
    }

    setupEventListeners() {
        // Prevent text selection during drag
        this.container.addEventListener('mousedown', (e) => {
            if (e.target.closest('.draggable-element')) {
                e.preventDefault();
            }
        });

        // Handle workspace scrolling
        let isScrolling = false;
        let scrollStartX, scrollStartY;
        let initialScrollLeft, initialScrollTop;

        this.container.addEventListener('mousedown', (e) => {
            if (!e.target.closest('.draggable-element') && !e.target.closest('.element-toolbar')) {
                isScrolling = true;
                scrollStartX = e.pageX;
                scrollStartY = e.pageY;
                initialScrollLeft = this.container.scrollLeft;
                initialScrollTop = this.container.scrollTop;
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isScrolling) {
                const dx = e.pageX - scrollStartX;
                const dy = e.pageY - scrollStartY;
                this.container.scrollLeft = initialScrollLeft - dx;
                this.container.scrollTop = initialScrollTop - dy;
            }
        });

        document.addEventListener('mouseup', () => {
            isScrolling = false;
        });

        // Handle zoom (if needed)
        this.container.addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                const scale = e.deltaY > 0 ? 0.9 : 1.1;
                this.elements.forEach(element => {
                    const currentScale = element.element.style.transform.match(/scale\((.*?)\)/) || [null, '1'];
                    const newScale = parseFloat(currentScale[1]) * scale;
                    element.element.style.transform = `scale(${newScale})`;
                });
            }
        });
    }
}

// Initialize workspace when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const workspaceContainer = document.querySelector('.workspace-panel');
    if (workspaceContainer) {
        new Workspace(workspaceContainer);
    }
});