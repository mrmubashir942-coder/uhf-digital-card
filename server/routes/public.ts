import { Router } from 'express';
import QRCode from 'qrcode';
import { db } from '../db.ts';
import { generateVCard } from '../vcard.ts';
import { PublicCardData } from '../../src/types/index.ts';

export const publicRouter = Router();

function getAppBaseUrl(req: any): string {
  // Use explicit environment variable or dynamic host from request
  if (process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL') {
    return process.env.APP_URL.replace(/\/$/, '');
  }
  if (process.env.URL) {
    return process.env.URL.replace(/\/$/, '');
  }
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:3000';
  return `${protocol}://${host}`;
}

// GET /api/public/company
publicRouter.get('/company', async (_req, res) => {
  try {
    const company = await db.getCompanySettings();
    res.json(company);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve company details.' });
  }
});

// GET /api/public/card/:employeeId
publicRouter.get('/card/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await db.getFullEmployeeByEmployeeId(employeeId);

    if (!employee) {
      res.status(404).json({
        error: 'Employee not found',
        code: 'NOT_FOUND',
        message: `No digital card found for ID: ${employeeId}`,
      });
      return;
    }

    if (employee.status === 'INACTIVE') {
      res.status(403).json({
        error: 'Card inactive',
        code: 'INACTIVE',
        message: 'This digital business card has been deactivated by administrator.',
        employeeId: employee.employeeId,
        fullName: employee.profile.fullName,
      });
      return;
    }

    const company = await db.getCompanySettings();
    const prof = employee.profile;

    const publicCard: PublicCardData = {
      employeeId: employee.employeeId,
      fullName: prof.fullName,
      designation: prof.designation,
      department: prof.department,
      phone: prof.showPhone ? prof.phone : undefined,
      whatsapp: prof.showWhatsapp ? prof.whatsapp : undefined,
      officePhone: prof.officePhone || company.phone,
      email: prof.showEmail ? employee.email : undefined,
      companyEmail: prof.showEmail ? (prof.companyEmail || employee.email) : undefined,
      linkedin: prof.showLinkedin ? prof.linkedin : undefined,
      twitter: (prof.showTwitter !== false) ? prof.twitter : undefined,
      github: (prof.showGithub !== false) ? prof.github : undefined,
      website: prof.website || company.website,
      officeAddress: prof.showAddress ? (prof.officeAddress || company.officeAddress) : undefined,
      bio: prof.bio,
      profilePhoto: prof.profilePhoto,
      status: employee.status,
      company: {
        companyName: company.companyName,
        logoUrl: company.logoUrl,
        website: company.website,
        email: company.email,
        phone: company.phone,
        officeAddress: company.officeAddress,
        linkedin: company.linkedin,
      },
    };

    // Track public card view activity
    try {
      await db.logActivity({
        actorName: 'Visitor',
        actorRole: 'PUBLIC',
        action: 'CARD_VIEW',
        category: 'INTERACTION',
        targetId: employee.id,
        targetName: `${prof.fullName} (${employee.employeeId})`,
        details: `Digital business card accessed for ${prof.fullName} (${employee.employeeId})`,
        userAgent: req.get('user-agent'),
      });
    } catch {}

    res.json(publicCard);
  } catch (err) {
    console.error('Error fetching public card:', err);
    res.status(500).json({ error: 'Failed to load digital business card.' });
  }
});

// GET /api/public/vcard/:employeeId
publicRouter.get('/vcard/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await db.getFullEmployeeByEmployeeId(employeeId);

    if (!employee) {
      res.status(404).send('Contact card not found.');
      return;
    }

    if (employee.status === 'INACTIVE') {
      res.status(403).send('Contact card is deactivated.');
      return;
    }

    const company = await db.getCompanySettings();
    const baseUrl = getAppBaseUrl(req);
    const vcardString = generateVCard(employee.profile, company, employee.email, baseUrl);

    const safeName = employee.profile.fullName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${safeName || employee.employeeId}_contact.vcf`;

    // Track contact download activity
    try {
      await db.logActivity({
        actorName: 'Visitor / Contact',
        actorRole: 'PUBLIC',
        action: 'VCARD_DOWNLOAD',
        category: 'INTERACTION',
        targetId: employee.id,
        targetName: `${employee.profile.fullName} (${employee.employeeId})`,
        details: `Downloaded .vcf contact card for ${employee.profile.fullName} (${employee.employeeId})`,
        userAgent: req.get('user-agent'),
      });
    } catch {}

    res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(vcardString);
  } catch (err) {
    console.error('Error generating VCF:', err);
    res.status(500).send('Failed to generate contact card.');
  }
});

// GET /api/public/qr/:employeeId
publicRouter.get('/qr/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await db.getFullEmployeeByEmployeeId(employeeId);

    if (!employee) {
      res.status(404).json({ error: 'Employee not found.' });
      return;
    }

    if (employee.status === 'INACTIVE') {
      res.status(403).json({
        error: 'Card inactive',
        code: 'INACTIVE',
        message: 'This digital business card has been deactivated by administrator.',
      });
      return;
    }

    const baseUrl = getAppBaseUrl(req);
    const cardUrl = `${baseUrl}/card/${employee.employeeId}`;

    // Track QR interaction
    try {
      await db.logActivity({
        actorName: 'Visitor / Device',
        actorRole: 'PUBLIC',
        action: 'QR_CODE_DOWNLOAD',
        category: 'INTERACTION',
        targetId: employee.id,
        targetName: `${employee.profile.fullName} (${employee.employeeId})`,
        details: `Dynamic QR code generated/accessed for ${employee.profile.fullName} (${employee.employeeId})`,
      });
    } catch {}

    // Generate high quality QR code data URL (PNG)
    const pngDataUrl = await QRCode.toDataURL(cardUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 500,
      color: {
        dark: '#0f172a', // Corporate UHF navy dark
        light: '#ffffff',
      },
    });

    // Generate SVG string
    const svgString = await QRCode.toString(cardUrl, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    res.json({
      employeeId: employee.employeeId,
      fullName: employee.profile.fullName,
      cardUrl,
      pngDataUrl,
      svgString,
    });
  } catch (err) {
    console.error('Error generating QR:', err);
    res.status(500).json({ error: 'Failed to generate QR code.' });
  }
});
