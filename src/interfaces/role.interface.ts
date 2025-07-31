export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPERADMIN = 'SUPERADMIN',
}

export interface RolePermissions {
  canManageEmails: boolean;
  canManageServices: boolean;
  canViewAnalytics: boolean;
  canManageUsers: boolean;
}

export class RoleChecker {
  private static readonly ADMIN_ROLES: UserRole[] = [
    UserRole.ADMIN,
    UserRole.SUPERADMIN,
  ];

  private static readonly SUPERADMIN_ROLES: UserRole[] = [UserRole.SUPERADMIN];

  static isAdmin(role: UserRole): boolean {
    return this.ADMIN_ROLES.includes(role);
  }

  static isSuperAdmin(role: UserRole): boolean {
    return this.SUPERADMIN_ROLES.includes(role);
  }

  static canManageEmails(role: UserRole): boolean {
    return this.isAdmin(role);
  }

  static canManageUsers(role: UserRole): boolean {
    return this.isSuperAdmin(role);
  }

  static canManageServices(role: UserRole): boolean {
    return this.isAdmin(role);
  }

  static canViewAnalytics(role: UserRole): boolean {
    return this.isAdmin(role);
  }

  static getPermissions(role: UserRole): RolePermissions {
    return {
      canManageEmails: this.canManageEmails(role),
      canManageServices: this.canManageServices(role),
      canViewAnalytics: this.canViewAnalytics(role),
      canManageUsers: this.canManageUsers(role),
    };
  }

  static getAllowedRoles(): UserRole[] {
    return Object.values(UserRole);
  }

  static isValidRole(role: string): role is UserRole {
    return Object.values(UserRole).includes(role as UserRole);
  }
}
