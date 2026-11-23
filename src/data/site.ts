// Site-wide constants shared by pages, structured data and the agent
// endpoints (llms.txt, markdown pages, profile.json).

export const SITE_URL = "https://jonooliver.dev";
export const SITE_NAME = "Jonathan Oliver | Portfolio";
export const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

// Stable id for the site owner, referenced from every page's JSON-LD
export const PERSON_ID = `${SITE_URL}/#person`;

export const absoluteUrl = (path: string) => new URL(path, SITE_URL).href;
