#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

@interface WithProperties : NSObject

@property(nonatomic, readwrite) NSArray<NSString *> *series;

@property(nonatomic, readwrite) NSArray<UIColor*> *colors;

@property(nonatomic, readwrite) NSArray *controllers;

@property(nonatomic, readwrite) NSString *title;

@property(nonatomic, readwrite) NSNumber /* Bool */ *isSet;

@end