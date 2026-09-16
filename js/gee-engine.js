/**
 * SatQuery AI — Google Earth Engine (GEE) Integration
 * Handles OAuth2 authentication, live data fetching, and cloud geospatial processing.
 */

import { lsGet, toast, sleep } from './utils.js';

let isGeeInitialized = false;

// ─────────────────────────────────────────
// INITIALIZATION
// ─────────────────────────────────────────
export async function initGEE() {
  if (isGeeInitialized) return true;

  const clientId = lsGet('gee_client_id');
  if (!clientId) {
    toast('GEE Client ID missing. Add it in Settings to enable Live Data.', 'warning', 6000);
    return false;
  }

  if (!window.ee) {
    toast('GEE Library not loaded. Check internet connection.', 'error');
    return false;
  }

  return new Promise((resolve) => {
    // Authenticate via OAuth2 popup
    window.ee.data.authenticateViaOauth(
      clientId,
      () => {
        // Initialize Earth Engine
        window.ee.initialize(
          null, null,
          () => {
            isGeeInitialized = true;
            toast('Connected to Google Earth Engine 🌍', 'success');
            resolve(true);
          },
          (e) => {
            console.error('GEE Init Error:', e);
            toast('Failed to initialize Earth Engine. See console.', 'error');
            resolve(false);
          }
        );
      },
      (e) => {
        console.error('GEE Auth Error:', e);
        toast('Google Earth Engine authentication failed.', 'error');
        resolve(false);
      },
      null, // extra scopes
      () => {
        // Fallback for popups blocked
        window.ee.data.authenticateViaPopup(
          () => resolve(true),
          () => resolve(false)
        );
      }
    );
  });
}

export function isGeeReady() {
  return isGeeInitialized;
}

// ─────────────────────────────────────────
// GEE WORKFLOWS
// ─────────────────────────────────────────

/**
 * Calculates NDVI using Sentinel-2 live data for a given bounds and year.
 * Returns the MapID and token to add as a Leaflet TileLayer.
 */
export async function getLiveNDVI(bounds = null, year = '2023') {
  if (!isGeeInitialized) throw new Error('GEE not initialized');

  return new Promise((resolve, reject) => {
    try {
      // Sentinel-2 Surface Reflectance
      let collection = window.ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
        .filterDate(`${year}-01-01`, `${year}-12-31`)
        .filter(window.ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20));

      if (bounds) {
        const geometry = window.ee.Geometry.BBox(bounds._southWest.lng, bounds._southWest.lat, bounds._northEast.lng, bounds._northEast.lat);
        collection = collection.filterBounds(geometry);
      }

      // Median composite
      const image = collection.median();

      // Calculate NDVI
      const ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');

      // Visualization parameters (Green scale)
      const visParams = {
        min: 0.0,
        max: 0.8,
        palette: ['#FFFFFF', '#CE7E45', '#DF923D', '#F1B555', '#FCD163', '#99B718', '#74A901', '#66A000', '#529400', '#3E8601', '#207401', '#056201', '#004C00', '#023B01', '#012E01', '#011D01', '#011301']
      };

      const mapId = ndvi.getMap(visParams);
      resolve({
        urlFormat: mapId.urlFormat,
        mapId: mapId.mapid,
        token: mapId.token,
      });

    } catch (e) {
      console.error('GEE Error:', e);
      reject(e);
    }
  });
}

/**
 * Change Detection between two years using GEE
 */
export async function getLiveChangeDetection(bounds = null, yearA = '2022', yearB = '2023') {
  if (!isGeeInitialized) throw new Error('GEE not initialized');

  return new Promise((resolve, reject) => {
    try {
      const getMedianNDVI = (year) => {
        let col = window.ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
          .filterDate(`${year}-01-01`, `${year}-12-31`)
          .filter(window.ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20));
        
        if (bounds) {
          const geometry = window.ee.Geometry.BBox(bounds._southWest.lng, bounds._southWest.lat, bounds._northEast.lng, bounds._northEast.lat);
          col = col.filterBounds(geometry);
        }
        return col.median().normalizedDifference(['B8', 'B4']);
      };

      const ndviA = getMedianNDVI(yearA);
      const ndviB = getMedianNDVI(yearB);

      // Change = B - A
      const change = ndviB.subtract(ndviA).rename('NDVI_Change');

      // Visualization: Red (decrease), White (no change), Green (increase)
      const visParams = {
        min: -0.3,
        max: 0.3,
        palette: ['#d73027', '#f46d43', '#fdae61', '#fee08b', '#ffffff', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850']
      };

      const mapId = change.getMap(visParams);
      resolve({
        urlFormat: mapId.urlFormat,
        mapId: mapId.mapid,
        token: mapId.token,
      });

    } catch (e) {
      console.error('GEE Change Error:', e);
      reject(e);
    }
  });
}
