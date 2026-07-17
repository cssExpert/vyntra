import { Body, Controller, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Public } from '../../../common/decorators/public.decorator';
import { StorefrontAuthService } from '../services/storefront-auth.service';
import { StorefrontRegisterDto, StorefrontLoginDto, StorefrontRefreshDto } from '../dto';

@Controller('public/sites/:orgId/auth')
export class StorefrontAuthController {
  constructor(private authService: StorefrontAuthService) {}

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('register')
  register(@Param('orgId') orgId: string, @Body() dto: StorefrontRegisterDto) {
    return this.authService.register(orgId, dto);
  }

  @Public()
  @HttpCode(200)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('login')
  login(@Param('orgId') orgId: string, @Body() dto: StorefrontLoginDto) {
    return this.authService.login(orgId, dto);
  }

  @Public()
  @HttpCode(200)
  @Post('refresh')
  refresh(@Body() dto: StorefrontRefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  /** Stateless JWT — logout is a client-side token discard. Endpoint exists for symmetry/future blacklisting. */
  @Public()
  @HttpCode(200)
  @Post('logout')
  logout() {
    return { success: true };
  }
}
