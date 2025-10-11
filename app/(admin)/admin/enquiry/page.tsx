'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Clock, Edit, Eye, FileText, Filter, HelpCircle, Mail, MessageSquare, MoreHorizontal, Phone, Search, Star, Trash2, Users, X } from 'lucide-react'
import { useTheme } from '@/lib/optimized-theme-context'
import { useTextHierarchy } from '@/lib/text-hierarchy'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Enquiry {
  id: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  enquiryType: 'GENERAL' | 'TECHNICAL' | 'PARTNERSHIP'
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  response?: string
  responseAt?: string
  createdAt: string
  updatedAt: string
}

export default function EnquiryPage() {
  const { isDarkMode } = useTheme()
  const textHierarchy = useTextHierarchy()
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [enquiryTypeFilter, setEnquiryTypeFilter] = useState('all')
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const fetchEnquiries = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (enquiryTypeFilter !== 'all') params.append('enquiryType', enquiryTypeFilter)

      const response = await fetch(`/api/enquiries?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setEnquiries(data.enquiries || [])
      } else {
        console.error('Failed to fetch enquiries')
      }
    } catch (error) {
      console.error('Failed to fetch enquiries:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEnquiries()
  }, [searchTerm, statusFilter, enquiryTypeFilter])

  const handleViewDetails = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry)
    setIsDetailModalOpen(true)
  }

  const handleUpdateEnquiry = async (id: string, updates: Partial<Enquiry>) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/enquiries/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      
      if (response.ok) {
        const result = await response.json()
        await fetchEnquiries() // Refresh the list
        if (selectedEnquiry?.id === id) {
          setSelectedEnquiry({ ...selectedEnquiry, ...updates, ...result.enquiry })
        }
      } else {
        const errorData = await response.json()
        console.error('Update failed:', errorData)
        alert(`Failed to update enquiry: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to update enquiry:', error)
      alert('Failed to update enquiry. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteEnquiry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this enquiry?')) return

    try {
      const response = await fetch(`/api/enquiries/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchEnquiries() // Refresh the list
        if (selectedEnquiry?.id === id) {
          setIsDetailModalOpen(false)
          setSelectedEnquiry(null)
        }
      }
    } catch (error) {
      console.error('Failed to delete enquiry:', error)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-theme-primary-100 text-theme-primary-800 dark:bg-theme-primary-900 dark:text-theme-primary-200' // Primary for new enquiries
      case 'IN_PROGRESS':
        return 'bg-theme-warning-100 text-theme-warning-800 dark:bg-theme-warning-900 dark:text-theme-warning-200' // Warning for in progress
      case 'RESOLVED':
        return 'bg-theme-success-100 text-theme-success-800 dark:bg-theme-success-900 dark:text-theme-success-200' // Success for resolved
      case 'CLOSED':
        return 'bg-theme-neutral-100 text-theme-neutral-800 dark:bg-theme-neutral-700 dark:text-theme-neutral-200' // Neutral for closed
      default:
        return 'bg-theme-neutral-100 text-theme-neutral-800 dark:bg-theme-neutral-700 dark:text-theme-neutral-200' // Neutral default
    }
  }


  const getEnquiryTypeBadgeColor = (enquiryType: string) => {
    switch (enquiryType) {
      case 'TECHNICAL':
        return 'bg-theme-info-100 text-theme-info-800 dark:bg-theme-info-900 dark:text-theme-info-200' // Info for technical support
      case 'PARTNERSHIP':
        return 'bg-theme-accent-100 text-theme-accent-800 dark:bg-theme-accent-900 dark:text-theme-accent-200' // Accent for partnerships
      case 'GENERAL':
        return 'bg-theme-neutral-100 text-theme-neutral-800 dark:bg-theme-neutral-700 dark:text-theme-neutral-200' // Neutral for general
      default:
        return 'bg-theme-neutral-100 text-theme-neutral-800 dark:bg-theme-neutral-700 dark:text-theme-neutral-200' // Neutral default
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className={textHierarchy.largeHeading(isDarkMode)}>Enquiries</h1>
          <p className={`${textHierarchy.subheading()} mt-1`}>
            Manage customer inquiries and support requests
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-theme-card border-theme-border">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className={`text-sm font-medium ${textHierarchy.metaText(isDarkMode)}`}>Total Enquiries</p>
                <p className={`text-2xl font-bold ${textHierarchy.sectionHeading(isDarkMode)}`}>{enquiries.length}</p>
              </div>
              <HelpCircle className="h-8 w-8 text-theme-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-theme-card border-theme-border">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className={`text-sm font-medium ${textHierarchy.metaText(isDarkMode)}`}>New</p>
                <p className={`text-2xl font-bold ${textHierarchy.sectionHeading(isDarkMode)}`}>
                  {enquiries.filter(e => e.status === 'NEW').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-theme-accent" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-theme-card border-theme-border">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className={`text-sm font-medium ${textHierarchy.metaText(isDarkMode)}`}>In Progress</p>
                <p className={`text-2xl font-bold ${textHierarchy.sectionHeading(isDarkMode)}`}>
                  {enquiries.filter(e => e.status === 'IN_PROGRESS').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-theme-warning" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-theme-card border-theme-border">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className={`text-sm font-medium ${textHierarchy.metaText(isDarkMode)}`}>Resolved</p>
                <p className={`text-2xl font-bold ${textHierarchy.sectionHeading(isDarkMode)}`}>
                  {enquiries.filter(e => e.status === 'RESOLVED').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-theme-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-theme-card border-theme-border">
        <CardHeader>
          <CardTitle className={textHierarchy.sectionHeading(isDarkMode)}>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-tertiary h-4 w-4" />
                <Input
                  placeholder="Search enquiries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-theme-bg border-theme-border text-theme-text"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-bg text-theme-text"
              >
                <option value="all">All Status</option>
                <option value="NEW">New</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            <div className="sm:w-48">
              <select
                value={enquiryTypeFilter}
                onChange={(e) => setEnquiryTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-bg text-theme-text"
              >
                <option value="all">All Types</option>
                <option value="TECHNICAL">Technical</option>
                <option value="PARTNERSHIP">Partnership</option>
                <option value="GENERAL">General</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enquiries Table */}
      <Card className="bg-theme-card border-theme-border">
        <CardHeader>
          <CardTitle className={textHierarchy.sectionHeading(isDarkMode)}>Enquiries ({enquiries.length})</CardTitle>
          <CardDescription className={textHierarchy.subheading()}>
            Manage customer inquiries and support requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-theme-border">
                  <TableHead className="text-theme-text">Contact</TableHead>
                  <TableHead className="text-theme-text">Subject</TableHead>
                  <TableHead className="text-theme-text">Type</TableHead>
                  <TableHead className="text-theme-text">Status</TableHead>
                  <TableHead className="text-theme-text">Created</TableHead>
                  <TableHead className="w-[50px] text-theme-text"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enquiries.map((enquiry) => (
                  <TableRow key={enquiry.id} className="border-theme-border hover:bg-theme-bg-secondary">
                    <TableCell>
                      <div>
                        <div className={`font-medium ${textHierarchy.cardTitle(isDarkMode)}`}>{enquiry.name}</div>
                        <div className={`text-sm ${textHierarchy.cardDescription()}`}>{enquiry.email}</div>
                        {enquiry.phone && (
                          <div className={`text-sm ${textHierarchy.cardDescription()}`}>{enquiry.phone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className={`font-medium ${textHierarchy.cardTitle(isDarkMode)} truncate`}>{enquiry.subject}</div>
                        <div className={`text-sm ${textHierarchy.cardDescription()} line-clamp-2`}>{enquiry.message}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getEnquiryTypeBadgeColor(enquiry.enquiryType)}>
                        {enquiry.enquiryType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(enquiry.status)}>
                        {enquiry.status}
                      </Badge>
                    </TableCell>
                    <TableCell className={textHierarchy.cardTitle(isDarkMode)}>{formatDate(enquiry.createdAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-theme-bg-secondary">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-theme-card border-theme-border">
                          <DropdownMenuLabel className={textHierarchy.cardTitle(isDarkMode)}>Actions</DropdownMenuLabel>
                          <DropdownMenuItem 
                            className="text-theme-text hover:bg-theme-bg-secondary"
                            onClick={() => handleViewDetails(enquiry)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className={`text-theme-text hover:bg-theme-bg-secondary ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => !isUpdating && handleUpdateEnquiry(enquiry.id, { status: 'IN_PROGRESS' })}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            {isUpdating ? 'Updating...' : 'Mark as In Progress'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className={`text-theme-text hover:bg-theme-bg-secondary ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => !isUpdating && handleUpdateEnquiry(enquiry.id, { status: 'RESOLVED' })}
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            {isUpdating ? 'Updating...' : 'Mark as Resolved'}
                          </DropdownMenuItem>
                          {enquiry.status === 'NEW' && (
                            <DropdownMenuItem 
                              className={`text-theme-success hover:bg-theme-success-50 dark:hover:bg-theme-success-900/20 ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                              onClick={() => !isUpdating && handleUpdateEnquiry(enquiry.id, { status: 'IN_PROGRESS' })}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              {isUpdating ? 'Updating...' : 'Mark as In Progress'}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator className="bg-theme-border-secondary" />
                          <DropdownMenuItem 
                            className="text-theme-error hover:bg-theme-error-50 dark:hover:bg-theme-error-900/20"
                            onClick={() => handleDeleteEnquiry(enquiry.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Enquiry Detail Modal */}
      {isDetailModalOpen && selectedEnquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-theme-card rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-theme-border bg-theme-bg-secondary">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-theme-primary">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${textHierarchy.sectionHeading(isDarkMode)}`}>Enquiry Details</h2>
                  <p className={`text-sm ${textHierarchy.metaText(isDarkMode)}`}>ID: {selectedEnquiry.id}</p>
                </div>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 rounded-lg text-theme-text-tertiary hover:text-theme-text hover:bg-theme-bg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Contact Information Section */}
                <div className="bg-theme-bg-secondary rounded-lg p-4">
                  <h3 className={`text-lg font-semibold ${textHierarchy.cardTitle(isDarkMode)} mb-4 flex items-center`}>
                    <Users className="h-5 w-5 mr-2 text-theme-primary" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${textHierarchy.metaText(isDarkMode)} mb-1`}>Full Name</label>
                      <p className={`${textHierarchy.cardTitle(isDarkMode)} font-medium`}>{selectedEnquiry.name}</p>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textHierarchy.metaText(isDarkMode)} mb-1`}>Email Address</label>
                      <a 
                        href={`mailto:${selectedEnquiry.email}`}
                        className="text-theme-primary hover:text-theme-primary/80 font-medium transition-colors flex items-center"
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        {selectedEnquiry.email}
                      </a>
                    </div>
                    {selectedEnquiry.phone && (
                      <div>
                        <label className={`block text-sm font-medium ${textHierarchy.metaText(isDarkMode)} mb-1`}>Phone Number</label>
                        <a 
                          href={`tel:${selectedEnquiry.phone}`}
                          className="text-theme-primary hover:text-theme-primary/80 font-medium transition-colors flex items-center"
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          {selectedEnquiry.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enquiry Details Section */}
                <div className="bg-theme-bg-secondary rounded-lg p-4">
                  <h3 className={`text-lg font-semibold ${textHierarchy.cardTitle(isDarkMode)} mb-4 flex items-center`}>
                    <FileText className="h-5 w-5 mr-2 text-theme-primary" />
                    Enquiry Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={`block text-sm font-medium ${textHierarchy.metaText(isDarkMode)} mb-2`}>Type</label>
                      <Badge className={getEnquiryTypeBadgeColor(selectedEnquiry.enquiryType)}>
                        {selectedEnquiry.enquiryType}
                      </Badge>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textHierarchy.metaText(isDarkMode)} mb-2`}>Status</label>
                      <Badge className={getStatusBadgeColor(selectedEnquiry.status)}>
                        {selectedEnquiry.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium ${textHierarchy.metaText(isDarkMode)} mb-2`}>Subject</label>
                      <p className={`${textHierarchy.cardTitle(isDarkMode)} font-medium bg-theme-bg p-3 rounded-lg border border-theme-border`}>
                        {selectedEnquiry.subject}
                      </p>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textHierarchy.metaText(isDarkMode)} mb-2`}>Message</label>
                      <div className="bg-theme-bg p-4 rounded-lg border border-theme-border">
                        <p className={`${textHierarchy.cardDescription()} whitespace-pre-wrap leading-relaxed`}>
                          {selectedEnquiry.message}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Response Section */}
                {selectedEnquiry.response && (
                  <div className="bg-theme-success-50 dark:bg-theme-success-900/20 rounded-lg p-4 border border-theme-success-200 dark:border-theme-success-800">
                    <h3 className={`text-lg font-semibold text-theme-success-800 dark:text-theme-success-300 mb-4 flex items-center`}>
                      <CheckCircle className="h-5 w-5 mr-2 text-theme-success-600 dark:text-theme-success-400" />
                      Admin Response
                    </h3>
                    <div className="bg-theme-bg p-4 rounded-lg border border-theme-success-200 dark:border-theme-success-700">
                      <p className={`${textHierarchy.cardDescription()} whitespace-pre-wrap leading-relaxed`}>
                        {selectedEnquiry.response}
                      </p>
                      {selectedEnquiry.responseAt && (
                        <p className={`text-sm ${textHierarchy.metaText(isDarkMode)} mt-2`}>
                          Responded on: {formatDate(selectedEnquiry.responseAt)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Timestamps Section */}
                <div className="bg-theme-bg-secondary rounded-lg p-4">
                  <h3 className={`text-lg font-semibold ${textHierarchy.cardTitle(isDarkMode)} mb-4 flex items-center`}>
                    <Clock className="h-5 w-5 mr-2 text-theme-primary" />
                    Timeline
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${textHierarchy.metaText(isDarkMode)} mb-1`}>Created</label>
                      <p className={textHierarchy.cardTitle(isDarkMode)}>{formatDate(selectedEnquiry.createdAt)}</p>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textHierarchy.metaText(isDarkMode)} mb-1`}>Last Updated</label>
                      <p className={textHierarchy.cardTitle(isDarkMode)}>{formatDate(selectedEnquiry.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-theme-border p-6 bg-theme-bg-secondary">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-3">
                <div className={`flex items-center space-x-2 text-sm ${textHierarchy.metaText(isDarkMode)}`}>
                  <Clock className="h-4 w-4" />
                  <span>Last updated: {formatDate(selectedEnquiry.updatedAt)}</span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDetailModalOpen(false)}
                    className="px-6 border-theme-border hover:bg-theme-bg-secondary"
                  >
                    Close
                  </Button>
                  {selectedEnquiry.status === 'NEW' && (
                    <Button
                      onClick={() => handleUpdateEnquiry(selectedEnquiry.id, { status: 'IN_PROGRESS' })}
                      disabled={isUpdating}
                      className="px-6 bg-theme-warning hover:bg-theme-warning-700 text-white disabled:opacity-50"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      {isUpdating ? 'Updating...' : 'Mark as In Progress'}
                    </Button>
                  )}
                  {selectedEnquiry.status === 'IN_PROGRESS' && (
                    <Button
                      onClick={() => handleUpdateEnquiry(selectedEnquiry.id, { status: 'RESOLVED' })}
                      disabled={isUpdating}
                      className="px-6 bg-theme-success hover:bg-theme-success-700 text-white disabled:opacity-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {isUpdating ? 'Updating...' : 'Mark as Resolved'}
                    </Button>
                  )}
                  {selectedEnquiry.status === 'RESOLVED' && (
                    <Button
                      onClick={() => handleUpdateEnquiry(selectedEnquiry.id, { status: 'CLOSED' })}
                      disabled={isUpdating}
                      className="px-6 bg-theme-neutral hover:bg-theme-neutral-700 text-white disabled:opacity-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      {isUpdating ? 'Updating...' : 'Close Enquiry'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
