import Foundation
import DeviceActivity
import FamilyControls

/// DeviceActivityMonitor extension that accumulates active seconds and writes them
/// into the shared app group so the React Native bridge can read today's usage.
///
/// Notes:
/// - Make sure this file is added to the Device Activity Monitor extension target.
/// - Ensure the extension target has the App Group `group.com.homingchan.app.deviceusage`
///   and the FamilyControls capability enabled.
/// - This uses a simple time-delta accumulator between events; for finer accuracy,
///   a Device Activity Report extension can be added later.
class DeviceActivityMonitorExtension: DeviceActivityMonitor {
    private let defaults = UserDefaults(suiteName: Shared.appGroupId)
    private let lastSeenKey = "lastActiveTs"

    override func intervalDidStart(for activity: DeviceActivityName) {
        accumulate()
    }

    override func intervalDidEnd(for activity: DeviceActivityName) {
        accumulate()
    }

    override func eventDidReachThreshold(_ event: DeviceActivityEvent.Name, activity: DeviceActivityName) {
        accumulate()
    }

    /// Accumulates active seconds between the last event and now, stores in shared defaults.
    private func accumulate() {
        let now = Date().timeIntervalSince1970
        let todayKeyName = todayKey()

        let storedTotal = defaults?.integer(forKey: todayKeyName) ?? 0
        let lastTs = defaults?.double(forKey: lastSeenKey) ?? 0

        // Reset day change if last timestamp is from a different day
        if lastTs > 0, !isSameDay(timestamp: lastTs, now: now) {
            defaults?.set(0, forKey: todayKeyName)
        }

        if lastTs > 0, isSameDay(timestamp: lastTs, now: now) {
            let delta = max(0, now - lastTs) // seconds
            let updated = storedTotal + Int(delta)
            defaults?.set(updated, forKey: todayKeyName)
        }

        defaults?.set(now, forKey: lastSeenKey)
    }

    private func isSameDay(timestamp: TimeInterval, now: TimeInterval) -> Bool {
        let cal = Calendar.current
        let d1 = Date(timeIntervalSince1970: timestamp)
        let d2 = Date(timeIntervalSince1970: now)
        return cal.isDate(d1, inSameDayAs: d2)
    }
}
