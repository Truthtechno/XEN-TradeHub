'use client';

import { useState, useEffect } from 'react';
import { useNotifications } from '@/lib/notifications-context';

export default function TestNotificationsPage() {
  const { notifications, isLoading, unreadCount, refreshNotifications } = useNotifications();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Check session
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => setSession(data))
      .catch(err => console.error('Error fetching session:', err));
  }, []);

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful:', data);
        // Refresh the page to update session
        window.location.reload();
      } else {
        console.error('Login failed:', data.error);
        alert(`Login failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      });

      if (response.ok) {
        console.log('Logout successful');
        window.location.reload();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Notification System Test</h1>
        
        {/* Session Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Session Status</h2>
          {session && session.user ? (
            <div className="text-green-600">
              <p>✅ Logged in as: {session.user.email}</p>
              <p>Role: {session.user.role}</p>
              <button
                onClick={handleLogout}
                className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="text-red-600">
              <p>❌ Not logged in</p>
              <button
                onClick={handleLogin}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Login as test@example.com
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Notifications</h2>
            <div className="flex gap-4">
              <span className="text-sm text-gray-600">
                Total: {notifications.length} | Unread: {unreadCount}
              </span>
              <button
                onClick={refreshNotifications}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Refresh
              </button>
            </div>
          </div>

          {isLoading ? (
            <p>Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No notifications found</p>
              <p className="text-sm text-gray-400 mt-2">
                Make sure you're logged in as test@example.com
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification: any) => (
                <div
                  key={notification.id}
                  className={`p-4 border rounded-lg ${
                    notification.isRead ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span>Type: {notification.type}</span>
                        <span>
                          {notification.isRead ? 'Read' : 'Unread'}
                        </span>
                        <span>
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {notification.actionUrl && (
                      <a
                        href={notification.actionUrl}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        View
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <h3 className="font-semibold text-yellow-800 mb-2">Test Instructions:</h3>
          <ol className="list-decimal list-inside text-yellow-700 space-y-1">
            <li>Click "Login as test@example.com" if not logged in</li>
            <li>You should see 5 test notifications appear</li>
            <li>Check the right notification panel on other pages</li>
            <li>Visit /notifications page to see the full notification interface</li>
            <li>Test creating new courses/resources as admin to see notifications</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
