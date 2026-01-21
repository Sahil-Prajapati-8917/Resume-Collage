import React, { useState, useEffect } from 'react'
import {
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  Calendar,
  Award,
  Settings,
  Edit,
  Save,
  Camera,
  Shield,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import apiService from '../services/api'

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const [profileData, setProfileData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      location: '',
      bio: ''
    },
    professionalInfo: {
      joinDate: '',
      totalEvaluations: 0,
      successfulPlacements: 0,
      averageTimeToHire: '',
      specializations: [],
      certifications: [],
      languages: []
    },
    performance: {
      quarterlyScore: 0,
      candidateSatisfaction: 0,
      hiringManagerRating: 0,
      efficiencyScore: 0,
      qualityScore: 0,
      trend: 'stable'
    }
  })

  const [tempProfileData, setTempProfileData] = useState(profileData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [apiStatus, setApiStatus] = useState('checking') // 'checking', 'connected', 'error'
  const [emailNotifications, setEmailNotifications] = useState(true)

  // Load profile data from API on component mount
  useEffect(() => {
    loadProfileData()
    verifyApiConnection()
  }, [])

  const loadProfileData = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiService.getProfile()
      
      if (result.success) {
        setProfileData(result.data)
        setTempProfileData(result.data)
        console.log('✅ Profile loaded successfully:', result.data)
      } else {
        setError(result.error?.message || 'Failed to load profile')
        console.error('❌ Profile load error:', result.error)
      }
    } catch (error) {
      setError('Network error occurred')
      console.error('❌ Network error:', error)
    } finally {
      setLoading(false)
    }
  }

  const verifyApiConnection = async () => {
    try {
      const result = await apiService.verifyApiConnection()
      
      if (result.success) {
        setApiStatus('connected')
        console.log('✅ API connection verified:', result.message)
      } else {
        setApiStatus('error')
        console.error('❌ API connection failed:', result.message)
      }
    } catch (error) {
      setApiStatus('error')
      console.error('❌ API verification error:', error)
    }
  }

  const handleEdit = () => {
    setTempProfileData(profileData)
    setIsEditing(true)
  }

  const handleSave = async () => {
    try {
      // In a real implementation, you would call the API here
      console.log('Saving profile data:', tempProfileData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setProfileData(tempProfileData)
      setIsEditing(false)
      
      // Show success message
      alert('Profile updated successfully! ✅')
      console.log('✅ Profile saved successfully')
    } catch (error) {
      console.error('❌ Error saving profile:', error)
      alert('Error saving profile. Please try again.')
    }
  }

  const handleCancel = () => {
    setTempProfileData(profileData)
    setIsEditing(false)
  }

  const handleInputChange = (section, field, value) => {
    setTempProfileData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {profileData.personalInfo.firstName[0]}{profileData.personalInfo.lastName[0]}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="absolute bottom-0 right-0 rounded-full p-2"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {profileData.personalInfo.firstName} {profileData.personalInfo.lastName}
              </h2>
              <p className="text-gray-600">{profileData.personalInfo.position}</p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="secondary">{profileData.personalInfo.department}</Badge>
                <Badge variant="outline">{profileData.personalInfo.location}</Badge>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Evaluations</p>
                <p className="text-2xl font-bold text-gray-900">{profileData.professionalInfo.totalEvaluations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Successful Placements</p>
                <p className="text-2xl font-bold text-gray-900">{profileData.professionalInfo.successfulPlacements}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Time to Hire</p>
                <p className="text-2xl font-bold text-gray-900">{profileData.professionalInfo.averageTimeToHire}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Performance Score</p>
                <p className="text-2xl font-bold text-gray-900">{profileData.performance.quarterlyScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>First Name</Label>
              <p className="font-medium">{profileData.personalInfo.firstName}</p>
            </div>
            <div>
              <Label>Last Name</Label>
              <p className="font-medium">{profileData.personalInfo.lastName}</p>
            </div>
            <div>
              <Label>Email</Label>
              <p className="font-medium">{profileData.personalInfo.email}</p>
            </div>
            <div>
              <Label>Phone</Label>
              <p className="font-medium">{profileData.personalInfo.phone}</p>
            </div>
            <div>
              <Label>Department</Label>
              <p className="font-medium">{profileData.personalInfo.department}</p>
            </div>
            <div>
              <Label>Position</Label>
              <p className="font-medium">{profileData.personalInfo.position}</p>
            </div>
            <div>
              <Label>Location</Label>
              <p className="font-medium">{profileData.personalInfo.location}</p>
            </div>
          </div>
          <div className="mt-4">
            <Label>Bio</Label>
            <p className="text-gray-700">{profileData.personalInfo.bio}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderEditProfile = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your personal and professional information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>First Name</Label>
              <Input
                value={tempProfileData.personalInfo.firstName}
                onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                value={tempProfileData.personalInfo.lastName}
                onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={tempProfileData.personalInfo.email}
                onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={tempProfileData.personalInfo.phone}
                onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
              />
            </div>
            <div>
              <Label>Department</Label>
              <Input
                value={tempProfileData.personalInfo.department}
                onChange={(e) => handleInputChange('personalInfo', 'department', e.target.value)}
              />
            </div>
            <div>
              <Label>Position</Label>
              <Input
                value={tempProfileData.personalInfo.position}
                onChange={(e) => handleInputChange('personalInfo', 'position', e.target.value)}
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={tempProfileData.personalInfo.location}
                onChange={(e) => handleInputChange('personalInfo', 'location', e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              rows={4}
              value={tempProfileData.personalInfo.bio}
              onChange={(e) => handleInputChange('personalInfo', 'bio', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  )

  const renderProfessional = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Join Date</Label>
              <p className="font-medium">{profileData.professionalInfo.joinDate}</p>
            </div>
            <div>
              <Label>Total Evaluations</Label>
              <p className="font-medium">{profileData.professionalInfo.totalEvaluations}</p>
            </div>
            <div>
              <Label>Successful Placements</Label>
              <p className="font-medium">{profileData.professionalInfo.successfulPlacements}</p>
            </div>
            <div>
              <Label>Average Time to Hire</Label>
              <p className="font-medium">{profileData.professionalInfo.averageTimeToHire}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Specializations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {profileData.professionalInfo.specializations.map((spec, index) => (
              <Badge key={index} variant="secondary">{spec}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Certifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {profileData.professionalInfo.certifications.map((cert, index) => (
              <Badge key={index} className="bg-green-100 text-green-800">{cert}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Languages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {profileData.professionalInfo.languages.map((lang, index) => (
              <Badge key={index} className="bg-blue-100 text-blue-800">{lang}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderPerformance = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Quarterly Score</Label>
              <Progress value={profileData.performance.quarterlyScore} className="mt-2" />
              <span className="text-sm font-medium mt-1 block">{profileData.performance.quarterlyScore}%</span>
            </div>
            <div>
              <Label>Candidate Satisfaction</Label>
              <Progress value={(profileData.performance.candidateSatisfaction / 5) * 100} className="mt-2" />
              <span className="text-sm font-medium mt-1 block">{profileData.performance.candidateSatisfaction}/5.0</span>
            </div>
            <div>
              <Label>Hiring Manager Rating</Label>
              <Progress value={(profileData.performance.hiringManagerRating / 5) * 100} className="mt-2" />
              <span className="text-sm font-medium mt-1 block">{profileData.performance.hiringManagerRating}/5.0</span>
            </div>
            <div>
              <Label>Efficiency Score</Label>
              <Progress value={profileData.performance.efficiencyScore} className="mt-2" />
              <span className="text-sm font-medium mt-1 block">{profileData.performance.efficiencyScore}%</span>
            </div>
            <div>
              <Label>Quality Score</Label>
              <Progress value={profileData.performance.qualityScore} className="mt-2" />
              <span className="text-sm font-medium mt-1 block">{profileData.performance.qualityScore}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 text-green-600 mr-2" />
            <span className="text-lg font-medium text-green-600">Improving</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Your performance has been consistently improving over the last quarter.
          </p>
        </CardContent>
      </Card>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive email updates about evaluations</p>
              </div>
              <Checkbox
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Add an extra layer of security</p>
              </div>
              <Button variant="outline" size="sm">
                <Shield className="h-4 w-4 mr-2" />
                Enable
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Data Export</p>
                <p className="text-sm text-gray-600">Download your evaluation history</p>
              </div>
              <Button variant="outline" size="sm">
                Export Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* API Status Indicator */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                apiStatus === 'connected' ? 'bg-green-500' : 
                apiStatus === 'checking' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm font-medium">
                API Status: {apiStatus === 'connected' ? 'Connected' : 
                           apiStatus === 'checking' ? 'Checking...' : 'Disconnected'}
              </span>
            </div>
            {loading && (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-600">Loading...</span>
              </div>
            )}
          </div>
          {error && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-sm text-red-800">Error: {error}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Profile</CardTitle>
          <CardDescription>
            Manage your profile and track your performance as an HR professional.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Tab Navigation */}
      <Card>
        <CardContent className="p-0">
          <div className="flex space-x-1 border-b">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'professional', label: 'Professional', icon: Briefcase },
              { id: 'performance', label: 'Performance', icon: Target },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      {isEditing ? renderEditProfile() : (
        <>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'professional' && renderProfessional()}
          {activeTab === 'performance' && renderPerformance()}
          {activeTab === 'settings' && renderSettings()}
        </>
      )}
    </div>
  )
}

export default Profile
