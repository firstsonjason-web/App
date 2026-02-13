//
//  ObjCExceptionHandler.m
//  boltexponativewind
//
//  Objective-C exception handler to catch NSExceptions that Swift cannot catch
//

#import "ObjCExceptionHandler.h"

@implementation ObjCExceptionHandler

+ (BOOL)tryExecuting:(void (^)(void))tryBlock error:(NSError * _Nullable * _Nullable)error {
    @try {
        if (tryBlock) {
            tryBlock();
        }
        return YES;
    }
    @catch (NSException *exception) {
        if (error) {
            NSDictionary *userInfo = @{
                NSLocalizedDescriptionKey: exception.reason ?: @"Unknown exception",
                @"ExceptionName": exception.name ?: @"Unknown",
                @"ExceptionReason": exception.reason ?: @"Unknown",
                @"ExceptionUserInfo": exception.userInfo ?: @{}
            };
            *error = [NSError errorWithDomain:@"ObjCExceptionDomain" 
                                         code:-1 
                                     userInfo:userInfo];
        }
        NSLog(@"[ObjCExceptionHandler] Caught exception: %@ - %@", exception.name, exception.reason);
        return NO;
    }
}

+ (BOOL)tryExecutingSilently:(void (^)(void))tryBlock {
    @try {
        if (tryBlock) {
            tryBlock();
        }
        return YES;
    }
    @catch (NSException *exception) {
        NSLog(@"[ObjCExceptionHandler] Silently caught exception: %@ - %@", exception.name, exception.reason);
        return NO;
    }
}

@end
