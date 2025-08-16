'use client';

import { RoleGuard } from '@/components/auth/role-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  BookOpen,
  Trophy,
  BarChart3,
  Settings,
  Crown,
  Plus,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const stats = [
    {
      title: 'Total Users',
      value: '1,247',
      change: '+12%',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Active Scenarios',
      value: '156',
      change: '+5',
      icon: BookOpen,
      color: 'text-green-600',
    },
    {
      title: 'Pro Subscribers',
      value: '89',
      change: '+8%',
      icon: Crown,
      color: 'text-yellow-600',
    },
    {
      title: 'Games Played',
      value: '5,432',
      change: '+23%',
      icon: Trophy,
      color: 'text-purple-600',
    },
  ];

  const quickActions = [
    {
      title: 'Create Scenario',
      description: 'Add new baseball strategy scenarios',
      icon: Plus,
      href: '/admin/scenarios/new',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: Users,
      href: '/admin/users',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: 'View Analytics',
      description: 'Review platform analytics',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings',
      icon: Settings,
      href: '/admin/settings',
      color: 'bg-gray-500 hover:bg-gray-600',
    },
  ];

  const recentScenarios = [
    {
      id: '1',
      title: 'Championship Pressure Situation',
      category: 'pitcher',
      difficulty: 'EXPERT',
      timesPlayed: 234,
      averageScore: 78,
      createdAt: '2024-11-10',
    },
    {
      id: '2',
      title: 'Bases Loaded Decision',
      category: 'batter',
      difficulty: 'ADVANCED',
      timesPlayed: 156,
      averageScore: 82,
      createdAt: '2024-11-09',
    },
    {
      id: '3',
      title: 'Defensive Positioning',
      category: 'fielder',
      difficulty: 'INTERMEDIATE',
      timesPlayed: 89,
      averageScore: 85,
      createdAt: '2024-11-08',
    },
  ];

  return (
    <RoleGuard requiredRole="ADMIN">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Crown className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                Administrator
              </Badge>
            </div>
            <p className="text-gray-600">Manage scenarios, users, and platform settings</p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-green-600">{stat.change}</p>
                    </div>
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {quickActions.map((action, index) => (
                    <Link key={index} href={action.href}>
                      <Button variant="outline" className="w-full justify-start h-auto p-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-md ${action.color}`}>
                            <action.icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium">{action.title}</p>
                            <p className="text-xs text-gray-500">{action.description}</p>
                          </div>
                        </div>
                      </Button>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Recent Scenarios */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Scenarios</CardTitle>
                      <CardDescription>Recently created or updated scenarios</CardDescription>
                    </div>
                    <Link href="/admin/scenarios">
                      <Button variant="outline" size="sm">
                        View All
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentScenarios.map((scenario) => (
                      <div
                        key={scenario.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium">{scenario.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {scenario.category}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${
                                scenario.difficulty === 'EXPERT'
                                  ? 'bg-red-100 text-red-700'
                                  : scenario.difficulty === 'ADVANCED'
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {scenario.difficulty}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{scenario.timesPlayed} plays</span>
                            <span>{scenario.averageScore}% avg score</span>
                            <span>Created {scenario.createdAt}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* System Status */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current system health and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                    <p className="font-medium">Database</p>
                    <p className="text-sm text-gray-500">Online</p>
                  </div>
                  <div className="text-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                    <p className="font-medium">API Services</p>
                    <p className="text-sm text-gray-500">Operational</p>
                  </div>
                  <div className="text-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-2"></div>
                    <p className="font-medium">Stripe Webhooks</p>
                    <p className="text-sm text-gray-500">Pending Setup</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
