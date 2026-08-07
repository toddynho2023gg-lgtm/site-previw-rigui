import { LandingPage } from "./components";
import { structuredData } from "./data";
import { seo } from "../src/config/clinic";

const deploymentHost =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.VERCEL_PROJECT_PRODUCTION_URL ??
  process.env.VERCEL_URL;
const deploymentOrigin = deploymentHost
  ? deploymentHost.startsWith("http")
    ? deploymentHost
    : `https://${deploymentHost}`
  : seo.canonicalUrl;

const absoluteStructuredData = {
  ...structuredData,
  "@graph": structuredData["@graph"].map((entry) => ({
    ...entry,
    image: new URL(entry.image, deploymentOrigin).href,
    logo: new URL(entry.logo, deploymentOrigin).href,
  })),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(absoluteStructuredData) }}
      />
      <LandingPage />
    </>
  );
}
