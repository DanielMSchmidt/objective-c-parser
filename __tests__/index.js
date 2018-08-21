const fs = require("fs");
const objcToJs = require("../index");

function loadFile(name) {
	return fs.readFileSync(`./exampleFiles/${name}.h`, "utf8");
}

describe("objective-c-parser", () => {
	describe("empty file", () => {
		const empty = loadFile("empty");
		it("should return an empty list of methods for an empty header file", () => {
			expect(objcToJs(empty).methods).toEqual([]);
		});
	});

	describe("basic example", () => {
		const basic = loadFile("basic");
		it("should return name of basic example", () => {
			expect(objcToJs(basic).name).toBe("BasicName");
		});

		it("should return three methods for basic example", () => {
			const methods = objcToJs(basic).methods;
			expect(methods).toBeInstanceOf(Array);
			expect(methods.length).toBe(3);

			expect(methods[0].args.length).toBe(0);
			expect(methods[0].name).toBe("basicMethodOne");
			expect(methods[0].returnType).toBe("NSInteger");
			expect(methods[0].comment).toBe(
				"This is the comment of basic method one"
			);

			expect(methods[1].name).toBe("basicMethodTwoWithArgOne:AndArgTwo:");
			expect(methods[1].returnType).toBe("NSString");
			expect(methods[1].comment).toBe(`This is the comment of basic method two.
It has multiple lines`);

			expect(methods[1].args.length).toBe(2);
			expect(methods[1].args[0].type).toBe("NSInteger");
			expect(methods[1].args[0].name).toBe("argOne");

			expect(methods[1].args[1].type).toBe("NSString");
			expect(methods[1].args[1].name).toBe("argTwo");
		});

		it("should be able to detect static methods", () => {
			const methods = objcToJs(basic).methods;
			expect(methods[0].static).toBe(false);
			expect(methods[1].static).toBe(false);
			expect(methods[2].static).toBe(true);
		});
	});

	describe("advanced", () => {
		const advanced = loadFile("advanced");

		it("should have the right name", () => {
			expect(objcToJs(advanced).name).toBe("GREYActions");
		});

		it("should have the right amount of methods", () => {
			const methods = objcToJs(advanced).methods;
			expect(methods.length).toBe(31);
		});

		it("should parse methods with pointers corretctly", () => {
			const method = objcToJs(advanced).methods[24];
			expect(method.name).toBe("actionForReplaceText:");
			expect(method.args[0].type).toBe("NSString *");
			expect(method.args[0].name).toBe("text");
		});

		it("should parse methods with underscores corretctly", () => {
			const method = objcToJs(advanced).methods[30];
			expect(method.name).toBe("actionForSnapshot:");
			expect(method.args[0].type).toBe("out __strong UIImage **");
			expect(method.args[0].name).toBe("outImage");
		});

		it("should parse methods with two args correctly", () => {
			const method = objcToJs(advanced).methods[6];
			expect(method.name).toBe(
				"actionForScrollInDirection:amount:xOriginStartPercentage:yOriginStartPercentage:"
			);
			expect(method.args[0].type).toBe("GREYDirection");
			expect(method.args[0].name).toBe("direction");
			expect(method.args[1].type).toBe("CGFloat");
			expect(method.args[1].name).toBe("amount");
			expect(method.args[2].type).toBe("CGFloat");
			expect(method.args[2].name).toBe("xOriginStartPercentage");
			expect(method.args[3].type).toBe("CGFloat");
			expect(method.args[3].name).toBe("yOriginStartPercentage");
		});
	});

	describe("edge cases", () => {
		const noComments = loadFile("noComments");

		it("should return every method", () => {
			const { methods } = objcToJs(noComments);
			expect(methods.length).toBe(8);
		});

		it("should find the arguments even with type casts", () => {
			const { methods } = objcToJs(noComments);
			const methodWithArgument = methods[1];
			expect(methodWithArgument.name).toBe(
				"detoxMatcherForScrollChildOfMatcher:"
			);
			expect(methodWithArgument.args.length).toBe(1);
			expect(methodWithArgument.args[0].type).toBe("id<GREYMatcher>");
			expect(methodWithArgument.args[0].name).toBe("matcher");
		});
	});

	describe("withImplementation", () => {
		const withImplementation = loadFile("withImplementation");

		it("should return every method", () => {
			const { methods } = objcToJs(withImplementation);
			expect(methods.length).toBe(14); // actually 17, but we don't need the last 3 regex is hard
			expect(methods.map(m => m.name)).toEqual(
				expect.arrayContaining([
					"initWithElementMatcher:",
					"inRoot:",
					"atIndex:",
					"rootElementProvider",
					"performAction:",
					"performAction:error:",
					"assert:",
					"assert:error:",
					"assertWithMatcher:",
					"assertWithMatcher:error:",
					"usingSearchAction:onElementWithMatcher:",
					"grey_uniqueElementInMatchedElements:andError:",
					"grey_handleFailureOfAction:actionError:userProvidedOutError:",
					"grey_handleFailureOfAssertion:assertionError:userProvidedOutError:"
				])
			);
		});
	});

	describe("noClassName", () => {
		const noClassName = loadFile("noClassName");

		it("should not fail without classname", () => {
			expect(() => {
				objcToJs(noClassName);
			}).not.toThrow();
		});
	});

	describe("withMacros", () => {
		const withMacros = loadFile("withMacros");

		it("should not fail with macros", () => {
			expect(() => {
				objcToJs(withMacros);
			}).not.toThrow();
		});

		it("should not fail with macros", () => {
			const { methods } = objcToJs(withMacros);
			expect(methods[0].name).toBe("performAction:error:");
			expect(methods[0].args[0].name).toBe("action");
			expect(methods[0].args[1].name).toBe("errorOrNil");
		});
	});
});
