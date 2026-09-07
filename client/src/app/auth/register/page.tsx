'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, Hexagon, CheckCircle2, Eye, EyeOff, KeyRound } from 'lucide-react';
import { authApi, beekeeperApi } from '@/lib/api';

export default function RegisterBeekeeperPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', password: '', confirmPassword: '',
    otp: '',
    kvicRegistrationId: '', aadhaarLast4: '', numberOfBeeBoxes: '', floralSources: [] as string[],
    village: '', district: '', state: '', pincode: '',
    accountNumber: '', ifscCode: '', bankName: ''
  });

  const updateForm = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));
  const handleCheckbox = (source: string) => {
    setFormData(prev => ({
      ...prev,
      floralSources: prev.floralSources.includes(source) 
        ? prev.floralSources.filter(s => s !== source)
        : [...prev.floralSources, source]
    }));
  };

  const handleRegister = async () => {
    setIsLoading(true); setError('');
    try {
      const userRes = await authApi.register({
        email: formData.email,
        password: formData.password,
        role: 'BEEKEEPER',
        fullName: formData.fullName,
        phone: formData.phone
      });
      
      if (!userRes.success) throw new Error(userRes.message || 'Failed to create user account');
      setRegisteredEmail(userRes.email || formData.email);
      if (userRes.token) {
        localStorage.setItem('honeychain_token', userRes.token);
        setStep(3); // Skip OTP step entirely
      } else {
        setStep(2); // Go to OTP step (legacy fallback)
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true); setError('');
    try {
      const verifyRes = await authApi.verifyOtp({
        email: registeredEmail,
        otp: formData.otp
      });
      
      if (!verifyRes.success) throw new Error(verifyRes.message || 'OTP verification failed');
      
      // Store token so subsequent requests are authenticated
      localStorage.setItem('honeychain_token', verifyRes.token || '');
      setStep(3); // Go to Profile Details step
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitProfile = async () => {
    setIsLoading(true); setError('');
    try {
      const profileRes = await beekeeperApi.submitProfile({
        fullName: formData.fullName,
        phone: formData.phone,
        kvicRegistrationId: formData.kvicRegistrationId,
        aadhaarLast4: formData.aadhaarLast4,
        numberOfBeeBoxes: parseInt(formData.numberOfBeeBoxes) || 0,
        floralSources: formData.floralSources,
        address: { village: formData.village, district: formData.district, state: formData.state, pincode: formData.pincode },
        bankDetails: { accountNumber: formData.accountNumber, ifscCode: formData.ifscCode, bankName: formData.bankName }
      });

      if (!profileRes.success) throw new Error(profileRes.message || 'Failed to create beekeeper profile');
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit profile');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    setError('');
    if (step === 1) {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match'); return;
      }
      handleRegister();
      return;
    }
    if (step === 2) {
      handleVerifyOtp();
      return;
    }
    setStep(s => Math.min(5, s + 1));
  };
  
  // Prevent going back to step 1 (Basic Info) if user is already created
  const prevStep = () => setStep(s => (s > 2 ? s - 1 : s));

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl text-center">
          <CheckCircle2 className="mx-auto h-20 w-20 text-green-500" />
          <h2 className="text-3xl font-extrabold text-gray-900">Registration Submitted!</h2>
          <p className="text-gray-500">Your email is verified and your profile is pending admin approval. You will receive an email once approved.</p>
          <Link href="/auth/login" className="block w-full py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-amber-500 hover:bg-amber-600">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-amber-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center mb-6">
        <Link href="/" className="inline-flex justify-center items-center gap-2">
          <Hexagon className="w-10 h-10 text-amber-500 fill-amber-500" />
          <span className="text-2xl font-extrabold text-amber-900">HoneyChain</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-xl shadow-amber-900/5 sm:rounded-2xl border border-amber-100">
          <div className="flex justify-between items-center mb-8 relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 -translate-y-1/2 rounded-full"></div>
            <div className={`absolute top-1/2 left-0 h-1 bg-amber-500 -z-10 -translate-y-1/2 rounded-full transition-all`} style={{ width: `${((step - 1) / 4) * 100}%` }}></div>
            {[1, 2, 3, 4, 5].map(s => (
              <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${step >= s ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                {s}
              </div>
            ))}
          </div>

          {error && <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">{error}</div>}

          <div className="space-y-4">
            {step === 1 && (
              <>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h3>
                <input type="text" placeholder="Full Name" className="w-full px-4 py-3 border rounded-xl" value={formData.fullName} onChange={e => updateForm('fullName', e.target.value)} />
                <input type="email" placeholder="Email Address" className="w-full px-4 py-3 border rounded-xl" value={formData.email} onChange={e => updateForm('email', e.target.value)} />
                <input type="tel" placeholder="Phone Number" className="w-full px-4 py-3 border rounded-xl" value={formData.phone} onChange={e => updateForm('phone', e.target.value)} />
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} placeholder="Password" className="w-full px-4 py-3 border rounded-xl pr-10" value={formData.password} onChange={e => updateForm('password', e.target.value)} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <div className="relative">
                  <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" className="w-full px-4 py-3 border rounded-xl pr-10" value={formData.confirmPassword} onChange={e => updateForm('confirmPassword', e.target.value)} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Verify Your Email</h3>
                <p className="text-sm text-gray-500 mb-4">We've sent a 6-digit verification code to <strong>{registeredEmail}</strong>.</p>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="text" maxLength={6} placeholder="Enter 6-digit OTP" className="w-full pl-12 pr-4 py-3 border rounded-xl font-mono text-lg tracking-[0.2em]" value={formData.otp} onChange={e => updateForm('otp', e.target.value)} />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Beekeeper Details</h3>
                <input type="text" placeholder="KVIC Registration ID" className="w-full px-4 py-3 border rounded-xl" value={formData.kvicRegistrationId} onChange={e => updateForm('kvicRegistrationId', e.target.value)} />
                <input type="text" placeholder="Aadhaar (Last 4 Digits)" maxLength={4} className="w-full px-4 py-3 border rounded-xl" value={formData.aadhaarLast4} onChange={e => updateForm('aadhaarLast4', e.target.value)} />
                <input type="number" placeholder="Number of Bee Boxes" className="w-full px-4 py-3 border rounded-xl" value={formData.numberOfBeeBoxes} onChange={e => updateForm('numberOfBeeBoxes', e.target.value)} />
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Floral Sources</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Mustard', 'Litchi', 'Jamun', 'Eucalyptus', 'Multifloral', 'Sunflower', 'Other'].map(source => (
                      <label key={source} className="flex items-center space-x-2">
                        <input type="checkbox" checked={formData.floralSources.includes(source)} onChange={() => handleCheckbox(source)} className="rounded text-amber-500 focus:ring-amber-500" />
                        <span className="text-sm text-gray-700">{source}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Address</h3>
                <input type="text" placeholder="Village / City" className="w-full px-4 py-3 border rounded-xl" value={formData.village} onChange={e => updateForm('village', e.target.value)} />
                <input type="text" placeholder="District" className="w-full px-4 py-3 border rounded-xl" value={formData.district} onChange={e => updateForm('district', e.target.value)} />
                <select className="w-full px-4 py-3 border rounded-xl text-gray-700" value={formData.state} onChange={e => updateForm('state', e.target.value)}>
                  <option value="">Select State</option>
                  <option value="AP">Andhra Pradesh</option>
                  <option value="AR">Arunachal Pradesh</option>
                  <option value="AS">Assam</option>
                  <option value="BR">Bihar</option>
                  <option value="CG">Chhattisgarh</option>
                  <option value="GA">Goa</option>
                  <option value="GJ">Gujarat</option>
                  <option value="HR">Haryana</option>
                  <option value="HP">Himachal Pradesh</option>
                  <option value="JH">Jharkhand</option>
                  <option value="KA">Karnataka</option>
                  <option value="KL">Kerala</option>
                  <option value="MP">Madhya Pradesh</option>
                  <option value="MH">Maharashtra</option>
                  <option value="MN">Manipur</option>
                  <option value="ML">Meghalaya</option>
                  <option value="MZ">Mizoram</option>
                  <option value="NL">Nagaland</option>
                  <option value="OD">Odisha</option>
                  <option value="PB">Punjab</option>
                  <option value="RJ">Rajasthan</option>
                  <option value="SK">Sikkim</option>
                  <option value="TN">Tamil Nadu</option>
                  <option value="TG">Telangana</option>
                  <option value="TR">Tripura</option>
                  <option value="UP">Uttar Pradesh</option>
                  <option value="UK">Uttarakhand</option>
                  <option value="WB">West Bengal</option>
                </select>
                <input type="text" placeholder="Pincode" className="w-full px-4 py-3 border rounded-xl" value={formData.pincode} onChange={e => updateForm('pincode', e.target.value)} />
              </>
            )}

            {step === 5 && (
              <>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Bank Details (Optional)</h3>
                <input type="text" placeholder="Bank Name" className="w-full px-4 py-3 border rounded-xl" value={formData.bankName} onChange={e => updateForm('bankName', e.target.value)} />
                <input type="text" placeholder="Account Number" className="w-full px-4 py-3 border rounded-xl" value={formData.accountNumber} onChange={e => updateForm('accountNumber', e.target.value)} />
                <input type="text" placeholder="IFSC Code" className="w-full px-4 py-3 border rounded-xl" value={formData.ifscCode} onChange={e => updateForm('ifscCode', e.target.value)} />
              </>
            )}
          </div>

          <div className="mt-8 flex justify-between">
            {step > 2 ? (
              <button onClick={prevStep} className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </button>
            ) : <div></div>}

            {step < 5 ? (
              <button onClick={nextStep} disabled={isLoading} className="flex items-center px-6 py-2 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 disabled:opacity-50">
                {isLoading ? 'Processing...' : 'Next'} <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            ) : (
              <button onClick={handleSubmitProfile} disabled={isLoading} className="flex items-center px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50">
                {isLoading ? 'Submitting...' : 'Submit Registration'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
