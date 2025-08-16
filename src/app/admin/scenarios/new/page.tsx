'use client';

import { useState } from 'react';
import { RoleGuard } from '@/components/auth/role-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Eye, Plus, X, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CreateScenario() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'pitcher',
    difficulty: 'INTERMEDIATE',
    inning: '',
    score: '',
    count: '',
    runners: '',
    outs: '',
    weatherConditions: '',
    videoUrl: '',
    mlbExample: '',
    isPublic: true,
  });

  const [choices, setChoices] = useState([
    { id: '1', text: '', explanation: '', successRate: 50 },
    { id: '2', text: '', explanation: '', successRate: 50 },
  ]);

  const [bestChoice, setBestChoice] = useState('1');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleChoiceChange = (id: string, field: string, value: string | number) => {
    setChoices((prev) =>
      prev.map((choice) => (choice.id === id ? { ...choice, [field]: value } : choice))
    );
  };

  const addChoice = () => {
    const newId = (choices.length + 1).toString();
    setChoices((prev) => [
      ...prev,
      {
        id: newId,
        text: '',
        explanation: '',
        successRate: 50,
      },
    ]);
  };

  const removeChoice = (id: string) => {
    if (choices.length > 2) {
      setChoices((prev) => prev.filter((choice) => choice.id !== id));
      if (bestChoice === id) {
        setBestChoice(choices[0]?.id || '1');
      }
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags((prev) => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title || !formData.description || choices.some((c) => !c.text)) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Here you would typically send the data to your API
    console.log('Scenario data:', {
      ...formData,
      choices,
      bestChoice,
      tags: JSON.stringify(tags),
    });

    toast.success('Scenario created successfully!');
  };

  return (
    <RoleGuard requiredRole="ADMIN">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Link href="/admin/scenarios">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Scenarios
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Create New Scenario</h1>
                <p className="text-gray-600">Design a new baseball strategy scenario</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button onClick={handleSubmit}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Scenario
                </Button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Essential details about the scenario</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., Championship Pressure Situation"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
                      required
                    >
                      <option value="pitcher">Pitcher</option>
                      <option value="batter">Batter</option>
                      <option value="fielder">Fielder</option>
                      <option value="baserunner">Base Runner</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the scenario situation in detail..."
                    className="w-full min-h-20 px-3 py-2 text-sm border border-input bg-background rounded-md"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <select
                      id="difficulty"
                      value={formData.difficulty}
                      onChange={(e) => handleInputChange('difficulty', e.target.value)}
                      className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                      <option value="EXPERT">Expert</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Visibility</Label>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="visibility"
                          checked={formData.isPublic}
                          onChange={() => handleInputChange('isPublic', true)}
                          className="mr-2"
                        />
                        Public
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="visibility"
                          checked={!formData.isPublic}
                          onChange={() => handleInputChange('isPublic', false)}
                          className="mr-2"
                        />
                        Private
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Game Situation */}
            <Card>
              <CardHeader>
                <CardTitle>Game Situation</CardTitle>
                <CardDescription>Specific details about the game state</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="inning">Inning</Label>
                    <Input
                      id="inning"
                      value={formData.inning}
                      onChange={(e) => handleInputChange('inning', e.target.value)}
                      placeholder="e.g., Bottom 9th"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="score">Score</Label>
                    <Input
                      id="score"
                      value={formData.score}
                      onChange={(e) => handleInputChange('score', e.target.value)}
                      placeholder="e.g., Home 4, Away 5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="count">Count</Label>
                    <Input
                      id="count"
                      value={formData.count}
                      onChange={(e) => handleInputChange('count', e.target.value)}
                      placeholder="e.g., 3-2"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="runners">Runners</Label>
                    <Input
                      id="runners"
                      value={formData.runners}
                      onChange={(e) => handleInputChange('runners', e.target.value)}
                      placeholder="e.g., Runner on 3rd"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="outs">Outs</Label>
                    <select
                      id="outs"
                      value={formData.outs}
                      onChange={(e) => handleInputChange('outs', e.target.value)}
                      className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
                    >
                      <option value="">Select outs</option>
                      <option value="0">0 outs</option>
                      <option value="1">1 out</option>
                      <option value="2">2 outs</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weather">Weather</Label>
                    <Input
                      id="weather"
                      value={formData.weatherConditions}
                      onChange={(e) => handleInputChange('weatherConditions', e.target.value)}
                      placeholder="e.g., Windy conditions"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Choices */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Decision Choices</CardTitle>
                    <CardDescription>
                      Define the available options and their outcomes
                    </CardDescription>
                  </div>
                  <Button type="button" variant="outline" onClick={addChoice}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Choice
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {choices.map((choice, index) => (
                  <div key={choice.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">Choice {index + 1}</Badge>
                        <input
                          type="radio"
                          name="bestChoice"
                          checked={bestChoice === choice.id}
                          onChange={() => setBestChoice(choice.id)}
                          className="mr-1"
                        />
                        <Label className="text-sm">Best Choice</Label>
                      </div>
                      {choices.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeChoice(choice.id)}
                          className="text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Choice Text *</Label>
                        <Input
                          value={choice.text}
                          onChange={(e) => handleChoiceChange(choice.id, 'text', e.target.value)}
                          placeholder="Describe this decision option..."
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Explanation</Label>
                        <textarea
                          value={choice.explanation}
                          onChange={(e) =>
                            handleChoiceChange(choice.id, 'explanation', e.target.value)
                          }
                          placeholder="Explain why this choice would be made and its likely outcome..."
                          className="w-full min-h-16 px-3 py-2 text-sm border border-input bg-background rounded-md"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Success Rate (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={choice.successRate}
                          onChange={(e) =>
                            handleChoiceChange(choice.id, 'successRate', parseInt(e.target.value))
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {!bestChoice && (
                  <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">Please select which choice is the best option.</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Content */}
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Content</CardTitle>
                <CardDescription>Additional resources and examples</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="videoUrl">Video URL</Label>
                    <Input
                      id="videoUrl"
                      value={formData.videoUrl}
                      onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mlbExample">MLB Example</Label>
                    <Input
                      id="mlbExample"
                      value={formData.mlbExample}
                      onChange={(e) => handleInputChange('mlbExample', e.target.value)}
                      placeholder="Reference to real MLB game/situation"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" variant="outline" onClick={addTag}>
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </RoleGuard>
  );
}
