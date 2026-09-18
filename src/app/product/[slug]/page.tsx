import React from 'react';
import { notFound } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { products } from '../../../data/products';
import ProductDetailClient from '../../../components/ProductDetailClient';

// This function tells Next.js to pre-build a page for every product slug
export function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = products.find((p) => p.slug === params.slug);
  
  if (!product) {
    return { title: 'Product Not Found' };
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} | Jevansrot`,
      description: product.description,
      images: [
        {
          url: product.img,
          width: 800,
          height: 800,
          alt: product.name,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: [product.img],
    }
  };
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = products.find((p) => p.slug === params.slug);
  
  if (!product) {
    notFound();
  }

  return (
    <main>
      <Navbar />
      <ProductDetailClient product={product} />
      <Footer />
    </main>
  );
}
