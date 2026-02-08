import { SignedIn, useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { createContext, useCallback, useEffect, useState } from "react";
import { apiEndpoints } from "../util/apiEndpoints";
import toast from "react-hot-toast";

export const UserCreditsContext = createContext(); 

export const UserCreditsProvider = ({children}) =>{

    const [credits,setCredits] = useState(5);
    const [loading,setLoading] = useState(false); 
    const {getToken, isSignedIn} = useAuth();

    // Funtion to fetch user Credits that can be called from anywhere
    const fetchUserCredits = useCallback( async () =>{
        if(!isSignedIn) return;

        setLoading(true);
        try {
            const token = await getToken();
            console.log("Token being used:", token);
            const response = await axios.get(apiEndpoints.GET_CREDITS,{headers:{Authorization:`Bearer ${token}`}})
            if(response.status === 200){
                setCredits(response.data.credits);
            }else{
                console.log(response);
                toast.error("Error Fetching Credits");
            }
        } catch (error) {
            console.error("Error fetching user credits"+error);
        }finally{
            setLoading(false);
        }
    },[getToken,isSignedIn]);

    useEffect(()=>{
        if(isSignedIn){
            fetchUserCredits();
        }
    },[fetchUserCredits,isSignedIn]);

    const updateCredits = useCallback(async (newCredits)=>{
        setCredits(newCredits);
    },[])

    const contextValue = {
        credits,
        setCredits,
        fetchUserCredits,
        updateCredits
    }

    return(
        <UserCreditsContext.Provider value={contextValue}>
            {children}
        </UserCreditsContext.Provider>
    )
}