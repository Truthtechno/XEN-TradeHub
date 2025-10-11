'use client';

import { useState, useEffect } from 'react';

export default function TestNotificationsSimplePage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuthAndLoadNotifications();
  }, []);

  const checkAuthAndLoadNotifications = async () => {
    try {
      // Check if user is logged in
      const authResponse = await fetch('/api/auth/me');
      const authData = await authResponse.json();
      
      if (authResponse.ok && authData.user) {
        setUser(authData.user);
        
        // Load notifications
        const notificationsResponse = await fetch('/api/notifications');
        const notificationsData = await notificationsResponse.json();
        
        if (notificationsResponse.ok) {
          setNotifications(notificationsData.notifications || []);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
        // Reload the page to update everything
        window.location.reload();
      } else {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔔 Notification System Test</h1>
        
        {/* User Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">User Status</h2>
          {user ? (
            <div className="text-green-600">
              <p>✅ <strong>Logged in as:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>Name:</strong> {user.name}</p>
              <button
                onClick={handleLogout}
                className="mt-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="text-red-600">
              <p>❌ <strong>Not logged in</strong></p>
              <button
                onClick={handleLogin}
                className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Login as test@example.com
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">📬 Notifications</h2>
            <div className="text-sm text-gray-600">
              Total: {notifications.length} | Unread: {notifications.filter(n => !n.isRead).length}
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔔</div>
              <p className="text-gray-500 text-lg">No notifications found</p>
              <p className="text-sm text-gray-400 mt-2">
                {user ? 'This user has no notifications' : 'Please log in to see notifications'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={`p-4 border rounded-lg transition-all hover:shadow-md ${
                    notification.isRead 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-blue-50 border-blue-200 shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                            NEW
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          notification.type === 'WELCOME' ? 'bg-green-100 text-green-800' :
                          notification.type === 'COURSE' ? 'bg-purple-100 text-purple-800' :
                          notification.type === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                          notification.type === 'SYSTEM' ? 'bg-gray-100 text-gray-800' :
                          notification.type === 'PROMOTION' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {notification.type}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">
                        {notification.message}
                      </p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>📅 {new Date(notification.createdAt).toLocaleString()}</span>
                        <span>{notification.isRead ? '✅ Read' : '📬 Unread'}</span>
                      </div>
                    </div>
                    {notification.actionUrl && (
                      <a
                        href={notification.actionUrl}
                        className="ml-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm whitespace-nowrap"
                      >
                        View →
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
          <h3 className="font-semibold text-yellow-800 mb-3">🧪 Test Instructions:</h3>
          <ol className="list-decimal list-inside text-yellow-700 space-y-2">
            <li><strong>Login:</strong> Click "Login as test@example.com" if not logged in</li>
            <li><strong>View Notifications:</strong> You should see 5 test notifications appear above</li>
            <li><strong>Test Other Pages:</strong> Visit <a href="/notifications" className="text-blue-600 underline">/notifications</a> to see the full notification interface</li>
            <li><strong>Test Right Panel:</strong> Check the right notification panel on other pages (like <a href="/dashboard" className="text-blue-600 underline">/dashboard</a>)</li>
            <li><strong>Test Admin Actions:</strong> Login as admin and create new courses/resources to see notifications</li>
          </ol>
        </div>

        {/* Quick Links */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-4">
          <h3 className="font-semibold text-blue-800 mb-3">🔗 Quick Links:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="/notifications" className="text-blue-600 hover:text-blue-800 underline">Full Notifications Page</a>
            <a href="/dashboard" className="text-blue-600 hover:text-blue-800 underline">Dashboard (with right panel)</a>
            <a href="/courses" className="text-blue-600 hover:text-blue-800 underline">Courses</a>
            <a href="/resources" className="text-blue-600 hover:text-blue-800 underline">Resources</a>
          </div>
        </div>
      </div>
    </div>
  );
}
