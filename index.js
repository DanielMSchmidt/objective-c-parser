'use strict';
const fs = require('fs');
const methodDeclarationRegex = /(?:\+|\-)\s?\(((?:\w|\<|\>)*)\)(?:\w|\s|\:|\(|\)|\*)*;/g;

// Get Groups for matches
function getNthGroupForMatch(string, regex, index) {
    const matches = [];
    let match;
    while ((match = regex.exec(string))) {
        matches.push(match[index]);
    }
    return matches;
}

const parseClassName = file => {
    const nameRegex = /@interface \w*/i;
    const nameRegexLength = 11;
    return file.match(nameRegex)[0].substr(nameRegexLength);
};

const extractMultiLineComment = (lineIndex, lines) => {
    let i = lineIndex;
    const commentLines = [];

    while (true) {
        i--;

        // is start of multi line string
        if (lines[i].indexOf('/**') !== -1) {
            return commentLines.join('\n');
        }

        // is end of multiline string
        if (lines[i].indexOf('*/') !== -1) {
            continue;
        }

        // is comment line
        if (lines[i].indexOf('*') !== -1) {
            commentLines.unshift(lines[i].replace(/\s*\*\s*/, ''));
        }
    }
};

const parseMethods = file => {
    const lines = file.split('\n');

    return file.match(methodDeclarationRegex).map(methodDeclaration => {
        const matchReturnType = /(?:\+|\-)\s?\(((?:\w|\<|\>)*)\)/;
        const returnType = methodDeclaration.match(matchReturnType);

        const methodBody = methodDeclaration
            .replace(returnType[0], '')
            .replace(';', '');

        const argumentsRegex = /\s?\(((?:\w|\s|\*)*)\)((?:\w)*)\s?/g;
        const rawArgs = [
            getNthGroupForMatch(methodBody, argumentsRegex, 1),
            getNthGroupForMatch(methodBody, argumentsRegex, 2),
        ];

        const name = rawArgs[0].length
            ? methodBody
                  .replace(argumentsRegex, '')
                  .replace(/\s/g, '')
                  .replace(/\(\)/g, '')
            : methodBody;

        const firstMethodLine = methodDeclaration.split('\n')[0];
        const lineIndex = lines.findIndex(line => {
            return firstMethodLine === line;
        });

        const isSingleLineComment = lines[lineIndex - 1].indexOf('//') != -1;
        const comment = isSingleLineComment
            ? lines[lineIndex - 1].replace(/\/\/(?:\s)*/, '')
            : extractMultiLineComment(lineIndex, lines);

        const [argumentTypes, argumentNames] = rawArgs;
        // Both should be the same length
        const args = argumentTypes.length
            ? argumentTypes.map((type, index) => ({
                  type,
                  name: argumentNames[index],
              }))
            : [];

        return {
            static: methodDeclaration.indexOf('+') !== -1,
            args,
            comment,
            name,
            returnType: returnType[1],
        };
    });
};

const parse = file => {
    return {
        name: parseClassName(file),
        methods: parseMethods(file),
    };
};

module.exports = parse;
