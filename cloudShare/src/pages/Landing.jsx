import React, { useEffect } from 'react'
import HeroSection from '../components/landing/HeroSection'
import FeatureSection from '../components/landing/FeatureSection'
import PricingSection from '../components/landing/PricingSection'
import TestimonialSection from '../components/landing/TestimonialSection'
import CTASection from '../components/landing/CTASection'
import Footer from '../components/landing/Footer'
import { features, pricingPlans, testimonials } from '../assets/data'
import { useClerk, useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'

const Landing = () => {
    const {openSignIn,openSignUp} = useClerk();
    const {isSignedIn} = useUser();
    const navigate = useNavigate();

    useEffect(()=>{
        if(isSignedIn){
            navigate("/dashboard")
        }
    },[isSignedIn,navigate])

    return (
        <div className='landing-page bg-gradient-to-b from-gray-50 to-gray-100'>
            {/* Hero Section */}
            <HeroSection  openSignIn={openSignIn} openSignUp={openSignUp}/>

            {/* Features Section */}
            <FeatureSection features={features}/>

            {/* Pricing Section */}
            <PricingSection pricingPlans={pricingPlans} openSignUp={openSignUp}/>

            {/* Testimonials section */}
            <TestimonialSection testimonials={testimonials}/>

            {/* CTA section */}
            <CTASection openSignUp={openSignUp}/>

            {/* Footer section */}
            <Footer />
        </div>
    )
}

export default Landing
