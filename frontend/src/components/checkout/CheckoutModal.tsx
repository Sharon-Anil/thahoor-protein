import { useState } from 'react';
import { X, MapPin, User, Phone, Home, CreditCard, Banknote, UploadCloud, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import qrCode from '../../assets/payment-qr.jpg';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (details: { name: string; phone: string; address: any; location: any; paymentMethod: 'COD' | 'Online'; paymentProof?: string }) => void;
    totalAmount: number;
}

export function CheckoutModal({ isOpen, onClose, onSubmit, totalAmount }: CheckoutModalProps) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState({
        street: '',
        city: '',
        pincode: '',
        landmark: ''
    });
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Online'>('COD');
    const [paymentProof, setPaymentProof] = useState<string>('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPaymentProof(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ name, phone, address, location, paymentMethod, paymentProof });
    };

    const getCurrentLocation = () => {
        setLoadingLocation(true);
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setLoadingLocation(false);
                },
                (error) => {
                    console.error("Error getting location", error);
                    setLoadingLocation(false);
                    let errorMessage = "Could not get location.";
                    if (error.code === 1) errorMessage = "Location permission denied.";
                    else if (error.code === 2) errorMessage = "Location unavailable.";
                    else if (error.code === 3) errorMessage = "Location request timed out.";
                    alert(`${errorMessage} Please enter address manually.`);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            setLoadingLocation(false);
            alert("Geolocation is not supported by your browser");
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-stone-900/70 backdrop-blur-md"
                />
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 30 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
                >
                    {/* Left Column - Order Summary & Payment Info (Visible on larger screens or stacked) */}
                    <div className="hidden md:flex flex-col w-[35%] bg-stone-50 border-r border-stone-200 p-8">
                        <div className="flex-1">
                            <h3 className="text-xl font-display font-bold text-stone-900 mb-6">Order Summary</h3>
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 flex flex-col gap-2">
                                <span className="text-sm font-medium text-stone-500">Total to Pay</span>
                                <span className="text-4xl font-bold text-primary">₹{totalAmount.toFixed(0)}</span>
                            </div>
                            
                            <div className="space-y-4 mt-8">
                                <div className="flex items-center gap-3 text-sm text-stone-600">
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                        <CheckCircle2 size={16} />
                                    </div>
                                    <p>Fast delivery within your area</p>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-stone-600">
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                        <CheckCircle2 size={16} />
                                    </div>
                                    <p>Fresh, high-quality cuts</p>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-stone-600">
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                        <CheckCircle2 size={16} />
                                    </div>
                                    <p>Safe and hygienic packaging</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-stone-200">
                            <p className="text-xs text-stone-500 leading-relaxed">
                                By placing this order, you agree to our terms and conditions. Orders will be verified via WhatsApp.
                            </p>
                        </div>
                    </div>

                    {/* Right Column - Form */}
                    <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 sm:p-8 border-b border-stone-100 z-10 bg-white/80 backdrop-blur-md sticky top-0">
                            <div>
                                <h2 className="text-2xl font-display font-bold text-stone-900">Checkout</h2>
                                <p className="text-sm text-stone-500 mt-1">Complete your delivery details</p>
                            </div>
                            <button 
                                onClick={onClose} 
                                className="w-10 h-10 rounded-full bg-stone-50 hover:bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-900 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrolling Form Container */}
                        <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
                            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
                                
                                {/* 1. Contact Info */}
                                <section>
                                    <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">1</span>
                                        Contact Information
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                                                <User size={18} />
                                            </div>
                                            <input
                                                required
                                                type="text"
                                                placeholder="Full Name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                                                <Phone size={18} />
                                            </div>
                                            <input
                                                required
                                                type="tel"
                                                placeholder="Phone Number"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* 2. Delivery Address */}
                                <section>
                                    <div className="flex justify-between items-end mb-4">
                                        <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">2</span>
                                            Delivery Address
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={getCurrentLocation}
                                            disabled={loadingLocation}
                                            className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium transition-colors"
                                        >
                                            <MapPin size={14} className={loadingLocation ? "animate-bounce" : ""} />
                                            {loadingLocation ? 'Locating...' : 'Auto-Locate'}
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {location && (
                                            <motion.div 
                                                initial={{ opacity: 0, height: 0 }} 
                                                animate={{ opacity: 1, height: 'auto' }} 
                                                className="bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2 border border-green-100"
                                            >
                                                <CheckCircle2 size={16} /> Location captured successfully!
                                            </motion.div>
                                        )}
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="relative md:col-span-2">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                                                    <Home size={18} />
                                                </div>
                                                <input
                                                    required
                                                    placeholder="House No., Building Name, Street"
                                                    value={address.street}
                                                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                />
                                            </div>

                                            <div className="relative">
                                                <input
                                                    required
                                                    placeholder="City"
                                                    value={address.city}
                                                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="relative">
                                                <input
                                                    required
                                                    placeholder="Pincode"
                                                    value={address.pincode}
                                                    onChange={(e) => setAddress({ ...address, pincode: e.target.value.slice(0, 6) })}
                                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="relative md:col-span-2">
                                                 <input
                                                    placeholder="Landmark (Optional)"
                                                    value={address.landmark}
                                                    onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* 3. Payment Method */}
                                <section>
                                     <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">3</span>
                                        Payment Method
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <label 
                                            className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                                paymentMethod === 'COD' 
                                                ? 'border-primary bg-primary/5' 
                                                : 'border-stone-200 hover:border-stone-300 bg-white'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="COD"
                                                checked={paymentMethod === 'COD'}
                                                onChange={() => setPaymentMethod('COD')}
                                                className="sr-only"
                                            />
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${paymentMethod === 'COD' ? 'bg-primary/20 text-primary' : 'bg-stone-100 text-stone-500'}`}>
                                                    <Banknote size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-stone-900">Cash on Delivery</div>
                                                    <div className="text-xs text-stone-500">Pay at your doorstep</div>
                                                </div>
                                            </div>
                                            {paymentMethod === 'COD' && (
                                                <div className="absolute top-4 right-4 text-primary">
                                                    <CheckCircle2 size={20} />
                                                </div>
                                            )}
                                        </label>

                                        <label 
                                            className={`relative flex flex-col justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                                paymentMethod === 'Online' 
                                                ? 'border-primary bg-primary/5' 
                                                : 'border-stone-200 hover:border-stone-300 bg-white'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="Online"
                                                checked={paymentMethod === 'Online'}
                                                onChange={() => setPaymentMethod('Online')}
                                                className="sr-only"
                                            />
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${paymentMethod === 'Online' ? 'bg-primary/20 text-primary' : 'bg-stone-100 text-stone-500'}`}>
                                                    <CreditCard size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-stone-900">Pay Online</div>
                                                    <div className="text-xs text-stone-500">Scan QR & Upload Proof</div>
                                                </div>
                                            </div>
                                            {paymentMethod === 'Online' && (
                                                <div className="absolute top-4 right-4 text-primary">
                                                    <CheckCircle2 size={20} />
                                                </div>
                                            )}
                                        </label>
                                    </div>

                                    {/* Online Payment Details */}
                                    <AnimatePresence>
                                        {paymentMethod === 'Online' && (
                                            <motion.div 
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="overflow-hidden mt-4"
                                            >
                                                <div className="bg-stone-50 rounded-2xl border border-stone-200 p-6 flex flex-col md:flex-row gap-6 items-center">
                                                    <div className="bg-white p-3 rounded-xl shadow-sm border border-stone-100 shrink-0">
                                                        <img src={qrCode} alt="Payment QR" className="w-32 h-32 object-contain" />
                                                    </div>
                                                    <div className="flex-1 w-full text-center md:text-left">
                                                        <h4 className="font-bold text-stone-900 text-lg mb-1">+91 96052 06865</h4>
                                                        <p className="text-sm text-stone-500 mb-4">Pay via GPay, PhonePe, or Paytm</p>
                                                        
                                                        <label className="relative flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-stone-300 rounded-xl bg-white hover:bg-stone-50 transition-colors cursor-pointer group">
                                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                                {paymentProof ? (
                                                                    <div className="flex items-center gap-2 text-green-600">
                                                                        <CheckCircle2 size={24} />
                                                                        <span className="font-medium text-sm">Screenshot Uploaded</span>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <UploadCloud className="w-6 h-6 text-stone-400 group-hover:text-primary mb-2 transition-colors" />
                                                                        <p className="text-xs text-stone-500 font-medium">Click to upload screenshot *</p>
                                                                    </>
                                                                )}
                                                            </div>
                                                            <input
                                                                required
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={handleFileChange}
                                                                className="hidden"
                                                            />
                                                        </label>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </section>
                            </form>
                        </div>

                        {/* Footer / Submit Button */}
                        <div className="p-6 border-t border-stone-100 bg-white z-10 md:hidden pb-safe">
                             <div className="flex justify-between items-center mb-4">
                                <span className="text-sm font-medium text-stone-500">Total to Pay</span>
                                <span className="text-2xl font-bold text-primary">₹{totalAmount.toFixed(0)}</span>
                            </div>
                            <button
                                form="checkout-form"
                                type="submit"
                                disabled={!name || !phone || !address.street || !address.city || !address.pincode || (paymentMethod === 'Online' && !paymentProof)}
                                className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 disabled:bg-stone-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                            >
                                Place Order <ChevronRight size={20} />
                            </button>
                        </div>
                        
                        {/* Footer for Desktop */}
                        <div className="hidden md:block p-6 sm:p-8 border-t border-stone-100 bg-white z-10 w-full relative">
                           <div className="flex justify-end w-full">
                                <button
                                    form="checkout-form"
                                    type="submit"
                                    disabled={!name || !phone || !address.street || !address.city || !address.pincode || (paymentMethod === 'Online' && !paymentProof)}
                                    className="min-w-[240px] py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 disabled:bg-stone-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                                >
                                    Confirm Order <ChevronRight size={20} />
                                </button>
                           </div>
                        </div>

                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
