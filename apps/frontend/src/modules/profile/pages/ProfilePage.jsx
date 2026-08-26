import { useState } from 'react'
import PersonalInfoSection from '../components/PersonalInfoSection.jsx'
import NotificationsList from '../components/NotificationsList.jsx'
import { useNotifications } from '../profile.hooks.js'

const TABS = [
  { key: 'info', label: 'Personal Info' },
  { key: 'notifications', label: 'Notifications' },
]

function ProfilePage() {
  const [activeTab, setActiveTab] = useState('info')
  const { notifications, markAsRead } = useNotifications()
  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1>Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account details and view your notifications.
        </p>
      </div>

      <div className="flex gap-2 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`relative px-4 py-2.5 text-sm font-medium transition ${
              activeTab === tab.key
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            {tab.key === 'notifications' && unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                {unreadCount}
              </span>
            )}
            {activeTab === tab.key && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'info' ? (
        <PersonalInfoSection />
      ) : (
        <NotificationsList notifications={notifications} onMarkAsRead={markAsRead} />
      )}
    </div>
  )
}

export default ProfilePage
