import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Satellite, Eye, Clock, Globe, Zap, Cloud } from 'lucide-react';

// Satellite specification interface
interface SatelliteSpec {
  id: string;
  name: string;
  type: 'Optical' | 'SAR' | 'Multispectral';
  resolution: string;
  revisitTime: string;
  coverage: string;
  bands: string;
  swathWidth: string;
  provider: string;
}

// Satellite specifications data
const satelliteSpecs: SatelliteSpec[] = [
  {
    id: 'worldview-3',
    name: 'WorldView-3',
    type: 'Optical',
    resolution: '31cm (panchromatic), 1.24m (multispectral)',
    revisitTime: '<1 day',
    coverage: 'Global',
    bands: '16 (VNIR + SWIR)',
    swathWidth: '13.1 km',
    provider: 'Maxar',
  },
  {
    id: 'worldview-4',
    name: 'WorldView-4',
    type: 'Optical',
    resolution: '31cm (panchromatic), 1.24m (multispectral)',
    revisitTime: '<1 day',
    coverage: 'Global',
    bands: '4 (multispectral)',
    swathWidth: '13.1 km',
    provider: 'Maxar',
  },
  {
    id: 'planet-dove',
    name: 'Planet Dove',
    type: 'Optical',
    resolution: '3-5m',
    revisitTime: 'Daily',
    coverage: 'Global',
    bands: '4 (RGB + NIR)',
    swathWidth: '24.6 km x 16.4 km',
    provider: 'Planet',
  },
  {
    id: 'planet-skysat',
    name: 'Planet SkySat',
    type: 'Optical',
    resolution: '50cm (panchromatic), 1m (multispectral)',
    revisitTime: '7x daily',
    coverage: 'Global',
    bands: '4 (multispectral)',
    swathWidth: '8 km x 6 km',
    provider: 'Planet',
  },
  {
    id: 'sentinel-2',
    name: 'Sentinel-2',
    type: 'Multispectral',
    resolution: '10m, 20m, 60m',
    revisitTime: '5 days',
    coverage: 'Global',
    bands: '13 (visible to SWIR)',
    swathWidth: '290 km',
    provider: 'ESA',
  },
  {
    id: 'landsat-8',
    name: 'Landsat 8',
    type: 'Multispectral',
    resolution: '15m (panchromatic), 30m (multispectral)',
    revisitTime: '16 days',
    coverage: 'Global',
    bands: '11 (visible to thermal)',
    swathWidth: '185 km',
    provider: 'NASA/USGS',
  },
  {
    id: 'iceye-sar',
    name: 'ICEYE SAR',
    type: 'SAR',
    resolution: '1m (spotlight), 3m (strip), 15m (scan)',
    revisitTime: 'Multiple daily',
    coverage: 'Global',
    bands: 'X-band',
    swathWidth: '5-30 km (mode dependent)',
    provider: 'ICEYE',
  },
  {
    id: 'sentinel-1',
    name: 'Sentinel-1',
    type: 'SAR',
    resolution: '5m x 20m (IW mode)',
    revisitTime: '6 days',
    coverage: 'Global',
    bands: 'C-band',
    swathWidth: '250 km',
    provider: 'ESA',
  },
];

// Feature comparison data
interface FeatureComparison {
  feature: string;
  optical: string;
  sar: string;
  multispectral: string;
}

const featureComparisons: FeatureComparison[] = [
  {
    feature: 'Weather Dependency',
    optical: 'Cloud-affected',
    sar: 'All-weather',
    multispectral: 'Cloud-affected',
  },
  {
    feature: 'Day/Night Operation',
    optical: 'Daylight only',
    sar: '24/7',
    multispectral: 'Daylight only',
  },
  {
    feature: 'Best Resolution',
    optical: '30cm',
    sar: '1m',
    multispectral: '10m',
  },
  {
    feature: 'Spectral Information',
    optical: 'Limited',
    sar: 'None',
    multispectral: 'Extensive',
  },
  {
    feature: 'Typical Use Cases',
    optical: 'Visual analysis, mapping',
    sar: 'Change detection, maritime',
    multispectral: 'Agriculture, environment',
  },
  {
    feature: 'Cost',
    optical: 'Medium-High',
    sar: 'High',
    multispectral: 'Low-Medium',
  },
];

