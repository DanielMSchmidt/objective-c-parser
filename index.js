"use strict";

const interfaceDeclarationRegex = /@interface ([\w\d]+)\s?:\s?([\w\d]+)\s?(?:<((?:[\w]+(?:,\s)?)+)>)?/g;
const methodDeclarationRegex = /(?<!\s\*\s)(?:\+|\-)\s?\(((?:\s|\w|\<|\>|\*)*)\)(?:\w|\s|\<|\>|\:|\(|\)|\*|\_|\-|\"|\[|\]|\^)*(__attribute__\(.*\))?(;|{)/g;
const returnTypeRegex = /(?:\+|\-)\s?\(((?:\s|\w|\<|\>|\*)*)\)/;
const argumentsRegex = /\s?\(((?:\w|\s|\*|\<|\>|\^|\(|\))*)\)\s*((?:\w)*)\s?/g;
const commentRegex = /(?:^|\s)\/\/(.+?)$|\/\*(.*?)\*\//gms;
const propertyDeclarationRegex = /(?:@property)\s?\(([\w,\s]+)\)\s?([\w\d]+(?:\s?\<[\w\d]+\s*\*?\>)?)\s*\*?\s*([\w\d]+);/g;

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
	return (file.match(nameRegex) || [""])[0].substr(nameRegexLength);
};

const parseInterfaceDeclaration = file => {
	const regex = new RegExp(interfaceDeclarationRegex);
	const matches = regex.exec(file);
	
	if (!matches) {
		const name = parseClassName(file);
		return {
			name
		};
	}

	const [_interface, name, superclass, comaSeparatedProtocols] = matches;
	
	const protocols = (comaSeparatedProtocols ?? '')
			.split(",")
			.map(protocol => protocol.trim());

	return {
		name,
		superclass,
		protocols,
	};
};

const extractMultiLineComment = (lineIndex, lines) => {
	let i = lineIndex;
	let commentFound = false;
	const commentLines = [];

	while (i > 0) {
		i--;

		// is end of multiline string
		if (lines[i].indexOf("*/") !== -1) {
			commentFound = true;
			continue;
		}

		// is start of multi line string
		if (lines[i].indexOf("/**") !== -1 && commentFound) {
			return commentLines.join("\n");
		}

		// is comment line start with star symbol
		if (lines[i].indexOf("*") !== -1 && commentFound) {
			commentLines.unshift(lines[i].replace(/^\s*\*\s*/, ""));
		}

		// No comment found
		if (lines[i].trim() !== "" && !commentFound) {
			break;
		}

		// FIXME: now, not parse the comment line without start with star symbol
	}

	// No comment found
	return "";
};

function extractNameOfMethodWithArguments(methodBody, rawArgs) {
	const lastArgument = rawArgs[1][rawArgs[1].length - 1];
	const indexOfLastArgumentEnd =
		methodBody.lastIndexOf(lastArgument) + lastArgument.length + 1;
	return methodBody
		.substr(0, indexOfLastArgumentEnd)
		.replace(argumentsRegex, "")
		.replace(/\s/g, "")
		.replace(/\(\)/g, "")
		.replace(/\{/g, "");
}

function extractNameOfMethodWithoutArguments(methodBody, rawArgs) {
	return methodBody.replace(/\s*\{?/g, "");
}

const parseMethods = file => {
	const lines = file.split("\n");
	const stripedFile = file.replace(commentRegex, "");
	const methodDeclarations = stripedFile.match(methodDeclarationRegex) || [];

	return methodDeclarations.map(methodDeclaration => {
		const returnType = methodDeclaration.match(returnTypeRegex);

		const methodBody = methodDeclaration
			.replace(returnType[0], "")
			.replace(/__attribute__\(.*\)/g, "")
			.replace(/NS_AVAILABLE_IOS\(.*\)/g, "")
			.replace(";", "");

		const rawArgs = [
			getNthGroupForMatch(methodBody, argumentsRegex, 1),
			getNthGroupForMatch(methodBody, argumentsRegex, 2)
		];

		const argumentsPresent = Boolean(rawArgs[0].length);

		const name = argumentsPresent
			? extractNameOfMethodWithArguments(methodBody, rawArgs)
			: extractNameOfMethodWithoutArguments(methodBody, rawArgs);

		const firstMethodLine = methodDeclaration.split("\n")[0];
		const lineIndex = lines.findIndex(line => {
			return firstMethodLine === line.replace(/^\s+/g, "");
		});

		const previousLine = lines[lineIndex - 1] ?? "";
		const isSingleLineComment = previousLine.indexOf("//") !== -1;
		const isSingleLineCommentInMultiLineCommentFormat =
			previousLine.indexOf("/**") !== -1 &&
			previousLine.lastIndexOf("*/") !== -1;
		const comment = isSingleLineComment
			? previousLine.replace(/\/\/(?:\s)*/, "")
			: isSingleLineCommentInMultiLineCommentFormat
			? previousLine
					.replace(/\/\*\*(?:\s)*/, "")
					.replace(/(?:\s)*\*+\//, "")
			: extractMultiLineComment(lineIndex, lines);

		const [argumentTypes, argumentNames] = rawArgs;
		// Both should be the same length
		const args = argumentTypes.length
			? argumentTypes.map((type, index) => ({
					type,
					name: argumentNames[index]
			  }))
			: [];

		return {
			static: methodDeclaration.indexOf("+") !== -1,
			args,
			comment,
			name,
			returnType: returnType[1]
		};
	});
};

const parseProperties = file => {
  const propertyDeclarations = file.match(propertyDeclarationRegex) || [];
	
	return propertyDeclarations.map(propertyDeclaration => {
		const regex = new RegExp(propertyDeclarationRegex);
		const matches = regex.exec(propertyDeclaration);

		if (!matches) {
			return null;
		}
		const [_full, commaSeparatedAttributes, type, name] = matches;
		const attributes = commaSeparatedAttributes
			.split(",")
			.map(attribute => attribute.trim());

		return {
			name, 
			type, 
			attributes
		};
	})
	.filter(declaration => !!declaration);
}

const parse = file => {
	const fileWithoutComments = file.replace(/\/\*[^]*?\*\//g, "");
	const { name, superclass, protocols } = parseInterfaceDeclaration(file);
	return {
		name,
		superclass,
		protocols,
		methods: parseMethods(file),
		properties: parseProperties(fileWithoutComments),
	};
};

module.exports = parse;
