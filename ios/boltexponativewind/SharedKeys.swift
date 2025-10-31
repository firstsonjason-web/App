import Foundation

public enum Shared {
    public static let appGroupId = "group.com.owenisas.app.deviceusage"
    public static let todayKeyPrefix = "activeSeconds-" // YYYY-MM-DD appended
}

public func todayKey() -> String {
    let df = DateFormatter(); df.dateFormat = "yyyy-MM-dd"; df.timeZone = .current
    return Shared.todayKeyPrefix + df.string(from: Date())
}