/*
 * Copyright 1999 - 2014 icCube software Llc.
 *
 * The code and all underlying concepts and data models are owned fully
 * and exclusively by icCube software Llc. and are protected by
 * copyright law and international treaties.
 *
 * Warning: Unauthorized reproduction, use or distribution of this
 * program, concepts, documentation and data models, or any portion of
 * it, may result in severe civil and criminal penalties, and will be
 * prosecuted to the maximum extent possible under the law.
 */
CodeMirror.defineMode("mdx-base", function (config) {
    var indentUnit = config.indentUnit, type;

    function ret(style, tp) {
        type = tp;
        return style;
    }

    var keywords = wordRegexp(
    [
        "AFTER",
        "ALL",
        "AS",
        "ASC",
        "AXIS",
        "BASC",
        "BDESC",
        "BEFORE",
        "BEFORE_AND_AFTER",
        "BEGIN",
        "BY",
        "CALCULATED",
        "CASE",
        "CATEGORY",
        "CELL",
        "CHAPTERS",
        "CLEAR",
        "COLUMNS",
        "COMMIT",
        "CONST",
        "CONSTRAINED",
        "CREATE",
        "CUBE",
        "DESC",
        "DIMENSION",
        "DRILLTHROUGH",
        "DROP",
        "DYNAMIC",
        "ELSE",
        "EMPTY",
        "END",
        "EXCLUDEEMPTY",
        "EXISTING",
        "FALSE",
        "FROM",
        "FUNCTION",
        "IC3RUN",
        "INCLUDEEMPTY",
        "LEAVES",
        "MAXROWS",
        "MEMBER",
        "NON",
        "ON",
        "PAGES",
        "POST",
        "PROPERTIES",
        "RECURSIVE",
        "RESULT_CACHE",
        "RETURN",
        "ROLLBACK",
        "ROWS",
        "SECTIONS",
        "SELECT",
        "SELF",
        "SELF_AND_AFTER",
        "SELF_AND_BEFORE",
        "SELF_BEFORE_AFTER",
        "SESSION",
        "SET",
        "STATIC",
        "THEN",
        "TRANSACTION",
        "TRUE",
        "TYPED",
        "UPDATE",
        "USE_EQUAL_ALLOCATION",
        "USE_EQUAL_INCREMENT",
        "USE_WEIGHTED_ALLOCATION",
        "USE_WEIGHTED_INCREMENT",
        "VISUAL",
        "WHEN",
        "WHERE",
        "WITH"

    ]);

    var operators = wordRegexp([
                                   "<", ">", "=", "<>", ">=", "<=", "is", "not", "and", "xor", "or"
                               ]);

    var operatorChars = /[*+\-<>=:\/\^]/;

    function tokenBase(stream, state) {
        var ch = stream.next();
        if (ch == "/" && (stream.eat("/") || stream.eat("*"))
        || ch == "-" && stream.eat("-")) {
            var commentSign = stream.current();
            state.tokenize = tokenComment(commentSign);
            return state.tokenize(stream, state);
        }
        else {
            if (ch == "\"" || ch == "'" || ch == "`") {
                state.tokenize = tokenString(ch);
                return state.tokenize(stream, state);
            }
            else {
                if (ch == "," || ch == ";") {
                    return ret("mdx-separator", ch);
                }
                else {
                    if (ch == '-') {
                        if (stream.eatWhile(/\d/)) {
                            if (stream.eat(".")) {
                                stream.eatWhile(/\d/);
                            }
                            return ret("mdx-number", "number");
                        }
                        else {
                            return ret("mdx-operator", "operator");
                        }
                    }
                    else {
                        if (operatorChars.test(ch)) {
                            stream.eatWhile(operatorChars);
                            return ret("mdx-operator", "operator");
                        }
                        else {
                            if (/\d/.test(ch)) {
                                stream.eatWhile(/\d/);
                                if (stream.eat(".")) {
                                    stream.eatWhile(/\d/);
                                }
                                return ret("mdx-number", "number");
                            }
                            else {
                                if (/[\(\)\{\}]/.test(ch)) {
                                    return ret("mdx-punctuation", ch);
                                }
                                else {
                                    if (/[\.&]/.test(ch)) {
                                        return ret("mdx-entity", "entity");
                                    }
                                    else {
                                        if (/[\[\]]/.test(ch)) {
                                            if (ch == '[') {
                                                state.tokenize = tokenBrackets;
                                            }
                                            return ret("mdx-bracket-entity", "entity");
                                        }
                                        else {
                                            stream.eatWhile(/[_\w\d]/);
                                            var word = stream.current(), style, type;
                                            if (operators.test(word)) {
                                                style = "mdx-operator";
                                                type = "operator";
                                            }
                                            else {
                                                if (keywords.test(word)) {
                                                    style = "mdx-keyword";
                                                    type = "keyword";
                                                }
                                                else {
                                                    if (MDXParser.functions.test(word)) {
                                                        style = "mdx-function";
                                                        type = "function";
                                                    }
                                                    else {
                                                        style = "mdx-entity";
                                                        type = "entity";
                                                    }
                                                }
                                            }
                                            return ret(style, type);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    function tokenComment(commentSign) {
        return function (stream, state) {
            if (commentSign == "//" || commentSign == "--") {
                if (commentSign == "//" && stream.peek() == "#") {
                    state.tokenize = tokenAnnotation;
                }
                else {
                    stream.skipToEnd();
                    state.tokenize = tokenBase;
                }
            }
            else {
                while (!stream.eol()) {
                    var ch = stream.next();
                    if (commentSign == "/*" && ch == '*' && stream.eat("/")) {
                        state.tokenize = tokenBase;
                        break;
                    }
                }
            }
            return ret("mdx-comment", "comment");
        };
    }

    function tokenAnnotation(stream, state) {
        if (stream.eat("#")) {
            stream.eatWhile(/\w/);
        }
        state.tokenize = tokenBase;
        return ret("mdx-annotation", "annotation");
    }

    function tokenString(quote) {
        return function (stream, state) {
            var escaped = false, ch;
            while ((ch = stream.next()) != null) {
                if (ch == quote && !escaped) {
                    break;
                }
                escaped = !escaped && ch == "\\";
            }
            if (!escaped) {
                state.tokenize = tokenBase;
            }
            return ret(quote == "`" ? "mdx-word" : "mdx-literal", "string");
        };
    }

    function tokenBrackets(stream, state) {
        if (stream.skipTo("]")) {
            state.tokenize = tokenBase;
        }
        else {
            stream.skipToEnd();
        }
        return ret("mdx-bracket-entity", "entity");
    }

    function Context(indented, column, type, align, prev) {
        this.indented = indented;
        this.column = column;
        this.type = type;
        this.align = align;
        this.prev = prev;
    }

    function pushContext(state, col, type) {
        return state.context = new Context(state.indented, col, type, null, state.context);
    }

    function popContext(state) {
        return state.context = state.context.prev;
    }

    return {
        startState: function (base) {
            return {tokenize: tokenBase,
                context: null,
                indented: base,
                startOfLine: true};
        },
        token: function (stream, state) {
            var ctx = state.context;
            if (stream.sol()) {
                state.indented = stream.indentation();
                state.startOfLine = true;
                if (ctx && ctx.align == null) {
                    ctx.align = false;
                }
                if (ctx && ctx.type == "annotation") {
                    ctx = popContext(state);
                }
            }
            if (stream.eatSpace()) {
                return null;
            }
            var style = state.tokenize(stream, state);

            if (type == "annotation") {
                if (ctx && ctx.type == ";") {
                    ctx = popContext(state);
                }
                pushContext(state, stream.column(), "annotation");
            }
            else {
                if (!ctx && type != "comment") {
                    pushContext(state, stream.column(), ";");
                }
            }
            if (style == "mdx-punctuation") {
                if (type == "(") {
                    pushContext(state, stream.column(), ")");
                }
                else {
                    if (type == ")") {
                        ctx = popContext(state);
                    }
                }
                if (type == "{") {
                    pushContext(state, stream.column(), "}");
                }
                else {
                    if (type == "}") {
                        ctx = popContext(state);
                    }
                }
            }
            else {
                if (style == "mdx-separator" && type == ";" && ctx && !ctx.prev) {
                    ctx = popContext(state);
                }
            }
            state.startOfLine = false;
            return style;
        },

        indent: function (state, textAfter) {
            var firstChar = textAfter && textAfter.charAt(0);
            var ctx = state.context;
            var closing = ctx && firstChar == ctx.type;
            if (!ctx) {
                return 0;
            }
            else {
                if (ctx.align) {
                    return ctx.column - (closing ? 1 : 0);
                }
                else {
                    return ctx.indented + (closing || ctx.type == "annotation" ? 0 : indentUnit);
                }
            }
        },

        electricChars: ")"};
});

CodeMirror.defineMode("mdx", function (config, parserConfig) {
    function tokenBase(stream, state) {
        var ch = stream.next();
        if (/[\w#]/.test(ch)) {
            stream.eatWhile(/\w/);
            if (MDXParser.customLinks.test(stream.current())) {
                return "mdx-custom-link";
            }
        }
        return null;
    }

    var mdxCustomLinks = {
        startState: function (base) {
            return {
                tokenize: tokenBase
            }
        },
        token: function (stream, state) {
            if (stream.eatSpace()) {
                return null;
            }
            return state.tokenize(stream, state);
        }
    };
    return CodeMirror.overlayMode(CodeMirror.getMode(config, parserConfig.backdrop || "mdx-base"), mdxCustomLinks, true);
});

var MDXParser = (function () {
    return {
        //List of functions will be dynamically loaded
        functions: wordRegexp([]),
        //List of custom links will be dynamically loaded
        customLinks: wordRegexp([]),

        setFunctionList: function (funcList) {
            this.functions = wordRegexp(funcList);
        },

        setCustomLinks: function (customLinksList) {
            this.customLinks = wordRegexp(customLinksList);
        }
    }
})();

function wordRegexp(words) {
    return new RegExp("^(?:" + words.join("|") + ")$", "i");
}

CodeMirror.defineMIME("mdx", "mdx");
