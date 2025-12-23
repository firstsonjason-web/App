import Foundation
import FamilyControls
import DeviceActivity
import ManagedSettings
import SwiftUI

@objc(ScreenTimeUsage)
class ScreenTimeUsage: NSObject {
    private let authCenter = AuthorizationCenter.shared
    private let activityCenter = DeviceActivityCenter()
    
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
        Task { @MainActor in
            do {
                if #available(iOS 16.0, *) {
                    try await authCenter.requestAuthorization(for: .individual)
                    resolve(true)
                } else {
                    reject("version_error", "iOS 16.0 or newer required", nil)
                }
            } catch {
                reject("auth_error", error.localizedDescription, error)
            }
        }
    }

    @objc func presentPicker(_ resolve: @escaping RCTPromiseResolveBlock,
                             rejecter reject: @escaping RCTPromiseRejectBlock) {
        Task { @MainActor in
            let picker = FamilyActivityPicker(selection: .constant(.init()))
            let vc = UIHostingController(rootView: picker)
            vc.modalPresentationStyle = .formSheet
            guard let root = UIApplication.shared.connectedScenes
                .compactMap({ ($0 as? UIWindowScene)?.keyWindow })
                .first?.rootViewController else { reject("no_root", "No root VC", nil); return }
            root.present(vc, animated: true) {
                resolve(true)
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
                resolve(true)
            } catch {
                reject("monitor_error", error.localizedDescription, error)
            }
        }
    }

    @objc func getTodayActiveSeconds(_ resolve: RCTPromiseResolveBlock,
                                     rejecter reject: RCTPromiseRejectBlock) {
        if let defaults = UserDefaults(suiteName: Shared.appGroupId) {
            resolve(defaults.integer(forKey: todayKey()))
        } else {
            resolve(0)
        }
    }
}
