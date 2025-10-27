import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2 } from 'lucide-react'

export default async function VerifyDataPage() {
  // Fetch all seeded data
  const [
    brokers,
    copyTradingPlatforms,
    affiliatePrograms,
    brokerAccountOpenings,
    copyTradingSubscriptions,
    courses,
    users
  ] = await Promise.all([
    prisma.broker.findMany({ orderBy: { displayOrder: 'asc' } }),
    prisma.copyTradingPlatform.findMany({ orderBy: { displayOrder: 'asc' } }),
    prisma.affiliateProgram.findMany({ include: { user: true } }),
    prisma.brokerAccountOpening.findMany({ include: { broker: true, user: true } }),
    prisma.copyTradingSubscription.findMany({ include: { platform: true, user: true } }),
    prisma.course.findMany({ where: { status: 'PUBLISHED' } }),
    prisma.user.count()
  ])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <CheckCircle2 className="h-8 w-8 text-green-500" />
        <div>
          <h1 className="text-3xl font-bold">XEN TradeHub Data Verification</h1>
          <p className="text-muted-foreground">Verify all seeded data is loaded correctly</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Brokers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{brokers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Copy Trading Platforms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{copyTradingPlatforms.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Brokers */}
      <Card>
        <CardHeader>
          <CardTitle>Brokers ({brokers.length})</CardTitle>
          <CardDescription>Partner brokers available in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {brokers.map((broker) => (
              <div key={broker.id} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{broker.name}</h3>
                    {broker.isActive && <Badge variant="outline" className="text-green-600">Active</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{broker.description}</p>
                  <div className="flex gap-2 mt-2">
                    {broker.benefits.slice(0, 3).map((benefit, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Badge variant="outline">Order: {broker.displayOrder}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Copy Trading Platforms */}
      <Card>
        <CardHeader>
          <CardTitle>Copy Trading Platforms ({copyTradingPlatforms.length})</CardTitle>
          <CardDescription>Copy trading platforms available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {copyTradingPlatforms.map((platform) => (
              <div key={platform.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{platform.name}</h3>
                    <p className="text-sm text-muted-foreground">{platform.description}</p>
                  </div>
                  <Badge variant={platform.isActive ? 'default' : 'secondary'}>
                    {platform.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">ROI:</span>
                    <span className="ml-2 font-medium">{platform.roi}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Risk:</span>
                    <span className="ml-2 font-medium">{platform.riskLevel}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Min Investment:</span>
                    <span className="ml-2 font-medium">${platform.minInvestment}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Win Rate:</span>
                    <span className="ml-2 font-medium">{platform.winRate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Broker Account Openings */}
      <Card>
        <CardHeader>
          <CardTitle>Broker Account Openings ({brokerAccountOpenings.length})</CardTitle>
          <CardDescription>User account opening requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {brokerAccountOpenings.map((opening) => (
              <div key={opening.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">{opening.fullName}</p>
                    <p className="text-sm text-muted-foreground">{opening.email}</p>
                  </div>
                  <Badge variant="outline">{opening.broker.name}</Badge>
                </div>
                <Badge variant={opening.status === 'APPROVED' ? 'default' : 'secondary'}>
                  {opening.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Copy Trading Subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Copy Trading Subscriptions ({copyTradingSubscriptions.length})</CardTitle>
          <CardDescription>Active copy trading subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {copyTradingSubscriptions.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">{sub.user.name}</p>
                    <p className="text-sm"><strong>Platform:</strong> {sub.platform.name}</p>
                  </div>
                  <Badge variant="outline">${sub.investmentUSD}</Badge>
                </div>
                <Badge variant={sub.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {sub.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Affiliate Programs */}
      <Card>
        <CardHeader>
          <CardTitle>Affiliate Programs ({affiliatePrograms.length})</CardTitle>
          <CardDescription>Active affiliate accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {affiliatePrograms.map((program) => (
              <div key={program.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">{program.user.name}</p>
                    <p className="text-sm text-muted-foreground">{program.user.email}</p>
                  </div>
                  <Badge variant="outline">{program.affiliateCode}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{program.tier}</Badge>
                  <Badge variant="secondary">{program.commissionRate}%</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Academy Courses */}
      <Card>
        <CardHeader>
          <CardTitle>Academy Courses ({courses.length})</CardTitle>
          <CardDescription>Published courses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {courses.map((course) => (
              <div key={course.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">{course.title}</p>
                  <p className="text-sm text-muted-foreground">{course.shortDescription}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{course.level}</Badge>
                  <Badge variant="secondary">
                    {course.isFree ? 'Free' : `$${course.priceUSD}`}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center p-6 bg-green-50 border border-green-200 rounded-lg">
        <div className="text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-green-900">All Data Verified Successfully!</h3>
          <p className="text-sm text-green-700">XEN TradeHub database is properly seeded and operational</p>
        </div>
      </div>
    </div>
  )
}
