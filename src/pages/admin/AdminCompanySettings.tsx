import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.ts';
import { CompanySettings } from '../../types/index.ts';
import { Input } from '../../components/common/Input.tsx';
import { Button } from '../../components/common/Button.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { uploadCompanyLogo } from '../../lib/storage.ts';
import {
  Building,
  Globe,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  CheckCircle2,
  ArrowLeft,
  Building2,
  Image as ImageIcon,
  Upload,
  Trash2,
  Loader2,
} from 'lucide-react';

interface AdminCompanySettingsProps {
  onNavigate: (path: string) => void;
}

export const AdminCompanySettingsPage: React.FC<AdminCompanySettingsProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const [companyName, setCompanyName] = useState('UHF Solutions');
  const [logoUrl, setLogoUrl] = useState('');
  const [website, setWebsite] = useState('https://uhfsolutions.com');
  const [email, setEmail] = useState('contact@uhfsolutions.com');
  const [phone, setPhone] = useState('+1 (800) 555-0199');
  const [officeAddress, setOfficeAddress] = useState(
    'Suite 400, Technology Park, Silicon Boulevard, CA 94025'
  );
  const [linkedin, setLinkedin] = useState('https://linkedin.com/company/uhf-solutions');
  const [twitter, setTwitter] = useState('https://twitter.com/uhfsolutions');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.admin
      .getCompanySettings()
      .then((data) => {
        if (isMounted) {
          setCompanyName(data.companyName);
          setLogoUrl(data.logoUrl || '');
          setWebsite(data.website);
          setEmail(data.email);
          setPhone(data.phone);
          setOfficeAddress(data.officeAddress);
          setLinkedin(data.linkedin || '');
          setTwitter(data.twitter || '');
        }
      })
      .catch((err) => {
        console.error('Error fetching company settings:', err);
        showToast('Failed to load company settings', 'error');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [showToast]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const { url } = await uploadCompanyLogo(file);
      setLogoUrl(url);
      showToast('Logo uploaded to Cloudinary! Click Save Changes to apply.', 'success');
    } catch (uploadErr: any) {
      console.error('Cloudinary upload error for company logo:', uploadErr);
      showToast(uploadErr.message || 'Failed to upload company logo.', 'error');
    } finally {
      setIsUploadingLogo(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await api.admin.updateCompanySettings({
        companyName: companyName.trim(),
        logoUrl: logoUrl.trim() || undefined,
        website: website.trim(),
        email: email.trim(),
        phone: phone.trim(),
        officeAddress: officeAddress.trim(),
        linkedin: linkedin.trim() || undefined,
        twitter: twitter.trim() || undefined,
      });

      showToast('Company information updated successfully!', 'success');
    } catch (err: any) {
      console.error('Failed to update company settings:', err);
      showToast(err.message || 'Failed to update company settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-slate-400">
        Loading organization settings...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => onNavigate('/admin/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#111827] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E5E7EB]">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#111827]">
                Company & Organization Settings
              </h1>
              <p className="text-xs text-[#64748B]">
                Corporate headquarters data reused across all employee digital cards, VCF downloads, and branding.
              </p>
            </div>
          </div>

          {/* Company Logo Section */}
          <div className="mb-6 p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]">
            <label className="block text-xs font-semibold text-[#111827] mb-2">
              Company Logo (Configurable Brand Asset)
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-24 h-24 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center overflow-hidden p-2 shadow-xs shrink-0">
                {logoUrl ? (
                  <img src={logoUrl} alt="Company Logo" className="max-w-full max-h-full object-contain" />
                ) : (
                  <Building2 className="w-10 h-10 text-[#64748B]" />
                )}
              </div>
              <div className="flex-1 w-full space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <label className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition-colors ${isUploadingLogo ? 'opacity-70 pointer-events-none' : ''}`}>
                    {isUploadingLogo ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{isUploadingLogo ? 'Uploading to Cloudinary...' : 'Upload Logo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingLogo}
                      onChange={handleLogoUpload}
                    />
                  </label>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-[#DC2626] text-[#64748B] text-xs font-semibold transition-colors cursor-pointer border border-[#E5E7EB]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Logo</span>
                    </button>
                  )}
                </div>
                <Input
                  label="Or Logo URL"
                  id="logo-url"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  leftIcon={<ImageIcon className="w-4 h-4" />}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Input
              label="Legal Company Name"
              id="company-name"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              leftIcon={<Building className="w-4 h-4" />}
              required
            />

            <Input
              label="Corporate Website"
              id="company-website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              leftIcon={<Globe className="w-4 h-4" />}
              required
            />

            <Input
              label="General Inquiries Email"
              id="company-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Main Switchboard Phone"
              id="company-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
              required
            />

            <Input
              label="Company LinkedIn Profile"
              id="company-linkedin"
              type="url"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              leftIcon={<Linkedin className="w-4 h-4" />}
            />

            <Input
              label="Company Twitter / X"
              id="company-twitter"
              type="url"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              leftIcon={<Twitter className="w-4 h-4" />}
            />
          </div>

          <div className="mt-4">
            <Input
              label="Corporate Headquarters Address"
              id="company-address"
              type="text"
              value={officeAddress}
              onChange={(e) => setOfficeAddress(e.target.value)}
              leftIcon={<MapPin className="w-4 h-4" />}
              required
            />
          </div>

          <div className="mt-8 pt-4 border-t border-[#E5E7EB] flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onNavigate('/admin/dashboard')}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              isLoading={isSaving}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Save Company Settings
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
