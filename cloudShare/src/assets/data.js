import { CreditCard, Files, LayoutDashboard, Receipt, Upload } from "lucide-react"
import Transactions from "../pages/Transactions"

export const features = [
    {
        iconName : "ArrowUpCircle",
        iconColor : "text-purple-500",
        title : "Easy File Upload",
        description : "Quickly upload your files with our intuitive drag-and-drop interface."
    },
    {
        iconName : "Shield",
        iconColor : "text-green-500",
        title : "Secure Storage",
        description : "Your files are encrypted and stored securely in our cloud infrastructure."
    },
    {
        iconName : "Share2",
        iconColor : "text-purple-500",
        title : "Simple Sharing",
        description : "Share files with anyone using secure links that you control."
    },
    {
        iconName : "CreditCard",
        iconColor : "text-orange-500",
        title : "Flexible Credits",
        description : "Pay only for what you use with our credit-based system."
    },
    {
        iconName : "FileText",
        iconColor : "text-red-500",
        title : "File Management",
        description : "Organize, preview, and manage you files from any device."
    },
    {
        iconName : "Clock",
        iconColor : "text-indigo-500",
        title : "Transaction History",
        description : "Keep track of all you credit purchases and usage."
    },
]

export const pricingPlans = [
    {
        name : "Free",
        price : "0",
        description : "Perfect for getting started",
        features : [
            "5 file uploads",
            "Basic file sharing",
            "7-day file retention",
            "Email support"
        ],
        cta : "Get Started",
        highlighted : false
    },
    {
        name : "Premium",
        price : "500",
        description : "For individuals with longer needs",
        features : [
            "500 file uploads",
            "Advanced file sharing",
            "30-day file retention",
            "Priority Email support",
            "File analytics",
        ],
        cta : "Go Premium",
        highlighted : true
    },{
        name : "Ultimate",
        price : "2500",
        description : "For teams and businesses",
        features : [
            "5000 file uploads",
            "Team sharing capabilities",
            "Unlimited file retention",
            "24/7 priority support",
            "Advanced analytics",
            "API access"
        ],
        cta : "Go Ultimate",
        highlighted : false
    },
]

export const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Freelance Designer",
    company: "Creative Studio",
    image: "https://images.squarespace-cdn.com/content/v1/66a4f1fc404ca05cac7d8ec8/385bc62c-b298-42f8-8f81-a931820c7a8f/Designer%2BHeadshots%2BFemale",
    quote: "Working with this platform has transformed how I collaborate with clients. It's seamless and efficient!",
    rating: 5
  },
  {
    name: "Michael Lee",
    role: "Software Engineer",
    company: "TechWorks",
    image: "https://headshots-inc.com/wp-content/uploads/2023/02/creative-headshot-photography-Example-1.jpg",
    quote: "The service exceeded my expectations. Everything was delivered on time with great attention to detail.",
    rating: 4
  },
  {
    name: "Emma Rodriguez",
    role: "Marketing Specialist",
    company: "BrightPath Agency",
    image: "https://images.squarespace-cdn.com/content/v1/66a4f1fc404ca05cac7d8ec8/815061e5-41c2-4035-a0d3-4d562d8a9b24/Designer%2BHeadshot%2BFemale",
    quote: "Absolutely fantastic experience! The team was professional, creative, and very responsive.",
    rating: 5
  }
]

export const SIDE_MENU_DATA = [
    {
        id:"01",
        label:"Dashboard",
        icon:LayoutDashboard,
        path:"/dashboard"
    },
    {
        id:"02",
        label:"Upload",
        icon:Upload,
        path:"/upload"
    },
    {
        id:"03",
        label:"My Files",
        icon:Files,
        path:"/my-files"
    },
    {
        id:"04",
        label:"Subscription",
        icon:CreditCard,
        path:"/subscriptions"
    },
    {
        id:"05",
        label:"Transactions",
        icon: Receipt,
        path:"/transactions"
    },
]