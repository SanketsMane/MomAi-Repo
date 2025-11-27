"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { usePaginatedQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import type { PublicFile } from "@workspace/backend/private/files";
import { Button } from "@workspace/ui/components/button";
import { FileIcon, MoreHorizontalIcon, PlusIcon, TrashIcon } from "lucide-react";
import { UploadDialog } from "../components/upload-dialog";
import { useState } from "react";
import { DeleteFileDialog } from "../components/delete-file-dialog";
import { useAction } from "convex/react";
import { useOrganization } from "@clerk/nextjs";

export const FilesView = () => {
  const { organization } = useOrganization();
  const orgId = organization?.id;

  const files = usePaginatedQuery(
    api.private.files.list,
    {},
    {
      initialNumItems: 10,
    },
  );

  const {
    topElementRef,
    handleLoadMore,
    canLoadMore,
    isLoadingFirstPage,
    isLoadingMore,
  } = useInfiniteScroll({
    status: files.status,
    loadMore: files.loadMore,
    loadSize: 10,
  })

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [selectedFile, setSelectedFile] = useState<PublicFile | null>(null);
  const handleDeleteClick = (file: PublicFile) => {
    setSelectedFile(file);
    setDeleteDialogOpen(true);
  };

  const handleFileDeleted = () => {
    setSelectedFile(null);
  }

  // Debug functionality
  const [debugResults, setDebugResults] = useState<any>(null);
  const [debugLoading, setDebugLoading] = useState(false);
  const debugKB = useAction(api.debug.knowledge.debugKnowledgeBase);
  const testSearch = useAction(api.debug.knowledge.testSearch);
  const createNamespace = useAction(api.debug.fix.createNamespace);
  const reprocessFile = useAction(api.debug.fix.reprocessFile);
  const storageFiles = useAction(api.debug.storage.listStorageFiles);
  const debugUpload = useAction(api.debug.upload.debugFileUpload);
  const clearAll = useAction(api.debug.clear.clearAllFiles);

  const handleDebugKB = async () => {
    if (!orgId) return;
    setDebugLoading(true);
    try {
      const result = await debugKB({ organizationId: orgId });
      setDebugResults({ type: "debug", ...result });
    } catch (error) {
      setDebugResults({ type: "error", error: String(error) });
    } finally {
      setDebugLoading(false);
    }
  };

  const handleTestSearch = async (query: string) => {
    if (!orgId) return;
    setDebugLoading(true);
    try {
      const result = await testSearch({ organizationId: orgId, query });
      setDebugResults({ type: "search", query, ...result });
    } catch (error) {
      setDebugResults({ type: "error", error: String(error) });
    } finally {
      setDebugLoading(false);
    }
  };

  const handleCreateNamespace = async () => {
    if (!orgId) return;
    setDebugLoading(true);
    try {
      const result = await createNamespace({ organizationId: orgId });
      setDebugResults({ type: "namespace", ...result });
    } catch (error) {
      setDebugResults({ type: "error", error: String(error) });
    } finally {
      setDebugLoading(false);
    }
  };

  const handleStorageFiles = async () => {
    if (!orgId) return;
    setDebugLoading(true);
    try {
      const result = await storageFiles({ organizationId: orgId });
      setDebugResults({ type: "storage", ...result });
    } catch (error) {
      setDebugResults({ type: "error", error: String(error) });
    } finally {
      setDebugLoading(false);
    }
  };

  const handleReprocessFirst = async () => {
    if (!orgId) return;
    setDebugLoading(true);
    try {
      // First get storage files
      const storage = await storageFiles({ organizationId: orgId! });
      if (storage.files && storage.files.length > 0) {
        const firstFile = storage.files[0];
        if (firstFile) {
          // Note: RAG entries don't have storageId, skipping reprocess for now
          setDebugResults({ 
            type: "error", 
            error: "Reprocess not available for RAG entries (no storageId)" 
          });
        } else {
          setDebugResults({ type: "error", error: "First file is undefined" });
        }
      } else {
        setDebugResults({ type: "error", error: "No files found in storage" });
      }
    } catch (error) {
      setDebugResults({ type: "error", error: String(error) });
    } finally {
      setDebugLoading(false);
    }
  };

  const handleDebugUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      setDebugLoading(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await debugUpload({
          filename: file.name,
          mimeType: file.type,
          bytes: arrayBuffer
        });
        setDebugResults({ type: "upload", filename: file.name, ...result });
      } catch (error) {
        setDebugResults({ type: "error", error: String(error) });
      } finally {
        setDebugLoading(false);
      }
    };
    input.click();
  };

  const handleClearAll = async () => {
    if (!orgId) return;
    const confirmed = confirm("This will delete ALL files from your knowledge base. Are you sure?");
    if (!confirmed) return;
    
    setDebugLoading(true);
    try {
      const result = await clearAll({ organizationId: orgId });
      setDebugResults({ type: "clear", ...result });
    } catch (error) {
      setDebugResults({ type: "error", error: String(error) });
    } finally {
      setDebugLoading(false);
    }
  };

  return (
    <>
      <DeleteFileDialog
        onOpenChange={setDeleteDialogOpen}
        open={deleteDialogOpen}
        file={selectedFile}
        onDeleted={handleFileDeleted}
      />
      <UploadDialog
        onOpenChange={setUploadDialogOpen}
        open={uploadDialogOpen}
      />
      <div className="flex min-h-screen flex-col bg-muted p-8">
        <div className="mx-auto w-full max-w-screen-md">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl">
              Knowledge Base
            </h1>
            <p className="text-muted-foreground">
              Upload and manage documents for your MOM AI assistant
            </p>
          </div>

          {/* Debug Section */}
          <div className="mt-6 rounded-lg border bg-yellow-50 p-4">
            <h3 className="text-lg font-semibold mb-3">🔍 Knowledge Base Debug</h3>
            <div className="flex gap-2 flex-wrap mb-3">
              <Button size="sm" onClick={handleDebugKB} disabled={debugLoading} variant="outline">
                Debug KB
              </Button>
              <Button size="sm" onClick={handleStorageFiles} disabled={debugLoading} variant="outline">
                Check Storage
              </Button>
              <Button size="sm" onClick={handleDebugUpload} disabled={debugLoading} variant="outline">
                🐛 Debug Upload
              </Button>
              <Button size="sm" onClick={handleClearAll} disabled={debugLoading} variant="destructive">
                🗑️ Clear All
              </Button>
              <Button size="sm" onClick={() => handleTestSearch("shift creation")} disabled={debugLoading} variant="outline">
                Test Search
              </Button>
            </div>
            
            {debugLoading && <div className="text-sm text-gray-600">Loading...</div>}
            
            {debugResults && (
              <div className="mt-3 p-3 bg-white rounded border text-xs overflow-auto max-h-64">
                <pre className="whitespace-pre-wrap">{JSON.stringify(debugResults, null, 2)}</pre>
              </div>
            )}
          </div>

          <div className="mt-8 rounded-lg border bg-background">
            <div className="flex items-center justify-end border-b px-6 py-4">
              <Button
                onClick={() => setUploadDialogOpen(true)}
              >
                <PlusIcon />
                Add New
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6 py-4 font-medium">Name</TableHead>
                  <TableHead className="px-6 py-4 font-medium">Type</TableHead>
                  <TableHead className="px-6 py-4 font-medium">Size</TableHead>
                  <TableHead className="px-6 py-4 font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  if (isLoadingFirstPage) {
                    return (
                      <TableRow>
                        <TableCell className="h-24 text-center" colSpan={4}>
                          Loading files...
                        </TableCell>
                      </TableRow>
                    );
                  }

                  if (files.results.length === 0) {
                    return (
                      <TableRow>
                        <TableCell className="h-24 text-center" colSpan={4}>
                          No files found
                        </TableCell>
                      </TableRow>
                    )
                  }

                  return files.results.map((file) => (
                    <TableRow className="hover:bg-muted/50" key={file.id}>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <FileIcon />
                          {file.name}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge className="uppercase" variant="outline">
                          {file.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-muted-foreground">
                        {file.size}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              className="size-8 p-0"
                              size="sm"
                              variant="ghost"
                            >
                              <MoreHorizontalIcon />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteClick(file)}
                            >
                              <TrashIcon className="size-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                })()}
              </TableBody>
            </Table>
            {!isLoadingFirstPage && files.results.length > 0 && (
              <div className="border-t">
                <InfiniteScrollTrigger
                  canLoadMore={canLoadMore}
                  isLoadingMore={isLoadingMore}
                  onLoadMore={handleLoadMore}
                  ref={topElementRef}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
