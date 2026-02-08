import { useAuth } from '@clerk/clerk-react'
import React, { useContext, useEffect, useState } from 'react'
import DashboardLayout from '../layout/DashboardLayout'
import { UserCreditsContext } from '../context/UserCreditsContext';
import UploadBox from '../components/UploadBox';
import RecentFilesTable from '../components/RecentFilesTable';
import axios from 'axios';
import { apiEndpoints } from '../util/apiEndpoints';
import { AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [files, setFiles] = useState([]);
    const [uploadFiles, setUploadFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [remainingUploads, setRemainingUploads] = useState(5);
    const { getToken } = useAuth();
    const { fetchUserCredits } = useContext(UserCreditsContext);
    const MAX_FILES = 5;


    useEffect(() => {
        const fetchRecentFiles = async () => {
            setLoading(true);
            try {
                const token = await getToken();
                const res = await axios.get(apiEndpoints.FETCH_FILES, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    }
                });

                const sortedFiles = res.data.sort((a, b) =>
                    new Date(b.uploadedAt) - new Date(a.uploadedAt)).slice(0, 5);
                setFiles(sortedFiles);
            } catch (error) {
                console.error("Error Fetching Files: " + error);
            } finally {
                setLoading(false);
            }
        };
        fetchRecentFiles();
    }, [getToken]);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (uploadFiles.length + selectedFiles.length > MAX_FILES) {
            setMessage(`You can upload a maximum of ${MAX_FILES} files at once`);
            setMessageType("error");
            return;
        }
        setUploadFiles(prevFiles => [...prevFiles, ...selectedFiles]);
        setMessage("");
        setMessageType("");
    };

    const handleRemoveFile = (index) => {
        setUploadFiles(prevFiles => prevFiles.filter((_, i) => index != i));
        setMessage("");
        setMessageType("");
    }

    const handleUpload = async () => {
        if (uploadFiles.length === 0) {
            setMessage("Please Select Atleast one file to upload");
            setMessageType("error");
            return;
        }
        if (uploadFiles.length > MAX_FILES) {
            setMessage(`You can only upload a maximum of ${MAX_FILES} uploadFiles at once`);
            setMessageType("error");
            return;
        }
        setUploading(true);
        setMessage("Uploading uploadFiles...");
        setMessageType("info");

        const formData = new FormData();
        uploadFiles.forEach((file) => formData.append("files", file));

        try {
            const token = await getToken();
            const response = await axios.post(apiEndpoints.UPLOAD_FILE, formData, { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` } });
            if (response.data && response.data.remainingCredits !== undefined) {
                setCredits(response.data.remainingCredits);
            }

            setMessage("Files Uploaded Successfully");
            setMessageType("Success");
            setUploadFiles([]);

            const res = await axios.get(apiEndpoints.FETCH_FILES, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                }
            });

            const sortedFiles = res.data.sort((a, b) =>
                new Date(b.uploadedAt) - new Date(a.uploadedAt)).slice(0, 5);
            setFiles(sortedFiles);

            await fetchUserCredits();

        } catch (error) {
            console.error("Error uploading uploadFiles", error);
            toast.error("Error Uploading Files");
            setMessage(error.response?.data?.message || "Error uploading files.Please try again");
            setMessageType("error");
        } finally {
            setUploading(false);
        }
    }

    useEffect(() => {
        setRemainingUploads(MAX_FILES - uploadFiles.length);
    }, [uploadFiles]);

    useEffect(() => {
        const displayToken = async () => {
            const token = await getToken();
        }
        displayToken();
    }, []);

    const isUploadDisabled = files.length === 0 || files.length > MAX_FILES;

    return (
        <DashboardLayout activeMenu="Dashboard">
            <div className='p-6'>
                <h1 className='text-2xl font-bold mb-6'>My Drive</h1>
                <p className='text-gray-600 mb-6'>Upload, manage, and share your files</p>
                {message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${messageType === 'error' ? "bg-red-50 text-red-700" : messageType === 'success' ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}>
                        {messageType === "error" && <AlertCircle size={20} />}
                        {message}
                    </div>
                )}
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left  Column*/}
                    <div className="w-full md:w-[40%]">
                        <UploadBox
                            files={uploadFiles}
                            onFileChange={handleFileChange}
                            onUpload={handleUpload}
                            uploading={uploading}
                            onRemoveFile={handleRemoveFile}
                            isUploadDisabled={isUploadDisabled}
                        />
                    </div>
                    {/* Right Column */}
                    <div className="w-full md:w-[60%]">
                        {loading ? (
                            <div className='flex justify-center items-center h-64'>
                                <Loader2 className='animate-spin mr-2' />
                                <span>Loading Files...</span>
                            </div>
                        ) : (
                            <RecentFilesTable files={files}/>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default Dashboard
