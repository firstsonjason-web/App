import DeviceActivity

final class MonitorExtension: DeviceActivityMonitorExtension {
    let defaults = UserDefaults(suiteName: Shared.appGroupId)!

    override func eventDidReachThreshold(_ event: DeviceActivityEvent.Name, activity: DeviceActivityName) {
        // We configured threshold = 5 minutes.
        let delta = 5 * 60
        let key = todayKey()
        let curr = defaults.integer(forKey: key)
        defaults.set(curr + delta, forKey: key)
    }
}