const fs = require('fs');
const objcToJs = require('../index');

function loadFile(name) {
    return fs.readFileSync(`./exampleFiles/${name}.h`, 'utf8');
}

describe('objective-c-parser', () => {
    describe('basic example', () => {
        const basic = loadFile('basic');
        it('should return name of basic example', () => {
            expect(objcToJs(basic).name).toBe('BasicName');
        });

        it('should return two methods for basic example', () => {
            const methods = objcToJs(basic).methods;
            expect(methods).toBeInstanceOf(Array);
            expect(methods.length).toBe(2);

            expect(methods[0].name).toBe('basicMethodOne');
            expect(methods[0].returnType).toBe('NSInteger');
            expect(methods[0].comment).toBe(
                'This is the comment of basic method one'
            );

            expect(methods[1].name).toBe('basicMethodTwoWithArgOne:AndArgTwo:');
            expect(methods[1].returnType).toBe('NSString');
            expect(methods[1].comment)
                .toBe(`This is the comment of basic method two.
It has multiple lines`);

            expect(methods[1].args.length).toBe(2);
            expect(methods[1].args[0].type).toBe('NSInteger');
            expect(methods[1].args[0].name).toBe('argOne');

            expect(methods[1].args[1].type).toBe('NSString');
            expect(methods[1].args[1].name).toBe('argTwo');
        });
    });

    describe('advanced', () => {
        const advanced = loadFile('advanced');

        it('should have the right name', () => {
            expect(objcToJs(advanced).name).toBe('GREYActions');
        });

        it('should have the right amount of methods', () => {
            const methods = objcToJs(advanced).methods;
            expect(methods.length).toBe(31);
        });
    });
});
