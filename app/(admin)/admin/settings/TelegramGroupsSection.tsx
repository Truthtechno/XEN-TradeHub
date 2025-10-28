'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Plus, Trash2, Save, Edit2, X } from 'lucide-react'

interface TelegramGroup {
  id: string
  name: string
  link: string
  description?: string
  category?: string
  displayOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export function TelegramGroupsSection() {
  const [groups, setGroups] = useState<TelegramGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    link: '',
    description: '',
    category: '',
    displayOrder: 0,
    isActive: true
  })

  // Fetch groups on mount
  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/telegram-groups')
      const data = await response.json()
      setGroups(data.groups || [])
    } catch (error) {
      console.error('Error fetching telegram groups:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingId(null)
    setShowForm(true)
    setFormData({
      name: '',
      link: '',
      description: '',
      category: '',
      displayOrder: groups.length,
      isActive: true
    })
  }

  const handleEdit = (group: TelegramGroup) => {
    setEditingId(group.id)
    setShowForm(true)
    setFormData({
      name: group.name,
      link: group.link,
      description: group.description || '',
      category: group.category || '',
      displayOrder: group.displayOrder,
      isActive: group.isActive
    })
  }

  const handleCancel = () => {
    setEditingId(null)
    setShowForm(false)
    setFormData({
      name: '',
      link: '',
      description: '',
      category: '',
      displayOrder: 0,
      isActive: true
    })
  }

  const handleSave = async () => {
    try {
      let response
      if (editingId) {
        // Update existing
        response = await fetch(`/api/admin/telegram-groups/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
      } else {
        // Create new
        response = await fetch('/api/admin/telegram-groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
      }

      if (response.ok) {
        await fetchGroups()
        setShowForm(false)
        setEditingId(null)
        setFormData({
          name: '',
          link: '',
          description: '',
          category: '',
          displayOrder: 0,
          isActive: true
        })
      } else {
        const errorData = await response.json()
        alert(`Failed to save telegram group: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error saving telegram group:', error)
      alert('Error saving telegram group')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this telegram group?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/telegram-groups/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchGroups()
      } else {
        alert('Failed to delete telegram group')
      }
    } catch (error) {
      console.error('Error deleting telegram group:', error)
      alert('Error deleting telegram group')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Telegram Groups
        </CardTitle>
        <CardDescription>
          Manage Telegram groups and channels for users to join
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add/Edit Form */}
        {showForm && (
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{editingId ? 'Edit Group' : 'Add New Group'}</h4>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., HFM Signal Group"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., HFM, Quiti, General"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Telegram Link *
              </label>
              <Input
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://t.me/yourgroup"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={2}
                placeholder="Brief description of the group"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Order
                </label>
                <Input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                </label>
              </div>
            </div>
            <Button onClick={handleSave} className="w-full bg-theme-primary hover:bg-theme-primary-700 text-white">
              <Save className="h-4 w-4 mr-2" />
              Save Group
            </Button>
          </div>
        )}

        {/* Groups List */}
        <div className="space-y-2">
            <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Groups ({groups.length})</h4>
            {!showForm && (
              <Button className="bg-theme-primary hover:bg-theme-primary-700 text-white" onClick={handleAdd} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Group
              </Button>
            )}
          </div>
          {groups.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No telegram groups yet. Click "Add Group" to create one.
            </div>
          ) : (
            groups.map((group) => (
              <div
                key={group.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-medium">{group.name}</h5>
                      {group.category && (
                        <Badge variant="outline">{group.category}</Badge>
                      )}
                      {!group.isActive && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    {group.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{group.description}</p>
                    )}
                    <a
                      href={group.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {group.link}
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(group)}
                      disabled={showForm && editingId !== group.id}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(group.id)}
                      disabled={showForm}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

