import React, { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  CloudUpload,
  FileText,
  CheckCircle,
  AlertTriangle,
  X
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import apiService from '@/services/api'

const ResumeUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [uploadStatus, setUploadStatus] = useState('idle') // idle, uploading, success, error
  const [parsedContent, setParsedContent] = useState(null)
  const [hiringForms, setHiringForms] = useState([])
  const [selectedHiringForm, setSelectedHiringForm] = useState('')

  useEffect(() => {
    const fetchHiringForms = async () => {
      try {
        const response = await apiService.get('/hiring-forms');
        if (response.ok) {
          const result = await response.json();
          setHiringForms(Array.isArray(result.data) ? result.data : []);
        } else {
          console.error('Failed to fetch hiring forms');
        }
      } catch (error) {
        console.error('Error fetching hiring forms:', error);
      }
    };

    fetchHiringForms();
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadTime: new Date().toLocaleString()
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])
    setUploadStatus('success')
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
    if (uploadedFiles.length === 1) {
      setUploadStatus('idle')
    }
  }

  const handleParse = async (fileData) => {
    setUploadStatus('uploading');
    try {
      const formData = new FormData();
      formData.append('resume', fileData.file);

      const response = await apiService.postFormData('/resume/parse', formData);

      if (!response.ok) {
        throw new Error('Failed to parse resume');
      }

      const result = await response.json();

      // We'll keep the mock structure for other fields but fill the real text
      const newParsedContent = {
        fileName: result.data.fileName,
        candidateName: 'Extracted from resume',
        email: 'extracted@example.com',
        phone: 'Included in text',
        experience: 'Included in text',
        education: 'Included in text',
        skills: ['Parsed Text below'],
        summary: 'Full text extracted successfully.',
        projects: [],
        rawText: result.data.text, // Add this field
        isResume: result.data.isResume,
        anomalies: result.data.anomalies || []
      };

      setParsedContent(newParsedContent);
      setUploadStatus('success');
    } catch (error) {
      console.error('Error parsing resume:', error);
      setUploadStatus('error');
      alert('Failed to parse resume. Please check if the backend is running.');
    }
  };

  const handleEvaluate = () => {
    if (uploadedFiles.length > 0 && selectedHiringForm) {
      handleParse(uploadedFiles[0])
      // In a real app, this would trigger the AI evaluation
      setTimeout(() => {
        alert('Resume submitted for evaluation! Check results in the Evaluation Results page.')
      }, 1000)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Upload Resume</CardTitle>
          <CardDescription>
            Upload resumes for AI-powered holistic evaluation. Supports PDF and DOC formats.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Drop Zone */}
          <Card>
            <CardContent className="p-6">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
                  }`}
              >
                <input {...getInputProps()} />
                <CloudUpload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <p className="text-lg font-medium text-gray-900">
                    {isDragActive ? 'Drop files here' : 'Drop resumes here or click to browse'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Supports PDF, DOC, DOCX files up to 10MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Files</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="h-8 w-8 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(file.size)} • {file.uploadTime}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleParse(file)}
                          >
                            Parse
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Parsed Content Preview */}
          {parsedContent && (
            <Card>
              <CardHeader>
                <CardTitle>Parsed Resume Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-4">
                  <Label>Full Extracted Text</Label>
                  <div className="mt-2 p-4 bg-muted rounded-md max-h-96 overflow-y-auto whitespace-pre-wrap text-sm font-mono">
                    {parsedContent.rawText || "No text extracted"}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold mb-4">Extracted Fields (Placeholder)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <p className="font-medium">{parsedContent.candidateName}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="font-medium">{parsedContent.email}</p>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <p className="font-medium">{parsedContent.phone}</p>
                    </div>
                    <div>
                      <Label>Experience</Label>
                      <p className="font-medium">{parsedContent.experience}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label>Skills</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {parsedContent.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Validation Results */}
          {parsedContent && !parsedContent.isResume && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-600">Validation Warning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-700 mb-4">
                  The uploaded file does not appear to be a resume. Please review the following issues:
                </p>
                <ul className="list-disc list-inside text-red-700">
                  {parsedContent.anomalies.map((anomaly, index) => (
                    <li key={index}>{anomaly}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Hiring Form Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="mb-4">Select Hiring Form</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedHiringForm} onValueChange={setSelectedHiringForm}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a hiring form..." />
                </SelectTrigger>
                <SelectContent>
                  {hiringForms.map((form) => (
                    <SelectItem key={form._id} value={form._id}>
                      {form.formName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedHiringForm && (
                <div className="mt-3 p-3 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">
                    {hiringForms.find(f => f._id === selectedHiringForm)?.industry}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Evaluation Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="mb-4">Evaluation Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">Holistic evaluation</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">Evidence highlighting</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">Explainable AI</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" />
                  <span className="text-sm">Strict mode</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Action Button */}
          <Button
            onClick={handleEvaluate}
            disabled={uploadedFiles.length === 0 || !selectedHiringForm}
            className="w-full"
            size="lg"
          >
            Start AI Evaluation
          </Button>

          {/* Info Box */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-800 font-medium">AI Evaluation Notice</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Our AI evaluates candidates holistically, considering experience context rather than just keywords. Missing links (GitHub, LinkedIn) are treated as soft signals, not automatic penalties.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div >
  )
}

export default ResumeUpload
