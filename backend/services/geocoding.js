const axios = require('axios');

/**
 * Geocoding Service
 * Supports multiple providers: Nominatim (OpenStreetMap) and Mapbox
 */

class GeocodingService {
  constructor() {
    this.providers = {
      nominatim: {
        name: 'Nominatim',
        enabled: true,
        priority: 1
      },
      photon: {
        name: 'Photon (Komoot)',
        enabled: true,
        priority: 2
      },
      mapbox: {
        name: 'Mapbox',
        enabled: !!process.env.MAPBOX_ACCESS_TOKEN,
        priority: 3,
        token: process.env.MAPBOX_ACCESS_TOKEN
      }
    };
  }

  /**
   * Get active providers sorted by priority
   */
  getActiveProviders() {
    return Object.entries(this.providers)
      .filter(([_, config]) => config.enabled)
      .sort((a, b) => a[1].priority - b[1].priority)
      .map(([name]) => name);
  }

  /**
   * Forward geocoding - location name to coordinates
   * @param {string} query - Location search query
   * @param {string} provider - Specific provider to use (optional)
   * @returns {Promise<Array>} Array of location results
   */
  async geocode(query, provider = null) {
    const providers = provider ? [provider] : this.getActiveProviders();

    for (const providerName of providers) {
      try {
        const results = await this[`geocode${this.capitalize(providerName)}`](query);
        if (results && results.length > 0) {
          return results;
        }
      } catch (error) {
        console.error(`${providerName} geocoding failed:`, error.message);
        // Continue to next provider
      }
    }

    return [];
  }

  /**
   * Reverse geocoding - coordinates to location name
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {string} provider - Specific provider to use (optional)
   * @returns {Promise<Object>} Location result
   */
  async reverseGeocode(lat, lng, provider = null) {
    const providers = provider ? [provider] : this.getActiveProviders();

    for (const providerName of providers) {
      try {
        const result = await this[`reverseGeocode${this.capitalize(providerName)}`](lat, lng);
        if (result) {
          return result;
        }
      } catch (error) {
        console.error(`${providerName} reverse geocoding failed:`, error.message);
        // Continue to next provider
      }
    }

    return null;
  }

  /**
   * Autocomplete suggestions
   * @param {string} query - Partial location query
   * @param {string} provider - Specific provider to use (optional)
   * @returns {Promise<Array>} Array of suggestions
   */
  async autocomplete(query, provider = null) {
    const providers = provider ? [provider] : this.getActiveProviders();

    for (const providerName of providers) {
      try {
        const results = await this[`autocomplete${this.capitalize(providerName)}`](query);
        if (results && results.length > 0) {
          return results;
        }
      } catch (error) {
        console.error(`${providerName} autocomplete failed:`, error.message);
        // Continue to next provider
      }
    }

    return [];
  }

