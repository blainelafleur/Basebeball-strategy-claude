'use client';

import { useState } from 'react';
import { RoleGuard } from '@/components/auth/role-guard';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Plus, Eye, Edit, Trash2, BookOpen, ArrowLeft, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

export default function ScenariosManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  // Mock data - in real app, this would come from API
  const scenarios = [
    {
      id: '1',
      title: 'Championship Pressure: Bottom 9th',
      description: "Two outs, runner on third, down by one run. What's your approach?",
      category: 'pitcher',
      difficulty: 'EXPERT',
      timesPlayed: 234,
      averageScore: 78,
      isPublic: true,
      createdAt: '2024-11-10',
      createdBy: 'Admin',
    },
    {
      id: '2',
      title: 'Bases Loaded Decision',
      description: 'Count is 3-2, bases loaded, two outs. Choose your pitch.',
      category: 'pitcher',
      difficulty: 'ADVANCED',
      timesPlayed: 156,
      averageScore: 82,
      isPublic: true,
      createdAt: '2024-11-09',
      createdBy: 'Coach Mike',
    },
    {
      id: '3',
      title: 'Defensive Positioning vs Power Hitter',
      description: 'Known pull hitter at the plate, runner on first. How do you position?',
      category: 'fielder',
      difficulty: 'INTERMEDIATE',
      timesPlayed: 89,
      averageScore: 85,
      isPublic: true,
      createdAt: '2024-11-08',
      createdBy: 'Admin',
    },
    {
      id: '4',
      title: 'Stealing Second Base',
      description: 'Fast runner on first, favorable count. When do you steal?',
      category: 'baserunner',
      difficulty: 'BEGINNER',
      timesPlayed: 312,
      averageScore: 91,
      isPublic: true,
      createdAt: '2024-11-07',
      createdBy: 'Coach Sarah',
    },
    {
      id: '5',
      title: 'Clutch At-Bat Strategy',
      description: "Bottom 7th, tying run on second base. What's your approach?",
      category: 'batter',
      difficulty: 'ADVANCED',
      timesPlayed: 198,
      averageScore: 76,
      isPublic: false,
      createdAt: '2024-11-06',
      createdBy: 'Pro Coach',
    },
  ];

  const categories = ['all', 'pitcher', 'batter', 'fielder', 'baserunner'];
  const difficulties = ['all', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

  const filteredScenarios = scenarios.filter((scenario) => {
    const matchesSearch =
      scenario.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scenario.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || scenario.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === 'all' || scenario.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-700';
      case 'INTERMEDIATE':
        return 'bg-blue-100 text-blue-700';
      case 'ADVANCED':
        return 'bg-orange-100 text-orange-700';
      case 'EXPERT':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <RoleGuard requiredRole="ADMIN">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold">Scenario Management</h1>
                  <p className="text-gray-600">Create, edit, and manage baseball scenarios</p>
                </div>
              </div>
              <Link href="/admin/scenarios/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Scenario
                </Button>
              </Link>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search Scenarios</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by title or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === 'all'
                          ? 'All Categories'
                          : category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <select
                    id="difficulty"
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
                  >
                    {difficulties.map((difficulty) => (
                      <option key={difficulty} value={difficulty}>
                        {difficulty === 'all'
                          ? 'All Difficulties'
                          : difficulty.charAt(0) + difficulty.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Summary */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {filteredScenarios.length} of {scenarios.length} scenarios
            </p>
          </div>

          {/* Scenarios List */}
          <div className="space-y-4">
            {filteredScenarios.map((scenario) => (
              <Card key={scenario.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{scenario.title}</h3>
                        <Badge variant="outline" className="text-xs capitalize">
                          {scenario.category}
                        </Badge>
                        <Badge className={`text-xs ${getDifficultyColor(scenario.difficulty)}`}>
                          {scenario.difficulty}
                        </Badge>
                        {!scenario.isPublic && (
                          <Badge variant="secondary" className="text-xs">
                            Private
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-4">{scenario.description}</p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <span>{scenario.timesPlayed} plays</span>
                        <span>{scenario.averageScore}% avg score</span>
                        <span>By {scenario.createdBy}</span>
                        <span>Created {scenario.createdAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" title="View Scenario">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Edit Scenario">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="More Options">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        title="Delete Scenario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredScenarios.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No scenarios found</h3>
                <p className="text-gray-600 mb-4">
                  No scenarios match your current filters. Try adjusting your search criteria.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedDifficulty('all');
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
