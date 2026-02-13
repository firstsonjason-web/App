//
//  ObjCExceptionHandler.h
//  boltexponativewind
//
//  Objective-C exception handler to catch NSExceptions that Swift cannot catch
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface ObjCExceptionHandler : NSObject

/// Execute a block and catch any Objective-C exceptions
/// @param tryBlock The block to execute
/// @param error On return, contains any exception that was thrown
/// @return YES if the block executed without exception, NO otherwise
+ (BOOL)tryExecuting:(void (^)(void))tryBlock error:(NSError * _Nullable * _Nullable)error;

/// Execute a block and return whether it succeeded (swallows exceptions)
+ (BOOL)tryExecutingSilently:(void (^)(void))tryBlock;

@end

NS_ASSUME_NONNULL_END
