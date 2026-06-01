import { Role } from '@prisma/client';

/** Shape attached to `request.user` by the JWT strategy after validation. */
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  superAdmin: boolean;
  organizationId: string | null;
  roles: Role[];
}