// Specification row component
function SpecRow({ spec }: { spec: SatelliteSpec }) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="border-b border-border hover:bg-muted/50 transition-colors"
    >
      <td className="py-4 px-4 font-medium text-foreground">{spec.name}</td>
      <td className="py-4 px-4">
        <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/10 text-yellow-500">
          {spec.type}
        </span>
      </td>
      <td className="py-4 px-4 text-muted-foreground">{spec.resolution}</td>
      <td className="py-4 px-4 text-muted-foreground">{spec.revisitTime}</td>
      <td className="py-4 px-4 text-muted-foreground">{spec.coverage}</td>
      <td className="py-4 px-4 text-muted-foreground">{spec.bands}</td>
      <td className="py-4 px-4 text-muted-foreground">{spec.swathWidth}</td>
      <td className="py-4 px-4 text-muted-foreground">{spec.provider}</td>
    </motion.tr>
  );
}

export default function SpecsPage() {
  // Group specs by type
  const opticalSpecs = satelliteSpecs.filter((s) => s.type === 'Optical');
  const sarSpecs = satelliteSpecs.filter((s) => s.type === 'SAR');
  const multispectralSpecs = satelliteSpecs.filter((s) => s.type === 'Multispectral');

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Technical Specifications
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Comprehensive technical details for all satellite data sources available
              through our platform. Compare resolution, revisit times, and capabilities.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Key Capabilities Overview */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-foreground text-center mb-12"
          >
            Key Capabilities
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                High Resolution
              </h3>
              <p className="text-sm text-muted-foreground">
                Up to 30cm resolution for detailed visual analysis
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                Frequent Revisits
              </h3>
              <p className="text-sm text-muted-foreground">
                Daily to sub-daily coverage for time-sensitive applications
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                Global Coverage
              </h3>
              <p className="text-sm text-muted-foreground">
                Worldwide data access from multiple satellite constellations
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                Rapid Delivery
              </h3>
              <p className="text-sm text-muted-foreground">
                Near real-time data processing and delivery
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                <Cloud className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                All-Weather SAR
              </h3>
              <p className="text-sm text-muted-foreground">
                See through clouds and darkness with radar imaging
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                <Satellite className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                Multi-Sensor
              </h3>
              <p className="text-sm text-muted-foreground">
                Optical, SAR, and multispectral data sources
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Satellite Specifications Table */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-foreground mb-8"
          >
            Satellite Specifications
          </motion.h2>

          {/* Optical Satellites */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Optical Satellites
            </h3>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-foreground">
                      Satellite
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-foreground">
                      Type
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-foreground">
                      Resolution
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-foreground">
                      Revisit Time
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-foreground">
                      Coverage
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-foreground">
                      Bands
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-foreground">
                      Swath Width
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-foreground">
                      Provider
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card">
                  {opticalSpecs.map((spec) => (
                    <SpecRow key={spec.id} spec={spec} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SAR Satellites */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-foreground mb-4">SAR Satellites</h3>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-foreground">
                      Satellite
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-foreground">
                      Type
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-foreground">
                      Resolution
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-foreground">
                      Revisit Time
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-foreground">
                      Coverage
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-foreground">
                      Bands
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-foreground">
                      Swath Width
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-foreground">
                      Provider
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card">
                  {sarSpecs.map((spec) => (
                    <SpecRow key={spec.id} spec={spec} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Multispectral Satellites */}
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Multispectral Satellites
            </h3>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-foreground">
                      Satellite
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-foreground">
                      Type
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-foreground">
                      Resolution
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-foreground">
                      Revisit Time
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-foreground">
                      Coverage
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-foreground">
                      Bands
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-foreground">
                      Swath Width
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-foreground">
                      Provider
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card">
                  {multispectralSpecs.map((spec) => (
                    <SpecRow key={spec.id} spec={spec} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-foreground mb-8"
          >
            Data Type Comparison
          </motion.h2>

          <div className="max-w-4xl mx-auto overflow-x-auto rounded-lg border border-border">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-foreground">
                    Feature
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-foreground">
                    Optical
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-foreground">
                    SAR
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-foreground">
                    Multispectral
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card">
                {featureComparisons.map((comparison, index) => (
                  <motion.tr
                    key={comparison.feature}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-4 px-4 font-medium text-foreground">
                      {comparison.feature}
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      {comparison.optical}
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      {comparison.sar}
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      {comparison.multispectral}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Need Help Choosing?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Our team can help you select the right satellite data sources for your
              specific use case and requirements.
            </p>
            <Link to="/contact" className="px-8 py-3 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors inline-block">
              Contact Our Experts
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
