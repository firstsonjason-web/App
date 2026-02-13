import Foundation

// MARK: - ScreenTimeUsage Native Module (COMPLETELY DISABLED)
// =============================================================================
// CRITICAL: This module is completely disabled due to crashes on various iOS versions.
// The crashes happen during TurboModule/bridge interop and exception handling.
//
// All methods immediately return safe values without any ObjC calls or exception handling.
// This is the safest possible implementation.
// =============================================================================

@objc(ScreenTimeUsage)
class ScreenTimeUsage: NSObject {

    // Use class var instead of static func to avoid potential TurboModule interop issues
    @objc
    class var moduleName: String {
        return "ScreenTimeUsage"
    }

    // IMPORTANT: Return TRUE - require main queue setup
    // This ensures all method calls happen on the main thread which is more stable
    // for React Native's bridge/TurboModule interop
    @objc
    class func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    // Explicitly declare we can be instantiated
    override init() {
        super.init()
    }

    // MARK: - Completely Safe Methods
    // These methods do NOTHING that could throw - just return immediately

    @objc func requestAuthorization(_ resolve: @escaping RCTPromiseResolveBlock,
                                    rejecter reject: @escaping RCTPromiseRejectBlock) {
        // Immediately reject - no other code
        reject("UNAVAILABLE", "Screen Time features are temporarily disabled", nil)
    }

    @objc func isAuthorized(_ resolve: @escaping RCTPromiseResolveBlock,
                           rejecter reject: @escaping RCTPromiseRejectBlock) {
        // Immediately resolve false - no other code
        resolve(NSNumber(value: false))
    }

    @objc func presentPicker(_ resolve: @escaping RCTPromiseResolveBlock,
                             rejecter reject: @escaping RCTPromiseRejectBlock) {
        // Immediately reject - no other code
        reject("UNAVAILABLE", "Screen Time features are temporarily disabled", nil)
    }

    @objc func startDailyMonitor(_ resolve: @escaping RCTPromiseResolveBlock,
                                 rejecter reject: @escaping RCTPromiseRejectBlock) {
        // Immediately reject - no other code
        reject("UNAVAILABLE", "Screen Time features are temporarily disabled", nil)
    }

    @objc func getTodayActiveSeconds(_ resolve: @escaping RCTPromiseResolveBlock,
                                     rejecter reject: @escaping RCTPromiseRejectBlock) {
        // Return 0 immediately - no UserDefaults access, nothing
        resolve(NSNumber(value: 0))
    }

    @objc func getDebugInfo(_ resolve: @escaping RCTPromiseResolveBlock,
                            rejecter reject: @escaping RCTPromiseRejectBlock) {
        // Return minimal info immediately - no complex operations
        let info: [String: Any] = [
            "featureDisabled": true,
            "disabledReason": "Module completely disabled due to stability issues"
        ]
        resolve(info)
    }
}
