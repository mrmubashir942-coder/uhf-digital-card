/**
 * UHF Solutions - VCard 3.0 Generation Utility
 * Conforms to RFC 2426 vCard 3.0 specifications.
 */
import { EmployeeProfile, CompanySettings } from '../src/types/index.ts';

export function generateVCard(
  profile: EmployeeProfile,
  company: CompanySettings,
  userEmail?: string,
  appBaseUrl?: string
): string {
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
  ];

  // Full Name
  const fullName = profile.fullName.trim();
  lines.push(`FN:${escapeVCard(fullName)}`);

  // Split name for N property (Family Name;Given Name;Additional Names;Honorific Prefixes;Honorific Suffixes)
  const nameParts = fullName.split(' ');
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  const firstName = nameParts.slice(0, -1).join(' ') || fullName;
  lines.push(`N:${escapeVCard(lastName)};${escapeVCard(firstName)};;;`);

  // Organization
  const orgName = company.companyName || 'UHF Solutions';
  const department = profile.department ? `;${escapeVCard(profile.department)}` : '';
  lines.push(`ORG:${escapeVCard(orgName)}${department}`);

  // Title / Designation
  if (profile.designation) {
    lines.push(`TITLE:${escapeVCard(profile.designation)}`);
  }

  // Mobile / Cell Phone
  if (profile.phone && profile.showPhone) {
    lines.push(`TEL;TYPE=CELL,VOICE:${cleanPhone(profile.phone)}`);
  }

  // Office Phone
  if (profile.officePhone) {
    lines.push(`TEL;TYPE=WORK,VOICE:${cleanPhone(profile.officePhone)}`);
  } else if (company.phone) {
    lines.push(`TEL;TYPE=WORK,VOICE:${cleanPhone(company.phone)}`);
  }

  // Work Email
  if (profile.companyEmail && profile.showEmail) {
    lines.push(`EMAIL;TYPE=INTERNET,WORK:${escapeVCard(profile.companyEmail)}`);
  } else if (userEmail && profile.showEmail) {
    lines.push(`EMAIL;TYPE=INTERNET,WORK:${escapeVCard(userEmail)}`);
  }

  // Website
  const web = profile.website || company.website;
  if (web) {
    lines.push(`URL;TYPE=WORK:${escapeVCard(web)}`);
  }

  // Include direct Digital Card URL
  if (appBaseUrl) {
    lines.push(`URL;TYPE=CARD:${escapeVCard(`${appBaseUrl}/card/${profile.employeeId}`)}`);
  }

  // LinkedIn
  if (profile.linkedin && profile.showLinkedin) {
    lines.push(`X-SOCIALPROFILE;type=linkedin:${escapeVCard(profile.linkedin)}`);
  }

  // Office Address
  const addr = profile.officeAddress || company.officeAddress;
  if (addr && profile.showAddress) {
    // ADR format: P.O. Box; Extended Address; Street Address; Locality; Region; Postal Code; Country
    lines.push(`ADR;TYPE=WORK:;;${escapeVCard(addr)};;;;`);
  }

  // Bio / Note
  if (profile.bio) {
    lines.push(`NOTE:${escapeVCard(profile.bio)}`);
  }

  // Profile Photo
  if (profile.profilePhoto) {
    lines.push(`PHOTO;VALUE=URI:${profile.profilePhoto}`);
  }

  // UID
  lines.push(`UID:urn:uuid:${profile.employeeId}-uhfsolutions`);

  // Revision date
  lines.push(`REV:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);

  lines.push('END:VCARD');

  // RFC 2426 requires CRLF line endings
  return lines.join('\r\n') + '\r\n';
}

function escapeVCard(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function cleanPhone(phone: string): string {
  return phone.trim();
}
