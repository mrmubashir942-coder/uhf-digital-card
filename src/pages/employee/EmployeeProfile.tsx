import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../lib/api.ts';
import { Input } from '../../components/common/Input.tsx';
import { Button } from '../../components/common/Button.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { uploadProfilePhoto } from '../../lib/storage.ts';
import {
  User,
  Phone,
  MessageSquare,
  Linkedin,
  Twitter,
  Github,
  Globe,
  Camera,
  Check,
  AlertCircle,
  Lock,
  ExternalLink,
  Loader2,
} from 'lucide-react';

interface EmployeeProfilePageProps {
  onNavigate: (path: string) => void;
}

export const EmployeeProfilePage: React.FC<EmployeeProfilePageProps> = ({ onNavigate }) => {
  const { user, profile, setProfile } = useAuth();
  const { showToast } = useToast();

  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [github, setGithub] = useState('');
  const [website, setWebsite] = useState('');
  const [bio, setBio] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  useEffect(() => {
    let isMounted = true;
    api.employee
      .getProfile()
      .then((res) => {
        if (isMounted) {
          const p = res.profile;
          setProfile(p);
          setPhone(p.phone || '');
          setWhatsapp(p.whatsapp || '');
          setLinkedin(p.linkedin || '');
          setTwitter(p.twitter || '');
          setGithub(p.github || '');
          setWebsite(p.website || '');
          setBio(p.bio || '');
          setProfilePhoto(p.profilePhoto || '');
          setPhotoUrlInput(p.profilePhoto || '');
        }
      })
      .catch((err) => {
        console.error('Error fetching employee profile:', err);
        showToast('Failed to load profile details', 'error');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [setProfile, showToast]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const currentEmpId = user?.employeeId || 'employee';
      const { url } = await uploadProfilePhoto(file, currentEmpId);
      setProfilePhoto(url);
      setPhotoUrlInput('');
      showToast('Photo uploaded to Cloudinary! Save changes to apply.', 'success');
    } catch (uploadErr: any) {
      console.error('Cloudinary photo upload error:', uploadErr);
      showToast(uploadErr.message || 'Failed to upload photo to Cloudinary.', 'error');
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleApplyPhotoUrl = () => {
    if (!photoUrlInput.trim()) return;
    setProfilePhoto(photoUrlInput.trim());
    showToast('Photo URL applied. Remember to save changes.', 'info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await api.employee.updateProfile({
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        linkedin: linkedin.trim(),
        twitter: twitter.trim(),
        github: github.trim(),
        website: website.trim(),
        bio: bio.trim(),
        profilePhoto,
      });

      setProfile(res.profile);
      showToast('Profile updated successfully!', 'success');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-[#64748B]">
        Loading profile...
      </div>
    );
  }

  const fullName = profile?.fullName || user?.fullName || 'Employee';
  const employeeId = user?.employeeId || 'UHF-001';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#111827] tracking-tight">
            My Employee Profile
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Manage your personal contact info, bio, and portrait photo visible on your digital card.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate(`/card/${employeeId}`)}
          leftIcon={<ExternalLink className="w-3.5 h-3.5 text-[#2563EB]" />}
        >
          Preview Digital Card
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Profile Photo Management */}
        <div className="bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-xs">
          <h2 className="text-sm font-bold text-[#111827] uppercase tracking-wider mb-4">
            Profile Portrait Photo
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-28 h-28 rounded-full border-2 border-[#2563EB]/40 p-1 bg-slate-50 overflow-hidden shadow-xs shrink-0 flex items-center justify-center">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt={fullName}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <User className="w-12 h-12 text-[#64748B]" />
              )}
            </div>

            <div className="flex-1 w-full space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#111827] block mb-1">
                  Upload New Photo
                </label>
                <div className="flex items-center gap-3">
                  <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-[#2563EB] hover:bg-blue-100 transition-colors border border-blue-200 ${isUploadingPhoto ? 'opacity-70 pointer-events-none' : ''}`}>
                    {isUploadingPhoto ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
                    ) : (
                      <Camera className="w-4 h-4 text-[#2563EB]" />
                    )}
                    <span>{isUploadingPhoto ? 'Uploading photo...' : 'Choose Image File'}</span>
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
                      Remove Photo
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-[#64748B] mt-1">PNG, JPG, or WEBP up to 5MB (stored securely in Cloudinary).</p>
              </div>

              {/* Or enter Image URL */}
              <div>
                <label className="text-xs font-semibold text-[#111827] block mb-1">
                  Or Paste Image URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={photoUrlInput}
                    onChange={(e) => setPhotoUrlInput(e.target.value)}
                    className="flex-1 rounded-xl border border-[#E5E7EB] bg-white text-xs px-3 py-2 text-[#111827] outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#2563EB]"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleApplyPhotoUrl}
                  >
                    Apply URL
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Administrative / Read-Only Fields */}
        <div className="bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#111827] uppercase tracking-wider">
              Corporate Administrative Data
            </h2>
            <span className="flex items-center gap-1 text-[11px] text-[#64748B]">
              <Lock className="w-3 h-3" />
              <span>Admin Controlled</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB]">
              <label className="text-[11px] text-[#64748B] font-semibold block mb-0.5">
                Full Name
              </label>
              <span className="text-sm font-bold text-[#111827]">
                {fullName}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB]">
              <label className="text-[11px] text-[#64748B] font-semibold block mb-0.5">
                Employee ID
              </label>
              <span className="text-sm font-mono font-bold text-[#2563EB]">
                {employeeId}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB]">
              <label className="text-[11px] text-[#64748B] font-semibold block mb-0.5">
                Official Designation
              </label>
              <span className="text-sm font-semibold text-[#111827]">
                {profile?.designation}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB]">
              <label className="text-[11px] text-[#64748B] font-semibold block mb-0.5">
                Assigned Department
              </label>
              <span className="text-sm font-semibold text-[#111827]">
                {profile?.department}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB]">
              <label className="text-[11px] text-[#64748B] font-semibold block mb-0.5">
                Corporate Email
              </label>
              <span className="text-sm font-semibold text-[#111827]">
                {profile?.companyEmail || user?.email}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB]">
              <label className="text-[11px] text-[#64748B] font-semibold block mb-0.5">
                Office Direct Phone
              </label>
              <span className="text-sm font-semibold text-[#111827]">
                {profile?.officePhone || 'Headquarters'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Permitted Employee Editable Fields */}
        <div className="bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#111827] uppercase tracking-wider">
            Editable Contact & Social Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Direct Mobile Phone"
              id="emp-phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
              helperText="Call button on your public card will dial this number."
            />

            <Input
              label="WhatsApp Phone"
              id="emp-whatsapp"
              type="tel"
              placeholder="+15550000000"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              leftIcon={<MessageSquare className="w-4 h-4" />}
              helperText="Format with country code (e.g., +15550000000)."
            />

            <Input
              label="LinkedIn Profile URL"
              id="emp-linkedin"
              type="url"
              placeholder="https://linkedin.com/in/username"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              leftIcon={<Linkedin className="w-4 h-4" />}
            />

            <Input
              label="Twitter / X Profile URL or Handle"
              id="emp-twitter"
              type="text"
              placeholder="@username or https://twitter.com/username"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              leftIcon={<Twitter className="w-4 h-4" />}
            />

            <Input
              label="GitHub Profile URL or Username"
              id="emp-github"
              type="text"
              placeholder="username or https://github.com/username"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              leftIcon={<Github className="w-4 h-4" />}
            />

            <Input
              label="Personal or Project Website"
              id="emp-website"
              type="url"
              placeholder="https://yourportfolio.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              leftIcon={<Globe className="w-4 h-4" />}
            />
          </div>

          <div className="flex flex-col gap-1.5 pt-2">
            <label htmlFor="emp-bio" className="text-xs font-semibold text-[#111827]">
              Professional Biography / Elevator Pitch
            </label>
            <textarea
              id="emp-bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief professional intro displayed on your digital card..."
              className="w-full rounded-xl border border-[#E5E7EB] bg-white text-[#111827] text-sm p-3.5 outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#2563EB] transition-all"
            />
            <p className="text-[11px] text-[#64748B]">Recommended 2-3 sentences.</p>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onNavigate('/employee/dashboard')}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
            leftIcon={<Check className="w-4 h-4" />}
          >
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
