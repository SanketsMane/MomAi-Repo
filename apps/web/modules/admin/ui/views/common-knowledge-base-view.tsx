"use client";

import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { Badge } from "@workspace/ui/components/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog";
import { FileIcon, FileTextIcon, PlusIcon, TrashIcon, UploadIcon, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface KnowledgeBaseItem {
  _id: string;
  title: string;
  type: "file" | "text";
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  textContent?: string;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

export const CommonKnowledgeBaseView = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [isAddingText, setIsAddingText] = useState(false);
  const [textTitle, setTextTitle] = useState("");
  const [textContent, setTextContent] = useState("");
  
  // File upload state
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileTitle, setFileTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Queries and mutations
  const allItemsResult = useQuery(api.public.commonKnowledgeBase.list, {
    paginationOpts: { numItems: 100, cursor: null },
  });
  const allItems = allItemsResult?.page as KnowledgeBaseItem[] | undefined;
  
  const createEntry = useMutation(api.public.commonKnowledgeBase.create);
  const deleteItem = useMutation(api.public.commonKnowledgeBase.remove);
  const generateUploadUrl = useMutation(api.public.fileStorage.generateUploadUrl);
  const storeFile = useAction(api.private.files.addFile);

  const handleAddText = async () => {
    if (!textTitle.trim() || !textContent.trim()) {
      toast.error("Please provide both title and content");
      return;
    }

    try {
      await createEntry({
        title: textTitle.trim(),
        type: "text",
        textContent: textContent.trim(),
      });
      
      setTextTitle("");
      setTextContent("");
      setIsAddingText(false);
      toast.success("Knowledge base entry added successfully");
    } catch (error) {
      console.error("Failed to add text:", error);
      toast.error("Failed to add knowledge base entry");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain',
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please select a PDF, DOCX, DOC, or TXT file");
        return;
      }

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      setSelectedFile(file);
      setFileTitle(file.name.replace(/\.[^/.]+$/, "")); // Remove extension for title
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !fileTitle.trim()) {
      toast.error("Please select a file and enter a title");
      return;
    }

    setIsUploading(true);
    
    try {
      // Get upload URL
      const uploadUrl = await generateUploadUrl({});
      
      // Upload file
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const { storageId } = await response.json();

      // Create knowledge base entry with file
      await createEntry({
        title: fileTitle.trim(),
        type: "file",
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type,
        fileUrl: storageId, // Store the storageId as fileUrl
      });

      toast.success("File uploaded successfully");
      resetFileForm();
      
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const resetFileForm = () => {
    setSelectedFile(null);
    setFileTitle("");
    setIsUploadDialogOpen(false);
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteItem({ id: id as any });
      toast.success("Knowledge base entry deleted successfully");
    } catch (error) {
      console.error("Failed to delete item:", error);
      toast.error("Failed to delete knowledge base entry");
    }
  };

  const filteredItems = allItems?.filter((item) => {
    if (activeTab === "all") return true;
    return item.type === activeTab;
  }) || [];

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted p-8">
      <div className="mx-auto w-full max-w-screen-md">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-4xl">Common Knowledge Base</h1>
          <p className="text-muted-foreground">
            Manage shared knowledge available to all AI assistants and chatbots
          </p>
        </div>
        
        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Knowledge Entries</h2>
          <div className="flex gap-2">
            <Dialog open={isUploadDialogOpen} onOpenChange={(open) => {
              setIsUploadDialogOpen(open);
              if (!open) resetFileForm();
            }}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <UploadIcon className="h-4 w-4" />
                  Upload File
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload Knowledge Base File</DialogTitle>
                  <DialogDescription>
                    Upload PDF, DOCX, DOC, or TXT files to the common knowledge base.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="file-title">Title</Label>
                    <Input
                      id="file-title"
                      placeholder="Enter file title..."
                      value={fileTitle}
                      onChange={(e) => setFileTitle(e.target.value)}
                      disabled={isUploading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file-input">Select File</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      {selectedFile ? (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileIcon className="h-8 w-8 text-blue-600" />
                            <div className="text-left">
                              <p className="font-medium text-sm">{selectedFile.name}</p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(selectedFile.size)}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedFile(null)}
                            disabled={isUploading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <UploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <div className="text-gray-600 mb-2">
                            <p className="text-sm">Drop your file here or click to browse</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Supports PDF, DOCX, DOC, TXT (Max 10MB)
                            </p>
                          </div>
                          <Input
                            id="file-input"
                            type="file"
                            accept=".pdf,.docx,.doc,.txt"
                            onChange={handleFileSelect}
                            disabled={isUploading}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            onClick={() => document.getElementById('file-input')?.click()}
                            disabled={isUploading}
                          >
                            Choose File
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={resetFileForm}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleFileUpload}
                    disabled={!selectedFile || !fileTitle.trim() || isUploading}
                  >
                    {isUploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Upload File
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button onClick={() => setIsAddingText(true)} className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Add Text Entry
            </Button>
          </div>
        </div>

        <div className="mt-6">

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="text">Text Entries</TabsTrigger>
          <TabsTrigger value="file">Files</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {isAddingText && (
            <Card>
              <CardHeader>
                <CardTitle>Add Text Entry</CardTitle>
                <CardDescription>
                  Create a new text-based knowledge entry
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="text-title">Title</Label>
                  <Input
                    id="text-title"
                    value={textTitle}
                    onChange={(e) => setTextTitle(e.target.value)}
                    placeholder="Enter a descriptive title..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="text-content">Content</Label>
                  <Textarea
                    id="text-content"
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="Enter the knowledge content..."
                    rows={6}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddText} disabled={!textTitle.trim() || !textContent.trim()}>
                    Add Entry
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsAddingText(false);
                    setTextTitle("");
                    setTextContent("");
                  }}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {filteredItems.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center space-y-2">
                    <p className="text-muted-foreground">No knowledge base entries found</p>
                    <p className="text-sm text-muted-foreground">
                      Add your first entry to get started
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredItems.map((item) => (
                <Card key={item._id}>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {item.type === "file" ? (
                          <FileIcon className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <FileTextIcon className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium leading-none">{item.title}</h3>
                          <Badge variant={item.type === "file" ? "default" : "secondary"}>
                            {item.type}
                          </Badge>
                        </div>
                        {item.type === "file" && item.fileName && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{item.fileName}</span>
                            {item.fileSize && (
                              <>
                                <span>•</span>
                                <span>{formatFileSize(item.fileSize)}</span>
                              </>
                            )}
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Added {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteItem(item._id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  {item.type === "text" && item.textContent && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {item.textContent}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
        </div>
      </div>
    </div>
  );
};