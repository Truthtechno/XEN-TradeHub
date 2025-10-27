'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, Users, ExternalLink } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { FileUpload } from '@/components/ui/file-upload'

interface CopyTradingPlatform {
  id: string
  name: string
  slug: string
  description: string | null
  logoUrl: string | null
  copyTradingLink: string
  profitPercentage: number
  profitShareRate: number
  riskLevel: string
  minInvestment: number
  strategy: string | null
  roi: number
  winRate: number
  maxDrawdown: number
  isActive: boolean
  displayOrder: number
  notes: string | null
  _count?: {
    subscriptions: number
  }
}

interface Subscription {
  id: string
  investmentUSD: number
  status: string
  startDate: string
  user: {
    name: string | null
    email: string
  }
  platform: {
    name: string
  }
}

export default function CopyTradingAdminPage() {
  const [platforms, setPlatforms] = useState<CopyTradingPlatform[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState<CopyTradingPlatform | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showSubscriptions, setShowSubscriptions] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    logoUrl: '',
    copyTradingLink: '',
    profitPercentage: 0,
    profitShareRate: 20,
    riskLevel: 'MEDIUM',
    minInvestment: 1000,
    strategy: '',
    roi: 0,
    winRate: 0,
    maxDrawdown: 0,
    isActive: true,
    displayOrder: 0,
    notes: ''
  })

  useEffect(() => {
    fetchPlatforms()
    fetchSubscriptions()
  }, [])

  const fetchPlatforms = async () => {
    try {
      const response = await fetch('/api/admin/copy-trading/platforms')
      if (response.ok) {
        const data = await response.json()
        setPlatforms(data.platforms || [])
      }
    } catch (error) {
      console.error('Error fetching platforms:', error)
      toast.error('Failed to load platforms')
    } finally {
      setLoading(false)
    }
  }

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/admin/copy-trading/subscriptions')
      if (response.ok) {
        const data = await response.json()
        setSubscriptions(data.subscriptions || [])
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  const handleCreate = () => {
    setSelectedPlatform(null)
    setFormData({
      name: '',
      slug: '',
      description: '',
      logoUrl: '',
      copyTradingLink: '',
      profitPercentage: 0,
      profitShareRate: 20,
      riskLevel: 'MEDIUM',
      minInvestment: 1000,
      strategy: '',
      roi: 0,
      winRate: 0,
      maxDrawdown: 0,
      isActive: true,
      displayOrder: platforms.length,
      notes: ''
    })
    setIsEditing(true)
  }

  const handleEdit = (platform: CopyTradingPlatform) => {
    setSelectedPlatform(platform)
    setFormData({
      name: platform.name,
      slug: platform.slug,
      description: platform.description || '',
      logoUrl: platform.logoUrl || '',
      copyTradingLink: platform.copyTradingLink,
      profitPercentage: platform.profitPercentage,
      profitShareRate: platform.profitShareRate,
      riskLevel: platform.riskLevel,
      minInvestment: platform.minInvestment,
      strategy: platform.strategy || '',
      roi: platform.roi,
      winRate: platform.winRate,
      maxDrawdown: platform.maxDrawdown,
      isActive: platform.isActive,
      displayOrder: platform.displayOrder,
      notes: platform.notes || ''
    })
    setIsEditing(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Platform name is required')
      return
    }
    if (!formData.copyTradingLink.trim()) {
      toast.error('Copy trading link is required')
      return
    }

    setSubmitting(true)

    const payload = {
      name: formData.name,
      slug: formData.slug || generateSlug(formData.name),
      description: formData.description,
      logoUrl: formData.logoUrl,
      copyTradingLink: formData.copyTradingLink,
      profitPercentage: formData.profitPercentage,
      profitShareRate: formData.profitShareRate,
      riskLevel: formData.riskLevel,
      minInvestment: formData.minInvestment,
      strategy: formData.strategy,
      roi: formData.roi,
      winRate: formData.winRate,
      maxDrawdown: formData.maxDrawdown,
      isActive: formData.isActive,
      displayOrder: formData.displayOrder,
      notes: formData.notes
    }

    try {
      const url = selectedPlatform 
        ? `/api/admin/copy-trading/platforms/${selectedPlatform.id}`
        : '/api/admin/copy-trading/platforms'
      
      const response = await fetch(url, {
        method: selectedPlatform ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        toast.success(selectedPlatform ? 'Platform updated successfully' : 'Platform created successfully')
        setIsEditing(false)
        fetchPlatforms()
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save platform')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save platform')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this platform?')) return

    try {
      const response = await fetch(`/api/admin/copy-trading/platforms/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Platform deleted successfully')
        fetchPlatforms()
      } else {
        throw new Error('Failed to delete platform')
      }
    } catch (error) {
      toast.error('Failed to delete platform')
    }
  }

  const updateSubscriptionStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/copy-trading/subscriptions/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        if (status === 'ACTIVE') {
          toast.success('Subscription activated - Commission approved automatically')
        } else {
          toast.success('Status updated successfully')
        }
        fetchSubscriptions()
      } else {
        throw new Error('Failed to update status')
      }
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk.toUpperCase()) {
      case 'LOW': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'HIGH': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Copy Trading Management</h1>
          <p className="text-muted-foreground">Manage copy trading platforms and subscriptions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowSubscriptions(!showSubscriptions)}>
            <Users className="mr-2 h-4 w-4" />
            Subscriptions ({subscriptions.length})
          </Button>
          <Button onClick={handleCreate} className="bg-theme-primary hover:bg-theme-primary-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add Platform
          </Button>
        </div>
      </div>

      {/* Subscriptions Panel */}
      {showSubscriptions && (
        <Card>
          <CardHeader>
            <CardTitle>Copy Trading Subscriptions</CardTitle>
            <CardDescription>Manage user subscriptions to copy trading platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Investment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{sub.user.name || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">{sub.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{sub.platform.name}</TableCell>
                    <TableCell>${sub.investmentUSD.toLocaleString()}</TableCell>
                    <TableCell>
                      <Select 
                        value={sub.status} 
                        onValueChange={(value) => updateSubscriptionStatus(sub.id, value)}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">PENDING</SelectItem>
                          <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                          <SelectItem value="PAUSED">PAUSED</SelectItem>
                          <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{new Date(sub.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={
                        sub.status === 'ACTIVE' ? 'default' :
                        sub.status === 'PENDING' ? 'secondary' :
                        sub.status === 'PAUSED' ? 'outline' : 'destructive'
                      }>
                        {sub.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Platforms</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platforms.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Platforms</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platforms.filter(p => p.isActive).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptions.filter(s => s.status === 'ACTIVE').length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Platforms Table */}
      <Card>
        <CardHeader>
          <CardTitle>Copy Trading Platforms</CardTitle>
          <CardDescription>Manage your copy trading platform partnerships</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead>Min Investment</TableHead>
                <TableHead>Subscribers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {platforms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <p>No platforms found</p>
                      <p className="text-sm">Click "Add Platform" to create your first copy trading platform</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                platforms.map((platform) => (
                  <TableRow key={platform.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {platform.logoUrl && (
                          <img src={platform.logoUrl} alt={platform.name} className="h-10 w-10 object-contain rounded" />
                        )}
                        <div>
                          <p className="font-medium">{platform.name}</p>
                          <p className="text-sm text-muted-foreground">{platform.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>${platform.minInvestment.toLocaleString()}</TableCell>
                    <TableCell>{platform._count?.subscriptions || 0}</TableCell>
                    <TableCell>
                      <Badge variant={platform.isActive ? 'secondary' : 'secondary'}>
                        {platform.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(platform)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(platform.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPlatform ? 'Edit Platform' : 'Add New Platform'}</DialogTitle>
            <DialogDescription>
              {selectedPlatform ? 'Update platform information' : 'Add a new copy trading platform'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Platform Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value
                  setFormData({ 
                    ...formData, 
                    name,
                    slug: generateSlug(name)
                  })
                }}
                placeholder="e.g., Exness, HFM"
                required
              />
              {formData.name && (
                <p className="text-xs text-muted-foreground">
                  Slug: {formData.slug || generateSlug(formData.name)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Brief description of the platform..."
              />
            </div>

            <div className="space-y-2">
              <FileUpload
                label="Platform Logo"
                value={formData.logoUrl}
                onChange={(url) => setFormData({ ...formData, logoUrl: url })}
                accept="image/*"
                maxSize={5 * 1024 * 1024}
                placeholder="Upload platform logo (PNG, JPG, SVG)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="copyTradingLink">Copy Trading Link *</Label>
              <Input
                id="copyTradingLink"
                type="url"
                value={formData.copyTradingLink}
                onChange={(e) => setFormData({ ...formData, copyTradingLink: e.target.value })}
                placeholder="https://platform.com/copy-trading"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profitShareRate">Profit Share % *</Label>
                <Input
                  id="profitShareRate"
                  type="number"
                  step="1"
                  value={formData.profitShareRate}
                  onChange={(e) => setFormData({ ...formData, profitShareRate: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minInvestment">Min Investment ($) *</Label>
                <Input
                  id="minInvestment"
                  type="number"
                  step="100"
                  value={formData.minInvestment}
                  onChange={(e) => setFormData({ ...formData, minInvestment: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="strategy">Trading Strategy</Label>
              <Textarea
                id="strategy"
                value={formData.strategy}
                onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                rows={3}
                placeholder="Describe the trading strategy..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                placeholder="Internal notes (not visible to users)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-theme-primary hover:bg-theme-primary-700 text-white">
                {submitting ? 'Saving...' : selectedPlatform ? 'Update Platform' : 'Create Platform'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
