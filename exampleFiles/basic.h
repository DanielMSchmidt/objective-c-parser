#import <Foundation/Foundation.h>
@protocol Ponies, Foo;
@interface BasicName : NSObject

// Another stupid comment
@property(nonatomic, readonly) uninteresting<IgnorePlease> matcher;


// This is the comment of basic method one
- (NSInteger)basicMethodOne ;

/**
 *  This is the comment of basic method two.
 *  It has multiple lines
 *  Example:
 * - (NSString *)basicMethodTwoWithArgOne:(NSInteger)argOne;
 */
- (NSString *)basicMethodTwoWithArgOne:(NSInteger)argOne;

/**
 *  This is the comment of basic method three.
 *  It has multiple lines
 */
- (NSString *) basicMethodThreeWithArgOne:(NSInteger)argOne AndArgTwo:(NSString *)argTwo;

// A static method
+ (NSInteger)basicStaticMethodOne;

/**
 * This is the comment of basic method five with block arguments
 */ 
+ (void)basicStaticMethodTwo:(nonnull void(^)(void))argOne;


+ (NSString *)argOneMethod:(NSInteger)argOne;

/** This is the comment of multiple lines in one line **/
+ (NSString *)argOneMethodTwo:(NSInteger)argOne;


@end