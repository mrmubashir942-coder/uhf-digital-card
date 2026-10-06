import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.ts';
import { FullEmployee, AccountStatus, Role } from '../../types/index.ts';
import { Input } from '../../components/common/Input.tsx';
import { Button } from '../../components/common/Button.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { uploadProfilePhoto } from '../../lib/storage.ts';
import {
  User,
  Mail,
  Briefcase,
  Phone,
  MessageSquare,
  Globe,
  Linkedin,
  Twitter,
  Github,
  MapPin,
  Camera,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Shield,
  Eye,
  Loader2,
} from 'lucide-react';

interface AdminEditEmployeeProps {
  employeeIdOrDbId: string;
  onNavigate: (path: string) => void;
}

export const AdminEditEmployeePage: React.FC<AdminEditEmployeeProps> = ({
  employeeIdOrDbId,
  onNavigate,
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [employee, setEmployee] = useState<FullEmployee | null>(null);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [officePhone, setOfficePhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [github, setGithub] = useState('');
  const [website, setWebsite] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [bio, setBio] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [status, setStatus] = useState<AccountStatus>('ACTIVE');
  const [role, setRole] = useState<Role>('EMPLOYEE');

  // Privacy toggles
  const [showPhone, setShowPhone] = useState(true);
  const [showWhatsapp, setShowWhatsapp] = useState(true);
  const [showEmail, setShowEmail] = useState(true);
  const [showLinkedin, setShowLinkedin] = useState(true);
  const [showTwitter, setShowTwitter] = useState(true);
  const [showGithub, setShowGithub] = useState(true);
  const [showAddress, setShowAddress] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.admin
      .getEmployee(employeeIdOrDbId)
      .then((data) => {
        if (isMounted) {
          setEmployee(data);
          setFullName(data.profile.fullName);
          setEmail(data.email);
          setDesignation(data.profile.designation);
          setDepartment(data.profile.department);
          setPhone(data.profile.phone || '');
          setWhatsapp(data.profile.whatsapp || '');
          setOfficePhone(data.profile.officePhone || '');
          setCompanyEmail(data.profile.companyEmail || '');
          setLinkedin(data.profile.linkedin || '');
          setTwitter(data.profile.twitter || '');
          setGithub(data.profile.github || '');
          setWebsite(data.profile.website || '');
          setOfficeAddress(data.profile.officeAddress || '');
          setBio(data.profile.bio || '');
          setProfilePhoto(data.profile.profilePhoto || '');
          setStatus(data.status);
          setRole(data.role);

          setShowPhone(data.profile.showPhone ?? true);
          setShowWhatsapp(data.profile.showWhatsapp ?? true);
          setShowEmail(data.profile.showEmail ?? true);
          setShowLinkedin(data.profile.showLinkedin ?? true);
          setShowTwitter(data.profile.showTwitter ?? true);
          setShowGithub(data.profile.showGithub ?? true);
          setShowAddress(data.profile.showAddress ?? true);
        }
      })
      .catch((err) => {
        console.error('Error fetching employee for editing:', err);
        showToast('Failed to load employee record', 'error');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [employeeIdOrDbId, showToast]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const currentEmpId = employee?.employeeId || 'employee';
      const { url } = await uploadProfilePhoto(file, currentEmpId);
      setProfilePhoto(url);
      setPhotoUrlInput('');
      showToast('Photo uploaded to Cloudinary', 'success');
    } catch (uploadErr: any) {
      console.error('Cloudinary photo upload error:', uploadErr);
      showToast(uploadErr.message || 'Failed to upload photo to Cloudinary.', 'error');
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
    if (!employee) return;

    setIsSaving(true);
    try {
      await api.admin.updateEmployee(employee.id, {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        designation: designation.trim(),
        department: department.trim(),
        phone: phone.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        officePhone: officePhone.trim() || undefined,
        companyEmail: companyEmail.trim() || undefined,
        linkedin: linkedin.trim() || undefined,
        twitter: twitter.trim() || undefined,
        github: github.trim() || undefined,
        website: website.trim() || undefined,
        officeAddress: officeAddress.trim() || undefined,
        bio: bio.trim() || undefined,
        profilePhoto: profilePhoto || undefined,
        status,
        role,
        showPhone,
        showWhatsapp,
        showEmail,
        showLinkedin,
        showTwitter,
        showGithub,
        showAddress,
      });

      showToast('Employee details updated successfully!', 'success');
      onNavigate('/admin/employees');
    } catch (err: any) {
      console.error('Failed to update employee:', err);
      showToast(err.message || 'Failed to update employee.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-slate-400">
        Loading employee details...
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-rose-500 mb-4">Employee record could not be found.</p>
        <Button variant="outline" onClick={() => onNavigate('/admin/employees')}>
          Back to Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => onNavigate('/admin/employees')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#111827] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Employee List</span>
        </button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate(`/card/${employee.employeeId}`)}
          leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
        >
          View Live Card
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-[#111827]">
                  Edit Employee: {employee.profile.fullName}
                </h1>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-50 text-[#2563EB] font-bold border border-blue-100">
                  {employee.employeeId}
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-1">
                Full administrator override for profile, permissions, status, and contact visibility.
              </p>
            </div>
          </div>

          {/* Photo */}
          <div className="mb-6 pb-6 border-b border-[#E5E7EB]">
            <label className="text-xs font-semibold text-[#111827] block mb-2">
              Profile Portrait Photo
            </label>
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full border-2 border-[#E5E7EB] bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-[#64748B]" />
                )}
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <label className={`cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-[#111827] hover:bg-slate-200 transition-colors ${isUploadingPhoto ? 'opacity-70 pointer-events-none' : ''}`}>
                    {isUploadingPhoto ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2563EB]" />
                    ) : (
                      <Camera className="w-3.5 h-3.5 text-[#2563EB]" />
                    )}
                    <span>{isUploadingPhoto ? 'Uploading...' : 'Upload Image'}</span>
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
                      className="text-xs text-[#DC2626] hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 max-w-md">
                  <input
                    type="url"
                    placeholder="Or enter image URL"
                    value={photoUrlInput}
                    onChange={(e) => setPhotoUrlInput(e.target.value)}
                    className="text-xs px-3 py-1.5 rounded-xl border border-[#E5E7EB] bg-white text-[#111827] placeholder-[#94A3B8] flex-1 outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#2563EB]"
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

          {/* Core Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Input
              label="Full Name"
              id="edit-fullname"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input
              label="Login Email"
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Designation"
              id="edit-designation"
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#111827]">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="rounded-xl border border-[#E5E7EB] bg-white text-xs px-3.5 py-2.5 text-[#111827] outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#2563EB]"
                required
              />
            </div>
          </div>

          {/* Contact Details */}
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mt-6 mb-3">
            Contact Numbers & Addresses
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Direct Mobile Phone"
              id="edit-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
            />

            <Input
              label="WhatsApp Number"
              id="edit-whatsapp"
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              leftIcon={<MessageSquare className="w-4 h-4" />}
            />

            <Input
              label="Company Email"
              id="edit-company-email"
              type="email"
              value={companyEmail}
              onChange={(e) => setCompanyEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Office Direct Phone"
              id="edit-officephone"
              type="tel"
              value={officePhone}
              onChange={(e) => setOfficePhone(e.target.value)}
              leftIcon={<Briefcase className="w-4 h-4" />}
            />

            <Input
              label="LinkedIn Profile or Handle"
              id="edit-linkedin"
              type="text"
              placeholder="https://linkedin.com/in/username or username"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              leftIcon={<Linkedin className="w-4 h-4" />}
            />

            <Input
              label="Twitter / X Profile or Handle"
              id="edit-twitter"
              type="text"
              placeholder="@username or https://twitter.com/username"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              leftIcon={<Twitter className="w-4 h-4" />}
            />

            <Input
              label="GitHub Profile or Handle"
              id="edit-github"
              type="text"
              placeholder="username or https://github.com/username"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              leftIcon={<Github className="w-4 h-4" />}
            />

            <Input
              label="Website URL"
              id="edit-website"
              type="url"
              placeholder="https://example.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              leftIcon={<Globe className="w-4 h-4" />}
            />
          </div>

          <div className="mt-4 space-y-4">
            <Input
              label="Office Location Address"
              id="edit-address"
              type="text"
              value={officeAddress}
              onChange={(e) => setOfficeAddress(e.target.value)}
              leftIcon={<MapPin className="w-4 h-4" />}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#111827]">
                Bio / Description
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="rounded-xl border border-[#E5E7EB] bg-white text-xs p-3 text-[#111827] placeholder-[#94A3B8] outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#2563EB]"
              />
            </div>
          </div>

          {/* Privacy Visibility Controls */}
          <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-[#2563EB]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
                Public Card Privacy Controls (Field Visibility)
              </h3>
            </div>
            <p className="text-xs text-[#64748B] mb-3">
              Choose which contact fields appear on the public digital business card.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#111827] cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={showPhone}
                  onChange={(e) => setShowPhone(e.target.checked)}
                  className="rounded text-[#2563EB]"
                />
                <span>Show Mobile Phone</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#111827] cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={showWhatsapp}
                  onChange={(e) => setShowWhatsapp(e.target.checked)}
                  className="rounded text-[#2563EB]"
                />
                <span>Show WhatsApp</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#111827] cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={showEmail}
                  onChange={(e) => setShowEmail(e.target.checked)}
                  className="rounded text-[#2563EB]"
                />
                <span>Show Email</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#111827] cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={showLinkedin}
                  onChange={(e) => setShowLinkedin(e.target.checked)}
                  className="rounded text-[#2563EB]"
                />
                <span>Show LinkedIn</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#111827] cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={showTwitter}
                  onChange={(e) => setShowTwitter(e.target.checked)}
                  className="rounded text-[#2563EB]"
                />
                <span>Show Twitter / X</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#111827] cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={showGithub}
                  onChange={(e) => setShowGithub(e.target.checked)}
                  className="rounded text-[#2563EB]"
                />
                <span>Show GitHub</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#111827] cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={showAddress}
                  onChange={(e) => setShowAddress(e.target.checked)}
                  className="rounded text-[#2563EB]"
                />
                <span>Show Address</span>
              </label>
            </div>
          </div>

          {/* Account Status & Role */}
          <div className="mt-6 pt-6 border-t border-[#E5E7EB] grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#111827] block mb-2">
                Account Status
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="edit-status"
                    value="ACTIVE"
                    checked={status === 'ACTIVE'}
                    onChange={() => setStatus('ACTIVE')}
                    className="text-[#2563EB]"
                  />
                  <span className="font-semibold text-[#059669]">Active</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="edit-status"
                    value="INACTIVE"
                    checked={status === 'INACTIVE'}
                    onChange={() => setStatus('INACTIVE')}
                    className="text-[#2563EB]"
                  />
                  <span className="font-semibold text-[#DC2626]">Inactive (Disabled)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#111827] block mb-2">
                Account Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="text-xs rounded-xl border border-[#E5E7EB] bg-white text-[#111827] px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#2563EB]"
              >
                <option value="EMPLOYEE">Employee (Standard Access)</option>
                <option value="ADMIN">Administrator (Full Access)</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 pt-4 border-t border-[#E5E7EB] flex items-center justify-end gap-3">
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
              isLoading={isSaving}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Save Employee Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
