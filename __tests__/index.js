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

		it("should return seven methods for basic example", () => {
			const methods = objcToJs(basic).methods;
			expect(methods).toBeInstanceOf(Array);
			expect(methods.length).toBe(7);

			expect(methods[0].args.length).toBe(0);
			expect(methods[0].name).toBe("basicMethodOne");
			expect(methods[0].returnType).toBe("NSInteger");
			expect(methods[0].comment).toBe(
				"This is the comment of basic method one"
			);

			expect(methods[1].name).toBe("basicMethodTwoWithArgOne:");
			expect(methods[1].returnType).toBe("NSString *");
			expect(methods[1].comment).toBe(`This is the comment of basic method two.
It has multiple lines
Example:
- (NSString *)basicMethodTwoWithArgOne:(NSInteger)argOne;`);

			expect(methods[1].args.length).toBe(1);
			expect(methods[1].args[0].type).toBe("NSInteger");
			expect(methods[1].args[0].name).toBe("argOne");

			expect(methods[2].name).toBe("basicMethodThreeWithArgOne:AndArgTwo:");
			expect(methods[2].returnType).toBe("NSString *");
			expect(methods[2].comment)
				.toBe(`This is the comment of basic method three.
It has multiple lines`);

			expect(methods[2].args.length).toBe(2);
			expect(methods[2].args[0].type).toBe("NSInteger");
			expect(methods[2].args[0].name).toBe("argOne");

			expect(methods[2].args[1].type).toBe("NSString *");
			expect(methods[2].args[1].name).toBe("argTwo");

			expect(methods[5].name).toBe("argOneMethod:");
			expect(methods[5].returnType).toBe("NSString *");
			expect(methods[5].comment).toBe("");
			expect(methods[5].args.length).toBe(1);
			expect(methods[5].args[0].type).toBe("NSInteger");
			expect(methods[5].args[0].name).toBe("argOne");

			expect(methods[6].name).toBe("argOneMethodTwo:");
			expect(methods[6].returnType).toBe("NSString *");
			expect(methods[6].comment).toBe(
				"This is the comment of multiple lines in one line"
			);
			expect(methods[6].args.length).toBe(1);
			expect(methods[6].args[0].type).toBe("NSInteger");
			expect(methods[6].args[0].name).toBe("argOne");
		});

		it("should be able to detect static methods", () => {
			const methods = objcToJs(basic).methods;
			expect(methods[0].static).toBe(false);
			expect(methods[1].static).toBe(false);
			expect(methods[2].static).toBe(false);
			expect(methods[3].static).toBe(true);
			expect(methods[4].static).toBe(true);
			expect(methods[5].static).toBe(true);
			expect(methods[6].static).toBe(true);
		});

		it("should be able to detect method with block arguments", () => {
			const methods = objcToJs(basic).methods;
			expect(methods[4].name).toBe("basicStaticMethodTwo:");
			expect(methods[4].returnType).toBe("void");
			expect(methods[4].comment).toBe(
				`This is the comment of basic method five with block arguments`
			);

			expect(methods[4].args.length).toBe(1);
			expect(methods[4].args[0].type).toBe("nonnull void(^)(void)");
			expect(methods[4].args[0].name).toBe("argOne");
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
			expect(methods.length).toBe(17);
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
					"grey_handleFailureOfAssertion:assertionError:userProvidedOutError:",
					"grey_errorForMultipleMatchingElements:withMatchedElementsIndexOutOfBounds:",
					"grey_searchActionDescription"
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

	describe("withProperties", () => {
		const withProperties = loadFile("withProperties");

		it("should not fail with properties", () => {
			expect(() => {
				objcToJs(withProperties);
			}).not.toThrow();
		});

		it("should extract all properties", () => {
			const { properties } = objcToJs(withProperties);

			const expectedProperties = [
				{
					name: "series",
					type: "NSArray<NSString *>",
					attributes: ["nonatomic", "readwrite"],
				},
				{
					name: "colors",
					type: "NSArray<UIColor*>",
					attributes: ["nonatomic", "readwrite"],
				},
				{
					name: "controllers",
					type: "NSArray",
					attributes: ["nonatomic", "readwrite"],
				},
				{
					name: "title",
					type: "NSString",
					attributes: ["nonatomic", "readwrite"],
				},
				{
					name: "isSet",
					type: "NSNumber",
					attributes: ["nonatomic", "readwrite"],
				},
			]

			expect(properties).toStrictEqual(expectedProperties);
		});

	});

	describe("withProtocols", () => {
		const withProtocols = loadFile("withProtocols");

		it("should not fail with protocols and superclass", () => {
			expect(() => {
				objcToJs(withProtocols);
			}).not.toThrow();
		});

		it("should extract protocols", () => {
			const { protocols } = objcToJs(withProtocols);

			expect(protocols).toStrictEqual(["Nameable"]);
		});

		it("should extract superclass", () => {
			const { superclass } = objcToJs(withProtocols);

			expect(superclass).toBe("NSObject");
		});

	});
});
