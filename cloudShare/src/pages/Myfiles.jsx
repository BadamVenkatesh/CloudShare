import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { Copy, Download, Eye, File, FileIcon, Globe, Grid, Image, List, Lock, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import FileCard from '../components/FileCard';
import { apiEndpoints } from '../util/apiEndpoints';
import ConfirmationDialog from '../components/ConfirmationDialog';
import DashboardLayout from '../layout/DashboardLayout';
import LinkShareModal from '../components/LinkShareModal';

const MyFiles = () => {
    const [files,setFiles] = useState([]);
    const [viewMode,setViewMode] = useState("list"); 
    const {getToken} = useAuth();
    const [deleteConfirmation,setDeleteConfirmation] = useState({
        isOpen: false,
        fileId: null
    })

    const [shareModal,setShareModal] = useState({
        isOpen: false,
        fileId: null,
        link: ""
    })

    // Fetching files for the logged in user
    const fetchFiles = async () => {
        try {
            const token = await getToken();
            const res = await axios.get(apiEndpoints.FETCH_FILES,{headers:{Authorization: `Bearer ${token}`}})
            if(res.status == 200){
                setFiles(res.data);
            }
            console.log(res)
        } catch (error) {
            console.error("Error Fetching files from the server: "+error);
            toast.error("Error fetching the files");
        }
    }
    const navigate = useNavigate();

    // Toggles the public/private status of a file
    const togglePublic = async (fileToUpdate) => {
        try {
            const token = await getToken();
            await axios.patch(apiEndpoints.TOGGLE_FILE(fileToUpdate.id),{},{headers:{Authorization:`Bearer ${token}`}})
            setFiles(files.map((file)=> file.id==fileToUpdate.id ? {...file,isPublic: !fileToUpdate.isPublic} : file));
        } catch (error) {
            console.error("Error Toggling Public Mode of files: "+error);
            toast.error("Error Toggling Public Mode of files");
        }
    }

    // Handle File Download
    const hanldeDownload = async (file) =>{
        try {
            const token = await getToken();
            const response = await axios.get(apiEndpoints.DOWNLOAD_FILE(file.id),{headers:{Authorization:`Bearer ${token}`},responseType:"blob"});
            // Create a blob url and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download",file.name);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download Failed: "+error);
            toast.error("Error Downloading File");
        }
    }

    // closes the delete confirmation modal 
    const closeDeleteConfirmation = () =>{
        setDeleteConfirmation({
            isOpen:false,
            fileId:null
        })
    }

    const openDeleteConfirmation =(fileId)=>{
        setDeleteConfirmation({
            isOpen:true,
            fileId
        })
    }

    // Open the share link Modal
    const openShareModel = (fileId) =>{
        const link = `${window.location.origin}/file/${fileId}`;
        setShareModal({
            isOpen: true,
            fileId,
            link
        })
    }

    // Close the share link modal
    const closeShareModal = () =>{
        setShareModal({
            isOpen:false,
            fileId:null,
            link:""
        })
    }

    // Delete a file after confirmation
    const handleDelete = async () =>{
        const fileId = deleteConfirmation.fileId;
        if(!fileId) return;
        try {
            const token = await getToken();
            const response = await axios.delete(apiEndpoints.DELETE_FILE(fileId),{headers:{"Authorization":`Bearer ${token}`}})
            if(response.status === 204){
                setFiles(files.filter((file)=>file.id!=fileId));
                closeDeleteConfirmation();
            }else{
                toast.error("Error Deleting File");
            }
        } catch (error) {
            console.error("Error Deleting file: "+error);
            toast.error("Error Deleting file");
        }
    }

    useEffect(()=>{
        fetchFiles();
    },[getToken])

    const getFileIcon = (file) => {
        const ext = file.name.split('.').pop().toLowerCase();
        if(['jpg','jpeg','png','svg','gif','webp'].includes(ext)){
            return <Image size={24} className='text-purple-500'/>
        }
        if(['mp4','mov','webm','avi','mkv'].includes(ext)){
            return <Video size={24} className='text-blue-500'/>
        }
        if(['mp3','wav','ogg','flac','m4a'].includes(ext)){
            return <Music size={24} className='text-green-500'/>
        }
        if(['odf','doc','docx','txt','rtf'].includes(ext)){
            return <Music size={24} className='text-amber-500'/>
        }
        return <FileIcon size={24} className='text-purple-500'/>
    }
    return (
        <DashboardLayout activeMenu="My Files">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">
                        My Files {files.length}
                    </h2>
                    <div className="flex items-center gap-3">
                        <List 
                            onClick={()=> setViewMode('list')}
                            size={24} 
                            className={`cursor-pointer transition-colors ${viewMode=='list' ? 'text-blue-600 ':" text-gray-400 hover:text-gray-600"}`}/>
                        <Grid 
                            onClick={()=> setViewMode('grid')}
                            size={24} 
                            className={`cursor-pointer transition-colors ${viewMode=='grid' ? 'text-blue-600 ':" text-gray-400 hover:text-gray-600"}`}/>
                    </div>
                </div>

                {files.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 flex flex-col items-center  justify-center ">
                        <File 
                            size = {60}
                            className = "text-purple-300 mb-4"
                        />
                        <h3 className='text-xl font-medium text-gray-700 mb-2'>
                            No files uploaded at
                        </h3>
                        <p className="text-gray-500 text-center max-w-md mb-6">
                            Start uploading files to see them listed here. you can upload documents, images, and other files to share and manage them securely.
                        </p>
                        <button 
                            onClick={()=>navigate("/upload")}
                            className='px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors'>Go to upload</button>
                    </div>
                ) : viewMode === 'grid' ? 
                ( 
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                        {files.map((file)=>(
                            <FileCard
                                key={file.id}
                                file={file}
                                onDelete={openDeleteConfirmation}
                                onTogglePublic={togglePublic}
                                onDownload={hanldeDownload}
                                onShareLink={openShareModel}
                            />
                        ))}
                    </div>
                ):
                (
                    <div className='overflow-auto bg-white rounded-lg shadow'>
                        <table className="min-w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">Size</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">Uploaded</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">Sharing</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">Actions</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-200'>
                                {files.map((file)=>(
                                    <tr
                                        key={file.id}
                                        className='hover:bg-gray-50 transition-colors'
                                    >
                                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800'>
                                            <div className="flex items-center gap-2">
                                                {getFileIcon(file)}
                                                {file.name}
                                            </div>
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap text-sm  text-gray-600'>
                                            {(file.size / 1024).toFixed(1)} KB
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap text-sm  text-gray-600'>
                                            {(new Date(file.uploadedAt)).toLocaleDateString()}
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap text-sm  text-gray-600'>
                                            <div className="flex items-center gap-4">
                                                <button 
                                                    onClick={()=>togglePublic(file)}
                                                    className='flex items-center gap-2 cursor-pointer group '>
                                                    {file.isPublic ? ( 
                                                        <>
                                                        <Globe size={16} className='text-green-500' />
                                                        <span className='group-hover:underline'>Public</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                        <Lock size={16} className='text-gray-500' />
                                                        <span className='group-hover:underline'>Private</span>
                                                        </>
                                                    )}
                                                </button>
                                                {file.isPublic && (
                                                    <button 
                                                        onClick={()=>openShareModel(file.id)}
                                                        className="flex items-center gap-2 cursor-pointer group text-blue-600">
                                                        <Copy size={16}/>
                                                        <span className='group-hover:underline'> Share Link</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap text-sm  font-medium'>
                                            <div className='grid grid-cols-3 gap-4'>
                                                <div className='flex justify-center'>
                                                    <button 
                                                        onClick={()=>hanldeDownload(file)}
                                                        title='Downloadd'
                                                        className='text-gray-500 hover:text-blue-600'>
                                                            <Download size={18}/>
                                                    </button>
                                                </div>
                                                <div className='flex justify-center'>
                                                    <button 
                                                        onClick={()=>openDeleteConfirmation(file.id)}
                                                        title='Delete'
                                                        className='text-gray-500 hover:text-red-600'>
                                                            <Trash2 size={18}/>
                                                    </button>
                                                </div>
                                                <div className='flex justify-center'>
                                                    {file.isPublic ? (
                                                        <a href={`/file/${file.id}`} 
                                                        title="View File" 
                                                        target="_blank" rel="noreferrer" className='text-gray-500 hover:text-blue-600'>
                                                            <Eye size={18}/>
                                                        </a>
                                                    ): (
                                                        <span className='w-[18px] '></span>
                                                    )}
                                                    
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
        }
            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog 
                isOpen={deleteConfirmation.isOpen}
                onClose={closeDeleteConfirmation}
                title='Delete File'
                message="Are you sure want to delete this file? This action can't be undone"
                confirmText='Delete'
                cancelText='Cancel'
                onConfirm={handleDelete}
                confirmationButtonClass='bg-red-600 hover:bg-red-700'
            />

            {/* Share Link Modal */}
            <LinkShareModal 
                isOpen = {shareModal.isOpen}
                onClose = {closeShareModal}
                link = {shareModal.link}
                title = "Share File"

            />
            </div>
        </DashboardLayout>
    )
}

export default MyFiles
