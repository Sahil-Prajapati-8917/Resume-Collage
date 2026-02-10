import React, { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Mail,
  Shield,
  Building2,
  Calendar,
  UserCheck,
  UserX
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

const HRUserManagement = () => {
  const [users, setUsers] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [companyFilter, setCompanyFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showBulkImportDialog, setShowBulkImportDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  // Form states
  const [newUser, setNewUser] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    department: '',
    position: '',
    role: 'recruiter',
    company: '',
    sendInvite: true
  })

  const [editUser, setEditUser] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    department: '',
    position: '',
    role: '',
    isActive: true
  })

  const [bulkUsers, setBulkUsers] = useState('')

  // Mock data
  useEffect(() => {
    const mockCompanies = [
      { id: '1', name: 'TechCorp Inc.', industry: 'IT' },
      { id: '2', name: 'HealthPlus Medical', industry: 'Healthcare' },
      { id: '3', name: 'FinSecure Bank', industry: 'Finance' },
      { id: '4', name: 'ManufacturePro', industry: 'Manufacturing' }
    ]

    const mockUsers = [
      {
        id: '1',
        email: 'sarah.johnson@techcorp.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        phone: '+1 (555) 123-4567',
        department: 'Talent Acquisition',
        position: 'HR Manager',
        role: 'hr_manager',
        company: { id: '1', name: 'TechCorp Inc.' },
        isActive: true,
        lastLogin: '2024-01-15 14:30:00',
        createdAt: '2024-01-10',
        permissions: ['canCreateHiringForms', 'canManageUsers', 'canViewAnalytics', 'canAccessAudit']
      },
      {
        id: '2',
        email: 'mike.chen@healthplus.com',
        firstName: 'Mike',
        lastName: 'Chen',
        phone: '+1 (555) 234-5678',
        department: 'Recruitment',
        position: 'Senior Recruiter',
        role: 'recruiter',
        company: { id: '2', name: 'HealthPlus Medical' },
        isActive: true,
        lastLogin: '2024-01-15 10:15:00',
        createdAt: '2024-01-08',
        permissions: ['canCreateHiringForms', 'canViewAnalytics']
      },
      {
        id: '3',
        email: 'emma.rodriguez@finsecure.com',
        firstName: 'Emma',
        lastName: 'Rodriguez',
        phone: '+1 (555) 345-6789',
        department: 'Human Resources',
        position: 'Company Admin',
        role: 'company_admin',
        company: { id: '3', name: 'FinSecure Bank' },
        isActive: false,
        lastLogin: '2024-01-10 16:45:00',
        createdAt: '2024-01-05',
        permissions: ['canCreateHiringForms', 'canManageUsers', 'canViewAnalytics', 'canAccessAudit']
      },
      {
        id: '4',
        email: 'alex.smith@manufacturepro.com',
        firstName: 'Alex',
        lastName: 'Smith',
        phone: '+1 (555) 456-7890',
        department: 'Talent Acquisition',
        position: 'Recruiter',
        role: 'recruiter',
        company: { id: '4', name: 'ManufacturePro' },
        isActive: true,
        lastLogin: '2024-01-14 09:20:00',
        createdAt: '2024-01-12',
        permissions: ['canCreateHiringForms', 'canViewAnalytics']
      },
      {
        id: '5',
        email: 'david.wilson@techcorp.com',
        firstName: 'David',
        lastName: 'Wilson',
        phone: '+1 (555) 567-8901',
        department: 'Talent Acquisition',
        position: 'Recruiter',
        role: 'recruiter',
        company: { id: '1', name: 'TechCorp Inc.' },
        isActive: true,
        lastLogin: '2024-01-15 11:45:00',
        createdAt: '2024-01-11',
        permissions: ['canCreateHiringForms', 'canViewAnalytics']
      }
    ]

    setTimeout(() => {
      setCompanies(mockCompanies)
      setUsers(mockUsers)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredUsers = users
    .filter(user =>
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(user => roleFilter === 'all' || user.role === roleFilter)
    .filter(user => statusFilter === 'all' || (user.isActive && statusFilter === 'active') || (!user.isActive && statusFilter === 'inactive'))
    .filter(user => companyFilter === 'all' || user.company.id === companyFilter)
    .sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`
          bValue = `${b.firstName} ${b.lastName}`
          break
        case 'email':
          aValue = a.email
          bValue = b.email
          break
        case 'company':
          aValue = a.company.name
          bValue = b.company.name
          break
        case 'role':
          aValue = a.role
          bValue = b.role
          break
        default:
          aValue = a[sortBy]
          bValue = b[sortBy]
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const getRoleColor = (role) => {
    switch (role) {
      case 'recruiter': return 'bg-blue-500'
      case 'hr_manager': return 'bg-purple-500'
      case 'company_admin': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case 'recruiter': return 'Recruiter'
      case 'hr_manager': return 'HR Manager'
      case 'company_admin': return 'Company Admin'
      default: return role
    }
  }

  const getPermissionsForRole = (role) => {
    const permissions = {
      recruiter: ['Create Hiring Forms', 'View Analytics'],
      hr_manager: ['Create Hiring Forms', 'Manage Users', 'View Analytics', 'Access Audit'],
      company_admin: ['Create Hiring Forms', 'Manage Users', 'View Analytics', 'Access Audit']
    }
    return permissions[role] || []
  }

  const handleCreateUser = async () => {
    const company = companies.find(c => c.id === newUser.company)
    const newUserObj = {
      id: Date.now().toString(),
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      phone: newUser.phone,
      department: newUser.department,
      position: newUser.position,
      role: newUser.role,
      company: company,
      isActive: true,
      lastLogin: null,
      createdAt: new Date().toISOString().split('T')[0],
      permissions: getPermissionsForRole(newUser.role)
    }

    setUsers([...users, newUserObj])
    setShowCreateDialog(false)
    setNewUser({
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      department: '',
      position: '',
      role: 'recruiter',
      company: '',
      sendInvite: true
    })
  }

  const handleEditUser = async () => {
    const updatedUsers = users.map(user =>
      user.id === selectedUser.id ? {
        ...user,
        ...editUser,
        permissions: getPermissionsForRole(editUser.role)
      } : user
    )
    setUsers(updatedUsers)
    setShowEditDialog(false)
  }

  const handleToggleUserStatus = (userId) => {
    const updatedUsers = users.map(user =>
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    )
    setUsers(updatedUsers)
  }

  const handleBulkImport = () => {
    const lines = bulkUsers.trim().split('\n')
    const importedUsers = []

    lines.forEach(line => {
      const [email, firstName, lastName, role] = line.split(',')
      if (email && firstName && lastName && role) {
        const company = companies[Math.floor(Math.random() * companies.length)]
        importedUsers.push({
          id: Date.now().toString() + Math.random().toString(),
          email: email.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: '',
          department: '',
          position: '',
          role: role.trim(),
          company: company,
          isActive: true,
          lastLogin: null,
          createdAt: new Date().toISOString().split('T')[0],
          permissions: getPermissionsForRole(role.trim())
        })
      }
    })

    setUsers([...users, ...importedUsers])
    setShowBulkImportDialog(false)
    setBulkUsers('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">HR & User Management</h1>
          <p className="text-muted-foreground">Manage HR accounts and permissions across all companies</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowBulkImportDialog(true)} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Bulk Import
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create User
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="flex flex-col lg:flex-row gap-4 p-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="recruiter">Recruiter</SelectItem>
                <SelectItem value="hr_manager">HR Manager</SelectItem>
                <SelectItem value="company_admin">Company Admin</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map(company => (
                  <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">Across all companies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.isActive).length}</div>
            <p className="text-xs text-muted-foreground">{Math.round((users.filter(u => u.isActive).length / users.length) * 100)}% active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies.length}</div>
            <p className="text-xs text-muted-foreground">Tenant companies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Logins today</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>HR Users</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">
                    <Button variant="ghost" onClick={() => setSortBy('name')}>
                      Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </Button>
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {user.firstName[0]}{user.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-muted-foreground">{user.position}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{user.company.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getRoleColor(user.role)} text-white`}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className={`h-2 w-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className={user.isActive ? 'text-green-600' : 'text-red-600'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.lastLogin ? user.lastLogin : 'Never'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => {
                          setSelectedUser(user)
                          setEditUser({
                            firstName: user.firstName,
                            lastName: user.lastName,
                            phone: user.phone,
                            department: user.department,
                            position: user.position,
                            role: user.role,
                            isActive: user.isActive
                          })
                          setShowEditDialog(true)
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleUserStatus(user.id)}
                          className={user.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                        >
                          {user.isActive ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New HR User</DialogTitle>
            <DialogDescription>
              Add a new HR user to a company with appropriate permissions
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                  placeholder="Enter first name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                  placeholder="Enter last name"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="user@company.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  placeholder="Talent Acquisition"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={newUser.position}
                  onChange={(e) => setNewUser({ ...newUser, position: e.target.value })}
                  placeholder="HR Manager"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recruiter">Recruiter</SelectItem>
                    <SelectItem value="hr_manager">HR Manager</SelectItem>
                    <SelectItem value="company_admin">Company Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company">Company</Label>
                <Select value={newUser.company} onValueChange={(value) => setNewUser({ ...newUser, company: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(company => (
                      <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={newUser.sendInvite}
                onCheckedChange={(checked) => setNewUser({ ...newUser, sendInvite: checked })}
              />
              <Label htmlFor="sendInvite">Send invitation email</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateUser} disabled={!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.role || !newUser.company}>
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User: {selectedUser?.firstName} {selectedUser?.lastName}</DialogTitle>
            <DialogDescription>
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="editFirstName">First Name</Label>
                <Input
                  id="editFirstName"
                  value={editUser.firstName}
                  onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editLastName">Last Name</Label>
                <Input
                  id="editLastName"
                  value={editUser.lastName}
                  onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editPhone">Phone</Label>
              <Input
                id="editPhone"
                value={editUser.phone}
                onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="editDepartment">Department</Label>
                <Input
                  id="editDepartment"
                  value={editUser.department}
                  onChange={(e) => setEditUser({ ...editUser, department: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editPosition">Position</Label>
                <Input
                  id="editPosition"
                  value={editUser.position}
                  onChange={(e) => setEditUser({ ...editUser, position: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="editRole">Role</Label>
                <Select value={editUser.role} onValueChange={(value) => setEditUser({ ...editUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recruiter">Recruiter</SelectItem>
                    <SelectItem value="hr_manager">HR Manager</SelectItem>
                    <SelectItem value="company_admin">Company Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editStatus">Status</Label>
                <Select value={editUser.isActive ? 'active' : 'inactive'} onValueChange={(value) => setEditUser({ ...editUser, isActive: value === 'active' })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Permissions Preview */}
            <div className="grid gap-2">
              <Label>Current Permissions</Label>
              <div className="grid grid-cols-2 gap-2">
                {getPermissionsForRole(editUser.role).map(permission => (
                  <Badge key={permission} variant="outline" className="text-xs">
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleEditUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Dialog */}
      <Dialog open={showBulkImportDialog} onOpenChange={setShowBulkImportDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Bulk Import HR Users</DialogTitle>
            <DialogDescription>
              Import multiple users at once using CSV format: email,firstName,lastName,role
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="bulkUsers">User Data (CSV Format)</Label>
              <textarea
                id="bulkUsers"
                value={bulkUsers}
                onChange={(e) => setBulkUsers(e.target.value)}
                placeholder="user1@company.com,John,Doe,recruiter
user2@company.com,Jane,Smith,hr_manager"
                className="min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>Format:</strong> email,firstName,lastName,role (one user per line)
              <br />
              <strong>Roles:</strong> recruiter, hr_manager, company_admin
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkImportDialog(false)}>Cancel</Button>
            <Button onClick={handleBulkImport} disabled={!bulkUsers.trim()}>
              Import Users
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default HRUserManagement