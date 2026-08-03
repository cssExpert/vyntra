import { BadRequestException, Body, Controller, Get, Put, Post } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentOrg } from '../../common/decorators/current-org.decorator';
import { StripeService } from '../services/stripe.service';
import { UpdateStripeConfigDto } from '../dto';

/** Org-admin self-service Stripe connection — each store connects its own account (apps/web's Store Settings → Payment tab). */
@Controller('organizations/me/stripe')
export class StripeConfigController {
  constructor(private stripeService: StripeService) {}

  @Roles(Role.ORG_ADMIN)
  @Get()
  getSettings(@CurrentOrg() orgId: string | null) {
    if (!orgId) throw new BadRequestException('No organization context');
    return this.stripeService.getSettings(orgId);
  }

  @Roles(Role.ORG_ADMIN)
  @Put()
  updateSettings(@CurrentOrg() orgId: string | null, @Body() dto: UpdateStripeConfigDto) {
    if (!orgId) throw new BadRequestException('No organization context');
    return this.stripeService.updateSettings(orgId, dto);
  }

  @Roles(Role.ORG_ADMIN)
  @Post('test')
  testConnection(@CurrentOrg() orgId: string | null) {
    if (!orgId) throw new BadRequestException('No organization context');
    return this.stripeService.testConnection(orgId);
  }
}
