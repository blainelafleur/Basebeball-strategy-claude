'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { RoleGuard } from '@/components/auth/role-guard';
import { useRole } from '@/hooks/use-role';
import { toast } from 'sonner';
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Palette,
  Volume2,
  Monitor,
  Smartphone,
  Mail,
  Award,
  Users,
  Download,
  Trash2,
  AlertTriangle,
  CreditCard,
} from 'lucide-react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const { isPro, isTeam, getRoleDisplayName } = useRole();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    achievements: true,
    gameInvites: true,
    weeklyDigest: false,
  });

  const [preferences, setPreferences] = useState({
    soundEffects: true,
    autoPlay: false,
    difficulty: 'intermediate',
    theme: 'system',
  });

  const handleBillingPortal = async () => {
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to access billing portal');
      }

      window.location.href = data.url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to access billing portal');
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <SettingsIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please sign in to access settings</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account preferences and privacy settings</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start text-blue-600 bg-blue-50">
                    <SettingsIcon className="w-4 h-4 mr-2" />
                    General
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Bell className="w-4 h-4 mr-2" />
                    Notifications
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Shield className="w-4 h-4 mr-2" />
                    Privacy
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Palette className="w-4 h-4 mr-2" />
                    Appearance
                  </Button>
                  {(isPro() || isTeam()) && (
                    <Button variant="ghost" className="w-full justify-start">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Billing
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <SettingsIcon className="w-5 h-5" />
                  <span>Account Information</span>
                </CardTitle>
                <CardDescription>
                  Update your account details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={session.user?.email || ''}
                      disabled
                    />
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      defaultValue={session.user?.name || ''}
                      placeholder="Enter your display name"
                    />
                  </div>
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
                <CardDescription>
                  Choose what notifications you&apos;d like to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <Label>Email Notifications</Label>
                      </div>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <Button
                      variant={notifications.email ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNotifications((prev) => ({ ...prev, email: !prev.email }))}
                    >
                      {notifications.email ? 'On' : 'Off'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Smartphone className="w-4 h-4 text-gray-500" />
                        <Label>Push Notifications</Label>
                      </div>
                      <p className="text-sm text-gray-500">
                        Receive push notifications on your device
                      </p>
                    </div>
                    <Button
                      variant={notifications.push ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNotifications((prev) => ({ ...prev, push: !prev.push }))}
                    >
                      {notifications.push ? 'On' : 'Off'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-gray-500" />
                        <Label>Achievement Notifications</Label>
                      </div>
                      <p className="text-sm text-gray-500">
                        Get notified when you unlock achievements
                      </p>
                    </div>
                    <Button
                      variant={notifications.achievements ? 'default' : 'outline'}
                      size="sm"
                      onClick={() =>
                        setNotifications((prev) => ({ ...prev, achievements: !prev.achievements }))
                      }
                    >
                      {notifications.achievements ? 'On' : 'Off'}
                    </Button>
                  </div>

                  <RoleGuard requiredRole={['PRO', 'TEAM', 'ADMIN']}>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <Label>Game Invites</Label>
                          <Badge variant="secondary" className="text-xs">
                            Pro
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          Receive invites to multiplayer games
                        </p>
                      </div>
                      <Button
                        variant={notifications.gameInvites ? 'default' : 'outline'}
                        size="sm"
                        onClick={() =>
                          setNotifications((prev) => ({ ...prev, gameInvites: !prev.gameInvites }))
                        }
                      >
                        {notifications.gameInvites ? 'On' : 'Off'}
                      </Button>
                    </div>
                  </RoleGuard>
                </div>
              </CardContent>
            </Card>

            {/* Game Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="w-5 h-5" />
                  <span>Game Preferences</span>
                </CardTitle>
                <CardDescription>Customize your gameplay experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Volume2 className="w-4 h-4 text-gray-500" />
                        <Label>Sound Effects</Label>
                      </div>
                      <p className="text-sm text-gray-500">Play sound effects during gameplay</p>
                    </div>
                    <Button
                      variant={preferences.soundEffects ? 'default' : 'outline'}
                      size="sm"
                      onClick={() =>
                        setPreferences((prev) => ({ ...prev, soundEffects: !prev.soundEffects }))
                      }
                    >
                      {preferences.soundEffects ? 'On' : 'Off'}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Default Difficulty</Label>
                    <div className="flex space-x-2">
                      {['beginner', 'intermediate', 'advanced', 'expert'].map((level) => (
                        <Button
                          key={level}
                          variant={preferences.difficulty === level ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPreferences((prev) => ({ ...prev, difficulty: level }))}
                          className="capitalize"
                        >
                          {level}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Theme Preference</Label>
                    <div className="flex space-x-2">
                      {['light', 'dark', 'system'].map((theme) => (
                        <Button
                          key={theme}
                          variant={preferences.theme === theme ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPreferences((prev) => ({ ...prev, theme: theme }))}
                          className="capitalize"
                        >
                          {theme}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Billing & Subscription */}
            {(isPro() || isTeam()) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5" />
                    <span>Billing & Subscription</span>
                  </CardTitle>
                  <CardDescription>
                    Manage your subscription and billing information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          {getRoleDisplayName()}
                        </Badge>
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          Active
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Your subscription is active and will renew automatically
                      </p>
                    </div>
                    <Button variant="outline" onClick={handleBillingPortal}>
                      Manage Billing
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">Current Plan</h4>
                        <p className="text-2xl font-bold text-blue-600">{getRoleDisplayName()}</p>
                        <p className="text-sm text-gray-500">
                          {isPro() ? '$9.99/month' : '$29.99/month'}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">Next Billing Date</h4>
                        <p className="text-lg font-semibold">December 16, 2024</p>
                        <p className="text-sm text-gray-500">Auto-renewal enabled</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-2">
                    <Label>Quick Actions</Label>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={handleBillingPortal}>
                        Update Payment Method
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleBillingPortal}>
                        Download Invoices
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleBillingPortal}>
                        Cancel Subscription
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Data & Privacy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Data & Privacy</span>
                </CardTitle>
                <CardDescription>Manage your data and privacy settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Download Your Data</Label>
                      <p className="text-sm text-gray-500">
                        Export all your game data, stats, and profile information
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <Label className="text-red-600">Delete Account</Label>
                      </div>
                      <p className="text-sm text-gray-500">
                        Permanently delete your account and all associated data
                      </p>
                    </div>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
