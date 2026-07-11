import React from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  path: string;
}

export default function SEO({ title, description, path }: SEOProps) {
  const fullUrl = `https://mahfuz62.pro.bd${path}`;
  const defaultTitle = "Mahfuz R Masum | Lead Full-Stack & Cloud Engineer | Professional Portfolio";
  const defaultDesc = "Explore the professional portfolio, interactive projects, and dynamic resume of Mahfuz R Masum. Certified Lead Full-Stack & Cloud Engineer specializing in high-performance React architectures, Node.js, and Google Cloud solutions.";
  
  const displayTitle = title ? `${title} | Mahfuz R Masum` : defaultTitle;
  const displayDesc = description || defaultDesc;

  return (
    <>
      <title>{displayTitle}</title>
      <meta name="description" content={displayDesc} />
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:title" content={displayTitle} />
      <meta property="og:description" content={displayDesc} />
      <meta property="og:url" content={fullUrl} />
      
      {/* Twitter */}
      <meta name="twitter:title" content={displayTitle} />
      <meta name="twitter:description" content={displayDesc} />
      <meta name="twitter:url" content={fullUrl} />
    </>
  );
}
