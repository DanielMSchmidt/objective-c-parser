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