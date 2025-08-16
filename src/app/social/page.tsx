'use client';

import { useState, useEffect } from 'react';
import { GameHeader } from '@/components/game/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, UserCheck, UserX, Search, Trophy, Zap, Star } from 'lucide-react';
import { toast } from 'sonner';

interface Friend {
  id: string;
  name: string;
  email: string;
  points: number;
  level: string;
  gamesPlayed: number;
  currentStreak: number;
  status: 'accepted' | 'pending_sent' | 'pending_received';
  lastActive: string;
}

interface SocialData {
  friends: Friend[];
  pendingRequests: Friend[];
  sentRequests: Friend[];
}

export default function SocialPage() {
  const [data, setData] = useState<SocialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchSocialData();
  }, []);

  const fetchSocialData = async () => {
    try {
      const response = await fetch('/api/social/friends');
      if (!response.ok) {
        throw new Error('Failed to fetch social data');
      }
      const socialData = await response.json();
      setData(socialData);
    } catch (error) {
      console.error('Error fetching social data:', error);
      toast.error('Failed to load friends data');
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await fetch(`/api/social/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error('Failed to search users');
      }
      const results = await response.json();
      setSearchResults(results.users || []);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setSearching(false);
    }
  };

  const sendFriendRequest = async (userId: string) => {
    try {
      const response = await fetch('/api/social/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to send friend request');
      }

      toast.success('Friend request sent!');
      await fetchSocialData();
      setSearchResults([]);
      setSearchQuery('');
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
    }
  };

  const respondToFriendRequest = async (userId: string, accept: boolean) => {
    try {
      const response = await fetch('/api/social/friends/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, accept }),
      });

      if (!response.ok) {
        throw new Error('Failed to respond to friend request');
      }

      toast.success(accept ? 'Friend request accepted!' : 'Friend request declined');
      await fetchSocialData();
    } catch (error) {
      console.error('Error responding to friend request:', error);
      toast.error('Failed to respond to friend request');
    }
  };

  const removeFriend = async (userId: string) => {
    try {
      const response = await fetch('/api/social/friends/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove friend');
      }

      toast.success('Friend removed');
      await fetchSocialData();
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Failed to remove friend');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchUsers();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <GameHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-8 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const renderUserCard = (
    user: Friend,
    showActions = true,
    actionType: 'friend' | 'pending' | 'sent' = 'friend'
  ) => (
    <Card key={user.id} className="transition-all duration-200 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <h3 className="font-semibold text-lg">{user.name}</h3>
              <div className="flex items-center space-x-3 mt-1">
                <Badge variant="secondary" className="text-xs">
                  Level {user.level}
                </Badge>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Trophy className="w-3 h-3" />
                  <span>{user.points} pts</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Zap className="w-3 h-3" />
                  <span>{user.currentStreak} streak</span>
                </div>
              </div>
            </div>
          </div>

          {showActions && (
            <div className="flex items-center space-x-2">
              {actionType === 'friend' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      /* Challenge friend functionality */
                    }}
                    className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  >
                    Challenge
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => removeFriend(user.id)}>
                    <UserX className="w-4 h-4" />
                  </Button>
                </>
              )}

              {actionType === 'pending' && (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => respondToFriendRequest(user.id, true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <UserCheck className="w-4 h-4 mr-1" />
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => respondToFriendRequest(user.id, false)}
                  >
                    <UserX className="w-4 h-4 mr-1" />
                    Decline
                  </Button>
                </>
              )}

              {actionType === 'sent' && (
                <Badge variant="secondary" className="text-xs">
                  Request Sent
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <GameHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Friends & Social</h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Connect with other baseball strategy enthusiasts, challenge friends, and compete
            together.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="friends" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="friends">Friends ({data?.friends.length || 0})</TabsTrigger>
                <TabsTrigger value="pending">
                  Requests ({data?.pendingRequests.length || 0})
                </TabsTrigger>
                <TabsTrigger value="sent">Sent ({data?.sentRequests.length || 0})</TabsTrigger>
              </TabsList>

              <TabsContent value="friends" className="mt-6">
                <div className="space-y-4">
                  {data?.friends.length ? (
                    data.friends.map((friend) => renderUserCard(friend, true, 'friend'))
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold mb-2">No Friends Yet</h3>
                        <p className="text-gray-600 mb-4">
                          Start by searching for users to add as friends!
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="pending" className="mt-6">
                <div className="space-y-4">
                  {data?.pendingRequests.length ? (
                    data.pendingRequests.map((request) => renderUserCard(request, true, 'pending'))
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <UserPlus className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold mb-2">No Pending Requests</h3>
                        <p className="text-gray-600">You have no pending friend requests.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="sent" className="mt-6">
                <div className="space-y-4">
                  {data?.sentRequests.length ? (
                    data.sentRequests.map((request) => renderUserCard(request, true, 'sent'))
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <UserCheck className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold mb-2">No Sent Requests</h3>
                        <p className="text-gray-600">You have no pending outgoing requests.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Add Friends */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="w-5 h-5" />
                  <span>Find Friends</span>
                </CardTitle>
                <CardDescription>Search for users by name or email</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2 mb-4">
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <Button onClick={searchUsers} disabled={searching || !searchQuery.trim()}>
                    <Search className="w-4 h-4" />
                  </Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground">Search Results</h4>
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Level {user.level} • {user.points} pts
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => sendFriendRequest(user.id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5" />
                  <span>Social Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Friends</span>
                    <span className="font-semibold">{data?.friends.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Pending Requests</span>
                    <span className="font-semibold">{data?.pendingRequests.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Sent Requests</span>
                    <span className="font-semibold">{data?.sentRequests.length || 0}</span>
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
