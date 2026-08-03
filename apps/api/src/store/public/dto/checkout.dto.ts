import { IsEmail, IsObject, IsOptional, IsString } from 'class-validator';
import { OrderAddressDto } from '../../dto/create-order.dto';

export class CheckoutDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsObject()
  shippingAddress: OrderAddressDto;

  @IsOptional()
  @IsObject()
  billingAddress?: OrderAddressDto;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsString()
  shippingMethod?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  /** Set when the shopper already paid via the embedded Stripe Payment Element — verified server-side before the order is created. */
  @IsOptional()
  @IsString()
  paymentIntentId?: string;
}
