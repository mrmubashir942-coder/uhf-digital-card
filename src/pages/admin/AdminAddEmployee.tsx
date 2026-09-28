import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.ts';
import { Input } from '../../components/common/Input.tsx';
import { Button } from '../../components/common/Button.tsx';
import { QRCodeModal } from '../../components/card/QRCodeModal.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { uploadProfilePhoto } from '../../lib/storage.ts';
import {
  User,
  Mail,
  Lock,
  Briefcase,
  Building,
  Phone,
  MessageSquare,
  Globe,
  Linkedin,
  MapPin,
  Camera,
  CheckCircle2,
  ArrowLeft,
  ExternalLink,
  QrCode,
  Loader2,
} from 'lucide-react';

interface AdminAddEmployeeProps {
  onNavigate: (path: string) => void;
}

export const AdminAddEmployeePage: React.FC<AdminAddEmployeeProps> = ({ onNavigate }) => {
  const { showToast } = useToast();

  const [employeeId, setEmployeeId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('Password123!');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('IT & Engineering');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [officePhone, setOfficePhone] = useState('+1 (800) 555-0199');
  const [linkedin, setLinkedin] = useState('');
  const [website, setWebsite] = useState('https://uhfsolutions.com');
  const [officeAddress, setOfficeAddress] = useState(
    'Suite 400, Technology Park, Silicon Boulevard, CA 94025'
  );
  const [bio, setBio] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [createdEmployee, setCreatedEmployee] = useState<any>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  // Auto-fetch next available ID on mount
  useEffect(() => {
    api.admin
      .getNextId()
      .then((res) => {
        setEmployeeId(res.nextId);
      })
      .catch((err) => {
        console.error('Failed to get next ID:', err);
        setEmployeeId('UHF-004');
      });
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const currentEmpId = employeeId.trim() || 'employee';
      const { url } = await uploadProfilePhoto(file, currentEmpId);
      setProfilePhoto(url);
      setPhotoUrlInput('');
      showToast('Photo uploaded to Firebase Storage', 'success');
    } catch (storageErr: any) {
      console.warn('Firebase Storage upload error, falling back to local preview:', storageErr);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setProfilePhoto(reader.result);
          setPhotoUrlInput('');
          showToast('Photo loaded locally', 'info');
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleApplyUrl = () => {
    if (!photoUrlInput.trim()) return;
    setProfilePhoto(photoUrlInput.trim());
    showToast('Photo URL set', 'info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !fullName || !email || !designation || !department) {
      showToast('Please fill out all required corporate fields.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.admin.createEmployee({
        employeeId: employeeId.trim().toUpperCase(),
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        temporaryPassword,
        designation: designation.trim(),
        department: department.trim(),
        phone: phone.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        companyEmail: companyEmail.trim() || email.trim().toLowerCase(),
        officePhone: officePhone.trim() || undefined,
        linkedin: linkedin.trim() || undefined,
        website: website.trim() || undefined,
        officeAddress: officeAddress.trim() || undefined,
        bio: bio.trim() || undefined,
        profilePhoto: profilePhoto || undefined,
        status,
        role: 'EMPLOYEE',
      });

      setCreatedEmployee(res.employee);
      showToast(`Employee ${res.employee.employeeId} registered successfully!`, 'success');
    } catch (err: any) {
      console.error('Create employee error:', err);
      showToast(err.message || 'Failed to create employee.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => onNavigate('/admin/employees')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Employee List</span>
        </button>
      </div>

      {createdEmployee ? (
        /* Post-Creation Success Card */
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
            Employee Created Successfully!
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Account, credentials, public digital card, and QR code are now live.
          </p>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 max-w-md mx-auto text-left space-y-2 mb-6 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50">
              <span className="text-slate-400">Employee ID:</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                {createdEmployee.employeeId}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50">
              <span className="text-slate-400">Full Name:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {createdEmployee.profile.fullName}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50">
              <span className="text-slate-400">Designation:</span>
              <span>{createdEmployee.profile.designation}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50">
              <span className="text-slate-400">Login Email:</span>
              <span>{createdEmployee.email}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Temporary Password:</span>
              <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                {temporaryPassword}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => onNavigate(`/card/${createdEmployee.employeeId}`)}
              leftIcon={<ExternalLink className="w-4 h-4" />}
            >
              View Public Card
            </Button>

            <Button
              variant="secondary"
              onClick={() => setShowQrModal(true)}
              leftIcon={<QrCode className="w-4 h-4 text-blue-400" />}
            >
              View & Download QR Code
            </Button>

            <Button
              variant="primary"
              onClick={() => onNavigate('/admin/employees')}
            >
              Return to Directory
            </Button>
          </div>

          {/* QR Modal */}
          {showQrModal && (
            <QRCodeModal
              isOpen={showQrModal}
              onClose={() => setShowQrModal(false)}
              employeeId={createdEmployee.employeeId}
              fullName={createdEmployee.profile.fullName}
              designation={createdEmployee.profile.designation}
            />
          )}
        </div>
      ) : (
        /* Add Employee Form */
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              New Employee Registration
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Create an employee account, provision corporate contact data, and generate digital card.
            </p>

            {/* Profile Photo */}
            <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-2">
                Employee Portrait Photo
              </label>
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-full border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-slate-400" />
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <label className={`cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors ${isUploadingPhoto ? 'opacity-70 pointer-events-none' : ''}`}>
                      {isUploadingPhoto ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      ) : (
                        <Camera className="w-3.5 h-3.5 text-blue-600" />
                      )}
                      <span>{isUploadingPhoto ? 'Uploading to Firebase...' : 'Upload File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingPhoto}
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    {profilePhoto && (
                      <button
                        type="button"
                        disabled={isUploadingPhoto}
                        onClick={() => setProfilePhoto('')}
                        className="text-xs text-rose-500 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 max-w-md">
                    <input
                      type="url"
                      placeholder="Or paste image URL (Unsplash, etc.)"
                      value={photoUrlInput}
                      onChange={(e) => setPhotoUrlInput(e.target.value)}
                      className="text-xs px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex-1 outline-none"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleApplyUrl}
                    >
                      Set
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Core Identification */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Input
                label="Full Name"
                id="add-fullname"
                type="text"
                placeholder="e.g. Tariq Mehmood"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
                required
              />

              <Input
                label="Employee ID (Unique)"
                id="add-empid"
                type="text"
                placeholder="e.g. UHF-004"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                leftIcon={<Briefcase className="w-4 h-4" />}
                helperText="Will form public digital card URL /card/UHF-xxx"
                required
              />

              <Input
                label="Email (Login Username)"
                id="add-email"
                type="email"
                placeholder="tariq@uhfsolutions.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Input
                label="Temporary Password"
                id="add-password"
                type="text"
                placeholder="Password123!"
                value={temporaryPassword}
                onChange={(e) => setTemporaryPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                helperText="Employee can change this after first login."
                required
              />

              <Input
                label="Official Designation"
                id="add-designation"
                type="text"
                placeholder="e.g. Lead QA Engineer"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                leftIcon={<Briefcase className="w-4 h-4" />}
                required
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Department *
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="IT & Engineering">IT & Engineering</option>
                  <option value="Creative & Design">Creative & Design</option>
                  <option value="Operations & PMO">Operations & PMO</option>
                  <option value="Executive Administration">Executive Administration</option>
                  <option value="Sales & Business Development">Sales & Business Development</option>
                  <option value="Quality Assurance">Quality Assurance</option>
                </select>
              </div>
            </div>

            {/* Contact Details */}
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-6 mb-3">
              Contact & Social Channels
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Direct Mobile Phone"
                id="add-phone"
                type="tel"
                placeholder="+1 (555) 789-0123"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone className="w-4 h-4" />}
              />

              <Input
                label="WhatsApp Number"
                id="add-whatsapp"
                type="tel"
                placeholder="+15557890123"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                leftIcon={<MessageSquare className="w-4 h-4" />}
              />

              <Input
                label="Company Email"
                id="add-company-email"
                type="email"
                placeholder="Leave blank to use login email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <Input
                label="Office Landline Phone"
                id="add-officephone"
                type="tel"
                value={officePhone}
                onChange={(e) => setOfficePhone(e.target.value)}
                leftIcon={<Building className="w-4 h-4" />}
              />

              <Input
                label="LinkedIn Profile URL"
                id="add-linkedin"
                type="url"
                placeholder="https://linkedin.com/in/username"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                leftIcon={<Linkedin className="w-4 h-4" />}
              />

              <Input
                label="Website URL"
                id="add-website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                leftIcon={<Globe className="w-4 h-4" />}
              />
            </div>

            {/* Office Address & Bio */}
            <div className="mt-4 space-y-4">
              <Input
                label="Office Location Address"
                id="add-address"
                type="text"
                value={officeAddress}
                onChange={(e) => setOfficeAddress(e.target.value)}
                leftIcon={<MapPin className="w-4 h-4" />}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Bio / Introduction
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Professional background summary..."
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs p-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Status Radio */}
              <div className="pt-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-2">
                  Account Status
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="status"
                      value="ACTIVE"
                      checked={status === 'ACTIVE'}
                      onChange={() => setStatus('ACTIVE')}
                      className="text-blue-600"
                    />
                    <span className="font-semibold text-emerald-600">Active (Live Card & Login)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="status"
                      value="INACTIVE"
                      checked={status === 'INACTIVE'}
                      onChange={() => setStatus('INACTIVE')}
                      className="text-blue-600"
                    />
                    <span className="font-semibold text-slate-500">Inactive (Disabled)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onNavigate('/admin/employees')}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Create Employee Account
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