  /**
   * Nominatim forward geocoding
   */
  async geocodeNominatim(query) {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: query,
        format: 'json',
        addressdetails: 1,
        limit: 10,
        'accept-language': 'en'
      },
      headers: {
        'User-Agent': 'EarthIntelligencePlatform/1.0'
      },
      timeout: 5000
    });

    return response.data.map(item => ({
      name: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      bbox: item.boundingbox ? [
        parseFloat(item.boundingbox[2]), // west
        parseFloat(item.boundingbox[0]), // south
        parseFloat(item.boundingbox[3]), // east
        parseFloat(item.boundingbox[1])  // north
      ] : undefined,
      provider: 'nominatim'
    }));
  }

  /**
   * Photon (Komoot) forward geocoding
   * Useful for partial queries/autocomplete, English only
   */
  async geocodePhoton(query) {
    const response = await axios.get('https://photon.komoot.io/api/', {
      params: {
        q: query,
        limit: 10,
        lang: 'en'
      },
      timeout: 5000
    });

    const features = response.data.features || [];
    return features.map(f => {
      const props = f.properties || {};
      const parts = [
        props.name,
        props.city || props.town || props.village,
        props.state,
        props.country
      ].filter(Boolean);
      const label = Array.from(new Set(parts)).join(', ');

      const coords = (f.geometry && f.geometry.coordinates) || [0, 0];
      // Photon sometimes provides 'extent' as [west, south, east, north]
      const extent = props.extent && Array.isArray(props.extent) && props.extent.length === 4
        ? props.extent
        : undefined;

      return {
        name: label || props.name || query,
        lat: coords[1],
        lng: coords[0],
        bbox: extent,
        provider: 'photon'
      };
    });
  }

  /**
   * Photon autocomplete (same as geocode with smaller limit)
   */
  async autocompletePhoton(query) {
    const response = await axios.get('https://photon.komoot.io/api/', {
      params: {
        q: query,
        limit: 5,
        lang: 'en'
      },
      timeout: 5000
    });

    const features = response.data.features || [];
    return features.map(f => {
      const props = f.properties || {};
      const parts = [
        props.name,
        props.city || props.town || props.village,
        props.state,
        props.country
      ].filter(Boolean);
      const label = Array.from(new Set(parts)).join(', ');

      const coords = (f.geometry && f.geometry.coordinates) || [0, 0];
      const extent = props.extent && Array.isArray(props.extent) && props.extent.length === 4
        ? props.extent
        : undefined;

      return {
        name: label || props.name || query,
        lat: coords[1],
        lng: coords[0],
        bbox: extent,
        provider: 'photon'
      };
    });
  }

  /**
   * Nominatim reverse geocoding
   */
  async reverseGeocodeNominatim(lat, lng) {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat,
        lon: lng,
        format: 'json',
        addressdetails: 1,
        'accept-language': 'en'
      },
      headers: {
        'User-Agent': 'EarthIntelligencePlatform/1.0'
      },
      timeout: 5000
    });

    return {
      name: response.data.display_name || `${lat}, ${lng}`,
      lat,
      lng,
      bbox: response.data.boundingbox ? [
        parseFloat(response.data.boundingbox[2]), // west
        parseFloat(response.data.boundingbox[0]), // south
        parseFloat(response.data.boundingbox[3]), // east
        parseFloat(response.data.boundingbox[1])  // north
      ] : undefined,
      provider: 'nominatim'
    };
  }

  /**
   * Nominatim autocomplete (same as geocode for Nominatim)
   */
  async autocompleteNominatim(query) {
    return this.geocodeNominatim(query);
  }

  /**
   * Mapbox forward geocoding
   */
  async geocodeMapbox(query) {
    if (!this.providers.mapbox.token) {
      throw new Error('Mapbox token not configured');
    }

    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
      {
        params: {
          access_token: this.providers.mapbox.token,
          limit: 10,
          language: 'en'
        },
        timeout: 5000
      }
    );

    return response.data.features.map(feature => ({
      name: feature.place_name,
      lat: feature.center[1],
      lng: feature.center[0],
      bbox: feature.bbox,
      provider: 'mapbox'
    }));
  }

  /**
   * Mapbox reverse geocoding
   */
  async reverseGeocodeMapbox(lat, lng) {
    if (!this.providers.mapbox.token) {
      throw new Error('Mapbox token not configured');
    }

    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json`,
      {
        params: {
          access_token: this.providers.mapbox.token,
          language: 'en'
        },
        timeout: 5000
      }
    );

    const feature = response.data.features[0];
    if (!feature) {
      return null;
    }

    return {
      name: feature.place_name || `${lat}, ${lng}`,
      lat,
      lng,
      bbox: feature.bbox,
      provider: 'mapbox'
    };
  }

  /**
   * Mapbox autocomplete
   */
  async autocompleteMapbox(query) {
    if (!this.providers.mapbox.token) {
      throw new Error('Mapbox token not configured');
    }

    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
      {
        params: {
          access_token: this.providers.mapbox.token,
          limit: 5,
          autocomplete: true,
          language: 'en'
        },
        timeout: 5000
      }
    );

    return response.data.features.map(feature => ({
      name: feature.place_name,
      lat: feature.center[1],
      lng: feature.center[0],
      bbox: feature.bbox,
      provider: 'mapbox'
    }));
  }

  /**
   * Utility: Capitalize first letter
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

module.exports = new GeocodingService();
