"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";

const PlanningCalendar = dynamic(() => import("./PlanningCalendar"), {
  ssr: false,
  loading: () => <div>Chargement du calendrier...</div>
});

export default function PlanningCalendarWrapper(props: any) {
  useEffect(() => {
    // Vérifier les props
    console.log("PlanningCalendarWrapper props.services:", props.services);
    
    // Vérifier que services ne contient que des strings
    if (props.services) {
      for (const [key, value] of Object.entries(props.services)) {
        if (typeof value !== 'string') {
          console.error(`ERREUR dans PlanningCalendarWrapper: services[${key}] n'est pas une string:`, typeof value, value);
        }
      }
    }
    
    // Vérifier les réservations
    if (props.reservations) {
      props.reservations.forEach((r: any, idx: number) => {
        if (r.services && Array.isArray(r.services)) {
          r.services.forEach((s: any, sIdx: number) => {
            if (typeof s !== 'string') {
              console.error(`ERREUR: reservation[${idx}].services[${sIdx}] n'est pas une string:`, typeof s, s);
            }
          });
        }
      });
    }
  }, [props]);
  
  try {
    return <PlanningCalendar {...props} />;
  } catch (error) {
    console.error("Erreur dans PlanningCalendar:", error);
    return <div>Erreur lors du rendu du calendrier: {String(error)}</div>;
  }
}