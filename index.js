'use strict';
const fs = require('fs');

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
    const linesWithMethods = [];

    lines.forEach((line, index) => {
        if (line.includes('-') && line.includes(';')) {
            linesWithMethods.push(index);
        }
    });

    // in an extra loop because we need to take care
    // of comments and multi line functions later

    return linesWithMethods.map(lineIndex => {
        const line = lines[lineIndex];
        const matchReturnType = /-\s?\((\w*)\)/;
        const returnType = line.match(matchReturnType);

        const methodBody = line.replace(returnType[0], '').replace(';', '');
        const rawArgs = methodBody.match(/\s?\(\w*\)\w*\s?/g);
        const name = rawArgs
            ? rawArgs
                  .reduce(
                      (carry, match) => carry.replace(match, ''),
                      methodBody
                  )
                  .replace(/\W*/g, '')
            : methodBody;

        const isSingleLineComment = lines[lineIndex - 1].indexOf('//') != -1;
        const comment = isSingleLineComment
            ? lines[lineIndex - 1].replace(/\/\/(?:\s)*/, '')
            : extractMultiLineComment(lineIndex, lines);

        const args = (rawArgs || []).map(arg => {
            return {
                type: arg.match(/\((\w*)\)/)[1],
                name: arg.match(/\(\w*\)(\w*)/)[1],
            };
        });

        return {
            args: args,
            comment: comment,
            name: name,
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
