jest.mock('fs');
const objcToJs = require('../index');
const basic = `
#import <Foundation/Foundation.h>
@protocol Ponies, Foo;
@interface BasicName : NSObject

// Another stupid comment
@property(nonatomic, readonly) uninteresting<IgnorePlease> matcher;


// This is the comment of basic method one
- (NSInteger)basicMethodOne;

/**
 *  This is the comment of basic method two.
 *  It has multiple lines

 */
- (NSString) basicMethodTwoWithArgOne:(NSInteger)argOne AndArgTwo:(NSString)argTwo;
@end
`;

describe('objective-c-parser', () => {
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

        expect(methods[1].name).toBe('basicMethodTwoWithArgOneAndArgTwo');
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
