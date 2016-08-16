/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
'use strict';

import invariant from 'invariant';

function getEventClientTouchOffset (e) {
    if (e.targetTouches.length === 1) {
        return getEventClientOffset(e.targetTouches[0]);
    }
}

function getEventClientOffset (e) {
    if (e.targetTouches) {
        return getEventClientTouchOffset(e);
    } else {
        return {
            x: e.clientX,
            y: e.clientY
        };
    }
}

const ELEMENT_NODE = 1;
function getNodeClientOffset (node) {
    const el = node.nodeType === ELEMENT_NODE
        ? node
        : node.parentElement;

    if (!el) {
        return null;
    }

    const { top, left } = el.getBoundingClientRect();
    return { x: left, y: top };
}

const eventNames = {
    mouse: {
        start: 'mousedown',
        move: 'mousemove',
        end: 'mouseup'
    },
    touch: {
        start: 'touchstart',
        move: 'touchmove',
        end: 'touchend'
    }
};

export class TouchBackend {
    constructor (manager, options = {}) {
        options.delayTouchStart = options.delayTouchStart || options.delay;

        options = {
            enableTouchEvents: true,
            enableMouseEvents: false,
            delayTouchStart: 0,
            delayMouseStart: 0,
            ...options
        };

        this.actions = manager.getActions();
        this.monitor = manager.getMonitor();
        this.registry = manager.getRegistry();

        this.delayTouchStart = options.delayTouchStart;
        this.delayMouseStart = options.delayMouseStart;
        this.sourceNodes = {};
        this.sourceNodeOptions = {};
        this.sourcePreviewNodes = {};
        this.sourcePreviewNodeOptions = {};
        this.targetNodeOptions = {};
        this.listenerTypes = [];
        this._mouseClientOffset = {};

        if (options.enableMouseEvents) {
            this.listenerTypes.push('mouse');
        }

        if (options.enableTouchEvents) {
            this.listenerTypes.push('touch');
        }

        this.getSourceClientOffset = this.getSourceClientOffset.bind(this);
        this.handleTopMoveStart = this.handleTopMoveStart.bind(this);
        this.handleTopMoveStartDelay = this.handleTopMoveStartDelay.bind(this);
        this.handleTopMoveStartCapture = this.handleTopMoveStartCapture.bind(this);
        this.handleTopMoveCapture = this.handleTopMoveCapture.bind(this);
        this.handleTopMove = this.handleTopMove.bind(this);
        this.handleTopMoveEndCapture = this.handleTopMoveEndCapture.bind(this);
    }

    setup () {
        if (typeof window === 'undefined') {
            return;
        }

        invariant(!this.constructor.isSetUp, 'Cannot have two Touch backends at the same time.');
        this.constructor.isSetUp = true;        

        this.addEventListener(window, 'start', this.getTopMoveStartHandler());
        this.addEventListener(window, 'start', this.handleTopMoveStartCapture, true);
        this.addEventListener(window, 'move',  this.handleTopMove);
        this.addEventListener(window, 'move',  this.handleTopMoveCapture, true);
        this.addEventListener(window, 'end',   this.handleTopMoveEndCapture, true);
    }

    teardown () {
        if (typeof window === 'undefined') {
            return;
        }

        this.constructor.isSetUp = false;
        this._mouseClientOffset = {};

        this.removeEventListener(window, 'start', this.handleTopMoveStartCapture, true);
        this.removeEventListener(window, 'start', this.handleTopMoveStart);
        this.removeEventListener(window, 'move',  this.handleTopMoveCapture, true);
        this.removeEventListener(window, 'move',  this.handleTopMove);
        this.removeEventListener(window, 'end',   this.handleTopMoveEndCapture, true);

        this.uninstallSourceNodeRemovalObserver();
    }

    addEventListener (subject, event, handler, capture) {
        this.listenerTypes.forEach(function (listenerType) {
            subject.addEventListener(eventNames[listenerType][event], handler, capture);
        });
    }

    removeEventListener (subject, event, handler, capture) {
        this.listenerTypes.forEach(function (listenerType) {
            subject.removeEventListener(eventNames[listenerType][event], handler, capture);
        });
    }

    connectDragSource (sourceId, node, options) {
        const handleMoveStart = this.handleMoveStart.bind(this, sourceId);
        this.sourceNodes[sourceId] = node;

        this.addEventListener(node, 'start', handleMoveStart);

        return () => {
            delete this.sourceNodes[sourceId];
            this.removeEventListener(node, 'start', handleMoveStart);
        };
    }

    connectDragPreview (sourceId, node, options) {
        this.sourcePreviewNodeOptions[sourceId] = options;
        this.sourcePreviewNodes[sourceId] = node;

        return () => {
            delete this.sourcePreviewNodes[sourceId];
            delete this.sourcePreviewNodeOptions[sourceId];
        };
    }

