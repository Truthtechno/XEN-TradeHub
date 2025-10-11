'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, CheckCircle, Clock, DollarSign, Download, Mail, MessageSquare, Phone, Target, Users, Plus, Edit, Trash2, Calendar as CalendarIcon, Video } from 'lucide-react'
import { useTheme } from '@/lib/optimized-theme-context'
import { useTextHierarchy } from '@/lib/text-hierarchy'

interface MentorshipRegistration {
  id: string
  name: string
  email: string
  phone: string
  country: string
  experience: string
  goals: string
  status: 'PENDING' | 'PAID' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  updatedAt: string
  user: {
    id: string
    email: string
    name: string
    role: string
  }
  appointments: MentorshipAppointment[]
}

interface MentorshipAppointment {
  id: string
  title: string
  description: string
  scheduledAt: string
  duration: number
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  meetingLink: string
  notes: string
  createdAt: string
  updatedAt: string
}

interface MentorshipStats {
  totalRegistrations: number
  pendingRegistrations: number
  completedRegistrations: number
  totalPayments: number
  completedPayments: number
  totalRevenue: number
  upcomingAppointments: number
  completedAppointments: number
}

export default function MentorshipAdminPage() {
  const { isDarkMode } = useTheme()
  const textHierarchy = useTextHierarchy()
  const [registrations, setRegistrations] = useState<MentorshipRegistration[]>([])
  const [appointments, setAppointments] = useState<MentorshipAppointment[]>([])
  const [stats, setStats] = useState<MentorshipStats>({
    totalRegistrations: 0,
    pendingRegistrations: 0,
    completedRegistrations: 0,
    totalPayments: 0,
    completedPayments: 0,
    totalRevenue: 0,
    upcomingAppointments: 0,
    completedAppointments: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedRegistration, setSelectedRegistration] = useState<MentorshipRegistration | null>(null)
  const [isAddRegistrationOpen, setIsAddRegistrationOpen] = useState(false)
  const [isAddAppointmentOpen, setIsAddAppointmentOpen] = useState(false)
  const [isEditRegistrationOpen, setIsEditRegistrationOpen] = useState(false)
  const [isEditAppointmentOpen, setIsEditAppointmentOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<MentorshipAppointment | null>(null)

  // Form states
  const [newRegistration, setNewRegistration] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    experience: '',
    goals: ''
  })

  const [newAppointment, setNewAppointment] = useState({
    registrationId: '',
    title: '',
    description: '',
    scheduledAt: '',
    duration: 60,
    meetingLink: '',
    notes: ''
  })

  const [editRegistration, setEditRegistration] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    experience: '',
    goals: '',
    status: 'PENDING'
  })

  const [editAppointment, setEditAppointment] = useState({
    title: '',
    description: '',
    scheduledAt: '',
    duration: 60,
    status: 'SCHEDULED',
    meetingLink: '',
    notes: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/mentorship')
      const data = await response.json()
      
      if (data.success) {
        setRegistrations(data.data.registrations)
        setStats(data.data.stats)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/admin/mentorship/appointments')
      const data = await response.json()
      
      if (data.success) {
        setAppointments(data.data.appointments)
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    }
  }

  const handleAddRegistration = async () => {
    try {
      const response = await fetch('/api/admin/mentorship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRegistration)
      })
      
      const data = await response.json()
      if (data.success) {
        await fetchData()
        setIsAddRegistrationOpen(false)
        setNewRegistration({
          name: '',
          email: '',
          phone: '',
          country: '',
          experience: '',
          goals: ''
        })
      }
    } catch (error) {
      console.error('Error adding registration:', error)
    }
  }

  const handleEditRegistration = async () => {
    if (!selectedRegistration) return
    
    try {
      const response = await fetch(`/api/admin/mentorship/${selectedRegistration.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editRegistration)
      })
      
      const data = await response.json()
      if (data.success) {
        await fetchData()
        setIsEditRegistrationOpen(false)
        setSelectedRegistration(null)
      }
    } catch (error) {
      console.error('Error updating registration:', error)
    }
  }

  const handleDeleteRegistration = async (id: string) => {
    if (!confirm('Are you sure you want to delete this registration?')) return
    
    try {
      const response = await fetch(`/api/admin/mentorship/${id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      if (data.success) {
        await fetchData()
      }
    } catch (error) {
      console.error('Error deleting registration:', error)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/mentorship/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      const data = await response.json()
      if (data.success) {
        await fetchData()
        console.log(data.message || 'Status updated successfully')
      } else {
        console.error('Failed to update status:', data.message)
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleAddAppointment = async () => {
    try {
      const response = await fetch('/api/admin/mentorship/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppointment)
      })
      
      const data = await response.json()
      if (data.success) {
        await fetchAppointments()
        await fetchData()
        setIsAddAppointmentOpen(false)
        setNewAppointment({
          registrationId: '',
          title: '',
          description: '',
          scheduledAt: '',
          duration: 60,
          meetingLink: '',
          notes: ''
        })
      }
    } catch (error) {
      console.error('Error adding appointment:', error)
    }
  }

  const handleEditAppointment = async () => {
    if (!selectedAppointment) return
    
    try {
      const response = await fetch(`/api/admin/mentorship/appointments/${selectedAppointment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editAppointment)
      })
      
      const data = await response.json()
      if (data.success) {
        await fetchAppointments()
        await fetchData()
        setIsEditAppointmentOpen(false)
        setSelectedAppointment(null)
      }
    } catch (error) {
      console.error('Error updating appointment:', error)
    }
  }

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return
    
    try {
      const response = await fetch(`/api/admin/mentorship/appointments/${id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      if (data.success) {
        await fetchAppointments()
        await fetchData()
      }
    } catch (error) {
      console.error('Error deleting appointment:', error)
    }
  }

  const openEditRegistration = (registration: MentorshipRegistration) => {
    setSelectedRegistration(registration)
    setEditRegistration({
      name: registration.name,
      email: registration.email,
      phone: registration.phone,
      country: registration.country,
      experience: registration.experience,
      goals: registration.goals,
      status: registration.status
    })
    setIsEditRegistrationOpen(true)
  }

  const openEditAppointment = (appointment: MentorshipAppointment) => {
    setSelectedAppointment(appointment)
    setEditAppointment({
      title: appointment.title,
      description: appointment.description,
      scheduledAt: new Date(appointment.scheduledAt).toISOString().slice(0, 16),
      duration: appointment.duration,
      status: appointment.status,
      meetingLink: appointment.meetingLink,
      notes: appointment.notes
    })
    setIsEditAppointmentOpen(true)
  }

  const exportData = () => {
    const csvContent = registrations.map(reg => 
      `${reg.id},${reg.name},${reg.email},${reg.phone},${reg.status},${reg.createdAt}`
    ).join('\n')
    
    const blob = new Blob([`ID,Name,Email,Phone,Status,Created Date\n${csvContent}`], 
      { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mentorship-registrations-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.phone.includes(searchTerm)
    const matchesStatus = !statusFilter || statusFilter === 'all' || reg.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-primary mx-auto mb-4"></div>
            <p className={textHierarchy.cardDescription()}>
              Loading mentorship data...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-theme tracking-tight">
            Mentorship Admin Dashboard
          </h1>
          <p className="text-theme-secondary text-base sm:text-lg max-w-2xl">
            Manage one-on-one mentorship registrations, payments, and appointments
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
          <Button 
            onClick={exportData} 
            variant="outline" 
            className="border-theme-border hover:bg-theme-bg-secondary px-6 py-3"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button 
            onClick={() => setIsAddRegistrationOpen(true)} 
            className="bg-theme-primary hover:bg-theme-primary-700 text-white px-6 py-3"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Reg
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Registrations</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRegistrations}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">All time registrations</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Payments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedPayments}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Successful payments</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming Appointments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.upcomingAppointments}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Scheduled sessions</p>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${stats.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">From completed payments</p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="registrations" className="space-y-6 sm:space-y-8">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-0 h-auto sm:h-10 bg-theme-bg-secondary">
          <TabsTrigger value="registrations" className="text-sm sm:text-base py-3 sm:py-2 data-[state=active]:bg-theme-primary data-[state=active]:text-white">Registrations</TabsTrigger>
          <TabsTrigger value="appointments" className="text-sm sm:text-base py-3 sm:py-2 data-[state=active]:bg-theme-primary data-[state=active]:text-white">Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="registrations" className="space-y-6 sm:space-y-8">
          {/* Filters */}
          <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search" className="text-sm font-medium text-gray-700 dark:text-gray-300">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="w-full sm:w-48">
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Registrations Table */}
          <Card className="bg-theme-card border-theme-border">
            <CardHeader>
              <CardTitle className={textHierarchy.sectionHeading(isDarkMode)}>
                Mentorship Registrations
              </CardTitle>
              <CardDescription className={textHierarchy.subheading()}>
                Manage student registrations and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredRegistrations.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto mb-4 text-theme-text-tertiary" />
                  <p className={textHierarchy.cardDescription()}>
                    No mentorship registrations found
                  </p>
                  <p className={`text-sm ${textHierarchy.metaText(isDarkMode)}`}>
                    Registrations will appear here once students start booking sessions
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRegistrations.map((registration) => (
                    <div key={registration.id} className="p-4 rounded-lg border bg-theme-bg-secondary border-theme-border">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className={`font-semibold ${textHierarchy.cardTitle(isDarkMode)}`}>
                              {registration.name}
                            </h3>
                            <Badge className={registration.status === 'PAID' ? 'bg-theme-success-100 text-theme-success-800 dark:bg-theme-success-900 dark:text-theme-success-200' : 'bg-theme-warning-100 text-theme-warning-800 dark:bg-theme-warning-900 dark:text-theme-warning-200'}>
                              {registration.status}
                            </Badge>
                            <Badge className={registration.user.role === 'PREMIUM' ? 'bg-theme-accent-100 text-theme-accent-800 dark:bg-theme-accent-900 dark:text-theme-accent-200' : 'bg-theme-neutral-100 text-theme-neutral-800 dark:bg-theme-neutral-900 dark:text-theme-neutral-200'}>
                              {registration.user.role}
                            </Badge>
                            <Select 
                              value={registration.status} 
                              onValueChange={(value) => handleStatusChange(registration.id, value)}
                            >
                              <SelectTrigger className="w-32 h-6 text-xs bg-theme-bg border-theme-border text-theme-text">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-theme-card border-theme-border">
                                <SelectItem value="PENDING">PENDING</SelectItem>
                                <SelectItem value="PAID">PAID</SelectItem>
                                <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                                <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-theme-text-tertiary" />
                              <span className={textHierarchy.cardDescription()}>
                                {registration.email}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-theme-text-tertiary" />
                              <span className={textHierarchy.cardDescription()}>
                                {registration.phone}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-theme-text-tertiary" />
                              <span className={textHierarchy.cardDescription()}>
                                {new Date(registration.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Target className="h-4 w-4 text-theme-text-tertiary" />
                              <span className={textHierarchy.cardDescription()}>
                                {registration.country}
                              </span>
                            </div>
                          </div>
                          
                          {registration.goals && (
                            <div className="mt-3">
                              <div className="flex items-start space-x-2">
                                <MessageSquare className="h-4 w-4 text-theme-text-tertiary mt-1" />
                                <div>
                                  <p className={`text-sm font-medium ${textHierarchy.cardDescription()}`}>
                                    Goals:
                                  </p>
                                  <p className={`text-sm ${textHierarchy.metaText(isDarkMode)}`}>
                                    {registration.goals}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {registration.appointments.length > 0 && (
                            <div className="mt-3">
                              <p className={`text-sm font-medium ${textHierarchy.cardDescription()}`}>
                                Appointments ({registration.appointments.length}):
                              </p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {registration.appointments.map((appointment) => (
                                  <Badge key={appointment.id} variant="outline" className="border-theme-border text-theme-text">
                                    {new Date(appointment.scheduledAt).toLocaleDateString()}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditRegistration(registration)}
                            className="border-theme-border hover:bg-theme-bg-secondary"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setNewAppointment(prev => ({ ...prev, registrationId: registration.id }))
                              setIsAddAppointmentOpen(true)
                            }}
                            className="border-theme-border hover:bg-theme-bg-secondary"
                          >
                            <CalendarIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteRegistration(registration.id)}
                            className="border-theme-border hover:bg-theme-error-50 dark:hover:bg-theme-error-900/20 text-theme-error"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <Card className="bg-theme-card border-theme-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className={textHierarchy.sectionHeading(isDarkMode)}>
                    Mentorship Appointments
                  </CardTitle>
                  <CardDescription className={textHierarchy.subheading()}>
                    Schedule and manage one-on-one sessions
                  </CardDescription>
                </div>
                <Button onClick={() => setIsAddAppointmentOpen(true)} className="bg-theme-primary hover:bg-theme-primary-700 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule Appointment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-theme-text-tertiary" />
                <p className={textHierarchy.cardDescription()}>
                  Appointments will appear here once scheduled
                </p>
                <p className={`text-sm ${textHierarchy.metaText(isDarkMode)}`}>
                  Use the "Schedule Appointment" button to create new sessions
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Registration Dialog */}
      <Dialog open={isAddRegistrationOpen} onOpenChange={setIsAddRegistrationOpen}>
        <DialogContent className="bg-theme-card border-theme-border">
          <DialogHeader>
            <DialogTitle className={textHierarchy.sectionHeading(isDarkMode)}>Add New Registration</DialogTitle>
            <DialogDescription className={textHierarchy.subheading()}>
              Create a new mentorship registration for a student
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className={textHierarchy.cardTitle(isDarkMode)}>Full Name</Label>
                <Input
                  id="name"
                  value={newRegistration.name}
                  onChange={(e) => setNewRegistration(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-theme-bg border-theme-border text-theme-text"
                />
              </div>
              <div>
                <Label htmlFor="email" className={textHierarchy.cardTitle(isDarkMode)}>Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newRegistration.email}
                  onChange={(e) => setNewRegistration(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-theme-bg border-theme-border text-theme-text"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone" className={textHierarchy.cardTitle(isDarkMode)}>Phone</Label>
                <Input
                  id="phone"
                  value={newRegistration.phone}
                  onChange={(e) => setNewRegistration(prev => ({ ...prev, phone: e.target.value }))}
                  className="bg-theme-bg border-theme-border text-theme-text"
                />
              </div>
              <div>
                <Label htmlFor="country" className={textHierarchy.cardTitle(isDarkMode)}>Country</Label>
                <Input
                  id="country"
                  value={newRegistration.country}
                  onChange={(e) => setNewRegistration(prev => ({ ...prev, country: e.target.value }))}
                  className="bg-theme-bg border-theme-border text-theme-text"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="experience" className={textHierarchy.cardTitle(isDarkMode)}>Experience Level</Label>
              <Textarea
                id="experience"
                value={newRegistration.experience}
                onChange={(e) => setNewRegistration(prev => ({ ...prev, experience: e.target.value }))}
                className="bg-theme-bg border-theme-border text-theme-text"
              />
            </div>
            <div>
              <Label htmlFor="goals" className={textHierarchy.cardTitle(isDarkMode)}>Goals & Preferences</Label>
              <Textarea
                id="goals"
                value={newRegistration.goals}
                onChange={(e) => setNewRegistration(prev => ({ ...prev, goals: e.target.value }))}
                className="bg-theme-bg border-theme-border text-theme-text"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddRegistrationOpen(false)} className="border-theme-border hover:bg-theme-bg-secondary">
              Cancel
            </Button>
            <Button onClick={handleAddRegistration} className="bg-theme-primary hover:bg-theme-primary-700 text-white">
              Add Registration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Registration Dialog */}
      <Dialog open={isEditRegistrationOpen} onOpenChange={setIsEditRegistrationOpen}>
        <DialogContent className="bg-theme-card border-theme-border">
          <DialogHeader>
            <DialogTitle className={textHierarchy.sectionHeading(isDarkMode)}>Edit Registration</DialogTitle>
            <DialogDescription className={textHierarchy.subheading()}>
              Update registration details and status
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editRegistration.name}
                  onChange={(e) => setEditRegistration(prev => ({ ...prev, name: e.target.value }))}
                  className={isDarkMode ? 'bg-gray-700 border-gray-600' : ''}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editRegistration.email}
                  onChange={(e) => setEditRegistration(prev => ({ ...prev, email: e.target.value }))}
                  className={isDarkMode ? 'bg-gray-700 border-gray-600' : ''}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editRegistration.phone}
                  onChange={(e) => setEditRegistration(prev => ({ ...prev, phone: e.target.value }))}
                  className={isDarkMode ? 'bg-gray-700 border-gray-600' : ''}
                />
              </div>
              <div>
                <Label htmlFor="edit-country">Country</Label>
                <Input
                  id="edit-country"
                  value={editRegistration.country}
                  onChange={(e) => setEditRegistration(prev => ({ ...prev, country: e.target.value }))}
                  className={isDarkMode ? 'bg-gray-700 border-gray-600' : ''}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-status" className={textHierarchy.cardTitle(isDarkMode)}>Status</Label>
              <Select value={editRegistration.status} onValueChange={(value) => setEditRegistration(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="bg-theme-bg border-theme-border text-theme-text">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-theme-card border-theme-border">
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-experience">Experience Level</Label>
              <Textarea
                id="edit-experience"
                value={editRegistration.experience}
                onChange={(e) => setEditRegistration(prev => ({ ...prev, experience: e.target.value }))}
                className={isDarkMode ? 'bg-gray-700 border-gray-600' : ''}
              />
            </div>
            <div>
              <Label htmlFor="edit-goals">Goals & Preferences</Label>
              <Textarea
                id="edit-goals"
                value={editRegistration.goals}
                onChange={(e) => setEditRegistration(prev => ({ ...prev, goals: e.target.value }))}
                className={isDarkMode ? 'bg-gray-700 border-gray-600' : ''}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditRegistrationOpen(false)} className="border-theme-border hover:bg-theme-bg-secondary">
              Cancel
            </Button>
            <Button onClick={handleEditRegistration} className="bg-theme-primary hover:bg-theme-primary-700 text-white">
              Update Registration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Appointment Dialog */}
      <Dialog open={isAddAppointmentOpen} onOpenChange={setIsAddAppointmentOpen}>
        <DialogContent className="bg-theme-card border-theme-border">
          <DialogHeader>
            <DialogTitle className={textHierarchy.sectionHeading(isDarkMode)}>Schedule Appointment</DialogTitle>
            <DialogDescription className={textHierarchy.subheading()}>
              Create a new mentorship session
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="appointment-registration" className={textHierarchy.cardTitle(isDarkMode)}>Student</Label>
              <Select value={newAppointment.registrationId} onValueChange={(value) => setNewAppointment(prev => ({ ...prev, registrationId: value }))}>
                <SelectTrigger className="bg-theme-bg border-theme-border text-theme-text">
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent className="bg-theme-card border-theme-border">
                  {registrations.map((reg) => (
                    <SelectItem key={reg.id} value={reg.id}>
                      {reg.name} ({reg.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="appointment-title" className={textHierarchy.cardTitle(isDarkMode)}>Title</Label>
              <Input
                id="appointment-title"
                value={newAppointment.title}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, title: e.target.value }))}
                className="bg-theme-bg border-theme-border text-theme-text"
              />
            </div>
            <div>
              <Label htmlFor="appointment-description" className={textHierarchy.cardTitle(isDarkMode)}>Description</Label>
              <Textarea
                id="appointment-description"
                value={newAppointment.description}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, description: e.target.value }))}
                className="bg-theme-bg border-theme-border text-theme-text"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="appointment-date" className={textHierarchy.cardTitle(isDarkMode)}>Date & Time</Label>
                <Input
                  id="appointment-date"
                  type="datetime-local"
                  value={newAppointment.scheduledAt}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, scheduledAt: e.target.value }))}
                  className="bg-theme-bg border-theme-border text-theme-text"
                />
              </div>
              <div>
                <Label htmlFor="appointment-duration" className={textHierarchy.cardTitle(isDarkMode)}>Duration (minutes)</Label>
                <Input
                  id="appointment-duration"
                  type="number"
                  value={newAppointment.duration}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="bg-theme-bg border-theme-border text-theme-text"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="appointment-link" className={textHierarchy.cardTitle(isDarkMode)}>Meeting Link</Label>
              <Input
                id="appointment-link"
                value={newAppointment.meetingLink}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, meetingLink: e.target.value }))}
                placeholder="https://zoom.us/j/..."
                className="bg-theme-bg border-theme-border text-theme-text"
              />
            </div>
            <div>
              <Label htmlFor="appointment-notes" className={textHierarchy.cardTitle(isDarkMode)}>Notes</Label>
              <Textarea
                id="appointment-notes"
                value={newAppointment.notes}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
                className="bg-theme-bg border-theme-border text-theme-text"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddAppointmentOpen(false)} className="border-theme-border hover:bg-theme-bg-secondary">
              Cancel
            </Button>
            <Button onClick={handleAddAppointment} className="bg-theme-primary hover:bg-theme-primary-700 text-white">
              Schedule Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}