"use client";

export default function PlanningCalendarSimple({ services }: { services: Record<string, string> }) {
  console.log("PlanningCalendarSimple services:", services);
  
  // Vérifier que services ne contient que des strings
  for (const [key, value] of Object.entries(services)) {
    if (typeof value !== 'string') {
      console.error(`ERROR: services[${key}] is not a string:`, typeof value, value);
    }
  }
  
  return (
    <div className="p-4 bg-white rounded-lg">
      <h2 className="text-xl font-bold mb-4">Calendrier Simple</h2>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(services).map(([key, value]) => (
          <div key={key} className="p-2 border rounded">
            <div className="font-semibold">{key}</div>
            <div className="text-sm text-gray-600">
              {typeof value === 'string' ? value : `ERROR: ${typeof value}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}