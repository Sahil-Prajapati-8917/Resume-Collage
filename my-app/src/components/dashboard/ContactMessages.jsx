import React, { useEffect, useState } from 'react';
import apiService from '../../services/api';
import { Loader2, Trash2, Mail, User, Clock, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const ContactMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const response = await apiService.getAllContacts();
            if (response.ok) {
                const data = await response.json();
                setMessages(data.data);
            } else {
                toast.error('Failed to fetch messages');
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error('Error loading messages');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        // Using a more modern confirm if possible, but keep it simple for now
        if (!window.confirm('Are you sure you want to delete this message?')) return;

        try {
            const response = await apiService.deleteContact(id);
            if (response.ok) {
                toast.success('Message deleted');
                setMessages(messages.filter((msg) => msg._id !== id));
            } else {
                toast.error('Failed to delete message');
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            toast.error('Error deleting message');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
        );
    }

    return (
        <Card className="border-border/40 bg-card/50">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold tracking-tight">Contact Messages</CardTitle>
                        <CardDescription className="text-sm font-medium">Inquiries from your portfolio visitors.</CardDescription>
                    </div>
                    <Badge variant="secondary" className="font-bold">
                        {messages.length} Messages
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <MessageSquare className="h-12 w-12 text-muted-foreground/20 mb-4" />
                        <p className="text-muted-foreground font-medium">No messages found.</p>
                    </div>
                ) : (
                    <div className="rounded-md border border-border/40">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[100px] font-bold">Date</TableHead>
                                    <TableHead className="font-bold">Sender</TableHead>
                                    <TableHead className="font-bold">Email</TableHead>
                                    <TableHead className="font-bold">Message</TableHead>
                                    <TableHead className="text-right font-bold">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {messages.map((msg) => (
                                    <TableRow key={msg._id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="text-xs font-medium text-muted-foreground">
                                            {new Date(msg.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="font-bold">
                                            <div className="flex items-center gap-2">
                                                <User className="h-3 w-3 text-primary" />
                                                {msg.name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-3 w-3 text-muted-foreground" />
                                                {msg.email}
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-xs">
                                            <p className="text-sm text-muted-foreground truncate" title={msg.message}>
                                                {msg.message}
                                            </p>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(msg._id)}
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ContactMessages;
