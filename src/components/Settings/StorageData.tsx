import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, FileText, Download, Trash2, Calendar, Search, RefreshCw, ExternalLink, Upload, X } from 'lucide-react';

// Google Identity Services types
declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: any) => any;
        };
      };
    };
  }
}

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
}

interface PDFFile {
  id: string;
  name: string;
  size: string;
  date: string;
  type: 'chat' | 'document' | 'media';
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
}

interface DrivePermission {
  id: string;
  type: string;
  role: string;
  emailAddress?: string;
}

interface StorageDataProps {
  onBack: () => void;
}

const StorageData: React.FC<StorageDataProps> = ({ onBack }) => {
  const [selectedPDF, setSelectedPDF] = useState<PDFFile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [driveFiles, setDriveFiles] = useState<PDFFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thumbnailErrors, setThumbnailErrors] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [selectedUploadFiles, setSelectedUploadFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<PDFFile | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Google Drive API configuration
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
  const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const FOLDER_ID = import.meta.env.VITE_GOOGLE_FOLDER_ID;
  
  // Authentication state
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Function to get file metadata
  const getFileMetadata = async (fileId: string) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?key=${API_KEY}&fields=id,name,mimeType,webViewLink,webContentLink,thumbnailLink,size,modifiedTime`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (err) {
      throw new Error(`Failed to fetch file metadata: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Function to fetch files from the specific folder
  const fetchDriveFiles = async () => {
    setLoading(true);
    setError(null);
    setThumbnailErrors(new Set()); // Clear thumbnail errors when refreshing
    
    try {
      // First, get the list of files in the folder
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?key=${API_KEY}&q='${FOLDER_ID}'+in+parents&fields=files(id,name,mimeType,size,modifiedTime)&orderBy=modifiedTime desc`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Get detailed metadata for each file
      const filesWithMetadata = await Promise.all(
        data.files.map(async (file: GoogleDriveFile) => {
          try {
            const metadata = await getFileMetadata(file.id);
            return {
              id: file.id,
              name: file.name,
              size: file.size ? formatFileSize(parseInt(file.size)) : 'Unknown',
              date: formatDate(file.modifiedTime),
              type: getFileType(file.mimeType),
              webViewLink: metadata.webViewLink,
              webContentLink: metadata.webContentLink,
              thumbnailLink: metadata.thumbnailLink
            };
          } catch (err) {
            console.error(`Error fetching metadata for ${file.name}:`, err);
            return {
              id: file.id,
              name: file.name,
              size: file.size ? formatFileSize(parseInt(file.size)) : 'Unknown',
              date: formatDate(file.modifiedTime),
              type: getFileType(file.mimeType)
            };
          }
        })
      );
      
      setDriveFiles(filesWithMetadata);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
      console.error('Error fetching drive files:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Helper function to determine file type
  const getFileType = (mimeType: string): 'chat' | 'document' | 'media' => {
    if (mimeType.includes('pdf')) return 'document';
    if (mimeType.includes('image') || mimeType.includes('video')) return 'media';
    return 'chat';
  };

  // Function to handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedUploadFiles(prev => [...prev, ...files]);
    // Reset the input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Function to remove selected file
  const removeSelectedFile = (index: number) => {
    setSelectedUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Drag and drop states
  const [isDragOver, setIsDragOver] = useState(false);

  // Function to handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    setSelectedUploadFiles(prev => [...prev, ...files]);
  };

  // Function to upload files to Google Drive
  const uploadFilesToDrive = async () => {
    if (selectedUploadFiles.length === 0) return;

    setUploading(true);
    setError(null);
    const newProgress: {[key: string]: number} = {};
    selectedUploadFiles.forEach(file => {
      newProgress[file.name] = 0;
    });
    setUploadProgress(newProgress);

    try {
      for (let i = 0; i < selectedUploadFiles.length; i++) {
        const file = selectedUploadFiles[i];
        
        // Update progress to show upload starting
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 10
        }));

        try {
          // Create the file metadata
          const metadata = {
            name: file.name,
            parents: [FOLDER_ID],
            mimeType: file.type
          };

          // Create the multipart request body
          const boundary = '-------314159265358979323846';
          const delimiter = "\r\n--" + boundary + "\r\n";
          const close_delim = "\r\n--" + boundary + "--";

          const multipartRequestBody = 
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            'Content-Type: ' + file.type + '\r\n\r\n';

          // Convert file to base64
          const fileReader = new FileReader();
          const filePromise = new Promise<string>((resolve, reject) => {
            fileReader.onload = () => {
              const result = fileReader.result as string;
              const base64 = result.split(',')[1];
              resolve(base64);
            };
            fileReader.onerror = reject;
          });
          
          fileReader.readAsDataURL(file);
          const base64Data = await filePromise;

          // Update progress
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: 30
          }));

          // Check if we have an access token for uploads
          if (!accessToken) {
            throw new Error('Authentication required for file uploads. Please click "Authenticate" first.');
          }

          // Make the upload request using OAuth2 token
          const response = await fetch(
            `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': `multipart/related; boundary=${boundary}`,
                'Content-Length': (multipartRequestBody.length + base64Data.length + close_delim.length).toString()
              },
              body: multipartRequestBody + base64Data + close_delim
            }
          );

          // Update progress
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: 80
          }));

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
          }

          const result = await response.json();
          
          // Update progress to complete
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: 100
          }));

          console.log(`Successfully uploaded: ${file.name}`, result);
        } catch (uploadError) {
          console.error(`Error uploading ${file.name}:`, uploadError);
          setError(`Failed to upload ${file.name}: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
        }
      }

      // Clear selected files after upload
      setSelectedUploadFiles([]);
      
      // Refresh the file list
      await fetchDriveFiles();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  // Load files on component mount
  useEffect(() => {
    fetchDriveFiles();
  }, []);

  // Initialize Google Identity Services
  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('Google Identity Services loaded');
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup script if component unmounts
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  // Function to authenticate with Google OAuth2
  const authenticateWithGoogle = () => {
    if (!window.google?.accounts?.oauth2) {
      setError('Google Identity Services not loaded. Please refresh the page.');
      return;
    }

    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: (response: any) => {
          if (response.error) {
            setError(`Authentication failed: ${response.error}`);
            return;
          }
          setAccessToken(response.access_token);
          setError(null);
          console.log('Successfully authenticated with Google Drive');
        },
      });

      tokenClient.requestAccessToken();
    } catch (error) {
      console.error('Authentication error:', error);
      setError('Failed to initialize authentication. Please try again.');
    }
  };

  const handlePDFClick = (pdf: PDFFile) => {
    setSelectedPDF(pdf);
    // Clear any open modals when entering file viewer
    setShowDeleteModal(false);
    setFileToDelete(null);
    setDeleting(false);
  };

  const handleDownload = (pdf: PDFFile) => {
    if (pdf.webContentLink) {
      window.open(pdf.webContentLink, '_blank');
    } else {
      console.log(`Downloading ${pdf.name}`);
    }
  };

  const handleViewInDrive = (pdf: PDFFile) => {
    if (pdf.webViewLink) {
      window.open(pdf.webViewLink, '_blank');
    }
  };

  const handleDelete = (pdf: PDFFile) => {
    setFileToDelete(pdf);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;

    setDeleting(true);
    try {
      // Check if we have an access token for deletion
      if (!accessToken) {
        setError('Authentication required for file deletion. Please click "Connect Google" first.');
        return;
      }

      // First, check if we have permission to delete this file
      const permissionResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileToDelete.id}/permissions?key=${API_KEY}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!permissionResponse.ok) {
        const errorText = await permissionResponse.text();
        throw new Error(`Permission check failed: ${permissionResponse.status} ${permissionResponse.statusText} - ${errorText}`);
      }

      const permissions = await permissionResponse.json();
      const hasDeletePermission = permissions.permissions?.some((perm: DrivePermission) => 
        perm.role === 'owner' || perm.role === 'writer'
      );

      if (!hasDeletePermission) {
        throw new Error('You do not have permission to delete this file. Only owners and writers can delete files.');
      }

      // Delete the file from Google Drive
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileToDelete.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Delete failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      // Remove the file from the local state
      setDriveFiles(prev => prev.filter(file => file.id !== fileToDelete.id));
      
      // If we're viewing the deleted file, close the viewer
      if (selectedPDF && selectedPDF.id === fileToDelete.id) {
        setSelectedPDF(null);
      }

      console.log(`Successfully deleted: ${fileToDelete.name}`);
      
      // Close the modal
      setShowDeleteModal(false);
      setFileToDelete(null);
    } catch (error) {
      console.error(`Error deleting ${fileToDelete.name}:`, error);
      setError(`Failed to delete ${fileToDelete.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setFileToDelete(null);
    setDeleting(false);
  };

  // Filter files based on search term
  const filteredFiles = driveFiles.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'chat':
        return <FileText className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      case 'media':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'chat':
        return 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400';
      case 'document':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
      case 'media':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (selectedPDF) {
    return (
      <div className="w-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
        {/* Delete Confirmation Modal */}
        {showDeleteModal && fileToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md mx-4 transform transition-all">
              {/* Modal Header */}
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                      Delete File
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-6">
                <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-3 sm:p-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-red-900 dark:text-red-100 break-words">
                        {fileToDelete.name}
                      </p>
                      <p className="text-xs text-red-700 dark:text-red-300">
                        {fileToDelete.size} • {fileToDelete.date}
                      </p>
                    </div>
                  </div>
                </div>
                
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  Are you sure you want to delete this file? This action will permanently remove the file from your Google Drive and cannot be undone.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={cancelDelete}
                  disabled={deleting}
                  className="w-full sm:flex-1 px-4 py-3 sm:py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="w-full sm:flex-1 px-4 py-3 sm:py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {deleting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Delete File</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <button
              onClick={() => {
                setSelectedPDF(null);
                // Clear any open modals when leaving file viewer
                setShowDeleteModal(false);
                setFileToDelete(null);
                setDeleting(false);
              }}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">File Viewer</h1>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getTypeColor(selectedPDF.type)}`}>
                {getTypeIcon(selectedPDF.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-gray-900 dark:text-white truncate text-sm sm:text-base">{selectedPDF.name}</h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{selectedPDF.size} • {selectedPDF.date}</p>
              </div>
            </div>
          </div>
        </div>

        {/* File Content */}
        <div className="flex-1 p-2 sm:p-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 sm:p-8 text-center">
            <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-500 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 px-2">{selectedPDF.name}</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 px-2">
              File preview would be displayed here
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 justify-center px-2">
              <button
                onClick={() => handleDownload(selectedPDF)}
                className="flex items-center justify-center space-x-2 px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              {selectedPDF.webViewLink && (
                <button
                  onClick={() => handleViewInDrive(selectedPDF)}
                  className="flex items-center justify-center space-x-2 px-4 py-3 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View in Drive</span>
                </button>
              )}
              <button
                onClick={() => handleDelete(selectedPDF)}
                className="flex items-center justify-center space-x-2 px-4 py-3 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors w-full sm:w-auto"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && fileToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md mx-4 transform transition-all">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Delete File
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6">
              <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-3 sm:p-4 mb-4">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-red-900 dark:text-red-100 break-words">
                      {fileToDelete.name}
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-300">
                      {fileToDelete.size} • {fileToDelete.date}
                    </p>
                  </div>
                </div>
              </div>
              
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Are you sure you want to delete this file? This action will permanently remove the file from your Google Drive and cannot be undone.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={cancelDelete}
                disabled={deleting}
                className="w-full sm:flex-1 px-4 py-3 sm:py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="w-full sm:flex-1 px-4 py-3 sm:py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {deleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete File</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Storage & Data</h1>
        </div>
        
        {/* File Upload Section */}
        <div className="flex items-center space-x-3 mb-4">
          <button
            onClick={fetchDriveFiles}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Loading...' : 'Refresh Files'}</span>
          </button>

          {/* Authentication Button */}
          <button
            onClick={authenticateWithGoogle}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>{accessToken ? 'Connected' : 'Connect Google'}</span>
          </button>

                     {/* File Upload Section */}
           <div className="flex items-center space-x-2">
             <input
               ref={fileInputRef}
               type="file"
               multiple
               onChange={handleFileSelect}
               className="hidden"
               accept="*/*"
             />
             
             {selectedUploadFiles.length > 0 && (
               <button
                 onClick={uploadFilesToDrive}
                 disabled={uploading}
                 className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 <Upload className={`w-4 h-4 ${uploading ? 'animate-spin' : ''}`} />
                 <span>{uploading ? 'Uploading...' : `Upload ${selectedUploadFiles.length} File${selectedUploadFiles.length > 1 ? 's' : ''}`}</span>
               </button>
             )}
           </div>
        </div>

        {/* Drag and Drop Upload Area */}
        <div 
          className={`mb-4 p-8 border-2 border-dashed rounded-lg text-center transition-all duration-200 ${
            isDragOver 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {isDragOver ? 'Drop files here' : 'Drag & Drop Files Here'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Or click the button below to select files
          </p>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors mx-auto"
          >
            <Upload className="w-4 h-4" />
            <span>Select Files</span>
          </button>
        </div>

        {/* Selected Files for Upload */}
        {selectedUploadFiles.length > 0 && (
          <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">
              Files to Upload ({selectedUploadFiles.length})
            </h3>
            <div className="space-y-2">
              {selectedUploadFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                  <div className="flex items-center space-x-2 text-sm text-purple-800 dark:text-purple-200">
                    <FileText className="w-4 h-4" />
                    <span>{file.name}</span>
                    <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {uploadProgress[file.name] !== undefined && (
                      <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress[file.name]}%` }}
                        ></div>
                      </div>
                    )}
                    <button
                      onClick={() => removeSelectedFile(index)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
              Error Loading Files
            </h3>
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Files from Google Drive ({filteredFiles.length})
            </h3>
            <a 
              href={`https://drive.google.com/drive/folders/${FOLDER_ID}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
            >
              <span>Open in Drive</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Loading files...</h3>
              <p className="text-gray-500 dark:text-gray-400">Fetching files from Google Drive</p>
            </div>
          ) : filteredFiles.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <button
                  key={file.id}
                  onClick={() => handlePDFClick(file)}
                  className="group bg-white dark:bg-gray-800 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md"
                >
                  {/* File Thumbnail */}
                  <div className="relative mb-3">
                    <div className="w-full aspect-[3/4] bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
                      {file.thumbnailLink && !thumbnailErrors.has(file.id) ? (
                        <img 
                          src={file.thumbnailLink} 
                          alt={file.name}
                          className="w-full h-full object-cover rounded-lg"
                          onError={() => {
                            setThumbnailErrors(prev => new Set(prev).add(file.id));
                          }}
                        />
                      ) : (
                        <div className="text-center">
                          <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                          <div className="w-16 h-2 bg-gray-300 dark:bg-gray-600 rounded mx-auto mb-1"></div>
                          <div className="w-12 h-2 bg-gray-300 dark:bg-gray-600 rounded mx-auto mb-1"></div>
                          <div className="w-14 h-2 bg-gray-300 dark:bg-gray-600 rounded mx-auto"></div>
                        </div>
                      )}
                    </div>
                    
                    {/* File Type Badge */}
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(file.type)}`}>
                      {file.type}
                    </div>
                  </div>
                  
                  {/* File Info */}
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {file.name}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{file.size}</span>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{file.date}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No files found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? `No files match "${searchTerm}"` : 'No files available in the Google Drive folder'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StorageData;
