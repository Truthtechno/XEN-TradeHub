'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trophy, Users, DollarSign, CheckCircle2, Clock, TrendingUp, Search } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Input } from '@/components/ui/input'

interface ChallengeParticipant {
  id: string
  userId: string
  userName: string
  userEmail: string
  month: string
  referralCount: number
  qualifiedReferrals: Array<{
    id: string
    name: string
    email: string
    joinedAt: string
  }>
  rewardClaimed: boolean
  rewardAmount: number
  claimedAt: string | null
  createdAt: string
}

interface Stats {
  totalParticipants: number
  completedChallenges: number
  pendingRewards: number
  totalRewardsPaid: number
}

export default function AdminMonthlyChallengePagePage() {
  const [participants, setParticipants] = useState<ChallengeParticipant[]>([])
  const [filteredParticipants, setFilteredParticipants] = useState<ChallengeParticipant[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMonth, setSelectedMonth] = useState<string>('')

  useEffect(() => {
    // Set current month as default
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    setSelectedMonth(currentMonth)
    fetchChallengeData(currentMonth)
  }, [])

  useEffect(() => {
    // Filter participants based on search term
    if (searchTerm) {
      const filtered = participants.filter(p => 
        p.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredParticipants(filtered)
    } else {
      setFilteredParticipants(participants)
    }
  }, [searchTerm, participants])

  const fetchChallengeData = async (month: string) => {
    try {
      const response = await fetch(`/api/admin/monthly-challenge?month=${month}`)
      if (response.ok) {
        const data = await response.json()
        setParticipants(data.participants || [])
        setFilteredParticipants(data.participants || [])
        setStats(data.stats || null)
      } else {
        toast.error('Failed to load challenge data')
      }
    } catch (error) {
      console.error('Error fetching challenge data:', error)
      toast.error('Failed to load challenge data')
    } finally {
      setLoading(false)
    }
  }

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month)
    setLoading(true)
    fetchChallengeData(month)
  }

  const getStatusBadge = (participant: ChallengeParticipant) => {
    if (participant.rewardClaimed) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Claimed
        </Badge>
      )
    } else if (participant.referralCount >= 3) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          <Trophy className="mr-1 h-3 w-3" />
          Completed
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          <Clock className="mr-1 h-3 w-3" />
          In Progress
        </Badge>
      )
    }
  }

  // Generate month options (last 6 months)
  const getMonthOptions = (): { value: string; label: string }[] => {
    const options: { value: string; label: string }[] = []
    const now = new Date()
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      options.push({ value, label })
    }
    return options
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading challenge data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Monthly Challenge Monitor</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Track participant progress and manage rewards
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="px-4 py-2 border rounded-md bg-background"
          >
            {getMonthOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalParticipants}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedChallenges}</div>
              <p className="text-xs text-muted-foreground mt-1">
                3+ referrals achieved
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Rewards</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingRewards}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting claim
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rewards Paid</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRewardsPaid.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                This month
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Participants</CardTitle>
          <CardDescription>
            Monitor all participants and their progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Participants Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant</TableHead>
                  <TableHead className="text-center">Progress</TableHead>
                  <TableHead className="text-center">Referrals</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Reward</TableHead>
                  <TableHead className="text-center">Claimed Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipants.length > 0 ? (
                  filteredParticipants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                              {participant.userName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{participant.userName}</p>
                            <p className="text-sm text-muted-foreground truncate">{participant.userEmail}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all"
                              style={{ width: `${Math.min((participant.referralCount / 3) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {Math.min((participant.referralCount / 3) * 100, 100).toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-semibold">
                          {participant.referralCount} / 3
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(participant)}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold">
                          ${participant.rewardAmount.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {participant.claimedAt ? (
                          <span className="text-sm">
                            {new Date(participant.claimedAt).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        {searchTerm ? 'No participants found' : 'No participants yet'}
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
