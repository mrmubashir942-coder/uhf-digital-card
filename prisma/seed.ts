/**
 * UHF Solutions Digital Card - Prisma Database Seeder
 * Used for populating PostgreSQL/Cloud database in production
 */
import bcrypt from 'bcryptjs';

export async function getSeedData() {
  const adminPasswordHash = await bcrypt.hash('AdminPassword123!', 10);
  const employeePasswordHash = await bcrypt.hash('Password123!', 10);

  return {
    admin: {
      employeeId: 'ADMIN-001',
      email: 'admin@uhfsolutions.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      profile: {
        fullName: 'UHF Administrator',
        designation: 'Head of IT & Security',
        department: 'Executive Administration',
        phone: '+1 (800) 555-0199',
        whatsapp: '+18005550199',
        officePhone: '+1 (800) 555-0199 ext 100',
        companyEmail: 'admin@uhfsolutions.com',
        linkedin: 'https://linkedin.com/company/uhf-solutions',
        website: 'https://uhfsolutions.com',
        officeAddress: 'Suite 400, Technology Park, Silicon Boulevard, CA 94025',
        bio: 'Supervising corporate infrastructure, enterprise identity, and security operations at UHF Solutions.',
        profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      }
    },
    employees: [
      {
        employeeId: 'UHF-001',
        email: 'ahmed@uhfsolutions.com',
        passwordHash: employeePasswordHash,
        role: 'EMPLOYEE',
        status: 'ACTIVE',
        profile: {
          fullName: 'Muhammad Ahmed',
          designation: 'Senior Software Developer',
          department: 'IT & Engineering',
          phone: '+1 (555) 234-5678',
          whatsapp: '+15552345678',
          officePhone: '+1 (800) 555-0199 ext 101',
          companyEmail: 'ahmed@uhfsolutions.com',
          linkedin: 'https://linkedin.com/in/muhammad-ahmed-uhf',
          website: 'https://uhfsolutions.com',
          officeAddress: 'Suite 400, Technology Park, Silicon Boulevard, CA 94025',
          bio: 'Full-stack engineer passionate about cloud architecture, robust distributed backend systems, and modern web applications at UHF Solutions.',
          profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
        }
      },
      {
        employeeId: 'UHF-002',
        email: 'ali@uhfsolutions.com',
        passwordHash: employeePasswordHash,
        role: 'EMPLOYEE',
        status: 'ACTIVE',
        profile: {
          fullName: 'Ali Khan',
          designation: 'UI/UX Designer',
          department: 'Creative & Design',
          phone: '+1 (555) 345-6789',
          whatsapp: '+15553456789',
          officePhone: '+1 (800) 555-0199 ext 102',
          companyEmail: 'ali@uhfsolutions.com',
          linkedin: 'https://linkedin.com/in/ali-khan-design',
          website: 'https://uhfsolutions.com',
          officeAddress: 'Suite 400, Technology Park, Silicon Boulevard, CA 94025',
          bio: 'Product designer focused on intuitive digital interfaces, typography, accessible design systems, and delightful user journeys.',
          profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
        }
      },
      {
        employeeId: 'UHF-003',
        email: 'usman@uhfsolutions.com',
        passwordHash: employeePasswordHash,
        role: 'EMPLOYEE',
        status: 'ACTIVE',
        profile: {
          fullName: 'Usman Khan',
          designation: 'Project Manager',
          department: 'Operations & PMO',
          phone: '+1 (555) 456-7890',
          whatsapp: '+15554567890',
          officePhone: '+1 (800) 555-0199 ext 103',
          companyEmail: 'usman@uhfsolutions.com',
          linkedin: 'https://linkedin.com/in/usman-khan-pm',
          website: 'https://uhfsolutions.com',
          officeAddress: 'Suite 400, Technology Park, Silicon Boulevard, CA 94025',
          bio: 'Technical project leader orchestrating agile sprint delivery, client stakeholders, and enterprise roadmaps at UHF Solutions.',
          profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
        }
      }
    ],
    company: {
      id: 'default-uhf-company',
      companyName: 'UHF Solutions',
      logoUrl: '',
      website: 'https://uhfsolutions.com',
      email: 'contact@uhfsolutions.com',
      phone: '+1 (800) 555-0199',
      officeAddress: 'Suite 400, Technology Park, Silicon Boulevard, CA 94025',
      linkedin: 'https://linkedin.com/company/uhf-solutions',
      twitter: 'https://twitter.com/uhfsolutions',
      primaryColor: '#0f172a',
      accentColor: '#2563eb',
      updatedAt: new Date().toISOString()
    }
  };
}
