'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, XCircle, Clock, AlertTriangle, Eye } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Commission {
  id: string
  amount: number
  type: string
  description: string
  status: string
  requiresVerification: boolean
  verificationData: any
  verifiedAt: string | null
  rejectionReason: string | null
  relatedEntityType: string | null
  relatedEntityId: string | null
  createdAt: string
  affiliateProgram: {
    affiliateCode: string
    user: {
      name: string | null
      email: string
    }
  }
}

export default function AffiliateCommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null)
  const [showVerificationDialog, setShowVerificationDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchCommissions()
  }, [filter])

  const fetchCommissions = async () => {
    try {
      let url = '/api/admin/affiliates/commissions'
      if (filter === 'pending') {
        url += '?requiresVerification=true&status=PENDING'
      } else if (filter !== 'all') {
        url += `?status=${filter.toUpperCase()}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setCommissions(data.commissions || [])
      }
    } catch (error) {
      console.error('Error fetching commissions:', error)
      toast.error('Failed to load commissions')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = (commission: Commission) => {
    setSelectedCommission(commission)
    setRejectionReason('')
    setShowVerificationDialog(true)
  }

  const handleApprove = async () => {
    if (!selectedCommission) return

    try {
      const response = await fetch(`/api/admin/affiliates/commissions/${selectedCommission.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true })
      })

      if (response.ok) {
        toast.success('Commission approved successfully')
        setShowVerificationDialog(false)
        fetchCommissions()
      } else {
        throw new Error('Failed to approve')
      }
    } catch (error) {
      toast.error('Failed to approve commission')
    }
  }

  const handleReject = async () => {
    if (!selectedCommission || !rejectionReason) {
      toast.error('Please provide a rejection reason')
      return
    }

    try {
      const response = await fetch(`/api/admin/affiliates/commissions/${selectedCommission.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: false, rejectionReason })
      })

      if (response.ok) {
        toast.success('Commission rejected')
        setShowVerificationDialog(false)
        fetchCommissions()
      } else {
        throw new Error('Failed to reject')
      }
    } catch (error) {
      toast.error('Failed to reject commission')
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: any = {
      PENDING: 'secondary',
      APPROVED: 'default',
      REJECTED: 'destructive'
    }
    const icons: any = {
      PENDING: Clock,
      APPROVED: CheckCircle,
      REJECTED: XCircle
    }
    const Icon = icons[status] || Clock
    return (
      <Badge variant={variants[status] || 'outline'} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    )
  }

  const getTypeBadge = (type: string) => {
    const colors: any = {
      ACADEMY: 'bg-blue-100 text-blue-800',
      COPY_TRADING: 'bg-purple-100 text-purple-800',
      BROKER_ACCOUNT: 'bg-green-100 text-green-800',
      SUBSCRIPTION: 'bg-yellow-100 text-yellow-800',
      OTHER: 'bg-gray-100 text-gray-800'
    }
    return (
      <Badge className={colors[type] || colors.OTHER}>
        {type.replace('_', ' ')}
      </Badge>
    )
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

  const pendingCount = commissions.filter(c => c.status === 'PENDING').length
  const approvedCount = commissions.filter(c => c.status === 'APPROVED').length
  const rejectedCount = commissions.filter(c => c.status === 'REJECTED').length
  const totalAmount = commissions.reduce((sum, c) => sum + (c.status === 'APPROVED' ? c.amount : 0), 0)

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Commission Management</h1>
        <p className="text-muted-foreground">Review and verify affiliate commissions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting verification</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedCount}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Commission value</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Commissions</CardTitle>
              <CardDescription>Review and verify commission requests</CardDescription>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Commissions</SelectItem>
                <SelectItem value="pending">Pending Verification</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Affiliate</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No commissions found
                  </TableCell>
                </TableRow>
              ) : (
                commissions.map((commission) => (
                  <TableRow key={commission.id}>
                    <TableCell>{new Date(commission.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{commission.affiliateProgram.user.name || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {commission.affiliateProgram.affiliateCode}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(commission.type)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{commission.description}</p>
                        {commission.requiresVerification && (
                          <div className="flex items-center gap-1 mt-1">
                            <AlertTriangle className="h-3 w-3 text-yellow-600" />
                            <span className="text-xs text-yellow-600">Requires verification</span>
                          </div>
                        )}
                        {commission.rejectionReason && (
                          <p className="text-xs text-red-600 mt-1">{commission.rejectionReason}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">${commission.amount.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(commission.status)}</TableCell>
                    <TableCell>
                      {commission.status === 'PENDING' && (
                        <Button size="sm" onClick={() => handleVerify(commission)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Verification Dialog */}
      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Verify Commission</DialogTitle>
            <DialogDescription>
              Review the commission details and approve or reject
            </DialogDescription>
          </DialogHeader>
          {selectedCommission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Affiliate</Label>
                  <p className="font-medium">{selectedCommission.affiliateProgram.user.name || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">{selectedCommission.affiliateProgram.user.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Affiliate Code</Label>
                  <p className="font-mono">{selectedCommission.affiliateProgram.affiliateCode}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <div className="mt-1">{getTypeBadge(selectedCommission.type)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <p className="text-2xl font-bold">${selectedCommission.amount.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p>{selectedCommission.description}</p>
              </div>

              {selectedCommission.verificationData && Object.keys(selectedCommission.verificationData).length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Verification Data</Label>
                  <div className="mt-2 p-4 bg-muted rounded-lg">
                    <pre className="text-sm overflow-auto">
                      {JSON.stringify(selectedCommission.verificationData, null, 2)}
                    </pre>
                  </div>
                  {selectedCommission.verificationData.requiresDepositVerification && (
                    <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-900 dark:text-yellow-100">Deposit Verification Required</p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            Please verify that the user has made the deposit/investment before approving this commission.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedCommission.relatedEntityType && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Related Entity</Label>
                    <p>{selectedCommission.relatedEntityType}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Entity ID</Label>
                    <p className="font-mono text-sm">{selectedCommission.relatedEntityId}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="rejectionReason">Rejection Reason (if rejecting)</Label>
                <Textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide a reason for rejection..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowVerificationDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleReject}>
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button onClick={handleApprove}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
