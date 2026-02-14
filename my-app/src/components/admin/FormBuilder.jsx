import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Trash2, ArrowUp, ArrowDown, Plus, Settings } from 'lucide-react';

const FormBuilder = ({ initialStandardFields, initialCustomFields, onSave }) => {
    const [standardFields, setStandardFields] = useState(initialStandardFields || {
        linkedIn: false,
        portfolio: false,
        github: false,
        expectedSalary: false,
        currentSalary: false,
        noticePeriod: false,
        experienceYears: false,
        currentCompany: false,
        currentDesignation: false,
        workMode: false,
        relocate: false
    });

    const [customFields, setCustomFields] = useState(initialCustomFields || []);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentField, setCurrentField] = useState(null); // Field being edited or added

    // Provide default values when opening the dialog for a new field
    const defaultField = {
        id: '', // Will be generated
        type: 'text',
        label: '',
        placeholder: '',
        required: false,
        aiRelevant: false,
        validation: { regex: '' },
        showIf: { fieldId: '', value: '', operator: 'equals' },
        options: [] // For select, checkbox, radio
    };

    const handleStandardChange = (key) => {
        setStandardFields(prev => {
            const updated = { ...prev, [key]: !prev[key] };
            onSave(updated, customFields);
            return updated;
        });
    };

    const handleAddCustomField = () => {
        setCurrentField({ ...defaultField, id: `field_${Date.now()}` });
        setIsDialogOpen(true);
    };

    const handleEditCustomField = (field) => {
        setCurrentField({ ...field });
        setIsDialogOpen(true);
    };

    const handleDeleteCustomField = (id) => {
        const updated = customFields.filter(f => f.id !== id);
        setCustomFields(updated);
        onSave(standardFields, updated);
    };

    const handleMoveField = (index, direction) => {
        const updated = [...customFields];
        if (direction === 'up' && index > 0) {
            [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
        } else if (direction === 'down' && index < updated.length - 1) {
            [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
        }
        setCustomFields(updated);
        onSave(standardFields, updated);
    };

    const saveField = () => {
        if (!currentField.label) return; // Simple validation

        setCustomFields(prev => {
            const exists = prev.find(f => f.id === currentField.id);
            let updated;
            if (exists) {
                updated = prev.map(f => f.id === currentField.id ? currentField : f);
            } else {
                updated = [...prev, currentField];
            }
            onSave(standardFields, updated);
            return updated;
        });
        setIsDialogOpen(false);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Standard Fields</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.keys(standardFields).map(key => (
                        <div key={key} className="flex items-center space-x-2">
                            <Checkbox
                                id={key}
                                checked={standardFields[key]}
                                onCheckedChange={() => handleStandardChange(key)}
                            />
                            <Label htmlFor={key} className="capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                            </Label>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Custom Fields</CardTitle>
                    <Button onClick={handleAddCustomField} size="sm">
                        <Plus className="w-4 h-4 mr-2" /> Add Field
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {customFields.length === 0 && (
                        <p className="text-muted-foreground text-sm">No custom fields added yet.</p>
                    )}
                    {customFields.map((field, index) => (
                        <div key={field.id} className="flex items-center justify-between p-3 border rounded-md bg-card">
                            <div className="flex items-center space-x-4">
                                <div className="flex flex-col space-y-1">
                                    <Button variant="ghost" size="icon" className="h-6 w-6" disabled={index === 0} onClick={() => handleMoveField(index, 'up')}>
                                        <ArrowUp className="w-3 h-3" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" disabled={index === customFields.length - 1} onClick={() => handleMoveField(index, 'down')}>
                                        <ArrowDown className="w-3 h-3" />
                                    </Button>
                                </div>
                                <div>
                                    <p className="font-medium">{field.label} {field.required && <span className="text-red-500">*</span>}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{field.type} • {field.aiRelevant ? 'AI Analyzed' : 'Standard'}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEditCustomField(field)}>
                                    <Settings className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteCustomField(field.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Field Configuration Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{currentField?.id && customFields.find(f => f.id === currentField.id) ? 'Edit Field' : 'Add New Field'}</DialogTitle>
                    </DialogHeader>

                    {currentField && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Field Type</Label>
                                    <Select
                                        value={currentField.type}
                                        onValueChange={(val) => setCurrentField({ ...currentField, type: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="text">Short Text</SelectItem>
                                            <SelectItem value="textarea">Long Text</SelectItem>
                                            <SelectItem value="number">Number</SelectItem>
                                            <SelectItem value="email">Email</SelectItem>
                                            <SelectItem value="url">URL</SelectItem>
                                            {/* Future: select, checkbox, etc. */}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Label</Label>
                                    <Input
                                        value={currentField.label}
                                        onChange={(e) => setCurrentField({ ...currentField, label: e.target.value })}
                                        placeholder="e.g. Years of React Experience"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Placeholder</Label>
                                <Input
                                    value={currentField.placeholder}
                                    onChange={(e) => setCurrentField({ ...currentField, placeholder: e.target.value })}
                                    placeholder="e.g. Enter your experience..."
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-md">
                                <div className="space-y-0.5">
                                    <Label>Required Field</Label>
                                    <p className="text-xs text-muted-foreground">Candidate must answer this.</p>
                                </div>
                                <Switch
                                    checked={currentField.required}
                                    onCheckedChange={(checked) => setCurrentField({ ...currentField, required: checked })}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-md">
                                <div className="space-y-0.5">
                                    <Label>Use in AI Evaluation</Label>
                                    <p className="text-xs text-muted-foreground">AI will analyze this answer affecting the score.</p>
                                </div>
                                <Switch
                                    checked={currentField.aiRelevant}
                                    onCheckedChange={(checked) => setCurrentField({ ...currentField, aiRelevant: checked })}
                                />
                            </div>

                            {/* Conditional Logic UI (Basic) */}
                            {/* Only show if there are other custom fields to depend on */}
                            {customFields.length > 0 && (
                                <div className="space-y-2 pt-2 border-t">
                                    <Label>Show Only If (Conditional)</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <Select
                                            value={currentField.showIf?.fieldId || ''}
                                            onValueChange={(val) => setCurrentField({ ...currentField, showIf: { ...currentField.showIf, fieldId: val } })}
                                        >
                                            <SelectTrigger><SelectValue placeholder="Select Field" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Always Show</SelectItem>
                                                {customFields.filter(f => f.id !== currentField.id).map(f => (
                                                    <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {currentField.showIf?.fieldId && currentField.showIf.fieldId !== 'none' && (
                                            <>
                                                <Select
                                                    value={currentField.showIf?.operator || 'equals'}
                                                    onValueChange={(val) => setCurrentField({ ...currentField, showIf: { ...currentField.showIf, operator: val } })}
                                                >
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="equals">Equals</SelectItem>
                                                        {/* Add more operators as needed */}
                                                    </SelectContent>
                                                </Select>
                                                <Input
                                                    placeholder="Value"
                                                    value={currentField.showIf?.value || ''}
                                                    onChange={(e) => setCurrentField({ ...currentField, showIf: { ...currentField.showIf, value: e.target.value } })}
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={saveField}>Save Field</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default FormBuilder;
