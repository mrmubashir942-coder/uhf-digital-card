import { PublicCardData } from '../types/index.ts';

function escapeVCard(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Builds RFC 2426 vCard 3.0 string with CRLF endings.
 */
export function buildVCardString(cardData: PublicCardData): string {
  const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0'];

  const fullName = (cardData.fullName || '').trim();
  lines.push(`FN:${escapeVCard(fullName)}`);

  const nameParts = fullName.split(' ');
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  const firstName = nameParts.slice(0, -1).join(' ') || fullName;
  lines.push(`N:${escapeVCard(lastName)};${escapeVCard(firstName)};;;`);

  const orgName = cardData.company?.companyName || 'UHF Solutions';
  const dept = cardData.department ? `;${escapeVCard(cardData.department)}` : '';
  lines.push(`ORG:${escapeVCard(orgName)}${dept}`);

  if (cardData.designation) {
    lines.push(`TITLE:${escapeVCard(cardData.designation)}`);
  }

  if (cardData.phone) {
    lines.push(`TEL;TYPE=CELL,VOICE:${cardData.phone.trim()}`);
  }

  const officePhone = cardData.officePhone || cardData.company?.phone;
  if (officePhone) {
    lines.push(`TEL;TYPE=WORK,VOICE:${officePhone.trim()}`);
  }

  const email = cardData.companyEmail || cardData.email;
  if (email) {
    lines.push(`EMAIL;TYPE=INTERNET,WORK:${escapeVCard(email.trim())}`);
  }

  const website = cardData.website || cardData.company?.website;
  if (website) {
    lines.push(`URL;TYPE=WORK:${escapeVCard(website.trim())}`);
  }

  // Include direct Digital Card URL
  if (typeof window !== 'undefined' && window.location) {
    const cardDirectUrl = `${window.location.origin}/card/${cardData.employeeId}`;
    lines.push(`URL;TYPE=CARD:${escapeVCard(cardDirectUrl)}`);
  }

  if (cardData.linkedin) {
    lines.push(`X-SOCIALPROFILE;type=linkedin:${escapeVCard(cardData.linkedin.trim())}`);
  }

  const address = cardData.officeAddress || cardData.company?.officeAddress;
  if (address) {
    lines.push(`ADR;TYPE=WORK:;;${escapeVCard(address.trim())};;;;`);
  }

  if (cardData.bio) {
    lines.push(`NOTE:${escapeVCard(cardData.bio.trim())}`);
  }

  // Profile photo URL (Cloudinary or web URL)
  if (cardData.profilePhoto) {
    lines.push(`PHOTO;VALUE=URI:${cardData.profilePhoto.trim()}`);
  }

  lines.push(`UID:urn:uuid:${cardData.employeeId}-uhfsolutions`);
  lines.push(`REV:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
  lines.push('END:VCARD');

  return lines.join('\r\n') + '\r\n';
}

export function downloadVCard(cardData: PublicCardData): void {
  try {
    const vcardContent = buildVCardString(cardData);
    const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeName = (cardData.fullName || cardData.employeeId).replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `${safeName}_contact.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (err) {
    // Fallback to server endpoint
    const url = `/api/public/vcard/${encodeURIComponent(cardData.employeeId)}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `${cardData.employeeId}_contact.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export async function shareCard(
  cardData: PublicCardData,
  url: string,
  onFallback: () => void
): Promise<void> {
  const shareTitle = `${cardData.fullName} | ${cardData.designation} - ${cardData.company?.companyName || 'UHF Solutions'}`;
  const shareText = `Digital Business Card for ${cardData.fullName}, ${cardData.designation} at ${cardData.company?.companyName || 'UHF Solutions'}.`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: url,
      });
      return;
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Web Share failed, showing modal fallback:', err);
        onFallback();
      }
      return;
    }
  }

  onFallback();
}
