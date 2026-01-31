/**
 * Main application bootstrap and game loop
 */

import * as THREE from 'three';
import { SceneManager } from './scene.js';
import { PhysicsWorld } from './physics.js';
import { TowerCrane } from './crane.js';
import { GameManager } from './game.js';
import { UI } from './ui.js';

class CraneOperatorGame {
    constructor() {
        this.container = document.getElementById('canvas-container');
        
        // Initialize systems
        this.ui = new UI();
        this.scene = new SceneManager(this.container);
        this.physics = new PhysicsWorld();
        this.crane = new TowerCrane(this.scene.scene);
        this.game = new GameManager(this.scene, this.physics, this.ui);

        // Control state
        this.controls = {
            slewLeft: false,
            slewRight: false,
            trolleyIn: false,
            trolleyOut: false,
            hoistUp: false,
            hoistDown: false
        };
        this.precisionMode = false;

        // Timing
        this.clock = new THREE.Clock();
        this.lastTime = 0;

        this.setupControls();
        this.setupResize();
        this.game.init();
        
        // Hide loading and start
        this.ui.hideLoading();
        this.animate();
    }

    setupControls() {
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    handleKeyDown(e) {
        switch (e.key) {
            case 'ArrowLeft':
                this.controls.slewLeft = true;
                e.preventDefault();
                break;
            case 'ArrowRight':
                this.controls.slewRight = true;
                e.preventDefault();
                break;
            case 'ArrowUp':
                this.controls.trolleyIn = true;
                e.preventDefault();
                break;
            case 'ArrowDown':
                this.controls.trolleyOut = true;
                e.preventDefault();
                break;
            case 'r':
            case 'R':
                this.controls.hoistUp = true;
                break;
            case 'f':
            case 'F':
                this.controls.hoistDown = true;
                break;
            case 'Shift':
                this.precisionMode = true;
                break;
            case ' ':
                e.preventDefault();
                this.handleSpaceKey();
                break;
            case 'c':
            case 'C':
                this.game.resetCurrentLoad();
                break;
            case 'w':
            case 'W':
                this.game.toggleWind();
                break;
            case 'v':
            case 'V':
                this.toggleCameraView();
                break;
        }
    }

    handleKeyUp(e) {
        switch (e.key) {
            case 'ArrowLeft':
                this.controls.slewLeft = false;
                break;
            case 'ArrowRight':
                this.controls.slewRight = false;
                break;
            case 'ArrowUp':
                this.controls.trolleyIn = false;
                break;
            case 'ArrowDown':
                this.controls.trolleyOut = false;
                break;
            case 'r':
            case 'R':
                this.controls.hoistUp = false;
                break;
            case 'f':
            case 'F':
                this.controls.hoistDown = false;
                break;
            case 'Shift':
                this.precisionMode = false;
                break;
        }
    }

    handleSpaceKey() {
        if (this.game.attachedLoad) {
            this.game.tryDetach();
        } else {
            const hookPos = this.crane.getHookPhysicsPosition();
            this.game.tryAttach(hookPos);
        }
    }

    toggleCameraView() {
        const cabPos = this.crane.getCabPosition();
        this.scene.toggleView(cabPos);
        
        const viewName = this.scene.currentView === 'orbit' ? 'Orbit View' : 'Cab View';
        this.ui.showMessage(viewName, 'info', 1500);
    }

    setupResize() {
        window.addEventListener('resize', () => {
            this.scene.handleResize();
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const deltaTime = this.clock.getDelta();

        // Update crane
        this.crane.update(this.controls, deltaTime, this.precisionMode);

        // Update physics
        this.physics.step(deltaTime);

        // Update game logic
        const hookPos = this.crane.getHookPhysicsPosition();
        this.game.update(deltaTime, hookPos);

        // Update camera if in cab view
        if (this.scene.currentView === 'cab') {
            this.scene.updateCabView(
                this.crane.getCabPosition(),
                this.crane.getJibRotation()
            );
        }

        // Update scene and render
        this.scene.update();
        this.scene.render();
    }
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new CraneOperatorGame();
    });
} else {
    new CraneOperatorGame();
}
