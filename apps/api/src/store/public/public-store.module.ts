import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { StoreModule } from '../store.module';
import { StorefrontAuthController } from './controllers/storefront-auth.controller';
import { StorefrontAccountController } from './controllers/storefront-account.controller';
import { PublicCartController } from './controllers/public-cart.controller';
import { PublicCheckoutController } from './controllers/public-checkout.controller';
import { StorefrontAuthService } from './services/storefront-auth.service';
import { StorefrontAccountService } from './services/storefront-account.service';
import { PublicCartService } from './services/public-cart.service';
import { PublicCheckoutService } from './services/public-checkout.service';
import { StorefrontCustomerJwtStrategy } from './strategies/storefront-customer-jwt.strategy';
import { StorefrontCustomerAuthGuard } from './guards/storefront-customer-auth.guard';
import { OptionalCustomerAuthGuard } from './guards/optional-customer-auth.guard';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    // Secrets/expiry are passed per-sign in the services, so register bare — mirrors AuthModule.
    JwtModule.register({}),
    StoreModule,
  ],
  controllers: [
    StorefrontAuthController,
    StorefrontAccountController,
    PublicCartController,
    PublicCheckoutController,
  ],
  providers: [
    StorefrontAuthService,
    StorefrontAccountService,
    PublicCartService,
    PublicCheckoutService,
    StorefrontCustomerJwtStrategy,
    StorefrontCustomerAuthGuard,
    OptionalCustomerAuthGuard,
  ],
})
export class PublicStoreModule {}
