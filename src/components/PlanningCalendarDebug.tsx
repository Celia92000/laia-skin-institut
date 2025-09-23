"use client";

export default function PlanningCalendarDebug({ services }: { services: any }) {
  console.log('PlanningCalendarDebug services:', services);
  console.log('Type of services:', typeof services);
  
  if (services) {
    for (const [key, value] of Object.entries(services)) {
      console.log(`services[${key}]:`, typeof value, value);
      if (typeof value !== 'string' && typeof value !== 'number') {
        console.error(`ERROR: services[${key}] is not a primitive:`, value);
      }
    }
  }
  
  return <div>Debug Component</div>;
}