import { useAuth } from '@clerk/clerk-react';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { apiEndpoints } from '../util/apiEndpoints';
import toast from 'react-hot-toast';
import { Copy, Download, File, Info, Share2 } from 'lucide-react';
import LinkShareModal from '../components/LinkShareModal';
import axios from 'axios';

const PublicFileView = () => {
    const [file,setFile] = useState(null);
    const [error,setError] = useState(null);
    const [isLoading,setIsLoading] = useState(false);
    const [shareModal,setShareModal] = useState({
        isOpen:false,
        link:""
    });
    const {getToken} = useAuth();
    const {fileId} = useParams();

    useEffect(()=>{
        const getFile = async () =>{
            setIsLoading(true);
            try {
                const res = await axios.get(apiEndpoints.PUBLIC_FILE_VIEW(fileId));
                setFile(res.data);
                setError(null);
            } catch (error) {
                console.error("Error Fetching files: "+error);
                setError("Could not retrieve file. The link may be invalid or file may have been removed");
            }finally{
                setIsLoading(false);
            }
        }
        getFile();
    },[fileId,getToken]);

    const hanldeDownload = async () => {
        try {
            const response = await axios.get(apiEndpoints.DOWNLOAD_FILE(fileId),{
                responseType:"blob",
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download",file.name);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url); // Clean up the object url
        } catch (error) {
            console.error("Download Failed: ",error);
            toast.error("Sorry, The File could not be downloaded.");
        }
    };

    const openShareModel = () =>{
        setShareModal({
            isOpen : true,
            link : window.location.href,
        });
    };

    const closeShareModal = () =>{
        setShareModal({
            isOpen : false,
            link : "",
        });
    }

    if(isLoading){
        return (
            <div className='flex justify-center items-center h-screen bg-gray-50'>
                <p className='text-gray-600'>Loading Files...</p>
            </div>
        );
    }

    if(error){
        return (
            <div className='flex justify-center items-center h-screen bg-gray-50'>
                <div className='text-center p-8 bg-white rounded-lg shadow-md'>
                    <h2 className='text-xl font-semibold text-red-600'>Error</h2>
                    <p className='text-gray-600 mt-2'>{error}</p>
                </div>
            </div>
        );
    }

    if(!file) return null;

    return (
        <div className='bg-gray-50 min-h-screen'>
            <header className='p-4 border-b bg-white'>
                <div className='container mx-auto flex justify-between items-center'>
                    <div className='flex items-center gap-2'>
                        <Share2 className='text-blue-600'/>
                        <span className='font-bold text-xl text-gray-800'>CloudShare</span>
                    </div>
                    <button
                        onClick={openShareModel}
                        className='flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-gray-200'
                    >
                        <Copy size={18}/>
                        Share Link
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className='container mx-auto p-4 md:p-8 flex justify-center'>
                <div className="w-full max-w-3xl">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
                        <div className="flex justify-center mb-4">
                            <div className='w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center'>
                                <File size={40} className='text-blue-500'/>
                            </div>
                        </div>
                        <h1 className='text-2xl font-semibold text-gray-800 break-words'>{file.name}</h1>

                        <p className='text-sm text-gray-500 mt-2'>
                            {(file.size/1024).toFixed(2)}KB
                            <span className='mx-2'>&bull;</span>
                            Shared on {new Date(file.uploadedAt).toLocaleDateString()}
                        </p>

                        <div className='my-6'>
                            <span className='inline-blocj bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full'>
                                {file.type || "File"}
                            </span>
                        </div>

                        <div className='flex justify-center gap-4 my-8'>
                            <button
                                onClick={hanldeDownload}
                                className='flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg'
                            >
                                <Download size={18} />
                                Download File
                            </button>
                        </div>

                        <hr className='my-8'/>

                        <div>
                            <h3 className='text-lg font-semibold text-left text-gray-800 mb-4'>
                                File Information
                            </h3>
                            <div className='text-left text-sm space-y-3'>
                                <div className='flex justify-between'>
                                    <span className='text-gray-500'>File Name:</span>
                                    <span className='text-gray-800 font-medium break-all'>{file.name}</span>
                                </div>
                            </div>
                        </div>

                        <div className='mt-6 bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg'>
                            <Info size={20} />
                            <p className='text-sm'>
                                This file has been shared publicily. Anyone with this link can view and download it.
                            </p>
                        </div>

                    </div>
                </div>
            </main>
            <LinkShareModal
                isOpen={shareModal.isOpen}
                onClose={closeShareModal}
                link={shareModal.link}
                title={"Share File"}
            />
        </div>
    )
}

export default PublicFileView
