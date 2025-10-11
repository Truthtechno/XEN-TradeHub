'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Building, Calendar, CheckCircle, Clock, Download, Edit, Eye, Filter, MapPin, MoreHorizontal, Plus, RefreshCw, Search, Star, Trash2, Users, X, Save } from 'lucide-react'
import { useTheme } from '@/lib/optimized-theme-context'
import { useTextHierarchy } from '@/lib/text-hierarchy'
import { exportRegistrationsToExcel, RegistrationData } from '@/lib/excel-export'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AcademyClass {
  id: string
  title: string
  description: string
  instructor: string
  location: string
  nextSession: string
  duration: string
  maxStudents: number
  enrolledStudents: number
  price: number
  currency: string
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'MASTERCLASS'
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

interface AcademyClassRegistration {
  id: string
  fullName: string
  email: string
  phone?: string
  experience?: string
  goals?: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  amountUSD: number
  currency: string
  createdAt: string
  user?: {
    id: string
    name?: string
    email: string
    profile?: {
      firstName?: string
      lastName?: string
      phone?: string
      country?: string
    }
  }
}

export default function AcademyPage() {
  const { isDarkMode } = useTheme()
  const textHierarchy = useTextHierarchy()
  const [classes, setClasses] = useState<AcademyClass[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')
  const [selectedClass, setSelectedClass] = useState<AcademyClass | null>(null)
  const [registrations, setRegistrations] = useState<AcademyClassRegistration[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showRegistrationsDialog, setShowRegistrationsDialog] = useState(false)
  const [editingClass, setEditingClass] = useState<AcademyClass | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Form state for create/edit
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'USD',
    duration: '',
    level: 'BEGINNER',
    maxStudents: '',
    instructor: '',
    location: '',
    nextSession: '',
    status: 'UPCOMING',
    isPublished: true
  })

  const fetchClasses = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }
    
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (levelFilter !== 'all') params.append('level', levelFilter)
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/academy-classes?${params}`)
      if (response.ok) {
        const data = await response.json()
        setClasses(data)
      } else {
        console.error('Failed to fetch classes')
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const fetchRegistrations = async (classId: string) => {
    try {
      const response = await fetch(`/api/academy-classes/${classId}/registrations`)
      if (response.ok) {
        const data = await response.json()
        setRegistrations(data)
        
        // Auto-confirm paid students if there are any
        const paidPendingCount = data.filter((r: any) => r.paymentStatus === 'PAID' && r.status === 'PENDING').length
        if (paidPendingCount > 0) {
          console.log(`Found ${paidPendingCount} paid students that need confirmation`)
          // Auto-confirm them
          try {
            const confirmResponse = await fetch(`/api/academy-classes/${classId}/auto-confirm-paid`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
            })
            if (confirmResponse.ok) {
              const confirmResult = await confirmResponse.json()
              console.log(`Auto-confirmed ${confirmResult.updatedCount} paid students`)
              // Refresh registrations to show updated status
              const refreshResponse = await fetch(`/api/academy-classes/${classId}/registrations`)
              if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json()
                setRegistrations(refreshData)
              }
            }
          } catch (confirmError) {
            console.error('Error auto-confirming paid students:', confirmError)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching registrations:', error)
    }
  }

  useEffect(() => {
    fetchClasses()
  }, [statusFilter, levelFilter, searchTerm])

  const handleCreateClass = async () => {
    try {
      const response = await fetch('/api/academy-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowCreateDialog(false)
        resetForm()
        fetchClasses()
      } else {
        console.error('Failed to create class')
      }
    } catch (error) {
      console.error('Error creating class:', error)
    }
  }

  const handleEditClass = async () => {
    if (!editingClass) return

    try {
      const response = await fetch(`/api/academy-classes/${editingClass.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowEditDialog(false)
        setEditingClass(null)
        resetForm()
        fetchClasses()
      } else {
        console.error('Failed to update class')
      }
    } catch (error) {
      console.error('Error updating class:', error)
    }
  }

  const handleDeleteClass = async (classId: string) => {
    // Find the class to get its details
    const classToDelete = classes.find(c => c.id === classId)
    if (!classToDelete) return

    // Check if class has registrations
    if (classToDelete.enrolledStudents > 0) {
      const confirmDelete = confirm(
        `This class has ${classToDelete.enrolledStudents} registered students. Are you sure you want to delete it? This will also delete all student registrations. This action cannot be undone.`
      )
      if (!confirmDelete) return
    } else {
      const confirmDelete = confirm(
        `Are you sure you want to delete "${classToDelete.title}"? This action cannot be undone.`
      )
      if (!confirmDelete) return
    }

    try {
      // First try without force
      let response = await fetch(`/api/academy-classes/${classId}`, {
        method: 'DELETE'
      })

      // If it fails due to registrations, try with force
      if (!response.ok && classToDelete.enrolledStudents > 0) {
        const error = await response.json()
        if (error.error === 'Cannot delete academy class with existing registrations') {
          const forceDelete = confirm(
            `This class has ${classToDelete.enrolledStudents} registered students. Do you want to force delete it anyway? This will permanently delete the class and all student registrations.`
          )
          if (!forceDelete) return

          response = await fetch(`/api/academy-classes/${classId}?force=true`, {
            method: 'DELETE'
          })
        }
      }

      if (response.ok) {
        const result = await response.json()
        console.log('Class deleted successfully:', result.message)
        fetchClasses()
        
        if (result.deletedRegistrations > 0) {
          alert(`Class deleted successfully! Also deleted ${result.deletedRegistrations} student registrations.`)
        } else {
          alert('Class deleted successfully!')
        }
      } else {
        const error = await response.json()
        console.error('Failed to delete class:', error)
        alert(`Failed to delete class: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting class:', error)
      alert('An error occurred while deleting the class. Please try again.')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      currency: 'USD',
      duration: '',
      level: 'BEGINNER',
      maxStudents: '',
      instructor: '',
      location: '',
      nextSession: '',
      status: 'UPCOMING',
      isPublished: true
    })
  }

  const openEditDialog = (academyClass: AcademyClass) => {
    setEditingClass(academyClass)
    setFormData({
      title: academyClass.title,
      description: academyClass.description,
      price: academyClass.price.toString(),
      currency: academyClass.currency,
      duration: academyClass.duration,
      level: academyClass.level,
      maxStudents: academyClass.maxStudents.toString(),
      instructor: academyClass.instructor,
      location: academyClass.location,
      nextSession: academyClass.nextSession.split('T')[0],
      status: academyClass.status,
      isPublished: academyClass.isPublished
    })
    setShowEditDialog(true)
  }

  const openRegistrationsDialog = async (academyClass: AcademyClass) => {
    setSelectedClass(academyClass)
    await fetchRegistrations(academyClass.id)
    setShowRegistrationsDialog(true)
  }

  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  const downloadToExcel = async () => {
    if (!selectedClass || registrations.length === 0) return

    setIsExporting(true)
    setExportProgress(0)

    try {
      // Convert registrations to the format expected by the export function
      const formattedRegistrations: RegistrationData[] = registrations.map(reg => ({
        id: reg.id,
        fullName: reg.fullName,
        email: reg.email,
        phone: reg.phone || undefined,
        experience: reg.experience || undefined,
        goals: reg.goals || undefined,
        status: reg.status,
        paymentStatus: reg.paymentStatus,
        amountUSD: reg.amountUSD,
        currency: reg.currency,
        createdAt: reg.createdAt,
        user: reg.user ? { name: reg.user.name } : undefined
      }))

      await exportRegistrationsToExcel(
        formattedRegistrations,
        selectedClass.title,
        (progress) => setExportProgress(progress)
      )
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      alert('Failed to export to Excel. Please try again.')
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  const autoConfirmPaidStudents = async () => {
    if (!selectedClass) return

    try {
      const response = await fetch(`/api/academy-classes/${selectedClass.id}/auto-confirm-paid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Auto-confirm result:', result)
        
        // Refresh registrations to show updated status
        await fetchRegistrations(selectedClass.id)
        
        // Show success message
        alert(`Successfully confirmed ${result.updatedCount} paid students!`)
      } else {
        const error = await response.json()
        console.error('Failed to auto-confirm:', error)
        alert('Failed to auto-confirm paid students. Please try again.')
      }
    } catch (error) {
      console.error('Error auto-confirming paid students:', error)
      alert('Error auto-confirming paid students. Please try again.')
    }
  }

  const handleRefresh = () => {
    fetchClasses(true)
    if (selectedClass) {
      fetchRegistrations(selectedClass.id)
    }
  }

  const filteredClasses = classes.filter(academyClass => {
    const matchesSearch = academyClass.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         academyClass.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         academyClass.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || academyClass.status === statusFilter
    const matchesLevel = levelFilter === 'all' || academyClass.level === levelFilter
    return matchesSearch && matchesStatus && matchesLevel
  })

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'UPCOMING':
        return 'bg-theme-accent-100 text-theme-accent-800 dark:bg-theme-accent-900 dark:text-theme-accent-200'
      case 'ONGOING':
        return 'bg-theme-success-100 text-theme-success-800 dark:bg-theme-success-900 dark:text-theme-success-200'
      case 'COMPLETED':
        return 'bg-theme-neutral-100 text-theme-neutral-800 dark:bg-theme-neutral-900 dark:text-theme-neutral-200'
      case 'CANCELLED':
        return 'bg-theme-error-100 text-theme-error-800 dark:bg-theme-error-900 dark:text-theme-error-200'
      default:
        return 'bg-theme-neutral-100 text-theme-neutral-800 dark:bg-theme-neutral-900 dark:text-theme-neutral-200'
    }
  }

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return 'bg-theme-success-100 text-theme-success-800 dark:bg-theme-success-900 dark:text-theme-success-200'
      case 'INTERMEDIATE':
        return 'bg-theme-warning-100 text-theme-warning-800 dark:bg-theme-warning-900 dark:text-theme-warning-200'
      case 'ADVANCED':
        return 'bg-theme-error-100 text-theme-error-800 dark:bg-theme-error-900 dark:text-theme-error-200'
      case 'MASTERCLASS':
        return 'bg-theme-accent-100 text-theme-accent-800 dark:bg-theme-accent-900 dark:text-theme-accent-200'
      default:
        return 'bg-theme-neutral-100 text-theme-neutral-800 dark:bg-theme-neutral-900 dark:text-theme-neutral-200'
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

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
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
          <h1 className={textHierarchy.largeHeading(isDarkMode)}>Academy Classes</h1>
          <p className={`${textHierarchy.subheading()} mt-1`}>
            Manage in-person training classes and workshops
          </p>
        </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                className="w-full sm:w-auto border-theme-border hover:bg-theme-bg-secondary"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="w-full sm:w-auto bg-theme-primary hover:bg-theme-primary-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Class
              </Button>
            </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-theme-card border-theme-border">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className={`text-sm font-medium ${textHierarchy.metaText(isDarkMode)}`}>Total Classes</p>
                <p className={`text-2xl font-bold ${textHierarchy.sectionHeading(isDarkMode)}`}>{classes.length}</p>
              </div>
              <Building className="h-8 w-8 text-theme-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-theme-card border-theme-border">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className={`text-sm font-medium ${textHierarchy.metaText(isDarkMode)}`}>Upcoming</p>
                <p className={`text-2xl font-bold ${textHierarchy.sectionHeading(isDarkMode)}`}>
                  {classes.filter(c => c.status === 'UPCOMING').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-theme-accent" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-theme-card border-theme-border">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className={`text-sm font-medium ${textHierarchy.metaText(isDarkMode)}`}>Total Students</p>
                <p className={`text-2xl font-bold ${textHierarchy.sectionHeading(isDarkMode)}`}>
                  {classes.reduce((acc, c) => acc + c.enrolledStudents, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-theme-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-theme-card border-theme-border">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className={`text-sm font-medium ${textHierarchy.metaText(isDarkMode)}`}>Revenue</p>
                <p className={`text-2xl font-bold ${textHierarchy.sectionHeading(isDarkMode)}`}>
                  {formatCurrency(classes.reduce((acc, c) => acc + (c.price * c.enrolledStudents), 0))}
                </p>
              </div>
              <Star className="h-8 w-8 text-theme-warning" />
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
                  placeholder="Search classes..."
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
                <option value="UPCOMING">Upcoming</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div className="sm:w-48">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="w-full px-3 py-2 border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-bg text-theme-text"
              >
                <option value="all">All Levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="MASTERCLASS">Masterclass</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classes Table */}
      <Card className="bg-theme-card border-theme-border">
        <CardHeader>
          <CardTitle className={textHierarchy.sectionHeading(isDarkMode)}>Classes ({filteredClasses.length})</CardTitle>
          <CardDescription className={textHierarchy.subheading()}>
            Manage academy classes and track enrollment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((academyClass) => (
              <Card key={academyClass.id} className="bg-theme-card border-theme-border hover:shadow-lg transition-all duration-200 group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className={`text-lg font-semibold ${textHierarchy.cardTitle(isDarkMode)} line-clamp-2 group-hover:text-theme-primary transition-colors`}>
                        {academyClass.title}
                      </CardTitle>
                      <CardDescription className={`mt-1 ${textHierarchy.cardDescription()} line-clamp-2`}>
                        {academyClass.description}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-theme-bg-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-theme-card border-theme-border">
                        <DropdownMenuLabel className={textHierarchy.cardTitle(isDarkMode)}>Actions</DropdownMenuLabel>
                        <DropdownMenuItem 
                          className="text-theme-text hover:bg-theme-bg-secondary"
                          onClick={() => openRegistrationsDialog(academyClass)}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          View Registrations
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-theme-text hover:bg-theme-bg-secondary"
                          onClick={() => openEditDialog(academyClass)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Class
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-theme-border-secondary" />
                        <DropdownMenuItem 
                          className="text-theme-error hover:bg-theme-error-50 dark:hover:bg-theme-error-900/20"
                          onClick={() => handleDeleteClass(academyClass.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Class
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge className={getLevelBadgeColor(academyClass.level)}>
                      {academyClass.level}
                    </Badge>
                    <Badge className={getStatusBadgeColor(academyClass.status)}>
                      {academyClass.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  {/* Instructor & Location */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-theme-text-tertiary" />
                      <span className={`text-sm ${textHierarchy.cardDescription()}`}>{academyClass.instructor}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-theme-text-tertiary" />
                      <span className={`text-sm ${textHierarchy.cardDescription()}`}>{academyClass.location}</span>
                    </div>
                  </div>

                  {/* Next Session & Duration */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-theme-text-tertiary" />
                      <span className={`text-sm ${textHierarchy.cardDescription()}`}>{formatDate(academyClass.nextSession)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-theme-text-tertiary" />
                      <span className={`text-sm ${textHierarchy.cardDescription()}`}>{academyClass.duration}</span>
                    </div>
                  </div>

                  {/* Students Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${textHierarchy.cardDescription()}`}>Enrollment</span>
                      <span className={`text-sm ${textHierarchy.cardDescription()}`}>
                        {academyClass.enrolledStudents}/{academyClass.maxStudents}
                      </span>
                    </div>
                    <div className="w-full bg-theme-bg-secondary rounded-full h-2">
                      <div 
                        className="bg-theme-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${(academyClass.enrolledStudents / academyClass.maxStudents) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between pt-2 border-t border-theme-border-secondary">
                    <span className={`text-sm ${textHierarchy.cardDescription()}`}>Price</span>
                    <span className={`text-lg font-semibold ${textHierarchy.sectionHeading(isDarkMode)}`}>
                      {formatCurrency(academyClass.price, academyClass.currency)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Class Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl bg-theme-card border-theme-border">
          <DialogHeader>
            <DialogTitle className={textHierarchy.sectionHeading(isDarkMode)}>Create New Academy Class</DialogTitle>
            <DialogDescription className={textHierarchy.subheading()}>
              Add a new in-person training class to the academy.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className={textHierarchy.cardTitle(isDarkMode)}>Class Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Beginner Forex Course"
                className="bg-theme-bg border-theme-border text-theme-text"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructor" className={textHierarchy.cardTitle(isDarkMode)}>Instructor</Label>
              <Input
                id="instructor"
                value={formData.instructor}
                onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                placeholder="e.g., XEN Forex Team"
                className="bg-theme-bg border-theme-border text-theme-text"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className={textHierarchy.cardTitle(isDarkMode)}>Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe what students will learn..."
                rows={3}
                className="bg-theme-bg border-theme-border text-theme-text"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className={textHierarchy.cardTitle(isDarkMode)}>Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="e.g., XEN Forex Academy, Kampala"
                className="bg-theme-bg border-theme-border text-theme-text"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price" className={textHierarchy.cardTitle(isDarkMode)}>Price</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="0"
                className="bg-theme-bg border-theme-border text-theme-text"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency" className={textHierarchy.cardTitle(isDarkMode)}>Currency</Label>
              <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                <SelectTrigger className="bg-theme-bg border-theme-border text-theme-text">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-theme-card border-theme-border">
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                placeholder="e.g., 2 days, 3 days"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Select value={formData.level} onValueChange={(value) => setFormData({...formData, level: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                  <SelectItem value="MASTERCLASS">Masterclass</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxStudents">Max Students</Label>
              <Input
                id="maxStudents"
                type="number"
                value={formData.maxStudents}
                onChange={(e) => setFormData({...formData, maxStudents: e.target.value})}
                placeholder="20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextSession">Next Session</Label>
              <Input
                id="nextSession"
                type="date"
                value={formData.nextSession}
                onChange={(e) => setFormData({...formData, nextSession: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPCOMING">Upcoming</SelectItem>
                  <SelectItem value="ONGOING">Ongoing</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="isPublished">Published</Label>
              <Select value={formData.isPublished.toString()} onValueChange={(value) => setFormData({...formData, isPublished: value === 'true'})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="border-theme-border hover:bg-theme-bg-secondary">
              Cancel
            </Button>
            <Button onClick={handleCreateClass} className="bg-theme-primary hover:bg-theme-primary-700 text-white">
              <Save className="h-4 w-4 mr-2" />
              Create Class
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Class Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl bg-theme-card border-theme-border">
          <DialogHeader>
            <DialogTitle className={textHierarchy.sectionHeading(isDarkMode)}>Edit Academy Class</DialogTitle>
            <DialogDescription className={textHierarchy.subheading()}>
              Update the academy class details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Class Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Beginner Forex Course"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-instructor">Instructor</Label>
              <Input
                id="edit-instructor"
                value={formData.instructor}
                onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                placeholder="e.g., XEN Forex Team"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe what students will learn..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="e.g., XEN Forex Academy, Kampala"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price</Label>
              <Input
                id="edit-price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-currency">Currency</Label>
              <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-duration">Duration</Label>
              <Input
                id="edit-duration"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                placeholder="e.g., 2 days, 3 days"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-level">Level</Label>
              <Select value={formData.level} onValueChange={(value) => setFormData({...formData, level: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                  <SelectItem value="MASTERCLASS">Masterclass</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-maxStudents">Max Students</Label>
              <Input
                id="edit-maxStudents"
                type="number"
                value={formData.maxStudents}
                onChange={(e) => setFormData({...formData, maxStudents: e.target.value})}
                placeholder="20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-nextSession">Next Session</Label>
              <Input
                id="edit-nextSession"
                type="date"
                value={formData.nextSession}
                onChange={(e) => setFormData({...formData, nextSession: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPCOMING">Upcoming</SelectItem>
                  <SelectItem value="ONGOING">Ongoing</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-isPublished">Published</Label>
              <Select value={formData.isPublished.toString()} onValueChange={(value) => setFormData({...formData, isPublished: value === 'true'})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} className="border-theme-border hover:bg-theme-bg-secondary">
              Cancel
            </Button>
            <Button onClick={handleEditClass} className="bg-theme-primary hover:bg-theme-primary-700">
              <Save className="h-4 w-4 mr-2" />
              Update Class
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Registrations Dialog */}
      <Dialog open={showRegistrationsDialog} onOpenChange={setShowRegistrationsDialog}>
        <DialogContent className="max-w-7xl max-h-[95vh] flex flex-col bg-theme-card border-theme-border">
          <DialogHeader className="pb-4 border-b border-theme-border flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className={textHierarchy.largeHeading(isDarkMode)}>
                  Class Registrations
                </DialogTitle>
                <DialogDescription className={`${textHierarchy.subheading()} text-lg`}>
                  View and manage registrations for <span className={`font-semibold ${textHierarchy.cardTitle(isDarkMode)}`}>{selectedClass?.title}</span>
                </DialogDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={autoConfirmPaidStudents}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2 bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                  disabled={registrations.filter(r => r.paymentStatus === 'PAID' && r.status === 'PENDING').length === 0}
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Auto-Confirm Paid</span>
                  {registrations.filter(r => r.paymentStatus === 'PAID' && r.status === 'PENDING').length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-green-200 text-green-800 rounded-full">
                      {registrations.filter(r => r.paymentStatus === 'PAID' && r.status === 'PENDING').length}
                    </span>
                  )}
                </Button>
                <div className="flex flex-col items-end">
                  <Button
                    onClick={downloadToExcel}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                    disabled={isExporting || registrations.length === 0}
                  >
                    <Download className={`h-4 w-4 ${isExporting ? 'animate-pulse' : ''}`} />
                    <span>
                      {isExporting 
                        ? `Exporting... ${Math.round(exportProgress)}%` 
                        : 'Download Professional Excel'
                      }
                    </span>
                  </Button>
                  {isExporting && (
                    <div className="w-full mt-1">
                      <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-300 ease-out"
                          style={{ width: `${exportProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 flex-shrink-0">
              <Card className="bg-theme-card border-theme-border">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-theme-primary" />
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${textHierarchy.metaText(isDarkMode)}`}>Total Registrations</p>
                      <p className={`text-2xl font-bold ${textHierarchy.sectionHeading(isDarkMode)}`}>{registrations.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-theme-card border-theme-border">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-theme-success" />
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${textHierarchy.metaText(isDarkMode)}`}>Confirmed</p>
                      <p className={`text-2xl font-bold ${textHierarchy.sectionHeading(isDarkMode)}`}>
                        {registrations.filter(r => r.status === 'CONFIRMED').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-theme-card border-theme-border">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-theme-warning" />
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${textHierarchy.metaText(isDarkMode)}`}>Pending</p>
                      <p className={`text-2xl font-bold ${textHierarchy.sectionHeading(isDarkMode)}`}>
                        {registrations.filter(r => r.status === 'PENDING').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-theme-card border-theme-border">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Star className="h-8 w-8 text-theme-accent" />
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${textHierarchy.metaText(isDarkMode)}`}>Revenue</p>
                      <p className={`text-2xl font-bold ${textHierarchy.sectionHeading(isDarkMode)}`}>
                        {formatCurrency(registrations.reduce((acc, r) => acc + r.amountUSD, 0))}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Registrations Table */}
            <div className="bg-theme-card rounded-lg border border-theme-border overflow-hidden flex-1 flex flex-col">
              <div className="px-6 py-4 border-b border-theme-border bg-theme-bg-secondary flex-shrink-0">
                <h3 className={`text-lg font-semibold ${textHierarchy.sectionHeading(isDarkMode)}`}>
                  Student Registrations ({registrations.length})
                </h3>
              </div>
              
              <div className="flex-1 overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-theme-bg-secondary z-10">
                    <TableRow className="bg-theme-bg-secondary">
                      <TableHead className={`font-semibold ${textHierarchy.cardTitle(isDarkMode)}`}>Student</TableHead>
                      <TableHead className={`font-semibold ${textHierarchy.cardTitle(isDarkMode)}`}>Contact</TableHead>
                      <TableHead className={`font-semibold ${textHierarchy.cardTitle(isDarkMode)}`}>Experience</TableHead>
                      <TableHead className={`font-semibold ${textHierarchy.cardTitle(isDarkMode)}`}>Status</TableHead>
                      <TableHead className={`font-semibold ${textHierarchy.cardTitle(isDarkMode)}`}>Payment</TableHead>
                      <TableHead className={`font-semibold ${textHierarchy.cardTitle(isDarkMode)}`}>Amount</TableHead>
                      <TableHead className={`font-semibold ${textHierarchy.cardTitle(isDarkMode)}`}>Registered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className={`text-center py-8 ${textHierarchy.cardDescription()}`}>
                          <div className="flex flex-col items-center">
                            <Users className="h-12 w-12 text-theme-text-tertiary mb-2" />
                            <p className={`text-lg font-medium ${textHierarchy.sectionHeading(isDarkMode)}`}>No registrations yet</p>
                            <p className={`text-sm ${textHierarchy.cardDescription()}`}>Students will appear here once they register for this class.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      registrations.map((registration) => (
                        <TableRow key={registration.id} className="hover:bg-theme-bg-secondary">
                          <TableCell>
                            <div>
                              <div className={`font-semibold ${textHierarchy.cardTitle(isDarkMode)}`}>
                                {registration.fullName}
                              </div>
                              {registration.user?.name && (
                                <div className={`text-sm ${textHierarchy.cardDescription()}`}>
                                  User: {registration.user.name}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className={textHierarchy.cardTitle(isDarkMode)}>{registration.email}</div>
                              {registration.phone && (
                                <div className={`text-sm ${textHierarchy.cardDescription()}`}>
                                  {registration.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className={textHierarchy.cardTitle(isDarkMode)}>
                              {registration.experience || 'Not specified'}
                            </div>
                            {registration.goals && (
                              <div className={`text-sm ${textHierarchy.cardDescription()} truncate max-w-32`}>
                                {registration.goals}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={`${
                                registration.status === 'CONFIRMED' 
                                  ? 'bg-theme-success-100 text-theme-success-800 dark:bg-theme-success-900 dark:text-theme-success-200'
                                  : registration.status === 'PENDING'
                                  ? 'bg-theme-warning-100 text-theme-warning-800 dark:bg-theme-warning-900 dark:text-theme-warning-200'
                                  : registration.status === 'CANCELLED'
                                  ? 'bg-theme-error-100 text-theme-error-800 dark:bg-theme-error-900 dark:text-theme-error-200'
                                  : 'bg-theme-neutral-100 text-theme-neutral-800 dark:bg-theme-neutral-900 dark:text-theme-neutral-200'
                              }`}
                            >
                              {registration.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={`${
                                registration.paymentStatus === 'PAID' 
                                  ? 'bg-theme-success-100 text-theme-success-800 dark:bg-theme-success-900 dark:text-theme-success-200'
                                  : registration.paymentStatus === 'PENDING'
                                  ? 'bg-theme-warning-100 text-theme-warning-800 dark:bg-theme-warning-900 dark:text-theme-warning-200'
                                  : registration.paymentStatus === 'FAILED'
                                  ? 'bg-theme-error-100 text-theme-error-800 dark:bg-theme-error-900 dark:text-theme-error-200'
                                  : 'bg-theme-neutral-100 text-theme-neutral-800 dark:bg-theme-neutral-900 dark:text-theme-neutral-200'
                              }`}
                            >
                              {registration.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className={`font-semibold ${textHierarchy.cardTitle(isDarkMode)}`}>
                              {formatCurrency(registration.amountUSD, registration.currency)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className={`text-sm ${textHierarchy.cardTitle(isDarkMode)}`}>
                              {formatDate(registration.createdAt)}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          
          <DialogFooter className="pt-4 border-t border-theme-border">
            <div className="flex justify-between items-center w-full">
              <div className={`text-sm ${textHierarchy.metaText(isDarkMode)}`}>
                Last updated: {new Date().toLocaleString()}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => selectedClass && fetchRegistrations(selectedClass.id)}
                  className="px-4 border-theme-border hover:bg-theme-bg-secondary"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowRegistrationsDialog(false)}
                  className="px-6 border-theme-border hover:bg-theme-bg-secondary"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