    connectDropTarget (targetId, node) {
        const handleMove = (e) => {
            let coords;

            /**
             * Grab the coordinates for the current mouse/touch position
             */
            switch (e.type) {
            case eventNames.mouse.move:
                coords = { x: e.clientX, y: e.clientY };
                break;

            case eventNames.touch.move:
                coords = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                break;
            default:
            }

            /**
             * Use the coordinates to grab the element the drag ended on.
             * If the element's parent is the same as the target node then we have hit a drop target and can handle the move.
             */
            if (document.elementFromPoint(coords.x, coords.y).parentNode === node) {
                return this.handleMove(e, targetId);
            }
        };

        /**
         * Attaching the event listener to the body so that touchmove will work while dragging over multiple target elements.
         */
        this.addEventListener(document.querySelector('body'), 'move', handleMove);


        return () => {
            this.removeEventListener(document.querySelector('body'), 'move', handleMove);
        };
    }

    getSourceClientOffset (sourceId) {
        return getNodeClientOffset(this.sourceNodes[sourceId]);
    }

    handleTopMoveStartCapture (e) {
        this.moveStartSourceIds = [];
    }

    handleMoveStart (sourceId) {
        this.moveStartSourceIds.unshift(sourceId);
    }

    getTopMoveStartHandler () {
        if (!this.delayTouchStart && !this.delayMouseStart) {
            return this.handleTopMoveStart;
        }

        return this.handleTopMoveStartDelay;
    }

    handleTopMoveStart (e) {
        // Don't prematurely preventDefault() here since it might:
        // 1. Mess up scrolling
        // 2. Mess up long tap (which brings up context menu)
        // 3. If there's an anchor link as a child, tap won't be triggered on link

        const clientOffset = getEventClientOffset(e);
        if (clientOffset) {
            this._mouseClientOffset = clientOffset;
        }
    }

    handleTopMoveStartDelay (e) {
        const delay = (e.type === eventNames.touch.start) 
            ? this.delayTouchStart
            : this.delayMouseStart;
        this.timeout = setTimeout(this.handleTopMoveStart.bind(this, e), delay);
    }

    handleTopMoveCapture (e) {
        this.dragOverTargetIds = [];
    }

    handleMove( e, targetId ) {
        this.dragOverTargetIds.unshift( targetId );
    }

    handleTopMove (e) {
        clearTimeout(this.timeout);

        const { moveStartSourceIds, dragOverTargetIds } = this;
        const clientOffset = getEventClientOffset(e);

        if (!clientOffset) {
            return;
        }


        // If we're not dragging and we've moved a little, that counts as a drag start
        if (
            !this.monitor.isDragging() &&
            this._mouseClientOffset.hasOwnProperty('x') &&
            moveStartSourceIds &&
            (
                this._mouseClientOffset.x !== clientOffset.x ||
                this._mouseClientOffset.y !== clientOffset.y
            )
        ) {
            this.moveStartSourceIds = null;
            this.actions.beginDrag(moveStartSourceIds, {
                clientOffset: this._mouseClientOffset,
                getSourceClientOffset: this.getSourceClientOffset,
                publishSource: false
            });
        }

        if (!this.monitor.isDragging()) {
            return;
        }

        const sourceNode = this.sourceNodes[this.monitor.getSourceId()];
        this.installSourceNodeRemovalObserver(sourceNode);
        this.actions.publishDragSource();

        e.preventDefault();

        /*const matchingTargetIds = Object.keys(this.targetNodes)
            .filter((targetId) => {
                const boundingRect = this.targetNodes[targetId].getBoundingClientRect();
                return clientOffset.x >= boundingRect.left &&
                clientOffset.x <= boundingRect.right &&
                clientOffset.y >= boundingRect.top &&
                clientOffset.y <= boundingRect.bottom;
            });
        */

        this.actions.hover(dragOverTargetIds, {
            clientOffset: clientOffset
        });
    }

    handleTopMoveEndCapture (e) {
        if (!this.monitor.isDragging() || this.monitor.didDrop()) {
            this.moveStartSourceIds = null;
            return;
        }

        e.preventDefault();

        this._mouseClientOffset = {};

        this.uninstallSourceNodeRemovalObserver();
        this.actions.drop();
        this.actions.endDrag();
    }

    installSourceNodeRemovalObserver (node) {
        this.uninstallSourceNodeRemovalObserver();

        this.draggedSourceNode = node;
        this.draggedSourceNodeRemovalObserver = new window.MutationObserver(() => {
            if (!node.parentElement) {
                this.resurrectSourceNode();
                this.uninstallSourceNodeRemovalObserver();
            }
        });

        if (!node || !node.parentElement) {
            return;
        }

        this.draggedSourceNodeRemovalObserver.observe(
            node.parentElement,
            { childList: true }
        );
    }

    resurrectSourceNode () {
        this.draggedSourceNode.style.display = 'none';
        this.draggedSourceNode.removeAttribute('data-reactid');
        document.body.appendChild(this.draggedSourceNode);
    }

    uninstallSourceNodeRemovalObserver () {
        if (this.draggedSourceNodeRemovalObserver) {
            this.draggedSourceNodeRemovalObserver.disconnect();
        }

        this.draggedSourceNodeRemovalObserver = null;
        this.draggedSourceNode = null;
    }
}

export default function createTouchBackend (optionsOrManager = {}) {
    const touchBackendFactory = function (manager) {
        return new TouchBackend(manager, optionsOrManager);
    };

    if (optionsOrManager.getMonitor) {
        return touchBackendFactory(optionsOrManager);
    } else {
        return touchBackendFactory;
    }
}