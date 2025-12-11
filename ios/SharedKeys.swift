import Foundation

struct Shared {
    static let appGroupId = "group.com.homingchan.app.deviceusage"
}

func todayKey() -> String {
    let formatter = DateFormatter()
    formatter.dateFormat = "yyyy-MM-dd"
    return "activeSeconds_\(formatter.string(from: Date()))"
}
