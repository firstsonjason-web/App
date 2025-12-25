import Foundation
import FamilyControls
import DeviceActivity
import ManagedSettings
import SwiftUI

@objc(ScreenTimeUsage)
class ScreenTimeUsage: NSObject {
    private let authCenter = AuthorizationCenter.shared
    private let activityCenter = DeviceActivityCenter()
    
    // selection must be accessed on the main thread as it's used in UI
    @MainActor private var selection = FamilyActivitySelection()
    
    @objc
    static func moduleName() -> String! {
        return "ScreenTimeUsage"
    }
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }

    @objc func requestAuthorization(_ resolve: @escaping RCTPromiseResolveBlock,
                                    rejecter reject: @escaping RCTPromiseRejectBlock) {
        Task {
            do {
                if #available(iOS 16.0, *) {
                    try await authCenter.requestAuthorization(for: .individual)
                    resolve(NSNumber(value: true))
                } else {
                    reject("version_error", "iOS 16.0 or newer required", nil)
                }
            } catch {
                reject("auth_error", error.localizedDescription, error)
            }
        }
    }
    
    @objc func isAuthorized(_ resolve: @escaping RCTPromiseResolveBlock,
                           rejecter reject: @escaping RCTPromiseRejectBlock) {
        if #available(iOS 16.0, *) {
            let status = authCenter.authorizationStatus
            resolve(NSNumber(value: status == .approved))
        } else {
            resolve(NSNumber(value: false))
        }
    }

    @objc func presentPicker(_ resolve: @escaping RCTPromiseResolveBlock,
                             rejecter reject: @escaping RCTPromiseRejectBlock) {
        Task { @MainActor in
            let pickerWrapper = PickerWrapper(
                selection: Binding(
                    get: { self.selection },
                    set: { self.selection = $0 }
                ),
                onDone: {
                    UIApplication.shared.connectedScenes
                        .compactMap({ ($0 as? UIWindowScene)?.keyWindow })
                        .first?.rootViewController?.dismiss(animated: true)
                }
            )
            let vc = UIHostingController(rootView: pickerWrapper)
            vc.modalPresentationStyle = .formSheet
            guard let root = UIApplication.shared.connectedScenes
                .compactMap({ ($0 as? UIWindowScene)?.keyWindow })
                .first?.rootViewController else { 
                reject("no_root", "No root VC", nil)
                return 
            }
            root.present(vc, animated: true) {
                resolve(NSNumber(value: true))
            }
        }
    }

    @objc func startDailyMonitor(_ resolve: @escaping RCTPromiseResolveBlock,
                                 rejecter reject: @escaping RCTPromiseRejectBlock) {
        Task {
            do {
                var start = DateComponents(); start.hour = 0; start.minute = 0
                var end   = DateComponents(); end.hour = 23; end.minute = 59

                let schedule = DeviceActivitySchedule(
                    intervalStart: start,
                    intervalEnd: end,
                    repeats: true
                )

                // 5-minute repeating threshold
                let eventName = DeviceActivityEvent.Name("tick5")
                let event = DeviceActivityEvent(
                    threshold: DateComponents(minute: 5)
                )

                try activityCenter.startMonitoring(
                    DeviceActivityName("dailyActive"),
                    during: schedule,
                    events: [eventName: event]
                )
                resolve(NSNumber(value: true))
            } catch {
                reject("monitor_error", error.localizedDescription, error)
            }
        }
    }

    @objc func getTodayActiveSeconds(_ resolve: @escaping RCTPromiseResolveBlock,
                                     rejecter reject: @escaping RCTPromiseRejectBlock) {
        let seconds: Int
        if let defaults = UserDefaults(suiteName: Shared.appGroupId) {
            seconds = defaults.integer(forKey: todayKey())
        } else {
            seconds = 0
        }
        resolve(NSNumber(value: seconds))
    }
    
    @objc func getDebugInfo(_ resolve: @escaping RCTPromiseResolveBlock,
                            rejecter reject: @escaping RCTPromiseRejectBlock) {
        var info: [String: Any] = [:]
        
        // Check authorization status
        if #available(iOS 16.0, *) {
            let status = authCenter.authorizationStatus
            info["authStatus"] = String(describing: status)
            
            // Only check activities if authorized to avoid potential crashes/exceptions
            if status == .approved {
                let activities = activityCenter.activities
                info["monitoringActivities"] = activities.map { $0.rawValue }
            } else {
                info["monitoringActivities"] = [] as [String]
            }
        }
        
        // Check App Group
        if let defaults = UserDefaults(suiteName: Shared.appGroupId) {
            let key = todayKey()
            info["todayKey"] = key
            info["activeSeconds"] = defaults.integer(forKey: key)
            info["lastActiveTs"] = defaults.double(forKey: "lastActiveTs")
            info["appGroupAvailable"] = true
            
            // List all keys in the app group safely
            let dict = defaults.dictionaryRepresentation()
            var relevantKeys: [String] = []
            for k in dict.keys {
                if k.starts(with: "activeSeconds_") || k == "lastActiveTs" {
                    relevantKeys.append(k)
                }
            }
            info["relevantKeys"] = relevantKeys
        } else {
            info["appGroupAvailable"] = false
        }
        
        resolve(info)
    }
}

struct PickerWrapper: View {
    @Binding var selection: FamilyActivitySelection
    var onDone: () -> Void

    var body: some View {
        NavigationView {
            FamilyActivityPicker(selection: $selection)
                .toolbar {
                    ToolbarItem(placement: .navigationBarTrailing) {
                        Button("Done") {
                            onDone()
                        }
                    }
                }
                .navigationTitle("Select Apps")
                .navigationBarTitleDisplayMode(.inline)
        }
    }
}
