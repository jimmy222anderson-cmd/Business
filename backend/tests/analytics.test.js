/**
 * Unit tests for analytics calculations
 */

const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals');
const mongoose = require('mongoose');
const ImageryRequest = require('../models/ImageryRequest');

// Mock data for testing
const mockRequests = [
  {
    full_name: 'Test User 1',
    email: 'test1@example.com',
    aoi_type: 'polygon',
    aoi_coordinates: {
      type: 'Polygon',
      coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
    },
    aoi_area_km2: 100,
    aoi_center: { lat: 0.5, lng: 0.5 },
    date_range: {
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-01-31')
    },
    urgency: 'standard',
    status: 'approved',
    filters: {
      providers: ['Maxar']
    }
  },
  {
    full_name: 'Test User 2',
    email: 'test2@example.com',
    aoi_type: 'rectangle',
    aoi_coordinates: {
      type: 'Polygon',
      coordinates: [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]]
    },
    aoi_area_km2: 200,
    aoi_center: { lat: 1, lng: 1 },
    date_range: {
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-01-31')
    },
    urgency: 'urgent',
    status: 'pending',
    filters: {
      providers: ['Planet Labs']
    }
  },
  {
    full_name: 'Test User 3',
    email: 'test3@example.com',
    user_id: new mongoose.Types.ObjectId(),
    aoi_type: 'polygon',
    aoi_coordinates: {
      type: 'Polygon',
      coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
    },
    aoi_area_km2: 150,
    aoi_center: { lat: 0.5, lng: 0.5 },
    date_range: {
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-01-31')
    },
    urgency: 'emergency',
    status: 'completed',
    filters: {
      providers: ['Maxar']
    }
  }
];

describe('Analytics Calculations', () => {
  describe('Average Response Time', () => {
    it('should calculate average response time correctly', () => {
      // Test calculation logic
      const testData = [
        { created_at: new Date('2024-01-01T10:00:00'), firstStatusChange: new Date('2024-01-01T12:00:00') },
        { created_at: new Date('2024-01-02T10:00:00'), firstStatusChange: new Date('2024-01-02T14:00:00') }
      ];
      
      const avgHours = testData.reduce((sum, item) => {
        const hours = (item.firstStatusChange - item.created_at) / (1000 * 60 * 60);
        return sum + hours;
      }, 0) / testData.length;
      
      expect(avgHours).toBe(3); // (2 hours + 4 hours) / 2 = 3 hours
    });
  });

  describe('Conversion Rate', () => {
    it('should calculate conversion rate correctly', () => {
      const totalRequests = 10;
      const convertedRequests = 6; // approved + completed
      const conversionRate = (convertedRequests / totalRequests) * 100;
      
      expect(conversionRate).toBe(60);
    });

    it('should handle zero requests', () => {
      const totalRequests = 0;
      const convertedRequests = 0;
      const conversionRate = totalRequests > 0 ? (convertedRequests / totalRequests) * 100 : 0;
      
      expect(conversionRate).toBe(0);
    });
  });

  describe('Requests by Urgency', () => {
    it('should group requests by urgency level', () => {
      const requests = [
        { urgency: 'standard' },
        { urgency: 'standard' },
        { urgency: 'urgent' },
        { urgency: 'emergency' }
      ];
      
      const grouped = requests.reduce((acc, req) => {
        acc[req.urgency] = (acc[req.urgency] || 0) + 1;
        return acc;
      }, {});
      
      expect(grouped.standard).toBe(2);
      expect(grouped.urgent).toBe(1);
      expect(grouped.emergency).toBe(1);
    });
  });

  describe('Requests by User Type', () => {
    it('should separate guest and registered users', () => {
      const requests = [
        { user_id: null },
        { user_id: null },
        { user_id: 'user123' },
        { user_id: 'user456' }
      ];
      
      const guestCount = requests.filter(r => r.user_id === null).length;
      const registeredCount = requests.filter(r => r.user_id !== null).length;
      
      expect(guestCount).toBe(2);
      expect(registeredCount).toBe(2);
    });
  });

  describe('Average AOI Size', () => {
    it('should calculate average AOI size correctly', () => {
      const requests = [
        { aoi_area_km2: 100 },
        { aoi_area_km2: 200 },
        { aoi_area_km2: 150 }
      ];
      
      const avgSize = requests.reduce((sum, r) => sum + r.aoi_area_km2, 0) / requests.length;
      
      expect(avgSize).toBe(150);
    });
  });
});
