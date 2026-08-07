import {
  assets,
  beforeAfter,
  clinic,
  faq,
  featureFlags,
  formatClinicText,
  isFeatureEnabled,
  seo,
  treatments,
  units,
  whatsappUrl,
  type BeforeAfterItem,
  type ClinicUnit,
} from "../src/config/clinic";

export const navigationItems = clinic.navigation.filter((item) =>
  isFeatureEnabled("feature" in item ? item.feature : undefined),
);

export const siteData = {
  ...clinic,
  units,
  faqs: faq,
  procedures: beforeAfter,
  treatments,
  featureFlags,
} as const;

export type { ClinicUnit };
export type Procedure = BeforeAfterItem;

export { formatClinicText, whatsappUrl };

export function mapsUrl(unit: ClinicUnit) {
  return unit.googleMapsUrl;
}

export const structuredData = {
  "@context": "https://schema.org",
  "@graph": units.map((unit) => ({
    "@type": seo.structuredData.type,
    name: `${clinic.name} — ${unit.name}`,
    description: seo.structuredData.description,
    image: assets.hero,
    logo: assets.logo,
    telephone: unit.phone,
    address: {
      "@type": "PostalAddress",
      ...unit.structuredAddress,
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: unit.whatsapp,
      contactType: seo.structuredData.contactType,
      availableLanguage: seo.structuredData.availableLanguage,
    },
  })),
};
