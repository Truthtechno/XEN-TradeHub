'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Calendar, CheckCircle, Clock, Edit, Eye, Filter, MoreHorizontal, Plus, Search, Star, Trash2, User, XCircle } from 'lucide-react'
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

interface CoachingSession {
  id: string
  studentName: string
  studentEmail: string
  coachName: string
  sessionType: 'One-on-One' | 'Group' | 'Webinar'
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'In Progress'
  scheduledDate: string
  duration: number
  price: number
  rating?: number
  notes?: string
  createdAt: string
}

export default function CoachingPage() {
  const [sessions, setSessions] = useState<CoachingSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const fetchSessions = async () => {
    setIsLoading(true)
    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data - replace with actual data from API
      setSessions([
        {
          id: '1',
          studentName: 'John Doe',
          studentEmail: 'john@example.com',
          coachName: 'Sarah Wilson',
          sessionType: 'One-on-One',
          status: 'Scheduled',
          scheduledDate: '2024-01-20T14:00:00Z',
          duration: 60,
          price: 150,
          notes: 'Beginner trader, needs help with risk management',
          createdAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          studentName: 'Jane Smith',
          studentEmail: 'jane@example.com',
          coachName: 'Mike Johnson',
          sessionType: 'One-on-One',
          status: 'Completed',
          scheduledDate: '2024-01-18T16:00:00Z',
          duration: 90,
          price: 200,
          rating: 5,
          notes: 'Advanced trader, discussed advanced strategies',
          createdAt: '2024-01-10T09:00:00Z'
        },
        {
          id: '3',
          studentName: 'Bob Wilson',
          studentEmail: 'bob@example.com',
          coachName: 'Sarah Wilson',
          sessionType: 'Group',
          status: 'In Progress',
          scheduledDate: '2024-01-19T10:00:00Z',
          duration: 120,
          price: 75,
          notes: 'Group session on technical analysis',
          createdAt: '2024-01-12T14:00:00Z'
        },
        {
          id: '4',
          studentName: 'Alice Brown',
          studentEmail: 'alice@example.com',
          coachName: 'Mike Johnson',
          sessionType: 'Webinar',
          status: 'Completed',
          scheduledDate: '2024-01-17T19:00:00Z',
          duration: 60,
          price: 50,
          rating: 4,
          notes: 'Webinar on market psychology',
          createdAt: '2024-01-08T11:00:00Z'
        }
      ])
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.coachName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter
    const matchesType = typeFilter === 'all' || session.sessionType === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'Cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'One-on-One':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'Group':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'Webinar':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-xen-red"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Coaching Sessions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage one-on-one coaching sessions and group training
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="w-full sm:w-auto">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Session
          </Button>
          <Button className="w-full sm:w-auto bg-xen-red hover:bg-red-700">
            <Plus className="h-4 w-4 mr-2" />
            New Session
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{sessions.length}</p>
              </div>
              <User className="h-8 w-8 text-xen-red" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {sessions.filter(s => s.status === 'Scheduled').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {sessions.filter(s => s.status === 'Completed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(sessions.reduce((acc, s) => acc + s.price, 0))}
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-xen-red bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="In Progress">In Progress</option>
              </select>
            </div>
            <div className="sm:w-48">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-xen-red bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="One-on-One">One-on-One</option>
                <option value="Group">Group</option>
                <option value="Webinar">Webinar</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Sessions ({filteredSessions.length})</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Manage coaching sessions and track progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 dark:border-gray-700">
                  <TableHead className="text-gray-900 dark:text-white">Student</TableHead>
                  <TableHead className="text-gray-900 dark:text-white">Coach</TableHead>
                  <TableHead className="text-gray-900 dark:text-white">Type</TableHead>
                  <TableHead className="text-gray-900 dark:text-white">Status</TableHead>
                  <TableHead className="text-gray-900 dark:text-white">Scheduled</TableHead>
                  <TableHead className="text-gray-900 dark:text-white">Duration</TableHead>
                  <TableHead className="text-gray-900 dark:text-white">Price</TableHead>
                  <TableHead className="text-gray-900 dark:text-white">Rating</TableHead>
                  <TableHead className="w-[50px] text-gray-900 dark:text-white"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((session) => (
                  <TableRow key={session.id} className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{session.studentName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{session.studentEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-900 dark:text-white">{session.coachName}</TableCell>
                    <TableCell>
                      <Badge className={getTypeBadgeColor(session.sessionType)}>
                        {session.sessionType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(session.status)}>
                        {session.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-900 dark:text-white">{formatDate(session.scheduledDate)}</TableCell>
                    <TableCell className="text-gray-900 dark:text-white">{session.duration} min</TableCell>
                    <TableCell className="text-gray-900 dark:text-white">{formatCurrency(session.price)}</TableCell>
                    <TableCell>
                      {session.rating ? (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-gray-900 dark:text-white">{session.rating}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <DropdownMenuLabel className="text-gray-900 dark:text-white">Actions</DropdownMenuLabel>
                          <DropdownMenuItem className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Session
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                          <DropdownMenuItem className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Cancel Session
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
    </div>
  )
}
