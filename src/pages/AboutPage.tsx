import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Target, Eye, Award, Users, Calendar, Rocket } from 'lucide-react';

// Team member interface
interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
}

// Milestone interface
interface Milestone {
  year: string;
  title: string;
  description: string;
}

// Team data
const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    role: 'Chief Executive Officer',
    bio: 'Former NASA scientist with 15+ years in satellite technology and earth observation.',
    image: '/placeholder.svg',
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    role: 'Chief Technology Officer',
    bio: 'AI/ML expert specializing in geospatial analytics and computer vision.',
    image: '/placeholder.svg',
  },
  {
    id: '3',
    name: 'Dr. Emily Watson',
    role: 'Chief Data Officer',
    bio: 'PhD in Remote Sensing with expertise in satellite data processing and analysis.',
    image: '/placeholder.svg',
  },
  {
    id: '4',
    name: 'James Park',
    role: 'VP of Business Development',
    bio: 'Strategic partnerships leader with deep industry connections across sectors.',
    image: '/placeholder.svg',
  },
];

// Timeline data
const milestones: Milestone[] = [
  {
    year: '2018',
    title: 'Company Founded',
    description: 'Earth Intelligence Platform launched with a vision to democratize satellite data access.',
  },
  {
    year: '2019',
    title: 'First Major Partnership',
    description: 'Secured partnerships with leading satellite providers Maxar and Planet.',
  },
  {
    year: '2020',
    title: 'Analytics Platform Launch',
    description: 'Released AI-powered analytics platform for automated geospatial insights.',
  },
  {
    year: '2021',
    title: 'Series A Funding',
    description: 'Raised $25M to expand platform capabilities and global reach.',
  },
  {
    year: '2022',
    title: 'Government Contracts',
    description: 'Awarded contracts with federal agencies for disaster response and monitoring.',
  },
  {
    year: '2023',
    title: 'Global Expansion',
    description: 'Opened offices in Europe and Asia, serving clients across 50+ countries.',
  },
  {
    year: '2024',
    title: 'Industry Recognition',
    description: 'Named "Most Innovative Geospatial Company" by industry leaders.',
  },
];

// Team member card component
function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
      className="bg-card border border-border rounded-lg overflow-hidden hover:border-yellow-500/50 transition-all duration-300"
    >
      {/* Member Image */}
      <div className="relative h-64 overflow-hidden bg-muted">
        <img
          src={member.image}
          alt={member.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Member Info */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-foreground mb-1">{member.name}</h3>
        <p className="text-sm text-yellow-500 font-medium mb-3">{member.role}</p>
        <p className="text-sm text-muted-foreground">{member.bio}</p>
      </div>
    </motion.div>
  );
}

// Milestone card component
function MilestoneCard({ milestone, index }: { milestone: Milestone; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative flex items-start gap-6"
    >
      {/* Year Badge */}
      <div className="flex-shrink-0 w-20 h-20 rounded-full bg-yellow-500/10 border-2 border-yellow-500 flex items-center justify-center">
        <span className="text-lg font-bold text-yellow-500">{milestone.year}</span>
      </div>

      {/* Content */}
      <div className="flex-grow pb-8">
        <h3 className="text-xl font-bold text-foreground mb-2">{milestone.title}</h3>
        <p className="text-muted-foreground">{milestone.description}</p>
      </div>
    </motion.div>
  );
}

export default function AboutPage() {
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
              About Us
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Empowering decision-makers with actionable earth intelligence through
              cutting-edge satellite technology and AI-powered analytics.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Company Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Founded in 2018, Earth Intelligence Platform was born from a simple yet
                  powerful vision: to make satellite data accessible, actionable, and
                  affordable for organizations of all sizes. Our founders, a team of former
                  NASA scientists and technology entrepreneurs, recognized that while
                  satellite technology had advanced dramatically, accessing and analyzing
                  this data remained complex and expensive.
                </p>
                <p>
                  Today, we serve clients across eight major industries, from agriculture to
                  insurance, providing them with the insights they need to make informed
                  decisions. Our platform aggregates data from dozens of satellite providers,
                  processes it using advanced AI algorithms, and delivers actionable
                  intelligence through an intuitive interface.
                </p>
                <p>
                  We believe that earth observation data should be a tool for positive
                  change—helping farmers optimize yields, enabling governments to respond to
                  disasters, supporting environmental conservation, and driving sustainable
                  development worldwide.
                </p>
              </div>
            </motion.div>

            {/* Mission, Vision, Values */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-yellow-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Our Mission</h3>
                <p className="text-sm text-muted-foreground">
                  Democratize access to satellite intelligence and empower organizations to
                  make data-driven decisions.
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
                  <Eye className="w-8 h-8 text-yellow-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Our Vision</h3>
                <p className="text-sm text-muted-foreground">
                  A world where earth observation data drives sustainable development and
                  positive global impact.
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
                  <Award className="w-8 h-8 text-yellow-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Our Values</h3>
                <p className="text-sm text-muted-foreground">
                  Innovation, accessibility, accuracy, and commitment to environmental
                  sustainability.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Users className="w-8 h-8 text-yellow-500" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Our Leadership Team
              </h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Meet the experts driving innovation in earth intelligence and satellite
              technology.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Calendar className="w-8 h-8 text-yellow-500" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Our Journey
              </h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Key milestones in our mission to transform earth intelligence.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            {/* Timeline Line */}
            <div className="relative">
              <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-border" />

              {/* Milestones */}
              <div className="space-y-0">
                {milestones.map((milestone, index) => (
                  <MilestoneCard
                    key={milestone.year}
                    milestone={milestone}
                    index={index}
                  />
                ))}
              </div>
            </div>
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
            <Rocket className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Join Us on Our Mission
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Whether you're looking to leverage satellite data for your organization or
              want to join our team, we'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/demo" className="px-8 py-3 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors text-center">
                Book a Demo
              </Link>
              <Link to="/contact" className="px-8 py-3 bg-transparent border-2 border-yellow-500 text-yellow-500 font-semibold rounded-lg hover:bg-yellow-500/10 transition-colors text-center">
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
