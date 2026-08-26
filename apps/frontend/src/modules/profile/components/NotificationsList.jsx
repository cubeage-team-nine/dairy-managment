function NotificationsList({ notifications, onMarkAsRead }) {
  if (notifications.length === 0) {
    return <p className="text-sm text-muted-foreground">No notifications yet.</p>
  }

  return (
    <ul className="space-y-2">
      {notifications.map((notification) => (
        <li
          key={notification.id}
          onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
          className={`flex items-start gap-3 rounded-lg border px-4 py-3 transition ${
            notification.isRead
              ? 'border-border bg-card'
              : 'cursor-pointer border-primary/30 bg-primary-soft'
          }`}
        >
          <span
            className={`mt-1.5 size-2 shrink-0 rounded-full ${
              notification.isRead ? 'bg-transparent' : 'bg-primary'
            }`}
          />

          <div className="min-w-0 flex-1">
            <p
              className={`text-sm ${
                notification.isRead ? 'text-muted-foreground' : 'font-medium text-foreground'
              }`}
            >
              {notification.message}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(notification.timestamp).toLocaleString()}
            </p>
          </div>

          {!notification.isRead && (
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              New
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}

export default NotificationsList
