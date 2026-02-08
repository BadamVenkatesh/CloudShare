import React, { useRef, useState } from 'react';
import { Upload, X, File } from 'lucide-react';

const UploadBox = ({
    files,
    onFileChange,
    onUpload,
    uploading,
    onRemoveFile,
    remainingCredits,
    isUploadDisabled
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length > 0) {
            // Create a synthetic event object to match the expected format
            const syntheticEvent = {
                target: {
                    files: droppedFiles
                }
            };
            onFileChange(syntheticEvent);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-blue-600">
                    <Upload size={20} />
                    <span className="font-medium">Upload Files</span>
                </div>
                <span className="text-sm text-gray-500">
                    {remainingCredits} credits remaining
                </span>
            </div>

            {/* Drop Zone */}
            <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
                className={`
          relative border-2 border-dashed rounded-lg p-12
          transition-all duration-200 cursor-pointer
          ${isDragging
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                    }
        `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={onFileChange}
                    className="hidden"
                    accept="*/*"
                />

                <div className="flex flex-col items-center justify-center text-center">
                    <div className={`
            w-12 h-12 rounded-full flex items-center justify-center mb-4
            ${isDragging ? 'bg-blue-100' : 'bg-blue-50'}
          `}>
                        <Upload className={isDragging ? 'text-blue-600' : 'text-blue-500'} size={24} />
                    </div>

                    <p className="text-gray-700 font-medium mb-1">
                        Drag and drop files here
                    </p>
                    <p className="text-sm text-gray-500">
                        or click to browse ({remainingCredits} credits remaining)
                    </p>
                </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="mt-6 space-y-2">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                        Selected Files ({files.length})
                    </h3>
                    {files.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="flex-shrink-0">
                                    <File className="text-gray-500" size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {formatFileSize(file.size)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveFile(index);
                                }}
                                className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-colors"
                                disabled={uploading}
                            >
                                <X className="text-gray-500 hover:text-red-500" size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Button */}
            {files.length > 0 && (
                <div className="mt-6">
                    <button
                        onClick={onUpload}
                        disabled={isUploadDisabled || uploading}
                        className={`
              w-full py-3 px-4 rounded-lg font-medium transition-all
              ${isUploadDisabled || uploading
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-98'
                            }
            `}
                    >
                        {uploading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Uploading...
                            </span>
                        ) : (
                            `Upload ${files.length} ${files.length === 1 ? 'File' : 'Files'}`
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default UploadBox;