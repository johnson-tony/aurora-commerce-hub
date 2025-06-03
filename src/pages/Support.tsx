// src/pages/Support.tsx

import React, { useState } from 'react';
import Navigation from '@/components/Navigation';

// Placeholder for useToast (replace with your actual Shadcn useToast import and implementation)
const useToast = () => {
    return {
        toast: ({ title, description, variant }: { title: string; description: string; variant: "default" | "success" | "destructive" }) => {
            console.log(`Toast: ${title} - ${description} (Variant: ${variant})`);
            // In a real app, you'd use shadcnToast({ title, description, variant }) here.
        }
    };
};

interface FAQItem {
    question: string;
    answer: string;
}

const faqData: FAQItem[] = [
    {
        question: "How do I track my order?",
        answer: "Once your order has shipped, you will receive an email with a tracking number and a link to the carrier's website. You can also find tracking information in your 'My Orders' section.",
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit/debit cards (Visa, MasterCard, American Express), UPI, Net Banking, and select digital wallets.",
    },
    {
        question: "Can I change or cancel my order after it's placed?",
        answer: "Orders can only be canceled or modified if they are still in 'Pending' or 'Processing' status. Please contact support immediately if you need to make changes.",
    },
    {
        question: "What is your return policy?",
        answer: "Our return policy allows for returns within 30 days of purchase for most items, provided they are in their original condition. Please refer to our dedicated 'Returns & Refunds' page for full details.",
    },
    {
        question: "How do I reset my password?",
        answer: "You can reset your password by going to the 'Login' page and clicking on the 'Forgot Password?' link. Follow the instructions sent to your registered email address.",
    },
];

const Support: React.FC = () => {
    const [openFAQ, setOpenFAQ] = useState<number | null>(null); // State to manage open/closed FAQ items
    const [contactForm, setContactForm] = useState({
        topic: '',
        orderId: '',
        message: '',
        email: '', // Add email field for the user
    });
    const { toast } = useToast();

    const handleFAQToggle = (index: number) => {
        setOpenFAQ(openFAQ === index ? null : index);
    };

    const handleContactFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setContactForm({ ...contactForm, [name]: value });
    };

    const handleContactFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation
        if (!contactForm.topic || !contactForm.message || !contactForm.email) {
            toast({
                title: "Error",
                description: "Please fill in all required contact form fields (Topic, Email, Message).",
                variant: "destructive",
            });
            return;
        }

        console.log("Contact form submitted:", contactForm);
        // In a real application, you would send this data to your backend API
        // e.g., axios.post('/api/support-ticket', contactForm)
        // Then handle success/failure response

        toast({
            title: "Support Request Sent",
            description: "Your request has been submitted. We'll get back to you within 24-48 hours.",
            variant: "success",
        });

        // Clear form after submission
        setContactForm({ topic: '', orderId: '', message: '', email: '' });
    };

    return (
        <div className="min-h-screen bg-soft-ivory">
            <Navigation />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-4xl font-extrabold text-charcoal-gray mb-6 text-center">How Can We Help You?</h1>
                <p className="text-lg text-gray-700 mb-10 text-center max-w-2xl mx-auto">
                    Find answers to common questions or reach out to our support team directly.
                </p>

                {/* --- FAQ Section --- */}
                <div className="bg-white p-8 rounded-lg shadow-md mb-10 border border-gray-200">
                    <h2 className="text-3xl font-bold text-charcoal-gray mb-6 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqData.map((item, index) => (
                            <div key={index} className="border border-gray-200 rounded-md">
                                <button
                                    className="flex justify-between items-center w-full p-4 text-lg font-semibold text-left text-gray-800 hover:bg-gray-50 transition-colors"
                                    onClick={() => handleFAQToggle(index)}
                                >
                                    <span>{item.question}</span>
                                    <span>{openFAQ === index ? '-' : '+'}</span>
                                </button>
                                {openFAQ === index && (
                                    <div className="p-4 pt-0 text-gray-700 bg-gray-50 border-t border-gray-100">
                                        <p>{item.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- Contact Form Section --- */}
                <div className="bg-white p-8 rounded-lg shadow-md mb-10 border border-gray-200">
                    <h2 className="text-3xl font-bold text-charcoal-gray mb-6 text-center">Contact Our Support Team</h2>
                    <form onSubmit={handleContactFormSubmit} className="max-w-xl mx-auto space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Your Email Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={contactForm.email}
                                onChange={handleContactFormChange}
                                placeholder="name@example.com"
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                                Topic <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="topic"
                                name="topic"
                                value={contactForm.topic}
                                onChange={handleContactFormChange}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                required
                            >
                                <option value="">-- Select a Topic --</option>
                                <option value="Order Issue">Order Issue</option>
                                <option value="Payment Problem">Payment Problem</option>
                                <option value="Account Management">Account Management</option>
                                <option value="Returns & Refunds">Returns & Refunds</option>
                                <option value="Technical Support">Technical Support</option>
                                <option value="General Inquiry">General Inquiry</option>
                                <option value="Feedback/Suggestion">Feedback/Suggestion</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-1">
                                Order ID (Optional)
                            </label>
                            <input
                                type="text"
                                id="orderId"
                                name="orderId"
                                value={contactForm.orderId}
                                onChange={handleContactFormChange}
                                placeholder="e.g., ORD-12345"
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                Your Message <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                value={contactForm.message}
                                onChange={handleContactFormChange}
                                rows={6}
                                placeholder="Describe your issue or feedback in detail..."
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 resize-y"
                                required
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-md hover:bg-indigo-700 font-semibold shadow-md transition-colors text-lg"
                        >
                            Submit Request
                        </button>
                    </form>
                </div>

                {/* --- Other Contact & Self-Service Links (Optional) --- */}
                <div className="bg-white p-8 rounded-lg shadow-md mb-10 border border-gray-200 text-center">
                    <h2 className="text-3xl font-bold text-charcoal-gray mb-6">Need More Help?</h2>
                    <div className="flex flex-col md:flex-row justify-center items-center gap-6">
                        <div className="p-4 border border-gray-200 rounded-lg w-full md:w-auto flex-1">
                            <h3 className="font-semibold text-xl mb-2 text-indigo-700">Call Us</h3>
                            <p className="text-gray-800 text-lg font-medium">+91 98765 43210</p>
                            <p className="text-sm text-gray-600">Mon-Fri: 9 AM - 6 PM IST</p>
                        </div>
                        <div className="p-4 border border-gray-200 rounded-lg w-full md:w-auto flex-1">
                            <h3 className="font-semibold text-xl mb-2 text-indigo-700">Email Us</h3>
                            <p className="text-gray-800 text-lg font-medium">support@yourapp.com</p>
                            <p className="text-sm text-gray-600">Response within 24-48 hours</p>
                        </div>
                        {/* You can add a live chat button here that triggers a chat widget */}
                        <a href="/live-chat" className="bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 font-semibold shadow-md transition-colors text-lg w-full md:w-auto flex-1 flex items-center justify-center">
                            <span className="mr-2">💬</span> Live Chat (if available)
                        </a>
                    </div>
                    <div className="mt-8">
                        <p className="text-lg text-charcoal-gray mb-4">Quick Links:</p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <a href="/my-orders" className="text-indigo-600 hover:underline font-medium text-base">View My Orders</a>
                            <a href="/returns-policy" className="text-indigo-600 hover:underline font-medium text-base">Returns & Refunds Policy</a>
                            <a href="/privacy-policy" className="text-indigo-600 hover:underline font-medium text-base">Privacy Policy</a>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Support;