import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CloudUpload,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  ArrowRight,
  Loader2,
  Trash2,
  BrainCircuit,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import apiService from '@/services/api'

const ResumeUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [uploadStatus, setUploadStatus] = useState('idle') // idle, uploading, success, error
  const [parsedContent, setParsedContent] = useState(null)
  const [hiringForms, setHiringForms] = useState([])
  const [selectedHiringForm, setSelectedHiringForm] = useState('')
  const [holisticEvaluation, setHolisticEvaluation] = useState(true)
  const [evidenceHighlighting, setEvidenceHighlighting] = useState(true)
  const [strictMode, setStrictMode] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchHiringForms = async () => {
      try {
        const response = await apiService.get('/hiring-forms');
        if (response.ok) {
          const result = await response.json();
          const forms = Array.isArray(result.data) ? result.data : [];
          const validForms = forms.filter(f => f && f._id && f.formName);
          setHiringForms(validForms);
        }
      } catch (error) {
        console.error('Error fetching hiring forms:', error);
      }
    };
    fetchHiringForms();
  }, []);

  const handleFileSelect = (event) => {
    setErrorMessage('')
    const files = Array.from(event.target.files)
    const acceptedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
    const maxSize = 10 * 1024 * 1024 // 10MB

    const validFiles = files.filter(file => {
      console.log('Selected file:', file.name, 'Type:', file.type, 'Size:', file.size);
      if (!acceptedTypes.includes(file.type) && !file.name.endsWith('.txt')) return false
      if (file.size > maxSize) return false
      return true
    })

    const newFiles = validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      uploadTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])
    setUploadStatus('success')
  }

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
    if (uploadedFiles.length === 1) {
      setUploadStatus('idle')
      setErrorMessage('')
    }
  }

  const handleParse = async (fileData) => {
    setUploadStatus('uploading');
    setErrorMessage('');
    try {
      const formData = new FormData();
      formData.append('resume', fileData.file);
      const response = await apiService.postFormData('/resume/parse', formData);

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to parse resume');
      }

      setParsedContent({
        ...result.data,
        rawText: result.data.text,
        candidateName: 'Extracted Candidate',
      });
      setUploadStatus('success');
      return result.data;
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(error.message);
      throw error;
    }
  };

  const handleEvaluate = async () => {
    if (uploadedFiles.length > 0 && selectedHiringForm) {
      try {
        const parseResult = await handleParse(uploadedFiles[0]);
        if (parseResult && parseResult.resumeId) {
          const response = await apiService.post('/resume/evaluate', {
            resumeId: parseResult.resumeId,
            hiringFormId: selectedHiringForm
          });
          if (response.ok) {
            navigate('/results', { state: { resumeId: parseResult.resumeId } });
          } else {
            const result = await response.json();
            setErrorMessage(result.message || 'Evaluation failed. Please try again.');
            setUploadStatus('error');
          }
        }
      } catch (error) {
        console.error("Evaluation process failed", error);
        // Error already handled in handleParse
      }
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + ['B', 'KB', 'MB'][i]
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Upload Resumes</h1>
        <p className="text-muted-foreground">Add candidate resumes for AI holistic evaluation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Dropzone */}
          <Card className="border-dashed border-2 hover:border-primary/50 transition-colors bg-card/50">
            <CardContent className="p-10 text-center flex flex-col items-center gap-4">
              <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <CloudUpload className="size-7 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-medium">Select your resume files</p>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Drag and drop PDF, DOCX or DOC files. Max size 10MB per file.
                </p>
              </div>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus className="size-4 mr-2" />
                Browse Files
              </Button>
              <Input
                id="file-upload"
                type="input" // hide this
                ref={(node) => {
                  if (node) {
                    node.type = 'file';
                    fileInputRef.current = node;
                  }
                }}
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.txt"
                multiple
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive">Process Error</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {errorMessage}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto -mr-2 -mt-2 text-muted-foreground hover:text-foreground"
                onClick={() => setErrorMessage('')}
              >
                <X className="size-4" />
              </Button>
            </div>
          )}

          {/* Uploaded List */}
          {uploadedFiles.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                Selected Files ({uploadedFiles.length})
              </h3>
              {uploadedFiles.map((file) => (
                <Card key={file.id} className="border-border/40 bg-card/50 overflow-hidden group">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-lg bg-accent flex items-center justify-center">
                        <FileText className="size-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)} • {file.uploadTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {uploadStatus === 'uploading' ? (
                        <Loader2 className="size-4 animate-spin text-muted-foreground mr-2" />
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeFile(file.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Parsed Preview */}
          {parsedContent && (
            <Card className="border-border/40 bg-card/50">
              <CardHeader>
                <CardTitle className="text-base font-semibold">AI Extraction Preview</CardTitle>
                <CardDescription>Verify the extracted data before evaluation.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase">Candidate</p>
                    <p className="text-sm font-medium">{parsedContent.candidateName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase">Email</p>
                    <p className="text-sm font-medium truncate">{parsedContent.email || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase">Status</p>
                    <Badge variant={parsedContent.isResume ? "default" : "destructive"} className="h-5 text-[10px]">
                      {parsedContent.isResume ? "Valid Resume" : "Warning"}
                    </Badge>
                  </div>
                </div>
                <Separator className="bg-border/40" />
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase">Extracted Summary</p>
                  <p className="text-sm leading-relaxed text-muted-foreground italic">
                    {parsedContent.summary || "No summary extracted."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card className="border-border/40 bg-card/50 sticky top-24">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Evaluation Settings</CardTitle>
              <CardDescription>Configure AI constraints.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Hiring Role / Form</Label>
                <Select value={selectedHiringForm} onValueChange={setSelectedHiringForm}>
                  <SelectTrigger className="w-full bg-background/50">
                    <SelectValue placeholder="Select a criteria..." />
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
                  <p className="text-[10px] text-muted-foreground pl-1">
                    Sector: {hiringForms.find(f => f._id === selectedHiringForm)?.industry}
                  </p>
                )}
              </div>

              <Separator className="bg-border/40" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <Label htmlFor="holistic" className="text-sm">Holistic Model</Label>
                    <p className="text-[10px] text-muted-foreground">Deep latent analysis</p>
                  </div>
                  <Checkbox id="holistic" checked={holisticEvaluation} onCheckedChange={setHolisticEvaluation} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <Label htmlFor="evidence" className="text-sm">Evidence Engine</Label>
                    <p className="text-[10px] text-muted-foreground">Highlight sources</p>
                  </div>
                  <Checkbox id="evidence" checked={evidenceHighlighting} onCheckedChange={setEvidenceHighlighting} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <Label htmlFor="strict" className="text-sm">Strict Validation</Label>
                    <p className="text-[10px] text-muted-foreground">Fail on gaps</p>
                  </div>
                  <Checkbox id="strict" checked={strictMode} onCheckedChange={setStrictMode} />
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button
                className="w-full group"
                size="lg"
                disabled={uploadedFiles.length === 0 || !selectedHiringForm || uploadStatus === 'uploading'}
                onClick={handleEvaluate}
              >
                {uploadStatus === 'uploading' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <BrainCircuit className="mr-2 h-4 w-4" />
                    Process Evaluation
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <div className="p-4 rounded-xl border border-primary/10 bg-primary/5 flex gap-3">
            <AlertCircle className="size-5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="text-primary font-medium">Pro Tip:</span> Our AI evaluates candidates holistically, considering experience context rather than just keyword matching.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResumeUpload

