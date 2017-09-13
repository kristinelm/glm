(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.reactDndTouchBackend = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function(condition, format, a, b, c, d, e, f) {
  if (process.env.NODE_ENV !== 'production') {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;

}).call(this,require('_process'))

},{"_process":1}],3:[function(require,module,exports){
/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TouchBackend = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports['default'] = createTouchBackend;

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function getEventClientTouchOffset(e) {
    if (e.targetTouches.length === 1) {
        return getEventClientOffset(e.targetTouches[0]);
    }
}

function getEventClientOffset(e) {
    if (e.targetTouches) {
        return getEventClientTouchOffset(e);
    } else {
        return {
            x: e.clientX,
            y: e.clientY
        };
    }
}

var ELEMENT_NODE = 1;
function getNodeClientOffset(node) {
    var el = node.nodeType === ELEMENT_NODE ? node : node.parentElement;

    if (!el) {
        return null;
    }

    var _el$getBoundingClient = el.getBoundingClientRect();

    var top = _el$getBoundingClient.top;
    var left = _el$getBoundingClient.left;

    return { x: left, y: top };
}

var eventNames = {
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

var TouchBackend = exports.TouchBackend = function () {
    function TouchBackend(manager) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, TouchBackend);

        options = _extends({
            enableTouchEvents: true,
            enableMouseEvents: false,
            delay: 0
        }, options);

        this.actions = manager.getActions();
        this.monitor = manager.getMonitor();
        this.registry = manager.getRegistry();

        this.delay = options.delay;
        this.sourceNodes = {};
        this.sourceNodeOptions = {};
        this.sourcePreviewNodes = {};
        this.sourcePreviewNodeOptions = {};
        this.targetNodes = {};
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
        this.handleTopMoveEndCapture = this.handleTopMoveEndCapture.bind(this);
    }

    _createClass(TouchBackend, [{
        key: 'setup',
        value: function setup() {
            if (typeof window === 'undefined') {
                return;
            }

            (0, _invariant2['default'])(!this.constructor.isSetUp, 'Cannot have two Touch backends at the same time.');
            this.constructor.isSetUp = true;

            var startHandler = this.delay ? this.handleTopMoveStartDelay : this.handleTopMoveStart;

            this.addEventListener(window, 'start', startHandler);
            this.addEventListener(window, 'start', this.handleTopMoveStartCapture, true);
            this.addEventListener(window, 'move', this.handleTopMoveCapture, true);
            this.addEventListener(window, 'end', this.handleTopMoveEndCapture, true);
        }
    }, {
        key: 'teardown',
        value: function teardown() {
            if (typeof window === 'undefined') {
                return;
            }

            this.constructor.isSetUp = false;
            this._mouseClientOffset = {};

            this.removeEventListener(window, 'start', this.handleTopMoveStartCapture, true);
            this.removeEventListener(window, 'start', this.handleTopMoveStart);
            this.removeEventListener(window, 'move', this.handleTopMoveCapture, true);
            this.removeEventListener(window, 'end', this.handleTopMoveEndCapture, true);

            this.uninstallSourceNodeRemovalObserver();
        }
    }, {
        key: 'addEventListener',
        value: function addEventListener(subject, event, handler, capture) {
            this.listenerTypes.forEach(function (listenerType) {
                subject.addEventListener(eventNames[listenerType][event], handler, capture);
            });
        }
    }, {
        key: 'removeEventListener',
        value: function removeEventListener(subject, event, handler, capture) {
            this.listenerTypes.forEach(function (listenerType) {
                subject.removeEventListener(eventNames[listenerType][event], handler, capture);
            });
        }
    }, {
        key: 'connectDragSource',
        value: function connectDragSource(sourceId, node, options) {
            var _this = this;

            var handleMoveStart = this.handleMoveStart.bind(this, sourceId);
            this.sourceNodes[sourceId] = node;

            this.addEventListener(node, 'start', handleMoveStart);

            return function () {
                delete _this.sourceNodes[sourceId];
                _this.removeEventListener(node, 'start', handleMoveStart);
            };
        }
    }, {
        key: 'connectDragPreview',
        value: function connectDragPreview(sourceId, node, options) {
            var _this2 = this;

            this.sourcePreviewNodeOptions[sourceId] = options;
            this.sourcePreviewNodes[sourceId] = node;

            return function () {
                delete _this2.sourcePreviewNodes[sourceId];
                delete _this2.sourcePreviewNodeOptions[sourceId];
            };
        }
    }, {
        key: 'connectDropTarget',
        value: function connectDropTarget(targetId, node) {
            var _this3 = this;

            this.targetNodes[targetId] = node;

            return function () {
                delete _this3.targetNodes[targetId];
            };
        }
    }, {
        key: 'getSourceClientOffset',
        value: function getSourceClientOffset(sourceId) {
            return getNodeClientOffset(this.sourceNodes[sourceId]);
        }
    }, {
        key: 'handleTopMoveStartCapture',
        value: function handleTopMoveStartCapture(e) {
            this.moveStartSourceIds = [];
        }
    }, {
        key: 'handleMoveStart',
        value: function handleMoveStart(sourceId) {
            this.moveStartSourceIds.unshift(sourceId);
        }
    }, {
        key: 'handleTopMoveStart',
        value: function handleTopMoveStart(e) {
            // Don't prematurely preventDefault() here since it might:
            // 1. Mess up scrolling
            // 2. Mess up long tap (which brings up context menu)
            // 3. If there's an anchor link as a child, tap won't be triggered on link

            var clientOffset = getEventClientOffset(e);
            if (clientOffset) {
                this._mouseClientOffset = clientOffset;
            }
        }
    }, {
        key: 'handleTopMoveStartDelay',
        value: function handleTopMoveStartDelay(e) {
            this.timeout = setTimeout(this.handleTopMoveStart.bind(this, e), this.delay);
        }
    }, {
        key: 'handleTopMoveCapture',
        value: function handleTopMoveCapture(e) {
            var _this4 = this;

            clearTimeout(this.timeout);

            var moveStartSourceIds = this.moveStartSourceIds;

            var clientOffset = getEventClientOffset(e);

            if (!clientOffset) {
                return;
            }

            // If we're not dragging and we've moved a little, that counts as a drag start
            if (!this.monitor.isDragging() && this._mouseClientOffset.hasOwnProperty('x') && moveStartSourceIds && (this._mouseClientOffset.x !== clientOffset.x || this._mouseClientOffset.y !== clientOffset.y)) {
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

            var sourceNode = this.sourceNodes[this.monitor.getSourceId()];
            this.installSourceNodeRemovalObserver(sourceNode);
            this.actions.publishDragSource();

            e.preventDefault();

            var matchingTargetIds = Object.keys(this.targetNodes).filter(function (targetId) {
                var boundingRect = _this4.targetNodes[targetId].getBoundingClientRect();
                return clientOffset.x >= boundingRect.left && clientOffset.x <= boundingRect.right && clientOffset.y >= boundingRect.top && clientOffset.y <= boundingRect.bottom;
            });

            this.actions.hover(matchingTargetIds, {
                clientOffset: clientOffset
            });
        }
    }, {
        key: 'handleTopMoveEndCapture',
        value: function handleTopMoveEndCapture(e) {
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
    }, {
        key: 'installSourceNodeRemovalObserver',
        value: function installSourceNodeRemovalObserver(node) {
            var _this5 = this;

            this.uninstallSourceNodeRemovalObserver();

            this.draggedSourceNode = node;
            this.draggedSourceNodeRemovalObserver = new window.MutationObserver(function () {
                if (!node.parentElement) {
                    _this5.resurrectSourceNode();
                    _this5.uninstallSourceNodeRemovalObserver();
                }
            });

            if (!node || !node.parentElement) {
                return;
            }

            this.draggedSourceNodeRemovalObserver.observe(node.parentElement, { childList: true });
        }
    }, {
        key: 'resurrectSourceNode',
        value: function resurrectSourceNode() {
            this.draggedSourceNode.style.display = 'none';
            this.draggedSourceNode.removeAttribute('data-reactid');
            document.body.appendChild(this.draggedSourceNode);
        }
    }, {
        key: 'uninstallSourceNodeRemovalObserver',
        value: function uninstallSourceNodeRemovalObserver() {
            if (this.draggedSourceNodeRemovalObserver) {
                this.draggedSourceNodeRemovalObserver.disconnect();
            }

            this.draggedSourceNodeRemovalObserver = null;
            this.draggedSourceNode = null;
        }
    }]);

    return TouchBackend;
}();

function createTouchBackend() {
    var optionsOrManager = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var touchBackendFactory = function touchBackendFactory(manager) {
        return new TouchBackend(manager, optionsOrManager);
    };

    if (optionsOrManager.getMonitor) {
        return touchBackendFactory(optionsOrManager);
    } else {
        return touchBackendFactory;
    }
}

},{"invariant":2}]},{},[3])(3)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2ludmFyaWFudC9icm93c2VyLmpzIiwic3JjL1RvdWNoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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SyxnQ0FBTCxDQUFzQyxPQUF0QyxDQUNJLEtBQUssYUFBTCxFQUNBLEVBQUUsV0FBVyxJQUFYLEVBRk4sRUFmb0M7Ozs7OENBcUJqQjtBQUNuQixpQkFBSyxpQkFBTCxDQUF1QixLQUF2QixDQUE2QixPQUE3QixHQUF1QyxNQUF2QyxDQURtQjtBQUVuQixpQkFBSyxpQkFBTCxDQUF1QixlQUF2QixDQUF1QyxjQUF2QyxFQUZtQjtBQUduQixxQkFBUyxJQUFULENBQWMsV0FBZCxDQUEwQixLQUFLLGlCQUFMLENBQTFCLENBSG1COzs7OzZEQU1lO0FBQ2xDLGdCQUFJLEtBQUssZ0NBQUwsRUFBdUM7QUFDdkMscUJBQUssZ0NBQUwsQ0FBc0MsVUFBdEMsR0FEdUM7YUFBM0M7O0FBSUEsaUJBQUssZ0NBQUwsR0FBd0MsSUFBeEMsQ0FMa0M7QUFNbEMsaUJBQUssaUJBQUwsR0FBeUIsSUFBekIsQ0FOa0M7Ozs7V0E5TzdCOzs7QUF3UEUsU0FBUyxrQkFBVCxHQUFvRDtRQUF2Qix5RUFBbUIsa0JBQUk7O0FBQy9ELFFBQU0sc0JBQXNCLFNBQXRCLG1CQUFzQixDQUFVLE9BQVYsRUFBbUI7QUFDM0MsZUFBTyxJQUFJLFlBQUosQ0FBaUIsT0FBakIsRUFBMEIsZ0JBQTFCLENBQVAsQ0FEMkM7S0FBbkIsQ0FEbUM7O0FBSy9ELFFBQUksaUJBQWlCLFVBQWpCLEVBQTZCO0FBQzdCLGVBQU8sb0JBQW9CLGdCQUFwQixDQUFQLENBRDZCO0tBQWpDLE1BRU87QUFDSCxlQUFPLG1CQUFQLENBREc7S0FGUDtDQUxXIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBzZXRUaW1lb3V0KGRyYWluUXVldWUsIDApO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiLyoqXG4gKiBDb3B5cmlnaHQgMjAxMy0yMDE1LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBCU0Qtc3R5bGUgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS4gQW4gYWRkaXRpb25hbCBncmFudFxuICogb2YgcGF0ZW50IHJpZ2h0cyBjYW4gYmUgZm91bmQgaW4gdGhlIFBBVEVOVFMgZmlsZSBpbiB0aGUgc2FtZSBkaXJlY3RvcnkuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFVzZSBpbnZhcmlhbnQoKSB0byBhc3NlcnQgc3RhdGUgd2hpY2ggeW91ciBwcm9ncmFtIGFzc3VtZXMgdG8gYmUgdHJ1ZS5cbiAqXG4gKiBQcm92aWRlIHNwcmludGYtc3R5bGUgZm9ybWF0IChvbmx5ICVzIGlzIHN1cHBvcnRlZCkgYW5kIGFyZ3VtZW50c1xuICogdG8gcHJvdmlkZSBpbmZvcm1hdGlvbiBhYm91dCB3aGF0IGJyb2tlIGFuZCB3aGF0IHlvdSB3ZXJlXG4gKiBleHBlY3RpbmcuXG4gKlxuICogVGhlIGludmFyaWFudCBtZXNzYWdlIHdpbGwgYmUgc3RyaXBwZWQgaW4gcHJvZHVjdGlvbiwgYnV0IHRoZSBpbnZhcmlhbnRcbiAqIHdpbGwgcmVtYWluIHRvIGVuc3VyZSBsb2dpYyBkb2VzIG5vdCBkaWZmZXIgaW4gcHJvZHVjdGlvbi5cbiAqL1xuXG52YXIgaW52YXJpYW50ID0gZnVuY3Rpb24oY29uZGl0aW9uLCBmb3JtYXQsIGEsIGIsIGMsIGQsIGUsIGYpIHtcbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICBpZiAoZm9ybWF0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW52YXJpYW50IHJlcXVpcmVzIGFuIGVycm9yIG1lc3NhZ2UgYXJndW1lbnQnKTtcbiAgICB9XG4gIH1cblxuICBpZiAoIWNvbmRpdGlvbikge1xuICAgIHZhciBlcnJvcjtcbiAgICBpZiAoZm9ybWF0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGVycm9yID0gbmV3IEVycm9yKFxuICAgICAgICAnTWluaWZpZWQgZXhjZXB0aW9uIG9jY3VycmVkOyB1c2UgdGhlIG5vbi1taW5pZmllZCBkZXYgZW52aXJvbm1lbnQgJyArXG4gICAgICAgICdmb3IgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZSBhbmQgYWRkaXRpb25hbCBoZWxwZnVsIHdhcm5pbmdzLidcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBhcmdzID0gW2EsIGIsIGMsIGQsIGUsIGZdO1xuICAgICAgdmFyIGFyZ0luZGV4ID0gMDtcbiAgICAgIGVycm9yID0gbmV3IEVycm9yKFxuICAgICAgICBmb3JtYXQucmVwbGFjZSgvJXMvZywgZnVuY3Rpb24oKSB7IHJldHVybiBhcmdzW2FyZ0luZGV4KytdOyB9KVxuICAgICAgKTtcbiAgICAgIGVycm9yLm5hbWUgPSAnSW52YXJpYW50IFZpb2xhdGlvbic7XG4gICAgfVxuXG4gICAgZXJyb3IuZnJhbWVzVG9Qb3AgPSAxOyAvLyB3ZSBkb24ndCBjYXJlIGFib3V0IGludmFyaWFudCdzIG93biBmcmFtZVxuICAgIHRocm93IGVycm9yO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGludmFyaWFudDtcbiIsIi8qKlxuICogQ29weXJpZ2h0IDIwMTUsIFlhaG9vIEluYy5cbiAqIENvcHlyaWdodHMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLiBTZWUgdGhlIGFjY29tcGFueWluZyBMSUNFTlNFIGZpbGUgZm9yIHRlcm1zLlxuICovXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnaW52YXJpYW50JztcblxuZnVuY3Rpb24gZ2V0RXZlbnRDbGllbnRUb3VjaE9mZnNldCAoZSkge1xuICAgIGlmIChlLnRhcmdldFRvdWNoZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHJldHVybiBnZXRFdmVudENsaWVudE9mZnNldChlLnRhcmdldFRvdWNoZXNbMF0pO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZ2V0RXZlbnRDbGllbnRPZmZzZXQgKGUpIHtcbiAgICBpZiAoZS50YXJnZXRUb3VjaGVzKSB7XG4gICAgICAgIHJldHVybiBnZXRFdmVudENsaWVudFRvdWNoT2Zmc2V0KGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiBlLmNsaWVudFgsXG4gICAgICAgICAgICB5OiBlLmNsaWVudFlcbiAgICAgICAgfTtcbiAgICB9XG59XG5cbmNvbnN0IEVMRU1FTlRfTk9ERSA9IDE7XG5mdW5jdGlvbiBnZXROb2RlQ2xpZW50T2Zmc2V0IChub2RlKSB7XG4gICAgY29uc3QgZWwgPSBub2RlLm5vZGVUeXBlID09PSBFTEVNRU5UX05PREVcbiAgICAgICAgPyBub2RlXG4gICAgICAgIDogbm9kZS5wYXJlbnRFbGVtZW50O1xuXG4gICAgaWYgKCFlbCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCB7IHRvcCwgbGVmdCB9ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgcmV0dXJuIHsgeDogbGVmdCwgeTogdG9wIH07XG59XG5cbmNvbnN0IGV2ZW50TmFtZXMgPSB7XG4gICAgbW91c2U6IHtcbiAgICAgICAgc3RhcnQ6ICdtb3VzZWRvd24nLFxuICAgICAgICBtb3ZlOiAnbW91c2Vtb3ZlJyxcbiAgICAgICAgZW5kOiAnbW91c2V1cCdcbiAgICB9LFxuICAgIHRvdWNoOiB7XG4gICAgICAgIHN0YXJ0OiAndG91Y2hzdGFydCcsXG4gICAgICAgIG1vdmU6ICd0b3VjaG1vdmUnLFxuICAgICAgICBlbmQ6ICd0b3VjaGVuZCdcbiAgICB9XG59O1xuXG5leHBvcnQgY2xhc3MgVG91Y2hCYWNrZW5kIHtcbiAgICBjb25zdHJ1Y3RvciAobWFuYWdlciwgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIG9wdGlvbnMgPSB7XG4gICAgICAgICAgICBlbmFibGVUb3VjaEV2ZW50czogdHJ1ZSxcbiAgICAgICAgICAgIGVuYWJsZU1vdXNlRXZlbnRzOiBmYWxzZSxcbiAgICAgICAgICAgIGRlbGF5OiAwLFxuICAgICAgICAgICAgLi4ub3B0aW9uc1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuYWN0aW9ucyA9IG1hbmFnZXIuZ2V0QWN0aW9ucygpO1xuICAgICAgICB0aGlzLm1vbml0b3IgPSBtYW5hZ2VyLmdldE1vbml0b3IoKTtcbiAgICAgICAgdGhpcy5yZWdpc3RyeSA9IG1hbmFnZXIuZ2V0UmVnaXN0cnkoKTtcblxuICAgICAgICB0aGlzLmRlbGF5ID0gb3B0aW9ucy5kZWxheTtcbiAgICAgICAgdGhpcy5zb3VyY2VOb2RlcyA9IHt9O1xuICAgICAgICB0aGlzLnNvdXJjZU5vZGVPcHRpb25zID0ge307XG4gICAgICAgIHRoaXMuc291cmNlUHJldmlld05vZGVzID0ge307XG4gICAgICAgIHRoaXMuc291cmNlUHJldmlld05vZGVPcHRpb25zID0ge307XG4gICAgICAgIHRoaXMudGFyZ2V0Tm9kZXMgPSB7fTtcbiAgICAgICAgdGhpcy50YXJnZXROb2RlT3B0aW9ucyA9IHt9O1xuICAgICAgICB0aGlzLmxpc3RlbmVyVHlwZXMgPSBbXTtcbiAgICAgICAgdGhpcy5fbW91c2VDbGllbnRPZmZzZXQgPSB7fTtcblxuICAgICAgICBpZiAob3B0aW9ucy5lbmFibGVNb3VzZUV2ZW50cykge1xuICAgICAgICAgICAgdGhpcy5saXN0ZW5lclR5cGVzLnB1c2goJ21vdXNlJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3B0aW9ucy5lbmFibGVUb3VjaEV2ZW50cykge1xuICAgICAgICAgICAgdGhpcy5saXN0ZW5lclR5cGVzLnB1c2goJ3RvdWNoJyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmdldFNvdXJjZUNsaWVudE9mZnNldCA9IHRoaXMuZ2V0U291cmNlQ2xpZW50T2Zmc2V0LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuaGFuZGxlVG9wTW92ZVN0YXJ0ID0gdGhpcy5oYW5kbGVUb3BNb3ZlU3RhcnQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5oYW5kbGVUb3BNb3ZlU3RhcnREZWxheSA9IHRoaXMuaGFuZGxlVG9wTW92ZVN0YXJ0RGVsYXkuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5oYW5kbGVUb3BNb3ZlU3RhcnRDYXB0dXJlID0gdGhpcy5oYW5kbGVUb3BNb3ZlU3RhcnRDYXB0dXJlLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuaGFuZGxlVG9wTW92ZUNhcHR1cmUgPSB0aGlzLmhhbmRsZVRvcE1vdmVDYXB0dXJlLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuaGFuZGxlVG9wTW92ZUVuZENhcHR1cmUgPSB0aGlzLmhhbmRsZVRvcE1vdmVFbmRDYXB0dXJlLmJpbmQodGhpcyk7XG4gICAgfVxuXG4gICAgc2V0dXAgKCkge1xuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGludmFyaWFudCghdGhpcy5jb25zdHJ1Y3Rvci5pc1NldFVwLCAnQ2Fubm90IGhhdmUgdHdvIFRvdWNoIGJhY2tlbmRzIGF0IHRoZSBzYW1lIHRpbWUuJyk7XG4gICAgICAgIHRoaXMuY29uc3RydWN0b3IuaXNTZXRVcCA9IHRydWU7XG5cbiAgICAgICAgdmFyIHN0YXJ0SGFuZGxlciA9IHRoaXMuZGVsYXlcbiAgICAgICAgICAgID8gdGhpcy5oYW5kbGVUb3BNb3ZlU3RhcnREZWxheVxuICAgICAgICAgICAgOiB0aGlzLmhhbmRsZVRvcE1vdmVTdGFydDtcblxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIod2luZG93LCAnc3RhcnQnLCBzdGFydEhhbmRsZXIpO1xuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIod2luZG93LCAnc3RhcnQnLCB0aGlzLmhhbmRsZVRvcE1vdmVTdGFydENhcHR1cmUsIHRydWUpO1xuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIod2luZG93LCAnbW92ZScsICB0aGlzLmhhbmRsZVRvcE1vdmVDYXB0dXJlLCB0cnVlKTtcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKHdpbmRvdywgJ2VuZCcsICAgdGhpcy5oYW5kbGVUb3BNb3ZlRW5kQ2FwdHVyZSwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgdGVhcmRvd24gKCkge1xuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY29uc3RydWN0b3IuaXNTZXRVcCA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9tb3VzZUNsaWVudE9mZnNldCA9IHt9O1xuXG4gICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcih3aW5kb3csICdzdGFydCcsIHRoaXMuaGFuZGxlVG9wTW92ZVN0YXJ0Q2FwdHVyZSwgdHJ1ZSk7XG4gICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcih3aW5kb3csICdzdGFydCcsIHRoaXMuaGFuZGxlVG9wTW92ZVN0YXJ0KTtcbiAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKHdpbmRvdywgJ21vdmUnLCAgdGhpcy5oYW5kbGVUb3BNb3ZlQ2FwdHVyZSwgdHJ1ZSk7XG4gICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcih3aW5kb3csICdlbmQnLCAgIHRoaXMuaGFuZGxlVG9wTW92ZUVuZENhcHR1cmUsIHRydWUpO1xuXG4gICAgICAgIHRoaXMudW5pbnN0YWxsU291cmNlTm9kZVJlbW92YWxPYnNlcnZlcigpO1xuICAgIH1cblxuICAgIGFkZEV2ZW50TGlzdGVuZXIgKHN1YmplY3QsIGV2ZW50LCBoYW5kbGVyLCBjYXB0dXJlKSB7XG4gICAgICAgIHRoaXMubGlzdGVuZXJUeXBlcy5mb3JFYWNoKGZ1bmN0aW9uIChsaXN0ZW5lclR5cGUpIHtcbiAgICAgICAgICAgIHN1YmplY3QuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWVzW2xpc3RlbmVyVHlwZV1bZXZlbnRdLCBoYW5kbGVyLCBjYXB0dXJlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVtb3ZlRXZlbnRMaXN0ZW5lciAoc3ViamVjdCwgZXZlbnQsIGhhbmRsZXIsIGNhcHR1cmUpIHtcbiAgICAgICAgdGhpcy5saXN0ZW5lclR5cGVzLmZvckVhY2goZnVuY3Rpb24gKGxpc3RlbmVyVHlwZSkge1xuICAgICAgICAgICAgc3ViamVjdC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZXNbbGlzdGVuZXJUeXBlXVtldmVudF0sIGhhbmRsZXIsIGNhcHR1cmUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25uZWN0RHJhZ1NvdXJjZSAoc291cmNlSWQsIG5vZGUsIG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgaGFuZGxlTW92ZVN0YXJ0ID0gdGhpcy5oYW5kbGVNb3ZlU3RhcnQuYmluZCh0aGlzLCBzb3VyY2VJZCk7XG4gICAgICAgIHRoaXMuc291cmNlTm9kZXNbc291cmNlSWRdID0gbm9kZTtcblxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIobm9kZSwgJ3N0YXJ0JywgaGFuZGxlTW92ZVN0YXJ0KTtcblxuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuc291cmNlTm9kZXNbc291cmNlSWRdO1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKG5vZGUsICdzdGFydCcsIGhhbmRsZU1vdmVTdGFydCk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgY29ubmVjdERyYWdQcmV2aWV3IChzb3VyY2VJZCwgbm9kZSwgb3B0aW9ucykge1xuICAgICAgICB0aGlzLnNvdXJjZVByZXZpZXdOb2RlT3B0aW9uc1tzb3VyY2VJZF0gPSBvcHRpb25zO1xuICAgICAgICB0aGlzLnNvdXJjZVByZXZpZXdOb2Rlc1tzb3VyY2VJZF0gPSBub2RlO1xuXG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5zb3VyY2VQcmV2aWV3Tm9kZXNbc291cmNlSWRdO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuc291cmNlUHJldmlld05vZGVPcHRpb25zW3NvdXJjZUlkXTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBjb25uZWN0RHJvcFRhcmdldCAodGFyZ2V0SWQsIG5vZGUpIHtcbiAgICAgICAgdGhpcy50YXJnZXROb2Rlc1t0YXJnZXRJZF0gPSBub2RlO1xuXG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy50YXJnZXROb2Rlc1t0YXJnZXRJZF07XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZ2V0U291cmNlQ2xpZW50T2Zmc2V0IChzb3VyY2VJZCkge1xuICAgICAgICByZXR1cm4gZ2V0Tm9kZUNsaWVudE9mZnNldCh0aGlzLnNvdXJjZU5vZGVzW3NvdXJjZUlkXSk7XG4gICAgfVxuXG4gICAgaGFuZGxlVG9wTW92ZVN0YXJ0Q2FwdHVyZSAoZSkge1xuICAgICAgICB0aGlzLm1vdmVTdGFydFNvdXJjZUlkcyA9IFtdO1xuICAgIH1cblxuICAgIGhhbmRsZU1vdmVTdGFydCAoc291cmNlSWQpIHtcbiAgICAgICAgdGhpcy5tb3ZlU3RhcnRTb3VyY2VJZHMudW5zaGlmdChzb3VyY2VJZCk7XG4gICAgfVxuXG4gICAgaGFuZGxlVG9wTW92ZVN0YXJ0IChlKSB7XG4gICAgICAgIC8vIERvbid0IHByZW1hdHVyZWx5IHByZXZlbnREZWZhdWx0KCkgaGVyZSBzaW5jZSBpdCBtaWdodDpcbiAgICAgICAgLy8gMS4gTWVzcyB1cCBzY3JvbGxpbmdcbiAgICAgICAgLy8gMi4gTWVzcyB1cCBsb25nIHRhcCAod2hpY2ggYnJpbmdzIHVwIGNvbnRleHQgbWVudSlcbiAgICAgICAgLy8gMy4gSWYgdGhlcmUncyBhbiBhbmNob3IgbGluayBhcyBhIGNoaWxkLCB0YXAgd29uJ3QgYmUgdHJpZ2dlcmVkIG9uIGxpbmtcblxuICAgICAgICBjb25zdCBjbGllbnRPZmZzZXQgPSBnZXRFdmVudENsaWVudE9mZnNldChlKTtcbiAgICAgICAgaWYgKGNsaWVudE9mZnNldCkge1xuICAgICAgICAgICAgdGhpcy5fbW91c2VDbGllbnRPZmZzZXQgPSBjbGllbnRPZmZzZXQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVUb3BNb3ZlU3RhcnREZWxheSAoZSkge1xuICAgICAgICB0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KHRoaXMuaGFuZGxlVG9wTW92ZVN0YXJ0LmJpbmQodGhpcywgZSksIHRoaXMuZGVsYXkpO1xuICAgIH1cblxuICAgIGhhbmRsZVRvcE1vdmVDYXB0dXJlIChlKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO1xuXG4gICAgICAgIGNvbnN0IHsgbW92ZVN0YXJ0U291cmNlSWRzIH0gPSB0aGlzO1xuICAgICAgICBjb25zdCBjbGllbnRPZmZzZXQgPSBnZXRFdmVudENsaWVudE9mZnNldChlKTtcblxuICAgICAgICBpZiAoIWNsaWVudE9mZnNldCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cblxuICAgICAgICAvLyBJZiB3ZSdyZSBub3QgZHJhZ2dpbmcgYW5kIHdlJ3ZlIG1vdmVkIGEgbGl0dGxlLCB0aGF0IGNvdW50cyBhcyBhIGRyYWcgc3RhcnRcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgIXRoaXMubW9uaXRvci5pc0RyYWdnaW5nKCkgJiZcbiAgICAgICAgICAgIHRoaXMuX21vdXNlQ2xpZW50T2Zmc2V0Lmhhc093blByb3BlcnR5KCd4JykgJiZcbiAgICAgICAgICAgIG1vdmVTdGFydFNvdXJjZUlkcyAmJlxuICAgICAgICAgICAgKFxuICAgICAgICAgICAgICAgIHRoaXMuX21vdXNlQ2xpZW50T2Zmc2V0LnggIT09IGNsaWVudE9mZnNldC54IHx8XG4gICAgICAgICAgICAgICAgdGhpcy5fbW91c2VDbGllbnRPZmZzZXQueSAhPT0gY2xpZW50T2Zmc2V0LnlcbiAgICAgICAgICAgIClcbiAgICAgICAgKSB7XG4gICAgICAgICAgICB0aGlzLm1vdmVTdGFydFNvdXJjZUlkcyA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLmFjdGlvbnMuYmVnaW5EcmFnKG1vdmVTdGFydFNvdXJjZUlkcywge1xuICAgICAgICAgICAgICAgIGNsaWVudE9mZnNldDogdGhpcy5fbW91c2VDbGllbnRPZmZzZXQsXG4gICAgICAgICAgICAgICAgZ2V0U291cmNlQ2xpZW50T2Zmc2V0OiB0aGlzLmdldFNvdXJjZUNsaWVudE9mZnNldCxcbiAgICAgICAgICAgICAgICBwdWJsaXNoU291cmNlOiBmYWxzZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMubW9uaXRvci5pc0RyYWdnaW5nKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNvdXJjZU5vZGUgPSB0aGlzLnNvdXJjZU5vZGVzW3RoaXMubW9uaXRvci5nZXRTb3VyY2VJZCgpXTtcbiAgICAgICAgdGhpcy5pbnN0YWxsU291cmNlTm9kZVJlbW92YWxPYnNlcnZlcihzb3VyY2VOb2RlKTtcbiAgICAgICAgdGhpcy5hY3Rpb25zLnB1Ymxpc2hEcmFnU291cmNlKCk7XG5cbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGNvbnN0IG1hdGNoaW5nVGFyZ2V0SWRzID0gT2JqZWN0LmtleXModGhpcy50YXJnZXROb2RlcylcbiAgICAgICAgICAgIC5maWx0ZXIoKHRhcmdldElkKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgYm91bmRpbmdSZWN0ID0gdGhpcy50YXJnZXROb2Rlc1t0YXJnZXRJZF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNsaWVudE9mZnNldC54ID49IGJvdW5kaW5nUmVjdC5sZWZ0ICYmXG4gICAgICAgICAgICAgICAgY2xpZW50T2Zmc2V0LnggPD0gYm91bmRpbmdSZWN0LnJpZ2h0ICYmXG4gICAgICAgICAgICAgICAgY2xpZW50T2Zmc2V0LnkgPj0gYm91bmRpbmdSZWN0LnRvcCAmJlxuICAgICAgICAgICAgICAgIGNsaWVudE9mZnNldC55IDw9IGJvdW5kaW5nUmVjdC5ib3R0b207XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmFjdGlvbnMuaG92ZXIobWF0Y2hpbmdUYXJnZXRJZHMsIHtcbiAgICAgICAgICAgIGNsaWVudE9mZnNldDogY2xpZW50T2Zmc2V0XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGhhbmRsZVRvcE1vdmVFbmRDYXB0dXJlIChlKSB7XG4gICAgICAgIGlmICghdGhpcy5tb25pdG9yLmlzRHJhZ2dpbmcoKSB8fCB0aGlzLm1vbml0b3IuZGlkRHJvcCgpKSB7XG4gICAgICAgICAgICB0aGlzLm1vdmVTdGFydFNvdXJjZUlkcyA9IG51bGw7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgdGhpcy5fbW91c2VDbGllbnRPZmZzZXQgPSB7fTtcblxuICAgICAgICB0aGlzLnVuaW5zdGFsbFNvdXJjZU5vZGVSZW1vdmFsT2JzZXJ2ZXIoKTtcbiAgICAgICAgdGhpcy5hY3Rpb25zLmRyb3AoKTtcbiAgICAgICAgdGhpcy5hY3Rpb25zLmVuZERyYWcoKTtcbiAgICB9XG5cbiAgICBpbnN0YWxsU291cmNlTm9kZVJlbW92YWxPYnNlcnZlciAobm9kZSkge1xuICAgICAgICB0aGlzLnVuaW5zdGFsbFNvdXJjZU5vZGVSZW1vdmFsT2JzZXJ2ZXIoKTtcblxuICAgICAgICB0aGlzLmRyYWdnZWRTb3VyY2VOb2RlID0gbm9kZTtcbiAgICAgICAgdGhpcy5kcmFnZ2VkU291cmNlTm9kZVJlbW92YWxPYnNlcnZlciA9IG5ldyB3aW5kb3cuTXV0YXRpb25PYnNlcnZlcigoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIW5vZGUucGFyZW50RWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVzdXJyZWN0U291cmNlTm9kZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMudW5pbnN0YWxsU291cmNlTm9kZVJlbW92YWxPYnNlcnZlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoIW5vZGUgfHwgIW5vZGUucGFyZW50RWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5kcmFnZ2VkU291cmNlTm9kZVJlbW92YWxPYnNlcnZlci5vYnNlcnZlKFxuICAgICAgICAgICAgbm9kZS5wYXJlbnRFbGVtZW50LFxuICAgICAgICAgICAgeyBjaGlsZExpc3Q6IHRydWUgfVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHJlc3VycmVjdFNvdXJjZU5vZGUgKCkge1xuICAgICAgICB0aGlzLmRyYWdnZWRTb3VyY2VOb2RlLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIHRoaXMuZHJhZ2dlZFNvdXJjZU5vZGUucmVtb3ZlQXR0cmlidXRlKCdkYXRhLXJlYWN0aWQnKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmRyYWdnZWRTb3VyY2VOb2RlKTtcbiAgICB9XG5cbiAgICB1bmluc3RhbGxTb3VyY2VOb2RlUmVtb3ZhbE9ic2VydmVyICgpIHtcbiAgICAgICAgaWYgKHRoaXMuZHJhZ2dlZFNvdXJjZU5vZGVSZW1vdmFsT2JzZXJ2ZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dlZFNvdXJjZU5vZGVSZW1vdmFsT2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5kcmFnZ2VkU291cmNlTm9kZVJlbW92YWxPYnNlcnZlciA9IG51bGw7XG4gICAgICAgIHRoaXMuZHJhZ2dlZFNvdXJjZU5vZGUgPSBudWxsO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlVG91Y2hCYWNrZW5kIChvcHRpb25zT3JNYW5hZ2VyID0ge30pIHtcbiAgICBjb25zdCB0b3VjaEJhY2tlbmRGYWN0b3J5ID0gZnVuY3Rpb24gKG1hbmFnZXIpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUb3VjaEJhY2tlbmQobWFuYWdlciwgb3B0aW9uc09yTWFuYWdlcik7XG4gICAgfTtcblxuICAgIGlmIChvcHRpb25zT3JNYW5hZ2VyLmdldE1vbml0b3IpIHtcbiAgICAgICAgcmV0dXJuIHRvdWNoQmFja2VuZEZhY3Rvcnkob3B0aW9uc09yTWFuYWdlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRvdWNoQmFja2VuZEZhY3Rvcnk7XG4gICAgfVxufVxuIl19
