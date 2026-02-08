import React from 'react';
import { FileText, Image, File, Lock, Globe, Download, Share2, Trash2 } from 'lucide-react';

const RecentFilesTable = ({ files }) => {
    const getFileIcon = (type) => {
        if (type?.startsWith('image/')) {
            return <Image className="text-purple-500" size={20} />;
        } else if (type?.includes('pdf')) {
            return <FileText className="text-red-500" size={20} />;
        } else if (type?.startsWith('video/')) {
            return <File className="text-blue-500" size={20} />;
        }
        return <File className="text-gray-500" size={20} />;
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('en-US', { month: 'short' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    };

    const truncateName = (name, maxLength = 30) => {
        if (!name) return '';
        if (name.length <= maxLength) return name;
        const ext = name.split('.').pop();
        const nameWithoutExt = name.substring(0, name.lastIndexOf('.'));
        const truncated = nameWithoutExt.substring(0, maxLength - ext.length - 4) + '...';
        return truncated + '.' + ext;
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Files ({files.length})</h2>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Size
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Uploaded By
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Modified
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sharing
                            </th>
                            {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th> */}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {files.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    No files uploaded yet. Upload your first file to get started!
                                </td>
                            </tr>
                        ) : (
                            files.map((file, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            {getFileIcon(file.type)}
                                            <span className="text-sm text-gray-900 font-medium" title={file.name}>
                                                {truncateName(file.name)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {formatFileSize(file.size)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        You
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {formatDate(file.uploadedAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {file.isPublic ? (
                                                <>
                                                    <Globe size={16} className="text-gray-400" />
                                                    <span className="text-sm text-gray-600">Public</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Lock size={16} className="text-gray-400" />
                                                    <span className="text-sm text-gray-600">Private</span>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    {/* <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <button
                                                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                                                title="Download"
                                            >
                                                <Download size={18} className="text-gray-600" />
                                            </button>
                                            <button
                                                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                                                title="Share"
                                            >
                                                <Share2 size={18} className="text-gray-600" />
                                            </button>
                                            <button
                                                className="p-1.5 hover:bg-red-50 rounded transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} className="text-red-600" />
                                            </button>
                                        </div>
                                    </td> */}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentFilesTable;