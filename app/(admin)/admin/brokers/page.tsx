'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, ExternalLink, Users, ArrowUpDown, Download, Filter } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { FileUpload } from '@/components/ui/file-upload'

interface Broker {
  id: string
  name: string
  slug: string
  description: string | null
  logoUrl: string | null
  referralLink: string
  benefits: string[]
  newAccountSteps: any[] | null
  existingAccountSteps: any[] | null
  isActive: boolean
  displayOrder: number
  notes: string | null
  _count?: {
    accountOpenings: number
  }
}

interface AccountOpening {
  id: string
  fullName: string
  email: string
  phone: string | null
  accountId: string | null
  status: string
  createdAt: string
  broker: {
    name: string
  }
  user: {
    name: string | null
    email: string
  }
}

export default function BrokersAdminPage() {
  const [brokers, setBrokers] = useState<Broker[]>([])
  const [accountOpenings, setAccountOpenings] = useState<AccountOpening[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showAccountOpenings, setShowAccountOpenings] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [sortField, setSortField] = useState<keyof AccountOpening | 'broker.name'>('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [filterBroker, setFilterBroker] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    logoUrl: '',
    referralLink: '',
    benefits: '',
    newAccountSteps: '',
    existingAccountSteps: '',
    isActive: true,
    displayOrder: 0,
    notes: ''
  })

  useEffect(() => {
    fetchBrokers()
    fetchAccountOpenings()
  }, [])

  const fetchBrokers = async () => {
    try {
      const response = await fetch('/api/admin/brokers')
      if (response.ok) {
        const data = await response.json()
        setBrokers(data.brokers || [])
      }
    } catch (error) {
      console.error('Error fetching brokers:', error)
      toast.error('Failed to load brokers')
    } finally {
      setLoading(false)
    }
  }

  const fetchAccountOpenings = async () => {
    try {
      const response = await fetch('/api/admin/brokers/account-openings')
      if (response.ok) {
        const data = await response.json()
        setAccountOpenings(data.accountOpenings || [])
      }
    } catch (error) {
      console.error('Error fetching account openings:', error)
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
    setSelectedBroker(null)
    setFormData({
      name: '',
      slug: '',
      description: '',
      logoUrl: '',
      referralLink: '',
      benefits: '',
      newAccountSteps: '',
      existingAccountSteps: '',
      isActive: true,
      displayOrder: brokers.length,
      notes: ''
    })
    setIsEditing(true)
  }

  const handleEdit = (broker: Broker) => {
    setSelectedBroker(broker)
    setFormData({
      name: broker.name,
      slug: broker.slug,
      description: broker.description || '',
      logoUrl: broker.logoUrl || '',
      referralLink: broker.referralLink,
      benefits: broker.benefits.join('\n'),
      newAccountSteps: broker.newAccountSteps ? JSON.stringify(broker.newAccountSteps, null, 2) : '',
      existingAccountSteps: broker.existingAccountSteps ? JSON.stringify(broker.existingAccountSteps, null, 2) : '',
      isActive: broker.isActive,
      displayOrder: broker.displayOrder,
      notes: broker.notes || ''
    })
    setIsEditing(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.name.trim()) {
      toast.error('Broker name is required')
      return
    }
    if (!formData.referralLink.trim()) {
      toast.error('Referral link is required')
      return
    }

    setSubmitting(true)
    console.log('Submitting broker data:', formData)

    // Parse steps JSON
    let newAccountSteps = null
    let existingAccountSteps = null
    
    if (formData.newAccountSteps.trim()) {
      try {
        newAccountSteps = JSON.parse(formData.newAccountSteps)
      } catch (e) {
        toast.error('Invalid JSON format for New Account Steps')
        setSubmitting(false)
        return
      }
    }
    
    if (formData.existingAccountSteps.trim()) {
      try {
        existingAccountSteps = JSON.parse(formData.existingAccountSteps)
      } catch (e) {
        toast.error('Invalid JSON format for Existing Account Steps')
        setSubmitting(false)
        return
      }
    }

    const benefitsArray = formData.benefits.split('\n').filter(b => b.trim())
    const payload = {
      name: formData.name,
      slug: formData.slug || generateSlug(formData.name),
      description: formData.description,
      logoUrl: formData.logoUrl,
      referralLink: formData.referralLink,
      benefits: benefitsArray,
      newAccountSteps,
      existingAccountSteps,
      isActive: formData.isActive,
      displayOrder: formData.displayOrder,
      notes: formData.notes
    }

    console.log('Payload to send:', payload)

    try {
      const url = selectedBroker 
        ? `/api/admin/brokers/${selectedBroker.id}`
        : '/api/admin/brokers'
      
      console.log('Sending request to:', url)
      
      const response = await fetch(url, {
        method: selectedBroker ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      console.log('Response status:', response.status)
      const responseData = await response.json()
      console.log('Response data:', responseData)

      if (response.ok) {
        toast.success(selectedBroker ? 'Broker updated successfully' : 'Broker created successfully')
        setIsEditing(false)
        fetchBrokers()
      } else {
        throw new Error(responseData.error || 'Failed to save broker')
      }
    } catch (error) {
      console.error('Error saving broker:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save broker')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this broker?')) return

    try {
      const response = await fetch(`/api/admin/brokers/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Broker deleted successfully')
        fetchBrokers()
      } else {
        throw new Error('Failed to delete broker')
      }
    } catch (error) {
      toast.error('Failed to delete broker')
    }
  }

  const updateAccountStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/brokers/account-openings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        if (status === 'APPROVED') {
          toast.success('Account approved - Commission will be created when deposit is verified')
        } else {
          toast.success('Status updated successfully')
        }
        fetchAccountOpenings()
      } else {
        throw new Error('Failed to update status')
      }
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleSort = (field: keyof AccountOpening | 'broker.name') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getFilteredAndSortedAccountOpenings = () => {
    // First filter
    let filtered = accountOpenings.filter(opening => {
      const brokerMatch = filterBroker === 'all' || opening.broker.name === filterBroker
      const statusMatch = filterStatus === 'all' || opening.status === filterStatus
      return brokerMatch && statusMatch
    })

    // Then sort
    return filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      if (sortField === 'broker.name') {
        aValue = a.broker.name
        bValue = b.broker.name
      } else {
        aValue = a[sortField]
        bValue = b[sortField]
      }

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      // Convert to string for comparison if needed
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }

  const exportToCSV = () => {
    const dataToExport = getFilteredAndSortedAccountOpenings()
    
    if (dataToExport.length === 0) {
      toast.error('No data to export')
      return
    }

    // Define CSV headers
    const headers = ['User Name', 'User Email', 'Broker', 'Contact Email', 'Phone', 'Account ID', 'Status', 'Date']
    
    // Convert data to CSV rows
    const rows = dataToExport.map(opening => [
      opening.fullName,
      opening.user.email,
      opening.broker.name,
      opening.email,
      opening.phone || '',
      opening.accountId || '',
      opening.status,
      new Date(opening.createdAt).toLocaleDateString()
    ])

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `account-requests-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    const filterInfo = filterBroker !== 'all' || filterStatus !== 'all' 
      ? ` (${dataToExport.length} filtered records)` 
      : ''
    toast.success(`Account requests exported successfully${filterInfo}`)
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
          <h1 className="text-3xl font-bold tracking-tight">Broker Management</h1>
          <p className="text-muted-foreground">Manage partner brokers and account opening requests</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAccountOpenings(!showAccountOpenings)}>
            <Users className="mr-2 h-4 w-4" />
            Account Requests ({accountOpenings.length})
          </Button>
          <Button onClick={handleCreate} className="bg-theme-primary hover:bg-theme-primary-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Broker
          </Button>
        </div>
      </div>

      {/* Account Openings Panel */}
      {showAccountOpenings && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Account Opening Requests</CardTitle>
                <CardDescription>
                  Manage user requests to open broker accounts
                  {accountOpenings.length > 0 && (
                    <span className="ml-2 text-primary font-medium">
                      ({getFilteredAndSortedAccountOpenings().length} of {accountOpenings.length} {filterBroker !== 'all' || filterStatus !== 'all' ? 'shown' : 'total'})
                    </span>
                  )}
                </CardDescription>
              </div>
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <Label htmlFor="broker-filter" className="text-sm mb-2 block">
                  <Filter className="inline h-3 w-3 mr-1" />
                  Filter by Broker
                </Label>
                <Select value={filterBroker} onValueChange={setFilterBroker}>
                  <SelectTrigger id="broker-filter">
                    <SelectValue placeholder="All Brokers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brokers</SelectItem>
                    {Array.from(new Set(accountOpenings.map(o => o.broker.name))).map(brokerName => (
                      <SelectItem key={brokerName} value={brokerName}>
                        {brokerName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label htmlFor="status-filter" className="text-sm mb-2 block">
                  <Filter className="inline h-3 w-3 mr-1" />
                  Filter by Status
                </Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(filterBroker !== 'all' || filterStatus !== 'all') && (
                <div className="flex items-end">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setFilterBroker('all')
                      setFilterStatus('all')
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('fullName')} className="h-8 px-2 lg:px-3">
                      User
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('broker.name')} className="h-8 px-2 lg:px-3">
                      Broker
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('email')} className="h-8 px-2 lg:px-3">
                      Contact
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('accountId')} className="h-8 px-2 lg:px-3">
                      Account ID
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('status')} className="h-8 px-2 lg:px-3">
                      Status
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('createdAt')} className="h-8 px-2 lg:px-3">
                      Date
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accountOpenings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-muted-foreground">No account opening requests yet</p>
                    </TableCell>
                  </TableRow>
                ) : getFilteredAndSortedAccountOpenings().length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-muted-foreground">No requests match the selected filters</p>
                      <Button 
                        variant="link" 
                        size="sm" 
                        onClick={() => {
                          setFilterBroker('all')
                          setFilterStatus('all')
                        }}
                        className="mt-2"
                      >
                        Clear Filters
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  getFilteredAndSortedAccountOpenings().map((opening) => (
                    <TableRow key={opening.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{opening.fullName}</p>
                          <p className="text-sm text-muted-foreground">{opening.user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{opening.broker.name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{opening.email}</p>
                          {opening.phone && <p className="text-muted-foreground">{opening.phone}</p>}
                        </div>
                      </TableCell>
                      <TableCell>{opening.accountId || '-'}</TableCell>
                      <TableCell>
                        <Select 
                          value={opening.status} 
                          onValueChange={(value) => updateAccountStatus(opening.id, value)}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">
                              <Badge variant="destructive" className="w-full">PENDING</Badge>
                            </SelectItem>
                            <SelectItem value="APPROVED">
                              <Badge variant="secondary" className="w-full">APPROVED</Badge>
                            </SelectItem>
                            <SelectItem value="REJECTED">
                              <Badge variant="destructive" className="w-full">REJECTED</Badge>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{new Date(opening.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={
                          opening.status === 'APPROVED' ? 'secondary' :
                          opening.status === 'PENDING' ? 'destructive' : 'destructive'
                        }>
                          {opening.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Brokers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Partner Brokers</CardTitle>
          <CardDescription>Manage your broker partnerships</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Referral Link</TableHead>
                <TableHead>Requests</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brokers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <p>No brokers found</p>
                      <p className="text-sm">Click "Add Broker" to create your first broker partnership</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                brokers.map((broker) => (
                  <TableRow key={broker.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {broker.logoUrl && (
                          <img src={broker.logoUrl} alt={broker.name} className="h-8 w-8 object-contain" />
                        )}
                        <span className="font-medium">{broker.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{broker.description}</TableCell>
                    <TableCell>
                      <a href={broker.referralLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                        <ExternalLink className="h-3 w-3" />
                        Link
                      </a>
                    </TableCell>
                    <TableCell>{broker._count?.accountOpenings || 0}</TableCell>
                    <TableCell>
                      <Badge variant={broker.isActive ? 'secondary' : 'secondary'}>
                        {broker.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>{broker.displayOrder}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(broker)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(broker.id)}>
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
            <DialogTitle>{selectedBroker ? 'Edit Broker' : 'Add New Broker'}</DialogTitle>
            <DialogDescription>
              {selectedBroker ? 'Update broker information' : 'Add a new partner broker'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Broker Name *</Label>
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
              />
            </div>

            <div className="space-y-2">
              <FileUpload
                label="Broker Logo"
                value={formData.logoUrl}
                onChange={(url) => setFormData({ ...formData, logoUrl: url })}
                accept="image/*"
                maxSize={5 * 1024 * 1024}
                placeholder="Upload broker logo (PNG, JPG, SVG)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="referralLink">Referral Link *</Label>
              <Input
                id="referralLink"
                type="url"
                value={formData.referralLink}
                onChange={(e) => setFormData({ ...formData, referralLink: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="benefits">Benefits (one per line)</Label>
              <Textarea
                id="benefits"
                value={formData.benefits}
                onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                rows={4}
                placeholder="Daily support&#10;Premium signals&#10;Low spreads"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="newAccountSteps">New Account Steps (JSON)</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const defaultSteps = [
                      { text: "Create a Brokerage Account with this link", buttonText: "Open Registration", buttonLink: formData.referralLink },
                      { text: "Create a trading account with leverage 1:2000 / 1:Unlimited" },
                      { text: "Verify & Fund your account with minimum $50" },
                      { text: "Download & install MT4/MT5 on your Mobile phone", note: "(Install it if you haven't yet)" }
                    ]
                    setFormData({ ...formData, newAccountSteps: JSON.stringify(defaultSteps, null, 2) })
                  }}
                >
                  Generate Default
                </Button>
              </div>
              <Textarea
                id="newAccountSteps"
                value={formData.newAccountSteps}
                onChange={(e) => setFormData({ ...formData, newAccountSteps: e.target.value })}
                rows={8}
                placeholder='[{"text": "Step 1", "buttonText": "Open Link", "buttonLink": "https://..."}]'
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                JSON array of steps for users creating a new account
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="existingAccountSteps">Existing Account Steps (JSON)</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const defaultSteps = [
                      { text: "Log in to your account and click on Live Chat", buttonText: "Live Chat", buttonLink: "#" },
                      { text: 'Type and send "Change Partner" in the live chat' },
                      { text: "You'll receive a link to a form. Fill it out as follows:", bullets: ["Reason for Partner Change: Write \"Trading Signals\"", "New Partner's Link: " + formData.referralLink, "How You Found Your New Partner: Write \"Telegram\""] },
                      { text: "Submit the form. Process could take up to 3 days", note: "3 days" },
                      { text: "Wait for confirmation email from the broker" },
                      { text: "After confirmation:", bullets: ["Create a new MT5 account on your dashboard", "Fund the new account or transfer funds from existing account", "Proceed to verification", "Message the telegram account provided after verification", "You'll be added to the FREE GROUP with daily trade signals"] }
                    ]
                    setFormData({ ...formData, existingAccountSteps: JSON.stringify(defaultSteps, null, 2) })
                  }}
                >
                  Generate Default
                </Button>
              </div>
              <Textarea
                id="existingAccountSteps"
                value={formData.existingAccountSteps}
                onChange={(e) => setFormData({ ...formData, existingAccountSteps: e.target.value })}
                rows={8}
                placeholder='[{"text": "Step 1", "bullets": ["Sub-step 1", "Sub-step 2"]}]'
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                JSON array of steps for users with existing accounts
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">
                  Controls the order brokers appear on the user page (0 = first, higher numbers appear later)
                </p>
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
              <Button type="submit" className="bg-theme-primary hover:bg-theme-primary-700 text-white" disabled={submitting}>
                {submitting ? 'Saving...' : (selectedBroker ? 'Update' : 'Create') + ' Broker'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
