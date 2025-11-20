'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadsApi, Upload } from '@/lib/api/uploads';
import { Button } from '@/components/ui/button';
import {
  Upload as UploadIcon,
  File,
  X,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface TaskFileUploadProps {
  taskId: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const isImage = (mimeType: string): boolean => {
  return mimeType.startsWith('image/');
};

export function TaskFileUpload({ taskId }: TaskFileUploadProps) {
  const queryClient = useQueryClient();
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch uploads for this task
  const { data: uploads = [], isLoading } = useQuery({
    queryKey: ['uploads', taskId],
    queryFn: () => uploadsApi.getTaskUploads(taskId),
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadsApi.uploadFile(taskId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uploads', taskId] });
      toast.success('File uploaded successfully');
      setUploadingFile(null);
    },
    onError: (error: Error) => {
      toast.error('Upload failed', {
        description: error.message,
      });
      setUploadingFile(null);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (uploadId: string) => uploadsApi.deleteUpload(uploadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uploads', taskId] });
      toast.success('File deleted');
      setDeleteId(null);
    },
    onError: () => {
      toast.error('Failed to delete file');
      setDeleteId(null);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large', {
        description: `Maximum file size is ${formatFileSize(MAX_FILE_SIZE)}`,
      });
      return;
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type', {
        description: 'Only images, PDFs, and Word documents are allowed',
      });
      return;
    }

    setUploadingFile(file);
    uploadMutation.mutate(file);
  };

  const handleDelete = (upload: Upload) => {
    setDeleteId(upload.id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  return (
    <div className="space-y-3">
      {/* Upload Button */}
      <div>
        <input
          type="file"
          id={`file-upload-${taskId}`}
          className="hidden"
          onChange={handleFileSelect}
          disabled={uploadMutation.isPending}
          accept="image/*,.pdf,.doc,.docx"
        />
        <label htmlFor={`file-upload-${taskId}`}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer"
            disabled={uploadMutation.isPending}
            asChild
          >
            <span>
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadIcon className="mr-2 h-4 w-4" />
                  Attach File
                </>
              )}
            </span>
          </Button>
        </label>
        {uploadingFile && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Uploading: {uploadingFile.name}
          </p>
        )}
      </div>

      {/* Uploaded Files List */}
      {isLoading ? (
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Loading files...
        </div>
      ) : uploads.length > 0 ? (
        <div className="space-y-2">
          {uploads.map((upload) => (
            <div
              key={upload.id}
              className="flex items-center justify-between rounded-md border bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2">
                {isImage(upload.mime_type) ? (
                  <ImageIcon className="h-4 w-4 shrink-0 text-blue-500 dark:text-blue-400" />
                ) : (
                  <File className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
                )}
                <div className="min-w-0 flex-1">
                  <a
                    href={upload.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {upload.file_name}
                  </a>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatFileSize(upload.file_size)} •{' '}
                    {new Date(upload.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400"
                onClick={() => handleDelete(upload)}
                disabled={deleteMutation.isPending}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : null}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this file? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
