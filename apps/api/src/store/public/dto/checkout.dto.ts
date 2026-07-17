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
}
