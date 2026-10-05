import { Router } from 'express';
import { db } from '../db.ts';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../middleware/auth.ts';

export const adminRouter = Router();

// Ensure all admin routes require authenticated admin
adminRouter.use(requireAuth);
adminRouter.use(requireAdmin);

// GET /api/admin/stats
adminRouter.get('/stats', async (_req, res) => {
  try {
    const stats = await db.getDashboardStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve dashboard statistics.' });
  }
});

// GET /api/admin/logs
adminRouter.get('/logs', async (req, res) => {
  try {
    const { limit, category, action, search, actorId } = req.query as {
      limit?: string;
      category?: any;
      action?: any;
      search?: string;
      actorId?: string;
    };

    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    const result = await db.getActivityLogs({
      limit: isNaN(parsedLimit) ? 50 : parsedLimit,
      category,
      action,
      search,
      actorId,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve activity audit logs.' });
  }
});

// DELETE /api/admin/logs (Clear audit trail)
adminRouter.delete('/logs', async (req: AuthenticatedRequest, res) => {
  try {
    await db.clearActivityLogs();
    await db.logActivity({
      actorId: req.user?.id,
      actorName: req.user?.employeeId || 'Administrator',
      actorRole: 'ADMIN',
      action: 'EMPLOYEE_STATUS_CHANGE',
      category: 'ADMIN',
      details: 'Audit trail activity log history was cleared by administrator',
    });
    res.json({ message: 'Activity log history cleared successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear activity logs.' });
  }
});

// GET /api/admin/next-id
adminRouter.get('/next-id', async (_req, res) => {
  try {
    const nextId = await db.getNextEmployeeId();
    res.json({ nextId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute next employee ID.' });
  }
});

// GET /api/admin/employees
adminRouter.get('/employees', async (req, res) => {
  try {
    const { search, status, department } = req.query as {
      search?: string;
      status?: string;
      department?: string;
    };

    const employees = await db.getAllEmployees({ search, status, department });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve employees list.' });
  }
});

// GET /api/admin/employees/:id
adminRouter.get('/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let employee = await db.getFullEmployeeById(id);
    if (!employee) {
      employee = await db.getFullEmployeeByEmployeeId(id);
    }

    if (!employee) {
      res.status(404).json({ error: 'Employee record not found.' });
      return;
    }

    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve employee record.' });
  }
});

// POST /api/admin/employees
adminRouter.post('/employees', async (req, res) => {
  try {
    const {
      employeeId,
      fullName,
      email,
      temporaryPassword,
      designation,
      department,
      phone,
      whatsapp,
      officePhone,
      companyEmail,
      linkedin,
      website,
      officeAddress,
      bio,
      profilePhoto,
      role,
      status,
    } = req.body;

    if (!employeeId || !fullName || !email || !designation || !department) {
      res.status(400).json({
        error: 'Employee ID, Full Name, Email, Designation, and Department are required.',
      });
      return;
    }

    const employee = await db.createEmployee({
      employeeId,
      fullName,
      email,
      temporaryPassword: temporaryPassword || 'Password123!',
      designation,
      department,
      phone,
      whatsapp,
      officePhone,
      companyEmail,
      linkedin,
      website,
      officeAddress,
      bio,
      profilePhoto,
      role: role || 'EMPLOYEE',
      status: status || 'ACTIVE',
    });

    await db.logActivity({
      actorId: (req as AuthenticatedRequest).user?.id,
      actorName: (req as AuthenticatedRequest).user?.employeeId || 'Administrator',
      actorRole: 'ADMIN',
      action: 'EMPLOYEE_CREATE',
      category: 'ADMIN',
      targetId: employee.id,
      targetName: `${employee.profile.fullName} (${employee.employeeId})`,
      details: `Created new employee record in department: ${employee.profile.department}`,
    });

    res.status(201).json({
      message: 'Employee successfully created.',
      employee,
    });
  } catch (err: any) {
    console.error('Error creating employee:', err);
    res.status(400).json({ error: err.message || 'Failed to create employee.' });
  }
});

// PUT /api/admin/employees/:id
adminRouter.put('/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await db.updateEmployee(id, req.body);

    await db.logActivity({
      actorId: (req as AuthenticatedRequest).user?.id,
      actorName: (req as AuthenticatedRequest).user?.employeeId || 'Administrator',
      actorRole: 'ADMIN',
      action: 'EMPLOYEE_UPDATE',
      category: 'ADMIN',
      targetId: updated.id,
      targetName: `${updated.profile.fullName} (${updated.employeeId})`,
      details: `Updated employee profile and settings for ${updated.profile.fullName}`,
    });

    res.json({
      message: 'Employee updated successfully.',
      employee: updated,
    });
  } catch (err: any) {
    console.error('Error updating employee:', err);
    res.status(400).json({ error: err.message || 'Failed to update employee.' });
  }
});

// PATCH /api/admin/employees/:id/status
adminRouter.patch('/employees/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const newStatus = await db.toggleStatus(id, status);

    await db.logActivity({
      actorId: (req as AuthenticatedRequest).user?.id,
      actorName: (req as AuthenticatedRequest).user?.employeeId || 'Administrator',
      actorRole: 'ADMIN',
      action: 'EMPLOYEE_STATUS_CHANGE',
      category: 'ADMIN',
      targetId: id,
      details: `Changed employee account status to ${newStatus}`,
    });

    res.json({
      message: `Employee account status updated to ${newStatus}.`,
      status: newStatus,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update employee status.' });
  }
});

// POST /api/admin/employees/:id/reset-password
adminRouter.post('/employees/:id/reset-password', async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ error: 'Temporary password must be at least 6 characters.' });
      return;
    }

    await db.updatePassword(id, newPassword);

    await db.logActivity({
      actorId: (req as AuthenticatedRequest).user?.id,
      actorName: (req as AuthenticatedRequest).user?.employeeId || 'Administrator',
      actorRole: 'ADMIN',
      action: 'PASSWORD_CHANGE',
      category: 'ADMIN',
      targetId: id,
      details: `Administrator initiated password reset for employee`,
    });

    res.json({ message: 'Password has been successfully reset.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to reset password.' });
  }
});

// DELETE /api/admin/employees/:id
adminRouter.delete('/employees/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const currentAdmin = req.user!;

    if (id === currentAdmin.id) {
      res.status(400).json({ error: 'You cannot delete your own administrator account.' });
      return;
    }

    await db.deleteEmployee(id);

    await db.logActivity({
      actorId: currentAdmin.id,
      actorName: currentAdmin.employeeId || 'Administrator',
      actorRole: 'ADMIN',
      action: 'EMPLOYEE_STATUS_CHANGE',
      category: 'ADMIN',
      targetId: id,
      details: `Deleted employee record (ID: ${id})`,
    });

    res.json({ message: 'Employee successfully deleted.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to delete employee.' });
  }
});

// GET /api/admin/company
adminRouter.get('/company', async (_req, res) => {
  try {
    const settings = await db.getCompanySettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve company settings.' });
  }
});

// PUT /api/admin/company
adminRouter.put('/company', async (req, res) => {
  try {
    const settings = await db.updateCompanySettings(req.body);

    await db.logActivity({
      actorId: (req as AuthenticatedRequest).user?.id,
      actorName: (req as AuthenticatedRequest).user?.employeeId || 'Administrator',
      actorRole: 'ADMIN',
      action: 'COMPANY_SETTINGS_UPDATE',
      category: 'ADMIN',
      details: `Updated corporate company settings (${settings.companyName})`,
    });

    res.json({
      message: 'Company settings updated successfully.',
      company: settings,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update company settings.' });
  }
});
