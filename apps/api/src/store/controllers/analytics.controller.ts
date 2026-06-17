import {
  Controller,
  Get,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentOrg } from '../../common/decorators/current-org.decorator';
import { AnalyticsService } from '../services/analytics.service';

@Controller('api/store/analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  /**
   * Get sales metrics dashboard
   */
  @Get('sales')
  async getSalesMetrics(
    @CurrentOrg() organizationId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const dateRange =
      from && to
        ? {
            from: new Date(from),
            to: new Date(to),
          }
        : undefined;

    if (
      dateRange &&
      (isNaN(dateRange.from.getTime()) || isNaN(dateRange.to.getTime()))
    ) {
      throw new BadRequestException('Invalid date format. Use ISO 8601.');
    }

    return this.analyticsService.getSalesMetrics(organizationId, dateRange);
  }

  /**
   * Get customer analytics
   */
  @Get('customers')
  async getCustomerMetrics(@CurrentOrg() organizationId: string) {
    return this.analyticsService.getCustomerMetrics(organizationId);
  }

  /**
   * Get top performing products
   */
  @Get('products/top')
  async getTopProducts(
    @CurrentOrg() organizationId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit) : 10;

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    return this.analyticsService.getTopProducts(organizationId, limitNum);
  }

  /**
   * Get category performance breakdown
   */
  @Get('categories')
  async getCategoryPerformance(@CurrentOrg() organizationId: string) {
    return this.analyticsService.getCategoryPerformance(organizationId);
  }

  /**
   * Get inventory health metrics
   */
  @Get('inventory')
  async getInventoryMetrics(@CurrentOrg() organizationId: string) {
    return this.analyticsService.getInventoryMetrics(organizationId);
  }

  /**
   * Get conversion funnel data
   */
  @Get('funnel')
  async getConversionFunnel(@CurrentOrg() organizationId: string) {
    return this.analyticsService.getConversionFunnel(organizationId);
  }

  /**
   * Get revenue trends
   */
  @Get('revenue-trends')
  async getRevenueTrends(
    @CurrentOrg() organizationId: string,
    @Query('days') days?: string,
  ) {
    const daysNum = days ? parseInt(days) : 30;

    if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
      throw new BadRequestException('Days must be between 1 and 365');
    }

    return this.analyticsService.getRevenueTrends(organizationId, daysNum);
  }

  /**
   * Get customer segmentation
   */
  @Get('customer-segments')
  async getCustomerSegmentation(@CurrentOrg() organizationId: string) {
    return this.analyticsService.getCustomerSegmentation(organizationId);
  }

  /**
   * Get comprehensive dashboard data
   * Combines multiple metrics for dashboard view
   */
  @Get('dashboard')
  async getDashboardMetrics(@CurrentOrg() organizationId: string) {
    const [
      sales,
      customers,
      topProducts,
      categories,
      inventory,
      segments,
      trends,
    ] = await Promise.all([
      this.analyticsService.getSalesMetrics(organizationId),
      this.analyticsService.getCustomerMetrics(organizationId),
      this.analyticsService.getTopProducts(organizationId, 5),
      this.analyticsService.getCategoryPerformance(organizationId),
      this.analyticsService.getInventoryMetrics(organizationId),
      this.analyticsService.getCustomerSegmentation(organizationId),
      this.analyticsService.getRevenueTrends(organizationId, 30),
    ]);

    return {
      salesMetrics: sales,
      customerMetrics: customers,
      topProducts,
      categoryPerformance: categories,
      inventoryMetrics: inventory,
      customerSegmentation: segments,
      revenueTrends: trends,
      generatedAt: new Date().toISOString(),
    };
  }
}
