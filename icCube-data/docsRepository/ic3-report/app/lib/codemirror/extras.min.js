(function () {
    CodeMirror.commands.autocomplete = function(cm, wat, options) {
        var mode = cm.getMode().name;
        var hint, config = { async: true };

        for (var k in options)
            if (options.hasOwnProperty(k))
                config[k] = options[k];

        if ((mode == 'mdx') || (mode == 'xml')) {
            hint = CodeMirror.hint.mdx;
            config.extraKeys = {
                ".": function (cm, handle) {
                    handle.pick();
                    cm.focus();
                    cm.replaceSelection('.', 'end');

                    // mimic pick(),
                    setTimeout(function () {
                        cm.focus();
                        setTimeout(function () {
                            CodeMirror.commands.autocomplete(cm, wat, options);
                        }, 50);
                    }, 50);
                }
            };
        }
        else if (mode == 'javascript') {
            hint = CodeMirror.hint["javascript"];
        }
        else if (mode == 'ic3-expression') {
            hint = CodeMirror.hint["ic3-expression"];
        }

        if (hint) {
            CodeMirror.showHint(cm, hint, config);
        }
    };

    function simpleHint(editor, callback) {
        if (typeof(editor.ic3autocompleteRequest) === 'function') {
            return editor.ic3autocompleteRequest(editor, callback, _.isFunction(this) ? this : undefined);
        }
    }

    CodeMirror.registerHelper("hint", "mdx", simpleHint);
    CodeMirror.registerHelper("hint", "javascript", simpleHint.bind(CodeMirror.hint.javascript));
    CodeMirror.registerHelper("hint", "ic3-expression", simpleHint);
})();
