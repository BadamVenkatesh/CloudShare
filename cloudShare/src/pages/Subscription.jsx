import React, { useContext, useEffect, useRef, useState } from 'react'
import DashboardLayout from '../layout/DashboardLayout'
import { useAuth, useUser } from '@clerk/clerk-react';
import { UserCreditsContext } from '../context/UserCreditsContext';
import { apiEndpoints } from '../util/apiEndpoints';
import { AlertCircle, Check, CreditCard, Loader2 } from 'lucide-react';
import axios from 'axios';

const Subscription = () => {
    const [processingPayment, setProcessingPayment] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);
    const { getToken } = useAuth();
    const razorpayScriptRef = useRef(null);
    const { credits, setCredits, fetchUserCredits } = useContext(UserCreditsContext);
    const user = useUser();
    const plans = [
        {
            id: "premium",
            name: "Premium",
            price: 500,
            credits: 500,
            features: [
                "500 file uploads",
                "Advanced file sharing",
                "Priority Email support",
            ],
            recommended: false
        },
        {
            id: "ultimate",
            name: "Ultimate",
            price: 2500,
            credits: 5000,
            features: [
                "5000 file uploads",
                "Team sharing capabilities",
                "24/7 priority support",
                "Advanced Analytics"
            ],
            recommended: true
        }
    ];

    useEffect(() => {
        if (!window.Razorpay) {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
            script.onload = () => {
                console.log("Razorpay Script loaded successfully");
                setRazorpayLoaded(true);
            }
            script.onerror = () => {
                console.error("Failed to load Razorpay Script");
                setMessage("Payment Gateway Failed to load.Please refresh the page and try again.");
                setMessageType("error");
            }
            document.body.appendChild(script);
            razorpayScriptRef.current = script;
        } else {
            setRazorpayLoaded(true);
        }

        return () => {
            if (razorpayScriptRef.current) {
                document.body.removeChild(razorpayScriptRef.current);
            }
        };
    }, []);

    // Fetch the user Credits
    useEffect(() => {
        const fetchUserCredits = async () => {
            try {
                const token = await getToken();
                const response = await axios.get(apiEndpoints.GET_CREDITS, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                setCredits(response.data.credits)
            } catch (error) {
                console.error("Error Fetching User Credits: " + error);
                setMessage("Failed to load your current credits. Please try again later");
                setMessageType("error");
            }
        };
        fetchUserCredits();
    }, [getToken]);

    const handlePurchase = async (plan) => {
        if (!razorpayLoaded) {
            setMessage("Payment Gateway is still loading. Please wait a moment and try again.");
            setMessageType("error");
            return;
        }
        setProcessingPayment(true);
        setMessage("");
        try {
            const token = await getToken();
            const response = await axios.post(apiEndpoints.CREATE_ORDER, {
                planId: plan.id,
                amount: plan.price * 100, // Razorpay expects money in paisa
                currency: "INR",
                credits: plan.credits
            }, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY,
                amount: plan.price * 100,
                currency: "INR",
                name: "CloudShare",
                description: `Purchase ${plan.credits} credist`,
                order_id: response.data.orderId,
                handler: async function (response) {
                    try {
                        const verifyResponse = await axios.post(apiEndpoints.VERIFY_PAYMENT, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            planId: plan.id
                        }, {
                            headers: {
                                "Authorization": `Bearer ${token}`
                            }
                        });

                        if (verifyResponse.data.success) {
                            if (verifyResponse.data.credits) {
                                console.log("Updating Credits to: ", verifyResponse.data.credits);
                                setCredits(verifyResponse.data.credits);
                            } else {
                                console.log("Credits not in response, fetching latest Credits");
                                await fetchUserCredits();
                            }
                            setMessage(`Payment Successful! ${plan.name} plan Activated.`)
                            setMessageType("success");
                        } else {
                            setMessage(`Payment Verification Failed! Please Contact Support`)
                            setMessageType("error");
                        }
                    } catch (error) {
                        console.error("Payment Verification error: " + error);
                        setMessage("Payment Verification Failed! Please Contact Support");
                        setMessageType("error");
                    }
                },
                prefill: {
                    name: user.fullname,
                    email: user.primaryEmailAddress
                },
                theme: {
                    color: "#3B82F6"
                }
            };

            if (window.Razorpay) {
                const razorpay = new window.Razorpay(options);
                razorpay.open();
            } else {
                throw new Error("Razorpay SDK not loaded");
            }

        } catch (error) {
            console.error("Payment Intialization error: " + error);
            setMessage("Failed to initate Payment! Please try again later.");
            setMessageType("error");
        }finally{
            setProcessingPayment(false); 
        }
    }

    return (
        <DashboardLayout activeMenu="Subscription">
            <div className='p-6'>
                <h1 className='text-2xl font-bold mb-2'>Subsctiption Plans</h1>
                <p className='text-gray-600 mb-6'>Choose a plan that works for you</p>

                {message && (
                    <div className={`mb-6 p-6 rounded-lg flex items-center gap-3 ${messageType === 'error' ? "bg-red-50 text-red-700" : messageType === "success" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}>
                        {messageType === "error" && <AlertCircle size={20} />}
                        {message}
                    </div>
                )}

                <div className='flex flex-col md:flex-row gap-6 mb-8'>
                    <div className='bg-blue-50 p-6 rounded-lg'>
                        <div className='flex items-center gap-2 mb-4'>
                            <CreditCard className='text-purple-500' />
                            <h2 className='text-lg font-medium'>Current Credits: <span className='font-bold text-purple-500'>{credits}</span></h2>
                        </div>
                        <p className='text-sm text-gray-600 mt-2'>
                            You can upload {credits} more files with your current credits.
                        </p>
                    </div>
                </div>

                <div className='grid md:grid-cols-2 gap-6'>
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`border rounded-xl p-6 ${plan.recommended ?
                                "border-purple-200 bg-purple-50 shadow-md" :
                                "border-gray-200 bg-white"
                                }`}>
                            {plan.recommended && (
                                <div className='inline-block bg-purple-500 text-white text-xs font-semibold'>RECOMMEDED</div>
                            )}
                            <h3 className='text-xl font-bold'>{plan.name}</h3>
                            <div className='mt-2 mb-4'>
                                <span className='text-3xl font-bold'>${plan.price}</span>
                                <span className='text-gray-500'>for {plan.credits} credits</span>
                            </div>
                            <ul className='space-y-3 mb-6'>
                                {plan.features.map((feature, index) => (
                                    <li key={index} className='flex items-start'>
                                        <Check size={18} className='text-green-500 mr-2 mt-0.5 flex-shrink' />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => handlePurchase(plan)}
                                disabled={processingPayment}
                                className={`w-full py-2 rounded-full font-medium transition-colors ${plan.recommended ? "bg-purple-500 text-white hover:bg-purple-600" : "bg-white border border-purple-500 text-purple-500 hover:bg-gray-200"} disabled:opacity-50 flex items-center justify-center gap-2`}
                            >
                                {processingPayment ? (
                                    <>
                                        <Loader2 size={16} className='animate-spin' />
                                        <span>Processing...</span>
                                    </>
                                )
                                    :
                                    (
                                        <>
                                            <span>Purchase Plan</span>
                                        </>
                                    )
                                }
                            </button>
                        </div>
                    ))}
                </div>

                <div className='mt-8 bg-gray-50 p-4 rounded-lg border border-gray-200'>
                    <h3 className='font-medium mb-2'>How Credits Work</h3>
                    <p className='text-sm text-gray-600'>
                        Each file upload consumes 1 credit. New users start with 5 free Credits.
                        Credits never expire and can be used at any time. If you run out of credits, you can purchase more through one of our plans above.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default Subscription
