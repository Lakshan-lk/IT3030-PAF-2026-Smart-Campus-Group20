import React from 'react';
import { motion } from 'framer-motion';
import ResourceCard from './ResourceCard';

const FacilitySection = ({ resources, onBook }) => {
  if (!resources.length) {
    return null;
  }

  return (
    <section className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
      >
        {resources.map(resource => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            onBook={onBook}
          />
        ))}
      </motion.div>
    </section>
  );
};

export default FacilitySection;
